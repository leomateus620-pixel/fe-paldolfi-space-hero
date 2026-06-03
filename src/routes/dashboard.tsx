import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/clube/ClubeComponents";
export const Route = createFileRoute("/dashboard")({ component: DashboardPage });
