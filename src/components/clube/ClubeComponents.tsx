import { Link } from "@tanstack/react-router";
import type React from "react";
import { cn } from "@/lib/utils";
import {
  activities,
  benefits,
  currentMember,
  events,
  plans,
  pointRules,
  ranking,
  reservations,
  reservationSlots,
} from "@/data/clubeMockData";
import type { ClubEvent, ClubPlan, ReservationSlot } from "@/types/clube";

export function GlassCard({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "glass-card rounded-[2rem] border border-white/55 bg-white/38 p-6 shadow-[0_24px_80px_rgba(92,55,33,.14)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(92,55,33,.20)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LiquidButton({
  children,
  to = "/reservar",
  variant = "primary",
}: React.PropsWithChildren<{ to?: string; variant?: "primary" | "ghost" }>) {
  return (
    <Link
      to={to as any}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition active:scale-95",
        variant === "primary"
          ? "bg-gradient-to-r from-[#7b3f28] via-[#b66b4c] to-[#d7a85e] text-white shadow-[#9b5b3d]/30 hover:brightness-110"
          : "border border-[#8b5a3d]/25 bg-white/45 text-[#5d3827] backdrop-blur-xl hover:bg-white/70",
      )}
    >
      {children}
    </Link>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status.includes("realizado") || status === "aberto" || status === "ativa"
      ? "bg-emerald-100 text-emerald-800"
      : status.includes("pendente") || status.includes("quase")
        ? "bg-amber-100 text-amber-800"
        : status.includes("lotado") || status.includes("ausente")
          ? "bg-rose-100 text-rose-800"
          : "bg-[#efe1d2] text-[#6f432f]";
  return <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", tone)}>{status}</span>;
}

export function MemberLevelBadge({ level = currentMember.level }: { level?: string }) {
  const icon = level.includes("Embaixadora")
    ? "👑"
    : level.includes("Premium")
      ? "☕"
      : level.includes("Frequente")
        ? "📚"
        : "🌱";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/45 px-3 py-1 text-xs font-semibold text-[#6b402d] shadow-inner">
      {icon} {level}
    </span>
  );
}

export function VisitProgress({
  used = currentMember.visitsUsed,
  total = currentMember.visitsAllowed,
}) {
  const percent = Math.round((used / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{used} visitas usadas</span>
        <span className="font-semibold">{total - used} restantes</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#ead8c6]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#8c4b31] to-[#d7a85e] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-[#7b5a49]">Ciclo válido até 30 de junho de 2026.</p>
    </div>
  );
}

export function PlanCard({ plan }: { plan: ClubPlan }) {
  return (
    <GlassCard
      className={cn("relative", plan.featured && "ring-2 ring-[#d7a85e]/70 bg-[#fff8ee]/55")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[.25em] text-[#9d6b45]">
            {plan.priority ? "Prioridade de reserva" : "Ritual mensal"}
          </p>
          <h3 className="mt-3 font-serif text-3xl text-[#3d2419]">{plan.name}</h3>
          <p className="mt-2 text-sm text-[#70513f]">{plan.subtitle}</p>
        </div>
        {plan.priority && (
          <span className="rounded-full bg-[#3d2419] px-3 py-1 text-xs text-white">prioridade</span>
        )}
      </div>
      <p className="mt-6 font-serif text-4xl text-[#5a321f]">{plan.price}</p>
      <VisitProgress used={plan.usedVisits} total={plan.monthlyVisits} />
      <ul className="mt-6 space-y-2 text-sm text-[#604130]">
        {plan.benefits.map((b) => (
          <li key={b}>✦ {b}</li>
        ))}
      </ul>
      <LiquidButton to="/plano">Ver meu plano</LiquidButton>
    </GlassCard>
  );
}

export function ReservationSlotCard({ slot }: { slot: ReservationSlot }) {
  const remaining = slot.capacity - slot.occupied;
  const soldOut = remaining <= 0 || slot.status === "lotado";
  return (
    <GlassCard className={cn(soldOut && "opacity-70")}>
      <div className="flex items-center justify-between">
        <p className="font-serif text-3xl text-[#42271b]">{slot.time}</p>
        <StatusBadge status={soldOut ? "lotado" : remaining === 1 ? "quase cheio" : "disponível"} />
      </div>
      <p className="mt-2 text-lg font-medium text-[#6d412d]">{slot.ritual}</p>
      <p className="mt-4 text-sm text-[#755541]">
        {remaining} de {slot.capacity} vagas disponíveis
      </p>
      <div className="mt-3 h-2 rounded-full bg-[#ead7c5]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#9b5a3b] to-[#d9aa62]"
          style={{ width: `${(slot.occupied / slot.capacity) * 100}%` }}
        />
      </div>
      <p className="mt-4 rounded-2xl bg-white/45 p-3 text-sm text-[#5f402f]">☕ {slot.benefit}</p>
      {slot.priorityNote && (
        <p className="mt-2 text-xs font-semibold text-[#9a653c]">{slot.priorityNote}</p>
      )}
      <button
        disabled={soldOut}
        className={cn(
          "mt-5 w-full rounded-full px-5 py-3 text-sm font-semibold transition active:scale-95",
          soldOut
            ? "cursor-not-allowed bg-[#d8c7b8] text-[#8a7465]"
            : "bg-[#5a321f] text-white shadow-lg hover:bg-[#74452f]",
        )}
      >
        {soldOut ? "Horário lotado" : "Reservar ritual"}
      </button>
    </GlassCard>
  );
}

export function RankingPodium() {
  const top = ranking.slice(0, 3);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {top.map((r, i) => (
        <GlassCard
          key={r.position}
          className={cn("text-center", i === 0 && "md:-mt-6 bg-[#fff6dc]/70")}
        >
          <p className="text-4xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</p>
          <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#7c442e] to-[#d9aa62] font-serif text-xl text-white">
            {r.initials}
          </div>
          <h3 className="mt-4 font-serif text-2xl">{r.name}</h3>
          <MemberLevelBadge level={r.level} />
          <p className="mt-3 text-2xl font-bold text-[#7a442d]">{r.points} pts</p>
        </GlassCard>
      ))}
    </div>
  );
}

export function RankingTable() {
  return (
    <GlassCard>
      <div className="space-y-3">
        {ranking.map((r) => (
          <div
            key={r.position}
            className={cn(
              "grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-3xl p-3",
              r.isCurrent ? "bg-[#fff0d6] ring-1 ring-[#d7a85e]" : "bg-white/35",
            )}
          >
            <span className="font-serif text-2xl text-[#7a442d]">#{r.position}</span>
            <div>
              <p className="font-semibold text-[#3c251b]">{r.name}</p>
              <p className="text-xs text-[#7d5b49]">
                {r.level} · {r.planName}
              </p>
            </div>
            <p className="font-bold text-[#6b3d2b]">{r.points} pts</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function PointsTimeline() {
  return (
    <GlassCard>
      <h3 className="font-serif text-3xl">Capítulos recentes de pontos</h3>
      <div className="mt-6 space-y-4">
        {activities.map((a) => (
          <div key={a.id} className="flex gap-4 rounded-3xl bg-white/35 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6a3c29] text-white">
              +{a.points}
            </span>
            <div>
              <p className="font-semibold">{a.title}</p>
              <p className="text-sm text-[#735341]">{a.description}</p>
              <p className="text-xs text-[#9a755e]">{a.date}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function EventCard({ event }: { event: ClubEvent }) {
  return (
    <GlassCard>
      <div className="flex justify-between gap-4">
        <div>
          <StatusBadge status={event.status} />
          <h3 className="mt-4 font-serif text-3xl">{event.title}</h3>
        </div>
        <span className="text-3xl">📖</span>
      </div>
      <p className="mt-3 text-sm text-[#735341]">{event.description}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[#9a755e]">Data</dt>
          <dd className="font-semibold">
            {event.date} · {event.time}
          </dd>
        </div>
        <div>
          <dt className="text-[#9a755e]">Vagas</dt>
          <dd className="font-semibold">{event.seats}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[#9a755e]">Local</dt>
          <dd className="font-semibold">{event.local}</dd>
        </div>
      </dl>
      <p className="mt-4 rounded-2xl bg-white/40 p-3 text-sm">
        +{event.points} pontos por participação{" "}
        {event.exclusivePlan ? `· Exclusivo ${event.exclusivePlan}` : ""}
      </p>
      <LiquidButton to="/eventos">Participar</LiquidButton>
    </GlassCard>
  );
}

export function AdminMetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <GlassCard className="p-5">
      <p className="text-xs uppercase tracking-[.22em] text-[#9a6a47]">{label}</p>
      <p className="mt-2 font-serif text-4xl text-[#3d2419]">{value}</p>
      <p className="text-sm text-[#735341]">{hint}</p>
    </GlassCard>
  );
}

export function SponsorBanner() {
  return (
    <div className="rounded-[2rem] border border-[#d7a85e]/50 bg-gradient-to-r from-[#fff4d8]/80 to-white/35 p-5 text-center shadow-inner">
      <p className="text-xs uppercase tracking-[.25em] text-[#9a6a47]">
        Ranking anual patrocinado por
      </p>
      <p className="font-serif text-3xl text-[#59321f]">Livraria Aurora & Charlie Brownie</p>
    </div>
  );
}

export const NavPills = () => (
  <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-6 py-4 text-sm">
    <LiquidButton to="/dashboard" variant="ghost">
      Minha jornada
    </LiquidButton>
    <LiquidButton to="/reservar" variant="ghost">
      Reservar
    </LiquidButton>
    <LiquidButton to="/checkin" variant="ghost">
      Check-in
    </LiquidButton>
    <LiquidButton to="/ranking" variant="ghost">
      Ranking
    </LiquidButton>
    <LiquidButton to="/eventos" variant="ghost">
      Eventos
    </LiquidButton>
    <LiquidButton to="/admin-clube" variant="ghost">
      Admin
    </LiquidButton>
  </div>
);

export function PageShell({
  eyebrow,
  title,
  children,
}: React.PropsWithChildren<{ eyebrow: string; title: string }>) {
  return (
    <div className="club-bg min-h-screen">
      <NavPills />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-xs uppercase tracking-[.3em] text-[#9a6a47]">{eyebrow}</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight text-[#332016] md:text-7xl">
          {title}
        </h1>
        <div className="mt-10">{children}</div>
      </main>
    </div>
  );
}

export function DashboardPage() {
  return (
    <PageShell
      eyebrow="Comunidade Fê Pandolfi"
      title={`Olá, ${currentMember.name}. Seu próximo capítulo já está reservado?`}
    >
      <div className="grid gap-5 md:grid-cols-4">
        <AdminMetricCard label="Próxima pausa" value="Hoje 14h" hint="Espaço Fê Pandolfi" />
        <AdminMetricCard
          label="Visitas restantes"
          value="3"
          hint="Você ainda pode viver este mês"
        />
        <AdminMetricCard
          label="Pontos"
          value={`${currentMember.points}`}
          hint="Ranking anual por engajamento"
        />
        <AdminMetricCard
          label="Livros"
          value={`${currentMember.booksCompleted}`}
          hint="Concluídos no clube"
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <GlassCard>
          <h2 className="font-serif text-4xl">Sua jornada como leitora</h2>
          <p className="mt-3 text-[#72513e]">
            Você já viveu 12 rituais de leitura e acumulou {currentMember.readingHours} horas
            desacelerando no Espaço Fê Pandolfi.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LiquidButton to="/reservar">Reservar horário</LiquidButton>
            <LiquidButton to="/checkin" variant="ghost">
              Fazer check-in
            </LiquidButton>
            <LiquidButton to="/ranking" variant="ghost">
              Ver ranking
            </LiquidButton>
          </div>
        </GlassCard>
        <GlassCard>
          <MemberLevelBadge />
          <h3 className="mt-4 font-serif text-3xl">
            Você está a 45 pontos de se tornar Embaixadora.
          </h3>
          <VisitProgress used={455} total={500} />
        </GlassCard>
      </div>
    </PageShell>
  );
}

export function ReservationPage() {
  return (
    <PageShell eyebrow="Reserva premium" title="Escolha o horário do seu ritual de leitura">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-5 md:grid-cols-3">
          {reservationSlots.map((s) => (
            <ReservationSlotCard key={s.id} slot={s} />
          ))}
        </div>
        <GlassCard>
          <h3 className="font-serif text-3xl">Seu plano ativo</h3>
          <p className="mt-2 text-sm text-[#72513e]">
            Plano Devoradora de Livros com prioridade visual nas reservas.
          </p>
          <VisitProgress />
          <p className="mt-5 rounded-2xl bg-white/45 p-4 text-sm">
            Ao reservar, 1 visita será consumida e seu café + bolo ficam incluídos.
          </p>
        </GlassCard>
      </div>
    </PageShell>
  );
}

export function CheckInPage() {
  return (
    <PageShell eyebrow="Check-in" title="Seu ritual começou. Boa leitura.">
      <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
        <GlassCard>
          <StatusBadge status="aguardando check-in" />
          <h2 className="mt-4 font-serif text-5xl">Reserva de hoje · 14h às 16h</h2>
          <p className="mt-4 text-[#72513e]">
            Confirme sua chegada ao Espaço Fê Pandolfi no Charlie Brownie.
          </p>
          <button className="mt-8 rounded-full bg-gradient-to-r from-[#6f3e2a] to-[#d7a85e] px-8 py-4 font-semibold text-white shadow-xl active:scale-95">
            Fazer check-in · +10 pontos
          </button>
          <p className="mt-4 text-sm text-[#7d5b49]">
            Check-in realizado. Seu ritual de leitura começou.
          </p>
        </GlassCard>
        <PointsTimeline />
      </div>
    </PageShell>
  );
}

export function RankingPage() {
  return (
    <PageShell eyebrow="Ranking justo por pontos" title="Ranking das leitoras do ano">
      <SponsorBanner />
      <div className="mt-10">
        <RankingPodium />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <RankingTable />
        <GlassCard>
          <h3 className="font-serif text-3xl">Como ganhar pontos</h3>
          <div className="mt-5 space-y-3">
            {pointRules.map((p) => (
              <div key={p.label} className="rounded-3xl bg-white/35 p-4">
                <p className="font-semibold">
                  {p.icon} {p.label}: +{p.points}
                </p>
                <p className="text-sm text-[#735341]">{p.text}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}

export function EventsPage() {
  return (
    <PageShell eyebrow="Eventos exclusivos" title="Encontros para ler, respirar e pertencer">
      <div className="grid gap-5 md:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </PageShell>
  );
}

export function BenefitsPage() {
  return (
    <PageShell eyebrow="Benefícios de membro" title="Não é só café. É o seu ritual de leitura.">
      <div className="grid gap-5 md:grid-cols-4">
        {benefits.map((b) => (
          <GlassCard key={b} className="min-h-40">
            <p className="text-3xl">✦</p>
            <h3 className="mt-4 font-serif text-2xl">{b}</h3>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}

export function PlanPage() {
  return (
    <PageShell eyebrow="Meu plano" title="Você ainda tem 3 visitas para viver este mês">
      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </PageShell>
  );
}

export function HistoryPage() {
  return (
    <PageShell eyebrow="Histórico" title="Sua biblioteca de rituais vividos">
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="font-serif text-3xl">Reservas passadas e futuras</h3>
          <div className="mt-5 space-y-3">
            {reservations.map((r) => (
              <div key={r.id} className="rounded-3xl bg-white/35 p-4">
                <div className="flex justify-between">
                  <b>
                    {r.date} · {r.time}
                  </b>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-sm text-[#735341]">
                  {r.memberName} · {r.planName} · {r.visitsRemaining} visitas restantes
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
        <PointsTimeline />
      </div>
    </PageShell>
  );
}

export function ProfilePage() {
  return (
    <PageShell eyebrow="Perfil da leitora" title="Marina Duarte, Leitora Premium">
      <div className="grid gap-6 md:grid-cols-3">
        <GlassCard className="md:col-span-1 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#6f3e2a] font-serif text-3xl text-white">
            MD
          </div>
          <h2 className="mt-4 font-serif text-3xl">Marina Duarte</h2>
          <MemberLevelBadge />
        </GlassCard>
        <GlassCard className="md:col-span-2">
          <h3 className="font-serif text-4xl">27 horas desacelerando no Espaço Fê Pandolfi.</h3>
          <p className="mt-4 text-[#72513e]">
            5 livros concluídos, 12 rituais vividos e posição #4 no ranking anual.
          </p>
          <VisitProgress />
        </GlassCard>
      </div>
    </PageShell>
  );
}

export function AdminClubPage() {
  return (
    <PageShell eyebrow="Área administrativa" title="Painel do Clube Fê Pandolfi">
      <div className="grid gap-5 md:grid-cols-4">
        <AdminMetricCard label="Reservas hoje" value="11" hint="3 slots em operação" />
        <AdminMetricCard label="Ocupação média" value="82%" hint="Poltronas reservadas" />
        <AdminMetricCard label="Check-ins pendentes" value="4" hint="Confirmar chegada" />
        <AdminMetricCard label="Membros ativos" value="128" hint="Planos Leitora e Devoradora" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <GlassCard>
          <h3 className="font-serif text-3xl">Reservas e check-ins</h3>
          <div className="mt-5 space-y-3">
            {reservations.map((r) => (
              <div
                key={r.id}
                className="grid gap-2 rounded-3xl bg-white/35 p-4 md:grid-cols-[1fr_auto_auto]"
              >
                <div>
                  <p className="font-semibold">{r.memberName}</p>
                  <p className="text-sm text-[#735341]">
                    {r.planName} · {r.date} · {r.time}
                  </p>
                </div>
                <StatusBadge status={r.status} />
                <button className="rounded-full border border-[#8b5a3d]/25 px-4 py-2 text-sm">
                  Confirmar
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="font-serif text-3xl">Configurações do clube</h3>
          <div className="mt-5 space-y-3 text-sm text-[#604130]">
            <p>Limite por horário: 4 vagas.</p>
            <p>Horários: 09h às 11h, 14h às 16h, 16h às 18h.</p>
            <p>Pontos: check-in 10, resenha 20, evento 15, indicação 30.</p>
            <p>Patrocinador: Livraria Aurora & Charlie Brownie.</p>
            <p>Premiações: Kindle, vale-livros e assinatura gratuita.</p>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}
