import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/clube/ClubeComponents";
export const Route = createFileRoute("/perfil")({ component: ProfilePage });
