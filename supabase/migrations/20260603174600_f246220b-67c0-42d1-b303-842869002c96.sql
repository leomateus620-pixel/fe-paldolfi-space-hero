
-- Roles enum and user_roles
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL DEFAULT '',
  email text,
  avatar_url text,
  pontos integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Events
CREATE TYPE public.event_status AS ENUM ('ativo','cancelado','encerrado');
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  data_inicio timestamptz NOT NULL,
  data_fim timestamptz NOT NULL,
  vagas_total integer NOT NULL CHECK (vagas_total > 0),
  vagas_ocupadas integer NOT NULL DEFAULT 0,
  local text NOT NULL DEFAULT '',
  imagem_url text,
  status public.event_status NOT NULL DEFAULT 'ativo',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events public read" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins manage events" ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Reservations
CREATE TYPE public.reservation_status AS ENUM ('confirmada','cancelada','presente','ausente');
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.reservation_status NOT NULL DEFAULT 'confirmada',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own reservations" ON public.reservations FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own reservations" ON public.reservations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reservations" ON public.reservations FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- Profile trigger on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Reservation status change → update points + seats
CREATE OR REPLACE FUNCTION public.handle_reservation_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  delta_points integer := 0;
  delta_seats integer := 0;
  evt RECORD;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'confirmada' THEN
      delta_points := 10;
      delta_seats := 1;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- reverse old
    IF OLD.status = 'confirmada' THEN delta_seats := delta_seats - 1; delta_points := delta_points - 10; END IF;
    IF OLD.status = 'presente' THEN delta_points := delta_points - 25; END IF;
    -- apply new
    IF NEW.status = 'confirmada' THEN delta_seats := delta_seats + 1; delta_points := delta_points + 10; END IF;
    IF NEW.status = 'presente' THEN delta_points := delta_points + 25; END IF;
    IF NEW.status = 'cancelada' AND OLD.status = 'confirmada' THEN
      SELECT data_inicio INTO evt FROM public.events WHERE id = NEW.event_id;
      IF evt.data_inicio - now() < interval '24 hours' THEN
        delta_points := delta_points - 5;
      END IF;
    END IF;
  END IF;

  IF delta_seats <> 0 THEN
    UPDATE public.events SET vagas_ocupadas = GREATEST(0, vagas_ocupadas + delta_seats) WHERE id = NEW.event_id;
  END IF;
  IF delta_points <> 0 THEN
    UPDATE public.profiles SET pontos = GREATEST(0, pontos + delta_points) WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_reservation_change
AFTER INSERT OR UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.handle_reservation_change();

-- Check seats trigger
CREATE OR REPLACE FUNCTION public.check_seats_available()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE evt RECORD;
BEGIN
  IF NEW.status = 'confirmada' THEN
    SELECT vagas_total, vagas_ocupadas, status FROM public.events WHERE id = NEW.event_id INTO evt;
    IF evt.status <> 'ativo' THEN RAISE EXCEPTION 'Evento não está ativo'; END IF;
    IF evt.vagas_ocupadas >= evt.vagas_total THEN RAISE EXCEPTION 'Evento lotado'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER check_seats_before_reservation
BEFORE INSERT ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.check_seats_available();
