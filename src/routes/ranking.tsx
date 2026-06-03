import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getRanking } from "@/lib/fee.functions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const rankingQO = queryOptions({ queryKey: ["ranking"], queryFn: () => getRanking() });

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking — Fe Paldolfi" },
      { name: "description", content: "Top clientes da Fe Paldolfi por pontos de engajamento." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(rankingQO),
  component: RankingPage,
  errorComponent: ({ error }) => <p className="p-8">{error.message}</p>,
});

function RankingPage() {
  const { data } = useSuspenseQuery(rankingQO);
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-5xl mb-3">Ranking</h1>
      <p className="text-muted-foreground mb-12">
        Top 20 clientes mais ativos. Ganhe pontos reservando e comparecendo aos eventos.
      </p>
      <ol className="space-y-2">
        {data.map((u, i) => (
          <li
            key={u.id}
            className="flex items-center gap-4 p-4 border border-border bg-card hover:bg-accent/30 transition"
          >
            <span className="font-serif text-2xl w-10 text-center text-primary">{i + 1}</span>
            <Avatar>
              <AvatarImage src={u.avatar_url ?? undefined} />
              <AvatarFallback>{u.nome?.slice(0, 2).toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
            <span className="flex-1 font-medium">{u.nome || "—"}</span>
            <span className="font-serif text-xl tabular-nums">{u.pontos} <span className="text-xs uppercase tracking-wider text-muted-foreground">pts</span></span>
          </li>
        ))}
        {data.length === 0 && <p className="text-muted-foreground">Ninguém pontuou ainda.</p>}
      </ol>
    </div>
  );
}
