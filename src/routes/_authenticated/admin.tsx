import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  adminStats,
  deleteEvent,
  getEventReservations,
  getMe,
  listEvents,
  setReservationStatus,
  upsertEvent,
} from "@/lib/fee.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const eventsQO = queryOptions({ queryKey: ["events"], queryFn: () => listEvents() });
const statsQO = queryOptions({ queryKey: ["admin-stats"], queryFn: () => adminStats() });
const meQO = queryOptions({ queryKey: ["me"], queryFn: () => getMe() });

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQO);
    if (!me.isAdmin) throw redirect({ to: "/minhas-reservas" });
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(eventsQO),
      context.queryClient.ensureQueryData(statsQO),
    ]),
  component: AdminPanel,
  errorComponent: ({ error }) => <p className="p-8">{error.message}</p>,
});

function toLocalInput(s: string) {
  const d = new Date(s);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AdminPanel() {
  const { data: events } = useSuspenseQuery(eventsQO);
  const { data: stats } = useSuspenseQuery(statsQO);
  const qc = useQueryClient();
  const save = useServerFn(upsertEvent);
  const del = useServerFn(deleteEvent);
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const blank = {
    titulo: "",
    descricao: "",
    data_inicio: new Date().toISOString(),
    data_fim: new Date(Date.now() + 3600_000).toISOString(),
    vagas_total: 20,
    local: "",
    imagem_url: "",
    status: "ativo" as const,
  };

  const openNew = () => { setEditing(blank); setOpen(true); };
  const openEdit = (e: any) => { setEditing(e); setOpen(true); };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await save({
        data: {
          id: editing.id,
          titulo: String(f.get("titulo")),
          descricao: String(f.get("descricao") ?? ""),
          data_inicio: new Date(String(f.get("data_inicio"))).toISOString(),
          data_fim: new Date(String(f.get("data_fim"))).toISOString(),
          vagas_total: Number(f.get("vagas_total")),
          local: String(f.get("local") ?? ""),
          imagem_url: String(f.get("imagem_url") ?? ""),
          status: String(f.get("status")) as any,
        },
      });
      toast.success("Evento salvo");
      setOpen(false);
      qc.invalidateQueries();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este evento?")) return;
    try { await del({ data: { id } }); toast.success("Excluído"); qc.invalidateQueries(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between mb-12">
        <h1 className="font-serif text-5xl">Painel Admin</h1>
        <Button onClick={openNew}>Novo evento</Button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-12">
        <Stat label="Eventos" value={stats.totalEventos} />
        <Stat label="Reservas" value={stats.totalReservas} />
        <Stat label="Presenças" value={stats.presentes} />
      </div>

      <h2 className="font-serif text-2xl mb-6">Eventos</h2>
      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.id} className="border border-border bg-card p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-serif text-xl">{e.titulo}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(e.data_inicio).toLocaleString("pt-BR")} · {e.vagas_ocupadas}/{e.vagas_total} vagas
              </p>
              <Badge className="mt-2" variant={e.status === "ativo" ? "default" : "secondary"}>{e.status}</Badge>
            </div>
            <div className="flex gap-2">
              <ReservationsDialog eventId={e.id} titulo={e.titulo} />
              <Button variant="outline" size="sm" onClick={() => openEdit(e)}>Editar</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(e.id)}>Excluir</Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar evento" : "Novo evento"}</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={handleSave} className="space-y-4">
              <Field name="titulo" label="Título" defaultValue={editing.titulo} required />
              <div>
                <Label>Descrição</Label>
                <Textarea name="descricao" defaultValue={editing.descricao} rows={3} />
              </div>
              <Field name="local" label="Local" defaultValue={editing.local} />
              <Field name="imagem_url" label="URL da imagem" defaultValue={editing.imagem_url ?? ""} placeholder="https://..." />
              <div className="grid grid-cols-2 gap-3">
                <Field name="data_inicio" label="Início" type="datetime-local" defaultValue={toLocalInput(editing.data_inicio)} required />
                <Field name="data_fim" label="Fim" type="datetime-local" defaultValue={toLocalInput(editing.data_fim)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field name="vagas_total" label="Vagas" type="number" defaultValue={editing.vagas_total} required />
                <div>
                  <Label>Status</Label>
                  <Select name="status" defaultValue={editing.status}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                      <SelectItem value="encerrado">Encerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Salvar</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-card p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="font-serif text-4xl mt-2">{value}</p>
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div>
      <Label htmlFor={rest.name}>{label}</Label>
      <Input id={rest.name} {...rest} />
    </div>
  );
}

function ReservationsDialog({ eventId, titulo }: { eventId: string; titulo: string }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const fetchRes = useServerFn(getEventReservations);
  const setStatus = useServerFn(setReservationStatus);
  const qc = useQueryClient();

  const load = async () => {
    const r = await fetchRes({ data: { eventId } });
    setRows(r);
  };

  const change = async (id: string, status: any) => {
    await setStatus({ data: { reservationId: id, status } });
    await load();
    qc.invalidateQueries();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) load(); }}>
      <DialogTrigger asChild><Button variant="outline" size="sm">Reservas</Button></DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{titulo} · Reservas</DialogTitle></DialogHeader>
        {rows.length === 0 ? <p className="text-muted-foreground text-sm">Sem reservas.</p> : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 border border-border">
                <div>
                  <p className="font-medium">{r.profiles?.nome}</p>
                  <p className="text-xs text-muted-foreground">{r.profiles?.email}</p>
                  <Badge variant="secondary" className="mt-1">{r.status}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => change(r.id, "presente")}>Presente</Button>
                  <Button size="sm" variant="outline" onClick={() => change(r.id, "ausente")}>Ausente</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
