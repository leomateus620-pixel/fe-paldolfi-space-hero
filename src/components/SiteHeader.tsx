import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl tracking-tight">
          Fe Paldolfi
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/eventos" className="hover:text-primary transition-colors">
            Eventos
          </Link>
          <Link to="/ranking" className="hover:text-primary transition-colors">
            Ranking
          </Link>
          {hasSession && (
            <Link to="/minhas-reservas" className="hover:text-primary transition-colors">
              Minhas Reservas
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {hasSession ? (
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sair
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm">Entrar</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
