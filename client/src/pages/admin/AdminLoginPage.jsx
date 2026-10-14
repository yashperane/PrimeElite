import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { LucideIcon } from '../../components/common/LucideIcon.jsx';

export const AdminLoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('कृपया ईमेल आणि पासवर्ड दोन्ही भरा.');
      return;
    }

    if (isSignUp) {
      if (password.length < 6) {
        toast.error('पासवर्ड किमान ६ अक्षरांचा असावा.');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('पासवर्ड आणि कन्फर्म पासवर्ड जुळत नाहीत.');
        return;
      }
    }

    try {
      setSubmitting(true);
      if (isSignUp) {
        await register(email, password);
        toast.success('नवीन ॲडमिन खाते यशस्वीरीत्या तयार झाले!');
      } else {
        await login(email, password);
        toast.success('यशस्वीरीत्या लॉगिन झाले!');
      }
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || (isSignUp ? 'नोंदणी अयशस्वी झाली.' : 'लॉगिन अयशस्वी झाले.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-3xl border border-theme-border bg-theme-card shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-theme-accent text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <LucideIcon name={isSignUp ? 'UserPlus' : 'Lock'} size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-theme-text mb-1">
            {isSignUp ? 'व्यवस्थापक नोंदणी (Sign Up)' : 'व्यवस्थापक लॉगिन (Sign In)'}
          </h1>
          <p className="text-xs text-theme-muted">
            {isSignUp ? 'नवीन ॲडमिन खाते तयार करा' : 'PRIME ELITE व्यवस्थापन पॅनेलमध्ये प्रवेश करा'}
          </p>
        </div>

        {/* Mode Toggle Switch */}
        <div className="flex border border-theme-border rounded-xl p-1 bg-theme-bg mb-6">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              !isSignUp ? 'bg-theme-card text-theme-accent shadow-sm' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            लॉगिन (Sign In)
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isSignUp ? 'bg-theme-card text-theme-accent shadow-sm' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            साइन अप (Sign Up)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">
              ईमेल पत्ता (Email)
            </label>
            <div className="relative">
              <LucideIcon
                name="Mail"
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@primeelite.local"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-theme-border bg-theme-bg text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">
              पासवर्ड (Password)
            </label>
            <div className="relative">
              <LucideIcon
                name="Key"
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-theme-border bg-theme-bg text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">
                पासवर्डची पुष्टी करा (Confirm Password)
              </label>
              <div className="relative">
                <LucideIcon
                  name="Check"
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-theme-border bg-theme-bg text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-theme-accent hover:bg-theme-accentHover text-white text-sm font-semibold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {submitting ? (
              <LucideIcon name="Loader" size={18} className="animate-spin" />
            ) : (
              <LucideIcon name={isSignUp ? 'UserPlus' : 'LogIn'} size={18} />
            )}
            <span>{isSignUp ? 'साइन अप करा' : 'लॉगिन करा'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
