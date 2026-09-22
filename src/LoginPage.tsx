import { Eye, EyeOff, Lock, LogIn, User } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { authenticate, completePasswordReset, requestPasswordReset, signOut } from './services/authService';
import unzaLogo from './assets/UNZA logo.png';
import type { LoginMode, Session } from './navigationLogic';

export function LoginPage({ onLogin, onBrowse }: { onLogin: (session: Session) => void; onBrowse?: () => void }) {
  const [loginMode, setLoginMode] = useState<LoginMode>('regular');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmation, setResetConfirmation] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);
  const [pendingSession, setPendingSession] = useState<Session | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = hash.get('access_token');
    if (hash.get('type') === 'recovery' && token) {
      setRecoveryToken(token);
      setShowReset(true);
    }
  }, []);

  const attemptLogin = async (event: FormEvent) => {
    event.preventDefault();

    const identifier = email.trim();
    if (!identifier || !password.trim()) {
      setError('Please enter your email or computer number and password.');
      return;
    }

    if (!identifier.includes('@') && !/^\d{10}$/.test(identifier)) {
      setError('Computer numbers must contain 10 digits, or enter a verified email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const session = await authenticate(identifier, password, loginMode);

      if (loginMode === 'regular' && session.role !== 'student') {
        await signOut();
        throw new Error('Regular user mode only allows the student account.');
      }

      if (loginMode === 'admin' && session.role === 'student') {
        await signOut();
        throw new Error('Admin login requires an authorized lecturer or developer account.');
      }

      if (session.mustChangePassword) {
        setPendingSession(session);
        setRecoveryToken('temporary-password');
        setShowReset(true);
        setResetMessage('This temporary password must be changed before you continue.');
        setPassword('');
      } else {
        onLogin(session);
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    if (!resetIdentifier.trim()) {
      setResetError('Enter your email address or computer ID.');
      return;
    }

    setResetLoading(true);
    setResetError('');
    setResetMessage('');

    try {
      await requestPasswordReset(resetIdentifier);
      setResetMessage('If the account exists, password reset instructions have been sent.');
    } catch (resetRequestError) {
      setResetError(resetRequestError instanceof Error ? resetRequestError.message : 'Unable to request a password reset.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleCompletePasswordReset = async () => {
    if (resetPassword.length < 8) {
      setResetError('Your new password must be at least 8 characters long.');
      return;
    }

    if (resetPassword !== resetConfirmation) {
      setResetError('The new passwords do not match.');
      return;
    }

    if (!recoveryToken) {
      setResetError('Open the password reset link from your email before setting a new password.');
      return;
    }

    setResetLoading(true);
    setResetError('');
    setResetMessage('');

    try {
      await completePasswordReset(resetPassword, recoveryToken);
      setResetMessage('Your password has been updated. You can now log in.');
      setResetPassword('');
      setResetConfirmation('');
      setRecoveryToken(null);
      window.history.replaceState({}, document.title, window.location.pathname);
      if (pendingSession) {
        onLogin({ ...pendingSession, mustChangePassword: false });
        setPendingSession(null);
      }
    } catch (passwordUpdateError) {
      setResetError(passwordUpdateError instanceof Error ? passwordUpdateError.message : 'Unable to update your password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-auto bg-[#060c18] text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 bg-[#1e3a6e] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <img src={unzaLogo} alt="University of Zambia" className="h-9 w-9 rounded-full bg-white p-1 object-contain" />
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
            <label className="mb-1 block text-xs text-slate-400">Email or computer ID</label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-2.5 focus-within:border-blue-500">
                  <User size={15} className="text-slate-500" />
                  <input
                    type="text"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={loginMode === 'regular' ? 'you@example.com or computer ID' : 'staff email or computer ID'}
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

              <button
                type="button"
                onClick={() => {
                  setShowReset((current) => !current);
                  setResetError('');
                  setResetMessage('');
                }}
                className="w-full text-center text-xs text-blue-400 hover:text-blue-300"
              >
                {showReset ? (pendingSession ? 'Password change required' : 'Close password reset') : 'Forgot password?'}
              </button>

              {showReset && (
                <div className="space-y-3 rounded-xl border border-slate-700/50 bg-slate-900/30 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wide text-slate-500">{pendingSession ? 'Change temporary password' : 'Reset password'}</div>

                  {resetError && <div className="rounded-lg border border-amber-700/40 bg-[#1a1200] px-3 py-2 text-xs text-amber-300">{resetError}</div>}
                  {resetMessage && <div className="rounded-lg border border-emerald-700/40 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-300">{resetMessage}</div>}

                  {!recoveryToken ? (
                    <>
                      <input
                        type="text"
                        value={resetIdentifier}
                        onChange={(event) => setResetIdentifier(event.target.value)}
                        placeholder="Email or computer ID"
                        className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={resetLoading}
                        onClick={() => void handleRequestPasswordReset()}
                        className="w-full rounded-lg border border-blue-500/70 px-3 py-2 text-xs font-medium text-blue-300 hover:bg-blue-900/20 disabled:opacity-70"
                      >
                        {resetLoading ? 'Sending…' : 'Send reset link'}
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="password"
                        value={resetPassword}
                        onChange={(event) => setResetPassword(event.target.value)}
                        placeholder={pendingSession ? 'Choose a new password' : 'New password'}
                        className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="password"
                        value={resetConfirmation}
                        onChange={(event) => setResetConfirmation(event.target.value)}
                        placeholder="Confirm new password"
                        className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={resetLoading}
                        onClick={() => void handleCompletePasswordReset()}
                        className="w-full rounded-lg border border-emerald-500/70 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-900/20 disabled:opacity-70"
                      >
                        {resetLoading ? 'Updating…' : pendingSession ? 'Change password' : 'Update password'}
                      </button>
                    </>
                  )}
                </div>
              )}

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
              {onBrowse && (
                <button type="button" onClick={onBrowse} className="w-full text-center text-xs text-blue-400 hover:text-blue-300">
                  Continue as visitor to view maps
                </button>
              )}
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
