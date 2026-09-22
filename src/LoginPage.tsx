import { Eye, EyeOff, Lock, LogIn, Building2, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { authenticateDevUser, type LoginMode, type Session } from './navigationLogic';

export function LoginPage({ onLogin }: { onLogin: (session: Session) => void }) {
  const [loginMode, setLoginMode] = useState<LoginMode>('regular');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const attemptLogin = (event: FormEvent) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const result = authenticateDevUser(email, password);
      if (!result.isAuthenticated) {
        setLoading(false);
        setError('Invalid credentials.');
        return;
      }

      if (loginMode === 'regular' && result.role !== 'student') {
        setLoading(false);
        setError('Regular user mode only allows the student account.');
        return;
      }

      if (loginMode === 'admin' && result.role === 'student') {
        setLoading(false);
        setError('Admin login requires an authorized lecturer or developer account.');
        return;
      }

      setLoading(false);
      onLogin({
        email: result.email,
        displayName: result.displayName,
        role: result.role,
        mode: loginMode,
      });
    }, 500);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-auto bg-[#060c18] text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 bg-[#1e3a6e] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <Building2 size={18} className="text-blue-200" />
          </div>
          <div>
            <div className="text-sm font-semibold">University of Zambia</div>
            <div className="text-[11px] text-blue-200">Department of Computer Science</div>
          </div>
        </div>
        <div className="hidden items-center gap-1 text-sm text-blue-200 sm:flex">
          <LogIn size={14} /> Login
        </div>
      </header>

      <div className="border-b border-yellow-900/50 bg-[#1a1608] px-4 py-2 text-sm text-[#d4b44a]">
        Please login to access the UNZA CS NAVIGATION SYSTEM.
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-[#0f1624] shadow-2xl">
            <div className="border-b border-slate-700/50 px-6 pb-4 pt-6">
              <div className="mb-1 text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400">Current students and staff</div>
              <h1 className="text-2xl font-bold text-slate-100">Login</h1>
              <p className="mt-1 text-sm text-slate-400">UNZA CS NAVIGATION SYSTEM</p>
            </div>

            <form onSubmit={attemptLogin} className="space-y-4 px-6 py-5">
              {error && (
                <div className="rounded-lg border border-amber-700/40 bg-[#1a1200] px-3 py-2 text-sm text-amber-300">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs text-slate-400">Email</label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-2.5 focus-within:border-blue-500">
                  <User size={15} className="text-slate-500" />
                  <input
                    type="text"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={loginMode === 'regular' ? 'student@dev.local' : 'lecturer@dev.local'}
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Password</label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-2.5 focus-within:border-blue-500">
                  <Lock size={15} className="text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                ) : (
                  <LogIn size={15} />
                )}
                {loading ? 'Logging in…' : 'Login'}
              </button>

              <div className="rounded-xl border border-slate-700/50 p-2">
                <div className="mb-2 text-[10px] font-mono uppercase tracking-wide text-slate-500">Choose login mode</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginMode('regular')}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                      loginMode === 'regular' ? 'border-blue-500 bg-blue-900/20 text-blue-300' : 'border-slate-700 bg-slate-800/50 text-slate-400'
                    }`}
                  >
                    Regular User
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMode('admin')}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                      loginMode === 'admin' ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300' : 'border-slate-700 bg-slate-800/50 text-slate-400'
                    }`}
                  >
                    Admin Login
                  </button>
                </div>
              </div>

              <p className="text-center text-xs text-slate-600">Use your UNZA student or staff credentials</p>
            </form>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-700/40 bg-[#0f1624] p-3">
              <div className="mb-1 text-xs font-semibold text-blue-400">UNZA CS NAVIGATION SYSTEM</div>
              <p className="text-xs text-slate-500">Find any room, office or staff member in the CS Department building.</p>
            </div>

            <a
              href="https://sis.unza.zm"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-700/40 bg-[#0f1624] p-3 hover:shadow-lg hover:border-blue-500"
            >
              <div className="mb-1 text-xs font-semibold text-blue-400">UNZA SIS Portal</div>
              <p className="text-xs text-slate-500">For results and finance access, visit the official UNZA portal.</p>
            </a>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-800 px-4 py-3 text-center text-xs text-slate-700">
        © 2026 University of Zambia — Department of Computer Science
      </footer>
    </div>
  );
}
