import { createFileRoute } from "@tanstack/react-router";
import { CheckInPage } from "@/components/clube/ClubeComponents";
export const Route = createFileRoute("/checkin")({ component: CheckInPage });
