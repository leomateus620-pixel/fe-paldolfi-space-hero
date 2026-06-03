import { createFileRoute } from "@tanstack/react-router";
import {
  EventCard,
  GlassCard,
  LiquidButton,
  NavPills,
  PlanCard,
  RankingPodium,
  SponsorBanner,
} from "@/components/clube/ClubeComponents";
import { benefits, events, plans } from "@/data/clubeMockData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clube Fê Pandolfi — Ritual de leitura no Charlie Brownie" },
      {
        name: "description",
        content:
          "Reserve seu espaço, viva seu ritual de leitura e faça parte de uma comunidade feita para desacelerar.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="club-bg min-h-screen">
      <NavPills />
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.1fr_.9fr] md:py-24">
        <div>
          <p className="text-xs uppercase tracking-[.32em] text-[#9a6a47]">
            Espaço Fê Pandolfi no Charlie Brownie
          </p>
          <h1 className="mt-5 font-serif text-6xl leading-[.95] text-[#321e15] md:text-8xl">
            Clube Fê Pandolfi
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-[#684a39]">
            Reserve seu espaço, viva seu ritual de leitura e faça parte de uma comunidade feita para
            desacelerar.
          </p>
          <p className="mt-5 max-w-xl rounded-[2rem] border border-white/60 bg-white/35 p-5 text-[#5c3b2b] backdrop-blur-xl">
            Não é só café. É o seu ritual de leitura: uma poltrona reservada, café, bolo, páginas
            abertas e pertencimento ao clube.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LiquidButton to="/reservar">Reservar meu ritual</LiquidButton>
            <LiquidButton to="/dashboard" variant="ghost">
              Entrar na comunidade
            </LiquidButton>
          </div>
        </div>
        <GlassCard className="relative isolate min-h-[480px] overflow-hidden bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,.78),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(215,168,94,.38),transparent_24%),linear-gradient(145deg,rgba(255,250,242,.78),rgba(239,210,183,.62)_48%,rgba(123,63,40,.22))] p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#d7a85e]/35 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 h-72 w-72 rounded-full bg-[#b66b4c]/25 blur-3xl" />
          <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(115deg,rgba(255,255,255,.5)_0_1px,transparent_1px_18px),radial-gradient(circle_at_32%_24%,rgba(255,255,255,.65),transparent_13%)]" />

          <div className="relative z-10 grid h-full gap-6 md:grid-cols-[.95fr_1.05fr]">
            <div className="flex flex-col justify-between gap-6">
              <div className="w-fit rounded-full border border-white/70 bg-white/45 px-4 py-2 text-xs font-semibold uppercase tracking-[.22em] text-[#7c4b31] shadow-inner backdrop-blur-xl">
                Clube de leitura premium
              </div>
              <div className="rounded-[2rem] border border-white/60 bg-white/45 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_24px_80px_rgba(92,55,33,.16)] backdrop-blur-2xl">
                <p className="font-serif text-4xl leading-none text-[#3a2419]">
                  Um espaço para ler, respirar e pertencer.
                </p>
                <p className="mt-3 text-sm leading-6 text-[#684a39]">
                  Cada visita inclui café, bolo e tempo reservado para você.
                </p>
              </div>
            </div>

            <div className="relative min-h-[300px]">
              <div className="absolute left-4 top-8 h-64 w-44 rotate-[-10deg] rounded-[1.7rem] border border-white/70 bg-gradient-to-br from-[#fffdf7] via-[#f7e8d3] to-[#d8a866] p-4 shadow-[0_30px_80px_rgba(92,55,33,.25)]">
                <div className="h-full rounded-[1.25rem] border border-[#c89b70]/35 bg-[linear-gradient(90deg,transparent_48%,rgba(112,73,49,.18)_49%,transparent_51%),repeating-linear-gradient(180deg,rgba(112,73,49,.18)_0_1px,transparent_1px_18px)]" />
              </div>
              <div className="absolute right-6 top-16 h-56 w-40 rotate-[12deg] rounded-[1.6rem] border border-white/70 bg-gradient-to-br from-[#8a4d34] via-[#b66b4c] to-[#edc989] p-3 shadow-[0_32px_90px_rgba(92,55,33,.28)]">
                <div className="h-full rounded-[1.15rem] border border-white/35 bg-white/18 backdrop-blur-sm" />
              </div>
              <div className="absolute bottom-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full border border-white/70 bg-white/50 shadow-[0_24px_70px_rgba(92,55,33,.22)] backdrop-blur-2xl">
                <div className="absolute left-1/2 top-7 h-12 w-16 -translate-x-1/2 rounded-b-[2rem] rounded-t-md bg-gradient-to-b from-[#fffaf2] to-[#d8b995] shadow-inner" />
                <div className="absolute right-4 top-9 h-8 w-7 rounded-full border-4 border-[#d8b995]" />
                <div className="absolute left-8 top-1 h-8 w-1 rounded-full bg-white/70 blur-sm" />
                <div className="absolute left-12 top-0 h-10 w-1 rounded-full bg-white/60 blur-sm" />
              </div>
              <div className="absolute bottom-2 right-3 rounded-[1.5rem] border border-white/65 bg-white/40 px-5 py-4 text-sm font-semibold text-[#5f3a28] shadow-xl backdrop-blur-xl">
                ☕ café + bolo · 📚 páginas abertas
              </div>
            </div>
          </div>
        </GlassCard>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-5 md:grid-cols-4">
          {benefits.slice(0, 4).map((b) => (
            <GlassCard key={b}>
              <p className="text-3xl">✦</p>
              <h3 className="mt-4 font-serif text-2xl">{b}</h3>
            </GlassCard>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-serif text-5xl">Planos do clube</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-serif text-5xl">Ranking anual</h2>
        <p className="mt-3 max-w-3xl text-[#684a39]">
          Ganhe pontos, suba de nível e participe do ranking anual. A competição valoriza check-ins,
          resenhas, eventos e indicações — não apenas frequência no café.
        </p>
        <div className="mt-8">
          <SponsorBanner />
        </div>
        <div className="mt-10">
          <RankingPodium />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-serif text-5xl">Eventos e benefícios</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <GlassCard className="text-center">
          <h2 className="font-serif text-5xl">
            As leitoras mais engajadas concorrem a premiações especiais.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#684a39]">
            Kindle, vale-livros, assinatura gratuita e uma comunidade que transforma a leitura em
            ritual.
          </p>
          <div className="mt-8">
            <LiquidButton to="/reservar">Quero fazer parte</LiquidButton>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
