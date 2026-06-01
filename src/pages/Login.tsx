import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { HeartHandshake, Mail, Lock } from "lucide-react";
import { clearAppMode } from '../lib/appMode';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

  if (error) {
  alert(error.message);
} else {
  clearAppMode();

  setTimeout(() => {
    navigate("/home");
  }, 50);
}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-100 flex items-center justify-center px-6">

      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-[40px] shadow-2xl overflow-hidden">

        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-teal-500 to-cyan-600 text-white p-14">

          <div className="flex items-center gap-3 mb-8">
            <HeartHandshake size={40} />
            <h1 className="text-4xl font-bold">
              Memora AI
            </h1>
          </div>

          <h2 className="text-5xl font-black leading-tight">
            Welcome Back
          </h2>

          <p className="mt-6 text-xl text-white/90 leading-relaxed">
            Continue caring for your loved ones with smart reminders,
            memory support, and AI-powered assistance.
          </p>

          <div className="mt-10 space-y-4 text-lg">
            <p>✓ Voice Assistant Support</p>
            <p>✓ Medicine Tracking</p>
            <p>✓ Family Connectivity</p>
            <p>✓ Emergency Features</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="p-10 lg:p-14 flex flex-col justify-center">

          <h2 className="text-4xl font-bold text-gray-800">
            Login
          </h2>

          <p className="text-gray-500 mt-3">
            Sign in to continue using Memora AI
          </p>

          {/* Email */}
          <div className="mt-10">
            <label className="text-sm font-medium text-gray-600">
              Email Address
            </label>

            <div className="mt-2 flex items-center border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-teal-500">
              <Mail className="text-gray-400" size={20} />

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full outline-none ml-3 bg-transparent"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-600">
              Password
            </label>

            <div className="mt-2 flex items-center border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-teal-500">
              <Lock className="text-gray-400" size={20} />

              <input
                type="password"
                placeholder="Enter your password"
                className="w-full outline-none ml-3 bg-transparent"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Button */}
          <button
            onClick={login}
            disabled={loading}
            className="mt-8 w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Footer */}
          <p className="text-center text-gray-500 mt-8">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-teal-600 font-semibold hover:underline"
            >
              Create Account
            </Link>
          </p>

          <Link
            to="/"
            className="text-center mt-4 text-gray-400 hover:text-teal-600"
          >
            ← Back To Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
