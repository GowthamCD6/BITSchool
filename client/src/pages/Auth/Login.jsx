import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import loginImg from '../../assets/login.webp';
import heroImg from '../../assets/hero.png';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Calendar,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function Login() {
  const { login } = useSchool();




  const [regNo, setRegNo] = useState('ADM001');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regNo || !password) {
      setErrorMessage('Please enter both registration number and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regNo, password })
      });
      const data = await response.json();

      setIsLoading(false);

      if (data.success) {
        if (data.token) {
          localStorage.setItem('bitschool_token', data.token);
        }
        login(data.user);
      } else {
        setErrorMessage(data.message || 'Invalid credentials.');
      }
    } catch (error) {
      setIsLoading(false);
      // Fallback offline login
      login({
        name: 'Dr. Robert Vance',
        email,
        role: 'Administrator',
        avatarColor: '#2563eb'
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'robert.vance@bitschool.edu', name: 'Dr. Robert Vance' })
      });
      const data = await response.json();

      setIsGoogleLoading(false);

      if (data.success) {
        if (data.token) {
          localStorage.setItem('bitschool_token', data.token);
        }
        login(data.user);
      } else {
        setErrorMessage(data.message || 'Google authentication failed.');
      }
    } catch (error) {
      setIsGoogleLoading(false);
      login({
        name: 'Dr. Robert Vance',
        email: 'robert.vance@bitschool.edu',
        role: 'Administrator',
        avatarColor: '#4285f4'
      });
    }
  };


  return (
    <div className="login-wrapper">
      {/* ── LEFT HERO BRANDING PANEL ── */}
      <div className="login-hero-panel" style={{ padding: 0, position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
        <img
          src={loginImg}
          alt="BITSchool Academic Management System"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = heroImg;
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to right, rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.1))',
            pointerEvents: 'none'
          }}
        />
        {/* Floating Brand Badge */}
        <div
          style={{
            position: 'absolute',
            top: '2.25rem',
            left: '2.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            padding: '0.65rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <GraduationCap size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.1 }}>BITSchool</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px' }}>ACADEMIC ERP</div>
          </div>
        </div>
      </div>



      {/* ── RIGHT FORM CONTAINER ── */}
      <div className="login-form-panel">
        <div className="login-form-card">

          {/* Title Header */}
          <div className="login-header">
            <h2 className="login-title">Sign In to BITSchool</h2>
          </div>


          {/* Google Sign-In Button */}
          <button
            type="button"
            className="google-auth-btn"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <span>Connecting to Google Workspace...</span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" className="google-icon">
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
              </>
            )}
          </button>

          {/* Divider */}
          <div className="login-divider">
            <span>OR SIGN IN WITH REGISTRATION NUMBER</span>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="login-error-alert">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Registration Number Field */}
            <div className="form-group">
              <label className="login-field-label">Registration Number</label>
              <div className="login-input-wrapper">
                <UserCheck size={18} className="login-input-icon" />
                <input
                  type="text"
                  className="form-control login-input"
                  placeholder="ADM001"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="login-field-label">Password</label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="login-forgot-link">
                  Forgot password?
                </a>
              </div>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control login-input"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="login-options">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Keep me signed in</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Copyright */}
          <div className="login-card-footer">
            BITSchool Academic ERP v2.4 · Powered by Advanced Agentic Operations
          </div>

        </div>
      </div>
    </div>
  );
}
