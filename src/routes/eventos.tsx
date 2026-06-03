import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { listEvents, reserveSpot } from "@/lib/fee.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const eventsQO = queryOptions({ queryKey: ["events"], queryFn: () => listEvents() });

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos — Fe Paldolfi" },
      { name: "description", content: "Lista de workshops e eventos abertos para reserva na Fe Paldolfi." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(eventsQO),
  component: EventosPage,
  errorComponent: ({ error }) => <p className="p-8">{error.message}</p>,
});

function EventosPage() {
  const { data: events } = useSuspenseQuery(eventsQO);
  const reserve = useServerFn(reserveSpot);
  const qc = useQueryClient();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleReserve = async (id: string) => {
    if (!signedIn) {
      window.location.href = "/auth";
      return;
    }
    try {
      await reserve({ data: { eventId: id } });
      toast.success("Reserva confirmada! +10 pontos");
      qc.invalidateQueries();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao reservar");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-serif text-5xl mb-12">Eventos</h1>
      {events.length === 0 ? (
        <p className="text-muted-foreground">Nenhum evento disponível no momento.</p>
      ) : (
        <div className="space-y-6">
          {events.map((e) => {
            const lotado = e.vagas_ocupadas >= e.vagas_total;
            const inativo = e.status !== "ativo";
            const restantes = Math.max(0, e.vagas_total - e.vagas_ocupadas);
            return (
              <article key={e.id} className="grid md:grid-cols-[280px_1fr_auto] gap-6 border-b border-border pb-8">
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  {e.imagem_url ? (
                    <img src={e.imagem_url} alt={e.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent to-secondary" />
                  )}
                </div>
                <div>
                  <p className="text-xs tracking-[0.25em] uppercase text-primary">
                    {new Date(e.data_inicio).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}
                  </p>
                  <h2 className="font-serif text-3xl mt-2">{e.titulo}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{e.local}</p>
                  <p className="mt-4 text-sm leading-relaxed">{e.descricao}</p>
                  <div className="mt-4 flex gap-2">
                    {inativo && <Badge variant="secondary">{e.status}</Badge>}
                    {lotado ? (
                      <Badge variant="destructive">Lotado</Badge>
                    ) : (
                      <Badge variant="outline">{restantes} vagas restantes</Badge>
                    )}
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 md:justify-center">
                  <Button
                    disabled={lotado || inativo}
                    onClick={() => handleReserve(e.id)}
                  >
                    Reservar
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
