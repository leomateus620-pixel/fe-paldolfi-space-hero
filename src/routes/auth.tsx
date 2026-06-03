import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — Fe Paldolfi" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/eventos", replace: true });
    });
  }, [navigate]);

  const signIn = async () => {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) {
      toast.error("Erro ao entrar");
      setLoading(false);
      return;
    }
    if (res.redirected) return;
    navigate({ to: "/eventos", replace: true });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Fe Paldolfi</p>
        <h1 className="font-serif text-4xl mb-3">Bem-vinda</h1>
        <p className="text-muted-foreground mb-10">Entre com sua conta Google para reservar seu lugar.</p>
        <Button size="lg" className="w-full" onClick={signIn} disabled={loading}>
          {loading ? "Conectando..." : "Continuar com Google"}
        </Button>
      </div>
    </div>
  );
}
