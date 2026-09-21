import { useState, type FormEvent } from 'react';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  };

  return (
    <div className="min-h-screen bg-brand-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-brand-border rounded-[var(--radius-brand)] shadow-[var(--shadow-card)] p-8">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.png" alt="ALLMED" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-xl font-bold font-[family-name:var(--font-heading)] text-brand-dark leading-tight">
              ALLMED
            </h1>
            <p className="text-sm text-brand-text-secondary">Pharmacy operations</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-text mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-brand-border rounded-[var(--radius-brand)] bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-text mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-brand-border rounded-[var(--radius-brand)] bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            />
          </div>
          {error && (
            <p className="text-sm text-brand-primary" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-xs text-brand-text-secondary leading-relaxed">
          Use the staff email stored on a <code className="text-brand-text">staff</code> row in
          Supabase. Create that user under Authentication → Users in the dashboard.
        </p>
      </div>
    </div>
  );
}
