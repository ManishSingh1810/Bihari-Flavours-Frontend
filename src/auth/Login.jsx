import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Phone, User, Lock, KeyRound, Loader } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../Context/userContext';
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Auth = () => {
  const { login } = useUser();
  const navigate = useNavigate();

  // ===== Forms =====
  const passwordLoginHook = useForm();
  const { register: passwordLoginRegister, handleSubmit: handlePasswordLoginSubmit, formState: { errors: passwordLoginErrors } } = passwordLoginHook;

  const { register: loginRegister, handleSubmit: handleLoginSubmit, getValues, reset: resetLogin, formState: { errors: loginErrors } } = useForm();
  const { register: signUpRegister, handleSubmit: handleSignUpSubmit, reset: resetSignup, formState: { errors: signUpErrors } } = useForm();
  const { register: passwordRegister, handleSubmit: handlePasswordSubmit, watch, formState: { errors: passwordErrors } } = useForm();
  const { register: otpRegister, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors } } = useForm();

  // ===== State =====
  const [isLoginView, setIsLoginView] = useState(true);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [loginStep, setLoginStep] = useState('enterMobile');
  const [signUpStep, setSignUpStep] = useState('enterDetails');
  const [userInfo, setUserInfo] = useState({ name: '', mobile: '' });
  const [countdown, setCountdown] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const password = watch("password", "");

  // ===== OTP Timer =====
  useEffect(() => {
    let timer;
    if ((signUpStep === 'enterOtp' || loginStep === 'enterOtp') && isResendDisabled) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [signUpStep, loginStep, isResendDisabled]);

  const startResendTimer = () => {
    setCountdown(30);
    setIsResendDisabled(true);
  };

  const togglePanel = () => {
    setIsLoginView(!isLoginView);
    setError('');
    resetSignup();
    resetLogin();
    passwordLoginHook.reset();
    setSignUpStep('enterDetails');
    setLoginStep('enterMobile');
    setIsOtpLogin(false);
  };

  // ===== Auth Helpers =====
  const storeAuthData = (data) => {
    const { token, user } = data;
    if (!token || !user) return;

    login({
      token,
      name: user.name,
      phone: user.phone,
      role: user.role,
      userId: user.userId || user.id
    });
  };

  const redirectUser = (role) => {
    navigate(role === "admin" ? "/admin" : "/", { replace: true });
  };

  // ===== Password Login =====
  const onPasswordLogin = async (data) => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.post(`${API_BASE_URL}/api/users/signin`, {
        email: data.mobile,
        password: data.password
      });

      if (res.data.success) {
        storeAuthData(res.data);
        redirectUser(res.data.user?.role);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ===== OTP Login =====
  const onRequestLoginOtp = async () => {
    const mobile = getValues("mobile_otp");
    if (!/^\S+@\S+\.\S+$/.test(mobile)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/otp/send`, { email: mobile, purpose: 'login' });
      if (res.data.success) {
        setUserInfo({ mobile });
        setLoginStep('enterOtp');
        startResendTimer();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyLoginOtp = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/otp/verify`, {
        email: userInfo.mobile,
        code: data.otp,
        purpose: 'login'
      });

      if (res.data.success) {
        storeAuthData(res.data);
        redirectUser(res.data.user?.role);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ===== Signup =====
  const onSignUpDetails = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/otp/send`, {
        email: data.mobile,
        purpose: 'signup'
      });

      if (res.data.success) {
        setUserInfo({ name: data.name, mobile: data.mobile });
        setSignUpStep('enterOtp');
        startResendTimer();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const onVerifySignUpOtp = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/otp/verify`, {
        email: userInfo.mobile,
        code: data.otp,
        purpose: 'signup'
      });

      if (res.data.success) {
        setSignUpStep('enterPassword');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const onSetPassword = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/users/signup`, {
        name: userInfo.name,
        email: userInfo.mobile,
        password: data.password
      });

      if (res.data.success) {
        storeAuthData(res.data);
        redirectUser(res.data.user?.role);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/otp/resend`, {
        email: userInfo.mobile
      });
      if (res.data.success) startResendTimer();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };


  return (
<div className="flex h-screen w-full items-center justify-center bg-[#FAF7F2] p-4">
      <div className='relative flex h-full max-h-200 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-[85%]'>

        {/* Error Display */}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 rounded-lg bg-red-500/90 px-4 py-2 text-white text-sm shadow-lg animate-fade-in">
            {error}
          </div>
        )}

        {/* Form Panels Container - Uses dynamic visibility on mobile */}
        <div className="flex w-full h-full"> 
          
          {/* Create Account Panel (Left Side - Full width on mobile, half on desktop) */}
          <div className={`flex w-full sm:w-1/2 flex-col items-center justify-center gap-5 bg-stone-50 p-8 ${isLoginView ? 'hidden sm:flex' : 'flex'}`}>
            {signUpStep === 'enterDetails' && (
              <div className="w-full max-w-sm animate-fade-in">
                <h1 className='text-3xl font-bold text-gray-800 text-center'>Create Account</h1>
                <form onSubmit={handleSignUpSubmit(onSignUpDetails)} className='mt-8 flex flex-col items-center gap-4'>
                  <div className="w-full relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      {...signUpRegister("name", { required: "Name is required" })} 
                      placeholder="Name" 
                      className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 transition focus:border-[#6C1F1F] focus:outline-none focus:ring-1 focus:ring-[#6C1F1F]" 
                    />
                    {signUpErrors.name && <p className="text-sm text-red-500 mt-1">{signUpErrors.name.message}</p>}
                  </div>
                  <div className="w-full relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="email" 
                      {...signUpRegister("mobile", { 
                        required: "Email is required", 
                        pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email address" } 
                      })} 
                      placeholder="Email Address" 
                      className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 transition focus:border-[#6C1F1F] focus:outline-none focus:ring-1 focus:ring-[#6C1F1F]" 
                    />
                    {signUpErrors.mobile && <p className="text-sm text-red-500 mt-1">{signUpErrors.mobile.message}</p>}
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full rounded-lg bg-[#6C1F1F] py-3 font-bold text-white transition hover:bg-[#5a1a1a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {loading ? <><Loader className="h-5 w-5 animate-spin" /> Sending...</> : 'Get OTP'}
                  </button>
                </form>
              </div>
            )}
            {signUpStep === 'enterOtp' && (
              <div className="w-full max-w-sm animate-fade-in text-center">
                <h1 className='text-3xl font-bold text-gray-800'>Verify OTP</h1>
                <p className="mt-4 text-gray-600">Enter the code sent to your email <span className="font-semibold text-[#6C1F1F]">{userInfo.mobile}</span></p>
                <form className='mt-8 flex flex-col items-center gap-4' onSubmit={handleOtpSubmit(onVerifySignUpOtp)}>
                  <div className="w-full relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="6-Digit Code" 
                      maxLength={6} 
                      {...otpRegister("otp", { 
                        required: "OTP is required",
                        pattern: { value: /^[0-9]{6}$/, message: "Must be 6 digits" } 
                      })}
                      className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-center text-xl tracking-[0.5em] focus:border-[#6C1F1F] focus:outline-none focus:ring-1 focus:ring-[#6C1F1F]" 
                    />
                    {otpErrors.otp && <p className="text-sm text-red-500 mt-1">{otpErrors.otp.message}</p>}
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full rounded-lg bg-[#6C1F1F] py-3 font-bold text-white transition hover:bg-[#5a1a1a] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {loading ? <><Loader className="h-5 w-5 animate-spin" /> Verifying...</> : 'Verify'}
                  </button>
                </form>
                <div className="mt-4 text-sm">
                  <button 
                    onClick={handleResendOtp} 
                    disabled={isResendDisabled || loading} 
                    className="font-semibold text-[#050505] hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    {isResendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}
            {signUpStep === 'enterPassword' && (
              <div className="w-full max-w-sm animate-fade-in">
                <h1 className='text-3xl font-bold text-gray-800 text-center'>Set Your Password</h1>
                <form onSubmit={handlePasswordSubmit(onSetPassword)} className='mt-8 flex flex-col items-center gap-4'>
                  <div className="w-full relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="password" 
                      {...passwordRegister("password", { 
                        required: "Password is required", 
                        minLength: { value: 6, message: "At least 6 characters" }
                      })} 
                      placeholder="Password" 
                      className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 transition focus:border-[#6C1F1F] focus:outline-none focus:ring-1 focus:ring-[#6C1F1F]" 
                    />
                    {passwordErrors.password && <p className="text-sm text-red-500 mt-1">{passwordErrors.password.message}</p>}
                  </div>
                  <div className="w-full relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="password" 
                      {...passwordRegister("confirmPassword", { 
                        required: "Please confirm password", 
                        validate: value => value === password || "Passwords do not match" 
                      })} 
                      placeholder="Confirm Password" 
                      className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 transition focus:border-[#6C1F1F] focus:outline-none focus:ring-1 focus:ring-[#6C1F1F]" 
                    />
                    {passwordErrors.confirmPassword && <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>}
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full rounded-lg bg-[#6C1F1F] py-3 font-bold text-white transition hover:bg-[#5a1a1a] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {loading ? <><Loader className="h-5 w-5 animate-spin" /> Creating...</> : 'Create Account'}
                  </button>
                </form>
              </div>
            )}
          </div>
          
          {/* Login Panel (Right Side - Full width on mobile, half on desktop) */}
          <div className={`flex w-full sm:w-1/2 flex-col items-center justify-center gap-5 bg-white p-8 ${!isLoginView ? 'hidden sm:flex' : 'flex'}`}>
            <h1 className='text-3xl font-bold text-gray-800'>Login</h1>
            <div className="flex gap-2 rounded-lg bg-gray-200 p-1">
              <button 
                onClick={() => { setIsOtpLogin(false); setError(''); setLoginStep('enterMobile'); }} 
                className={`px-4 py-2 text-sm font-semibold rounded-md transition ${!isOtpLogin ? 'bg-white text-[#6C1F1F] shadow-md' : 'text-gray-500'}`}
              >
                Password
              </button>
              <button 
                onClick={() => { setIsOtpLogin(true); setError(''); setLoginStep('enterMobile'); }} 
                className={`px-4 py-2 text-sm font-semibold rounded-md transition ${isOtpLogin ? 'bg-white text-[#6C1F1F] shadow-md' : 'text-gray-500'}`}
              >
                OTP
              </button>
            </div>

            {!isOtpLogin ? (
              <form onSubmit={handlePasswordLoginSubmit(onPasswordLogin)} className='flex w-full max-w-sm flex-col items-center gap-4 animate-fade-in'>
                <div className="w-full relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="email" 
                    {...passwordLoginRegister("mobile", { 
                      required: "Email is required", 
                      pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email address" } 
                    })} 
                    placeholder="Email Address" 
                    className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 transition focus:border-[#6C1F1F] focus:outline-none focus:ring-1 focus:ring-[#6C1F1F]" 
                  />
                  {passwordLoginErrors.mobile && <p className="text-sm text-red-500 mt-1">{passwordLoginErrors.mobile.message}</p>}
                </div>
                <div className="w-full relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="password" 
                    {...passwordLoginRegister("password", { required: "Password is required" })} 
                    placeholder="Password" 
                    className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 transition focus:border-[#6C1F1F] focus:outline-none focus:ring-1 focus:ring-[#6C1F1F]" 
                  />
                  {passwordLoginErrors.password && <p className="text-sm text-red-500 mt-1">{passwordLoginErrors.password.message}</p>}
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full rounded-lg bg-[#6C1F1F] py-3 font-bold text-white transition hover:bg-[#5a1a1a] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {loading ? <><Loader className="h-5 w-5 animate-spin" /> Logging in...</> : 'Login'}
                </button>
              </form>
            ) : (
              <div className="w-full max-w-sm animate-fade-in">
                {loginStep === 'enterMobile' && (
                  <form onSubmit={handleLoginSubmit(onRequestLoginOtp)} className='flex w-full flex-col items-center gap-4'>
                    <div className="w-full relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="email" 
                        {...loginRegister("mobile_otp", { 
                          required: "Email is required", 
                          pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email address" } 
                        })} 
                        placeholder="Email Address" 
                        className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 transition focus:border-[#6C1F1F] focus:outline-none focus:ring-1 focus:ring-[#6C1F1F]" 
                      />
                      {loginErrors.mobile_otp && <p className="text-sm text-red-500 mt-1">{loginErrors.mobile_otp.message}</p>}
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full rounded-lg bg-[#6C1F1F] py-3 font-bold text-white transition hover:bg-[#5a1a1a] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {loading ? <><Loader className="h-5 w-5 animate-spin" /> Sending...</> : 'Send OTP'}
                    </button>
                  </form>
                )}
                {loginStep === 'enterOtp' && (
                  <form onSubmit={handleLoginSubmit(onVerifyLoginOtp)} className='flex w-full flex-col items-center gap-4 text-center'>
                    <p className="text-gray-600">Enter the code sent to your email <span className="font-semibold text-[#6C1F1F]">{userInfo.mobile}</span></p>
                    <div className="w-full relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="text" 
                        maxLength={6} 
                        {...loginRegister("otp", { required: "OTP is required" })} 
                        placeholder="6-Digit Code" 
                        className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-center text-xl tracking-[0.5em] transition focus:border-[#6C1F1F] focus:outline-none focus:ring-1 focus:ring-[#6C1F1F]" 
                      />
                      {loginErrors.otp && <p className="text-sm text-red-500 mt-1">{loginErrors.otp.message}</p>}
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full rounded-lg bg-[#6C1F1F] py-3 font-bold text-white transition hover:bg-[#5a1a1a] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {loading ? <><Loader className="h-5 w-5 animate-spin" /> Verifying...</> : 'Verify & Login'}
                    </button>
                    <div className="mt-2 text-sm">
                      <button 
                        type="button" 
                        onClick={handleResendOtp} 
                        disabled={isResendDisabled || loading} 
                        className="font-semibold text-[#E7C453] hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
                      >
                        {isResendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
            
            {/* Mobile Toggle Button (Visible only on mobile to switch forms) */}
            <div className='sm:hidden pt-8 w-full max-w-sm'>
              <button onClick={togglePanel} className="w-full rounded-lg border-2 border-[#6C1F1F] text-[#6C1F1F] bg-white py-3 font-semibold transition hover:bg-[#6C1F1F] hover:text-white">
                New Here? Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Sliding Info Panel (Only visible on desktop/sm+ screens) */}
        <div 
          className={`absolute top-0 z-20 hidden sm:flex h-full w-1/2 transform
            bg-[#6C1F1F]
            transition-transform duration-1000 ease-out
            ${isLoginView ? 'translate-x-0' : 'translate-x-full'}`}

        >
          <div className='flex flex-col items-center justify-center h-full w-full p-12 text-center text-white'>
            <h1 className='text-4xl font-bold'>{isLoginView ? 'New Here?' : 'Welcome Back!'}</h1>
            <p className='mt-4 text-lg'>
              {isLoginView ? 'Sign up to discover the authentic taste of Bihar.' : 'Log in to continue your culinary journey.'}
            </p>
            <button onClick={togglePanel} className="mt-6 rounded-full border-2 border-white px-8 py-3 font-semibold transition hover:bg-white/20">
              {isLoginView ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};


export default Auth;
