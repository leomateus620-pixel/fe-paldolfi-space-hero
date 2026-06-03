export type PlanId = "leitora" | "devoradora";
export type MemberLevel =
  | "Leitora"
  | "Leitora Frequente"
  | "Leitora Premium"
  | "Embaixadora Fê Pandolfi";
export type ReservationStatus =
  | "reservada"
  | "check-in pendente"
  | "check-in realizado"
  | "cancelada"
  | "ausente"
  | "lotado";

export interface ClubPlan {
  id: PlanId;
  name: string;
  subtitle: string;
  monthlyVisits: number;
  usedVisits: number;
  price: string;
  benefits: string[];
  featured?: boolean;
  priority?: boolean;
  cycleEnd: string;
}

export interface ClubMember {
  id: string;
  name: string;
  initials: string;
  planId: PlanId;
  visitsUsed: number;
  visitsAllowed: number;
  points: number;
  level: MemberLevel;
  rank: number;
  booksCompleted: number;
  readingHours: number;
  subscriptionStatus: "ativa" | "pausada";
}

export interface ReservationSlot {
  id: string;
  date: string;
  time: string;
  ritual: string;
  capacity: number;
  occupied: number;
  status: ReservationStatus;
  benefit: string;
  priorityNote?: string;
}

export interface Reservation {
  id: string;
  memberName: string;
  planName: string;
  date: string;
  time: string;
  status: ReservationStatus;
  visitsRemaining: number;
  checkIn: boolean;
}

export interface RankingEntry {
  position: number;
  name: string;
  initials: string;
  level: MemberLevel;
  points: number;
  planName: string;
  isCurrent?: boolean;
}

export interface ClubEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  local: string;
  seats: string;
  points: number;
  description: string;
  status: "aberto" | "exclusivo" | "quase cheio";
  exclusivePlan?: string;
}

export interface PointsActivity {
  id: string;
  title: string;
  description: string;
  points: number;
  date: string;
}
