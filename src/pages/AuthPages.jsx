import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone } from "lucide-react";
import { useFoodie } from "../context/FoodieContext.jsx";
import { isValidEmail, isValidMobile } from "../utils/storage.js";

export function AuthPage({ mode = "login" }) {
  const { setUser, notify } = useFoodie();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", mobile: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sent, setSent] = useState(false);
  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  const title = isRegister ? "Join the table." : isForgot ? "Let's get you back in." : "Welcome back.";
  const submit = (event) => {
    event.preventDefault();
    setError("");
    if (isForgot) {
      if (!isValidEmail(values.email)) return setError("Enter a valid email address.");
      setSent(true);
      return;
    }
    if (!isValidEmail(values.email)) return setError("Enter a valid email address.");
    if (isRegister && !isValidMobile(values.mobile)) return setError("Enter a valid 10-digit Indian mobile number.");
    if (values.password.length < 6) return setError("Password must be at least 6 characters.");
    const name = isRegister ? values.name.trim() : values.name.trim() || values.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    if (isRegister && !name) return setError("Enter your full name.");
    setUser({ name, email: values.email, mobile: values.mobile || "" });
    notify(isRegister ? "Welcome to Foodie!" : "You're signed in");
    navigate("/");
  };
  if (sent) return <div className="auth-page"><div className="auth-card text-center"><div className="auth-icon"><Mail /></div><p className="eyebrow">CHECK YOUR INBOX</p><h1>We've sent a reset link.</h1><p className="auth-subtitle">If an account exists for <b>{values.email}</b>, you'll receive instructions shortly.</p><Link to="/login" className="primary-button mt-6 w-full">Back to sign in</Link></div></div>;
  return <div className="auth-page"><div className="auth-card"><Link to="/" className="back-link mb-7"><ArrowLeft size={15} /> Back to Foodie</Link><p className="eyebrow">{isRegister ? "GOOD FOOD STARTS HERE" : isForgot ? "NO WORRIES" : "YOUR TABLE IS WAITING"}</p><h1>{title}</h1><p className="auth-subtitle">{isRegister ? "Create an account to save favourites and make checkout a breeze." : isForgot ? "Enter the email linked to your account and we'll send you a reset link." : "Sign in for your saved details, favourite bites, and order history."}</p>
    <form onSubmit={submit} className="auth-form">
      {isRegister && <label>Full name<div className="input-icon"><span>☺</span><input required value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} placeholder="Your name" /></div></label>}
      <label>Email address<div className="input-icon"><Mail size={17} /><input type="email" required autoComplete="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} placeholder="you@example.com" /></div></label>
      {isRegister && <label>Mobile number<div className="input-icon"><Phone size={17} /><input inputMode="numeric" maxLength="10" required value={values.mobile} onChange={(e) => setValues({ ...values, mobile: e.target.value.replace(/\D/g, "") })} placeholder="10-digit mobile number" /></div></label>}
      {!isForgot && <label>Password<div className="input-icon"><LockKeyhole size={17} /><input type={showPassword ? "text" : "password"} required minLength="6" autoComplete={isRegister ? "new-password" : "current-password"} value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} placeholder="At least 6 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>}
      {!isRegister && !isForgot && <div className="flex justify-end"><Link to="/forgot-password" className="text-sm font-bold text-brand">Forgot password?</Link></div>}
      {error && <p className="form-error">{error}</p>}
      <button className="primary-button w-full">{isRegister ? "Create account" : isForgot ? "Send reset link" : "Sign in"} <ArrowRight size={17} /></button>
    </form>
    {isRegister ? <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p> : !isForgot && <p className="auth-switch">New to Foodie? <Link to="/register">Create an account</Link></p>}
    <p className="demo-caption">Demo account · Sign in with any valid email and 6+ character password.</p>
  </div></div>;
}
