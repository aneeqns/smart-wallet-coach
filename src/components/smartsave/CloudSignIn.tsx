import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import '@lovable.dev/cloud-auth-js/styles.css';
import { useSmartSave } from '@/lib/smartsave/store';
import logo from '@/assets/smartsave-logo.png.asset.json';

export function CloudSignIn() {
  const { authEmail, cancelAuth } = useSmartSave();
  const [email, setEmail] = useState(authEmail);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const result = signup
        ? await supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: window.location.origin } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) setMessage(result.error.message);
      else if (signup && !result.data.session) setMessage('Check your email to confirm your account, then sign in here.');
      setPassword('');
    } catch { setMessage('Unable to sign in. Please try again.'); }
    finally { setBusy(false); }
  };
  const social = async (provider: 'google' | 'lovable') => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) setMessage(result.error.message);
    } catch { setMessage('Unable to sign in. Please try again.'); }
    finally { setBusy(false); }
  };
  return <div className="grid min-h-screen place-items-center bg-background px-4 py-8">
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft">
      <img src={logo.url} alt="SmartSave logo" className="mx-auto size-16 object-contain" />
      <h1 className="my-5 text-center text-2xl font-bold">{signup ? 'Create your Cloud account' : 'Sign in to SmartSave'}</h1>
      <form onSubmit={submit} className="space-y-4">
        {signup && <div><Label htmlFor="cloud-name">Display name</Label><Input id="cloud-name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></div>}
        <div><Label htmlFor="cloud-email">Email</Label><Input id="cloud-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></div>
        <div><Label htmlFor="cloud-password">Password</Label><Input id="cloud-password" type="password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} autoComplete={signup ? 'new-password' : 'current-password'} /></div>
        {message && <p role="status" className="text-sm text-foreground">{message}</p>}
        <Button type="submit" disabled={busy} className="w-full">{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</Button>
      </form>
      <Button variant="link" className="mt-2 w-full" onClick={() => { setSignup(!signup); setMessage(''); }}>{signup ? 'Already have an account? Sign in' : 'Create a new account'}</Button>
      <Button variant="outline" disabled={busy} className="google-signin mt-4 w-full gap-2" onClick={() => social('google')}>
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
        Continue with Google
      </Button>
      <Button disabled={busy} className="lovable-auth-button mt-2 w-full" onClick={() => social('lovable')}>Continue with Lovable</Button>
      <Button variant="ghost" className="mt-4 w-full" onClick={cancelAuth}>Back to accounts</Button>
    </div>
  </div>;
}