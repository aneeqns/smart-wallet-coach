CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT '',
 avatar text NOT NULL DEFAULT '',
 preferences jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE FUNCTION public.create_smartsave_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles (id, display_name, avatar) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''));
 RETURN NEW;
END;
$$;
CREATE TRIGGER smartsave_profile_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_smartsave_profile();
CREATE TABLE public.smartsave_states (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
 state jsonb NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.smartsave_states TO authenticated;
GRANT ALL ON public.smartsave_states TO service_role;
ALTER TABLE public.smartsave_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own simulation" ON public.smartsave_states FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own simulation" ON public.smartsave_states FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own simulation" ON public.smartsave_states FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);