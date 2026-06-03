import { createFileRoute } from "@tanstack/react-router";
import { ReservationPage } from "@/components/clube/ClubeComponents";
export const Route = createFileRoute("/reservar")({ component: ReservationPage });
