import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { cancelReservation, getMe, getMyReservations } from "@/lib/fee.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const myResQO = queryOptions({ queryKey: ["my-reservations"], queryFn: () => getMyReservations() });
const meQO = queryOptions({ queryKey: ["me"], queryFn: () => getMe() });

export const Route = createFileRoute("/_authenticated/minhas-reservas")({
  component: MinhasReservas,
  errorComponent: ({ error }) => <p className="p-8">{error.message}</p>,
});

function MinhasReservas() {
  const { data: me } = useSuspenseQuery(meQO);
  const { data: reservations } = useSuspenseQuery(myResQO);
  const cancel = useServerFn(cancelReservation);
  const qc = useQueryClient();

  const handleCancel = async (id: string) => {
    if (!confirm("Cancelar esta reserva?")) return;
    try {
      await cancel({ data: { reservationId: id } });
      toast.success("Reserva cancelada");
      qc.invalidateQueries();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-5xl">Olá, {me.profile?.nome}</h1>
          <p className="text-muted-foreground mt-2">Seus pontos: <span className="text-primary font-medium">{me.profile?.pontos ?? 0}</span></p>
        </div>
        {me.isAdmin && (
          <Link to="/admin"><Button variant="outline">Painel Admin</Button></Link>
        )}
      </div>

      <h2 className="font-serif text-2xl mb-6">Minhas reservas</h2>
      {reservations.length === 0 ? (
        <p className="text-muted-foreground">Você ainda não tem reservas. <Link to="/eventos" className="text-primary underline">Ver eventos</Link></p>
      ) : (
        <div className="space-y-4">
          {reservations.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between border border-border p-5 bg-card">
              <div>
                <h3 className="font-serif text-xl">{r.events?.titulo}</h3>
                <p className="text-sm text-muted-foreground">
                  {r.events && new Date(r.events.data_inicio).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}
                </p>
                <Badge variant={r.status === "confirmada" ? "default" : r.status === "presente" ? "default" : "secondary"} className="mt-2">
                  {r.status}
                </Badge>
              </div>
              {r.status === "confirmada" && (
                <Button variant="outline" size="sm" onClick={() => handleCancel(r.id)}>Cancelar</Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
