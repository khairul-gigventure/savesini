import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../utils/firebase';

interface AuthViewProps {
  onSuccess: () => void;
  onContinueAsGuest?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onContinueAsGuest }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setErrorMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onSuccess();
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in popup closed before completing.');
      } else {
        setErrorMessage(err?.message || 'Failed to sign in with Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email.trim(), password, name.trim() || undefined);
      } else {
        await signInWithEmail(email.trim(), password);
      }
      onSuccess();
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already registered. Please sign in instead.');
      } else if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setErrorMessage('Invalid email or password. Please verify your credentials.');
      } else if (code === 'auth/operation-not-allowed') {
        setErrorMessage(
          'Email/Password sign-in is not yet enabled in Firebase Console. Please use "Continue with Google" for instant 1-click access.'
        );
      } else {
        setErrorMessage(err?.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center px-4 py-12 font-['Inter']">
      <div className="w-full max-w-md space-y-6">
        {/* App Logo & Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white border border-zinc-200 shadow-xs mb-1">
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1UeH9IZix3PAV1iFfYF3f1H7g2daGTPgMif9HTtQNw2l_yFiNs2LJjnI2bha5kxW97XpiBjrUyguAwR73Gw3W2Hn_x3RPNXJPh2QuRBZ0A7O7Ou871XDXjA8iWU3dIv_7e40VwfpGbfJM9zPl9Lw2I0Pwssjb8o86aqwpvbvTUqA9G9EbvJ1Jrle5GRi2l8wyPzndBnaGPUbp8p9cT5Vs0sYDgyGqKVy0Ux3xmcLtCdzf6bKVtD9_2wjlE"
              alt="SaveSini"
              className="h-10 w-10 rounded-lg object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-['Plus_Jakarta_Sans']">
            SaveSini
          </h1>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
            Personal Social Media Intelligence Vault. Sign in or create an account to store and access your curated frameworks securely in Firebase.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/80 shadow-xs space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-zinc-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                resetForm();
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                resetForm();
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Primary 1-Click Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-zinc-200" />
            <span className="absolute px-3 bg-white text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Or with email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Coach Khairul"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all text-zinc-900"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all text-zinc-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all text-zinc-900"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all text-zinc-900"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to Vault' : 'Create My Vault Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Security Guarantee */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Private & isolated Firebase Firestore storage</span>
          </div>
        </div>

        {/* Demo / Guest Option */}
        {onContinueAsGuest && (
          <div className="text-center">
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-4 cursor-pointer"
            >
              Or preview app in Demo Mode (Local Only)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
