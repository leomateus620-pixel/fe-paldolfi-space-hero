import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listEvents } from "@/lib/fee.functions";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero.jpg";

const eventsQO = queryOptions({ queryKey: ["events"], queryFn: () => listEvents() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fe Paldolfi — Eventos e Workshops Exclusivos" },
      { name: "description", content: "Reserve seu lugar em eventos e workshops da Fe Paldolfi. Acumule pontos e suba no ranking." },
      { property: "og:title", content: "Fe Paldolfi — Eventos e Workshops" },
      { property: "og:description", content: "Experiências exclusivas para clientes da Fe Paldolfi." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(eventsQO),
  component: Index,
  errorComponent: ({ error }) => <p className="p-8">{error.message}</p>,
});

function Index() {
  const { data: events } = useSuspenseQuery(eventsQO);
  const upcoming = events.filter((e) => e.status === "ativo").slice(0, 3);

  return (
    <div>
      <section className="relative">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-32 md:py-48">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Fe Paldolfi · Experiências</p>
          <h1 className="font-serif text-5xl md:text-7xl max-w-2xl leading-[1.05]">
            Encontros que celebram quem você é.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Reserve seu lugar em workshops e eventos exclusivos. Acumule pontos a cada presença e suba no ranking.
          </p>
          <div className="mt-10 flex gap-3">
            <Link to="/eventos"><Button size="lg">Ver eventos</Button></Link>
            <Link to="/ranking"><Button size="lg" variant="outline">Ranking</Button></Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-serif text-3xl md:text-4xl">Próximos encontros</h2>
          <Link to="/eventos" className="text-sm text-primary hover:underline">Ver todos →</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground">Nenhum evento publicado ainda.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {upcoming.map((e) => (
              <Link key={e.id} to="/eventos" className="group block">
                <div className="aspect-[4/5] bg-muted overflow-hidden mb-4">
                  {e.imagem_url ? (
                    <img src={e.imagem_url} alt={e.titulo} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent to-secondary" />
                  )}
                </div>
                <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
                  {new Date(e.data_inicio).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
                </p>
                <h3 className="font-serif text-2xl mt-2">{e.titulo}</h3>
                <p className="text-sm text-muted-foreground mt-1">{e.local}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
