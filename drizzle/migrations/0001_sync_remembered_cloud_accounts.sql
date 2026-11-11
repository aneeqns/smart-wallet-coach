GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.smartsave_states TO authenticated;
GRANT ALL ON public.smartsave_states TO service_role;
CREATE TABLE public.smartsave_account_directories (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
 accounts jsonb NOT NULL DEFAULT '[]'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.smartsave_account_directories TO authenticated;
GRANT ALL ON public.smartsave_account_directories TO service_role;
ALTER TABLE public.smartsave_account_directories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own account directory" ON public.smartsave_account_directories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own account directory" ON public.smartsave_account_directories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own account directory" ON public.smartsave_account_directories FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);