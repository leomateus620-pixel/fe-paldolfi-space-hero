import { createFileRoute } from "@tanstack/react-router";
import { EventsPage } from "@/components/clube/ClubeComponents";
export const Route = createFileRoute("/eventos")({ component: EventsPage });
