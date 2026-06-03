import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setHasSession(!!session),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-[#fff8ef]/75 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-serif text-2xl tracking-tight text-[#3d2419]">
          Clube Fê Pandolfi
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[#5d3c2c] md:flex">
          <Link to="/reservar" className="hover:text-[#9b5a3b]">
            Reservar
          </Link>
          <Link to="/dashboard" className="hover:text-[#9b5a3b]">
            Minha jornada
          </Link>
          <Link to="/ranking" className="hover:text-[#9b5a3b]">
            Ranking
          </Link>
          <Link to="/eventos" className="hover:text-[#9b5a3b]">
            Eventos
          </Link>
          <Link to="/admin-clube" className="hover:text-[#9b5a3b]">
            Admin
          </Link>
          {hasSession && (
            <Link to="/minhas-reservas" className="hover:text-[#9b5a3b]">
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
