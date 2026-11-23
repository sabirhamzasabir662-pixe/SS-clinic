import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Modals state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');
  const [modalErrorMsg, setModalErrorMsg] = useState('');

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Forgot password state
  const [forgotUsername, setForgotUsername] = useState('');

  const validate = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = 'Username is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(username.trim(), password, rememberMe);
      navigate('/');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Demo quick login for Google
    setIsLoading(true);
    setTimeout(async () => {
      try {
        await login('shazaib', 'admin123', rememberMe);
        navigate('/');
      } catch {
        setErrorMessage('Google authentication failed. Please try standard login.');
        setIsLoading(false);
      }
    }, 600);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setModalErrorMsg('');
    if (!regData.name || !regData.username || !regData.password) {
      setModalErrorMsg('Please fill in all required fields');
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      setModalErrorMsg('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regData.name,
          username: regData.username,
          password: regData.password,
          email: regData.email,
          role: 'Staff'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setModalSuccessMsg('Registration successful! You can now log in.');
      setTimeout(() => {
        setShowRegisterModal(false);
        setUsername(regData.username);
        setModalSuccessMsg('');
      }, 1500);
    } catch (err) {
      setModalErrorMsg(err.message);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotUsername.trim()) {
      setModalErrorMsg('Please enter your username');
      return;
    }
    setModalSuccessMsg('A password reset link or instructions have been sent to your administrator.');
    setTimeout(() => {
      setShowForgotModal(false);
      setModalSuccessMsg('');
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f1f5f9] select-none">
      
      {/* LEFT PANEL */}
      <div className="relative w-full lg:w-[48%] xl:w-[50%] min-h-[500px] lg:min-h-screen bg-gradient-to-br from-[#ebf5fb] via-[#e2eefb] to-[#cbe2fb] flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden">
        
        {/* Soft Background Hospital Blur Circles & Perspective Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200/50 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -left-20 w-80 h-80 bg-cyan-100/60 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
        </div>

        {/* Stethoscope illustration / medical motif at bottom left */}
        <div className="absolute -bottom-8 -left-8 w-80 h-80 pointer-events-none opacity-40 lg:opacity-60">
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-blue-800">
            {/* Stethoscope tubing and chestpiece aesthetic */}
            <path d="M 60 380 C 100 360, 180 340, 220 280 C 260 220, 240 140, 160 120 C 100 100, 70 140, 60 190" stroke="#1d4ed8" strokeWidth="12" strokeLinecap="round" />
            <path d="M 220 280 C 280 320, 320 280, 340 220" stroke="#1e40af" strokeWidth="10" strokeLinecap="round" />
            {/* Bell/Chestpiece */}
            <circle cx="340" cy="210" r="32" fill="#94a3b8" stroke="#334155" strokeWidth="6" />
            <circle cx="340" cy="210" r="22" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
            <circle cx="340" cy="210" r="10" fill="#cbd5e1" />
          </svg>
        </div>

        {/* Giant Royal-Blue Curved Shape on the Right Edge with Light-Blue Outline */}
        <div className="hidden lg:block absolute top-0 right-0 h-full w-[45%] pointer-events-none">
          <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 200 800" fill="none">
            {/* Royal blue main crescent */}
            <path 
              d="M 200 0 C 40 180, 20 480, 200 800 L 200 800 Z" 
              fill="#1a4ecb" 
            />
            {/* Thin light-blue stroke */}
            <path 
              d="M 200 0 C 40 180, 20 480, 200 800" 
              stroke="#5bb4ff" 
              strokeWidth="4" 
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Top Spacer / Brand anchor */}
        <div className="relative z-10 pt-4"></div>

        {/* Centered Brand Presentation */}
        <div className="relative z-10 flex flex-col items-center text-center my-auto py-8">
          {/* Logo: Heart + Cross + Teal Hand */}
          <div className="mb-5 transition-transform hover:scale-105 duration-300">
            <img 
              src="/assets/login_logo_transparent.png" 
              alt="SS Shifa Clinic Logo" 
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md"
              onError={(e) => {
                // Fallback SVG in case image file is missing
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="hidden w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              SS
            </div>
          </div>

          {/* Clinic Name: "SS" in dark navy, "Shifa Clinic" in teal */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            <span className="text-[#0c2340]">SS</span>{' '}
            <span className="text-[#00a896]">Shifa Clinic</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-500 font-medium text-sm sm:text-base mt-1.5">
            Clinic Management System
          </p>

          {/* Thin Divider Line */}
          <div className="w-40 h-[1.5px] bg-slate-300/80 my-5 rounded-full"></div>

          {/* Tagline */}
          <p className="text-slate-600 text-sm sm:text-base font-normal max-w-xs leading-relaxed">
            Manage Diseases, Medicines &amp;<br />
            Patients with ease
          </p>
        </div>

        {/* Bottom 3 Feature Cards */}
        <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-6 max-w-md mx-auto w-full pt-6 pb-2">
          
          {/* Feature 1: Secure */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/90 shadow-sm border border-blue-100 flex items-center justify-center text-blue-600 mb-2 transition hover:shadow-md">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800">Secure</span>
            <span className="text-[10px] sm:text-xs text-slate-500">Data Security</span>
          </div>

          {/* Feature 2: Organized */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/90 shadow-sm border border-blue-100 flex items-center justify-center text-blue-600 mb-2 transition hover:shadow-md">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800">Organized</span>
            <span className="text-[10px] sm:text-xs text-slate-500">Well Managed</span>
          </div>

          {/* Feature 3: Accessible */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/90 shadow-sm border border-blue-100 flex items-center justify-center text-blue-600 mb-2 transition hover:shadow-md">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800">Accessible</span>
            <span className="text-[10px] sm:text-xs text-slate-500">Anywhere Anytime</span>
          </div>

        </div>

      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[52%] xl:w-[50%] min-h-screen bg-[#f4f7fb] flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-[430px] bg-white rounded-[24px] sm:rounded-[28px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] border border-slate-100 p-7 sm:p-10">
          
          {/* Circular User Icon */}
          <div className="w-14 h-14 rounded-full bg-[#e8f1fc] flex items-center justify-center mx-auto mb-4 text-[#1e5adb]">
            <User className="w-7 h-7 stroke-[2]" />
          </div>

          {/* Card Header */}
          <h2 className="text-2xl sm:text-[26px] font-bold text-[#0c2340] text-center tracking-tight">
            Welcome Back!
          </h2>
          <p className="text-slate-500 text-sm text-center mt-1 mb-7">
            Login to your clinic account
          </p>

          {/* Alert Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Username Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (validationErrors.username) {
                      setValidationErrors({ ...validationErrors, username: null });
                    }
                  }}
                  placeholder="Enter your username"
                  className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border ${
                    validationErrors.username ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-blue-200 focus:border-blue-500'
                  } bg-white text-slate-800 placeholder-slate-400 text-sm transition-all outline-none focus:ring-2`}
                />
              </div>
              {validationErrors.username && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{validationErrors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors({ ...validationErrors, password: null });
                    }
                  }}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border ${
                    validationErrors.password ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-blue-200 focus:border-blue-500'
                  } bg-white text-slate-800 placeholder-slate-400 text-sm transition-all outline-none focus:ring-2`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{validationErrors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between pt-1 pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setModalErrorMsg('');
                  setModalSuccessMsg('');
                  setForgotUsername(username);
                  setShowForgotModal(true);
                }}
                className="text-xs font-semibold text-[#1e5adb] hover:underline hover:text-blue-700 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1e5adb] hover:bg-[#1848b3] active:bg-[#133c94] text-white font-medium py-2.5 sm:py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-sm text-sm disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.2]" />
                  <span>Login</span>
                </>
              )}
            </button>

          </form>

          {/* "or" Divider */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-normal">or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Login with Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-medium py-2.5 sm:py-3 rounded-xl transition duration-150 flex items-center justify-center gap-2.5 text-sm shadow-sm disabled:opacity-60"
          >
            {/* Google colored G Logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Login with Google</span>
          </button>

          {/* Footer Register Link */}
          <div className="text-center mt-7 text-xs text-slate-500">
            <span>Don't have an account? </span>
            <button
              type="button"
              onClick={() => {
                setModalErrorMsg('');
                setModalSuccessMsg('');
                setShowRegisterModal(true);
              }}
              className="text-[#1e5adb] hover:underline font-semibold transition-colors"
            >
              Register here
            </button>
          </div>

          {/* Demo Credentials Helper Pill */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <span>Admin:</span>
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">shazaib</span>
            <span>/</span>
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">admin123</span>
          </div>

        </div>

        {/* Developer Credit */}
        <Footer login />

      </div>

      {/* REGISTER MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Create Clinic Account</h3>
            <p className="text-xs text-slate-500 mb-5">Register a new healthcare staff account</p>

            {modalErrorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalErrorMsg}</span>
              </div>
            )}
            {modalSuccessMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{modalSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Full Name"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="doctor_user"
                  value={regData.username}
                  onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="doctor@clinic.com"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regData.confirmPassword}
                  onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 bg-[#1e5adb] hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm transition"
              >
                Register
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Forgot Password</h3>
            <p className="text-xs text-slate-500 mb-5">Enter your clinic username to reset access</p>

            {modalErrorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalErrorMsg}</span>
              </div>
            )}
            {modalSuccessMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{modalSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#1e5adb] hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm transition"
              >
                Send Reset Request
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
