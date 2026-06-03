import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Public: list events
export const listEvents = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("events")
    .select("*")
    .order("data_inicio", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

// Public: ranking top 20
export const getRanking = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, nome, avatar_url, pontos")
    .order("pontos", { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);
  return data ?? [];
});

// Auth: my profile + role
export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");
    return { profile, isAdmin, userId };
  });

// Auth: my reservations
export const getMyReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("reservations")
      .select("*, events(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// Auth: reserve a spot
export const reserveSpot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ eventId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("reservations")
      .insert({ event_id: data.eventId, user_id: userId, status: "confirmada" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Auth: cancel reservation
export const cancelReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ reservationId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("reservations")
      .update({ status: "cancelada" })
      .eq("id", data.reservationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===== Admin =====
const requireAdmin = async (supabase: any, userId: string) => {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso restrito a administradores");
};

const EventInput = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().min(2).max(200),
  descricao: z.string().max(2000).default(""),
  data_inicio: z.string(),
  data_fim: z.string(),
  vagas_total: z.number().int().min(1).max(10000),
  local: z.string().max(200).default(""),
  imagem_url: z.string().url().or(z.literal("")).optional(),
  status: z.enum(["ativo", "cancelado", "encerrado"]).default("ativo"),
});

export const upsertEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => EventInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const payload = { ...data, imagem_url: data.imagem_url || null };
    if (data.id) {
      const { error } = await supabase.from("events").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { error } = await supabase.from("events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getEventReservations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ eventId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { data: rows, error } = await supabase
      .from("reservations")
      .select("*, profiles!reservations_user_id_fkey(nome, email, avatar_url)")
      .eq("event_id", data.eventId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const setReservationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        reservationId: z.string().uuid(),
        status: z.enum(["confirmada", "cancelada", "presente", "ausente"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { error } = await supabase
      .from("reservations")
      .update({ status: data.status })
      .eq("id", data.reservationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const [{ count: totalEventos }, { count: totalReservas }, { count: presentes }] =
      await Promise.all([
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("reservations").select("*", { count: "exact", head: true }),
        supabase
          .from("reservations")
          .select("*", { count: "exact", head: true })
          .eq("status", "presente"),
      ]);
    return {
      totalEventos: totalEventos ?? 0,
      totalReservas: totalReservas ?? 0,
      presentes: presentes ?? 0,
    };
  });
