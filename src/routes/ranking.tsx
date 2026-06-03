import { createFileRoute } from "@tanstack/react-router";
import { RankingPage } from "@/components/clube/ClubeComponents";
export const Route = createFileRoute("/ranking")({ component: RankingPage });
