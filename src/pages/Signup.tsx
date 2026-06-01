import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { clearAppMode } from '../lib/appMode';
import {
  HeartHandshake,
  Mail,
  Lock,
  User,
} from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

const signup = async () => {
  console.log("Signup clicked");

  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  setLoading(true);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

 

  setLoading(false);

  if (error) {
    alert(error.message);
    return;
  }
clearAppMode();
await new Promise(resolve => setTimeout(resolve, 800));
  navigate("/setup");
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
            Create Your Account
          </h2>

          <p className="mt-6 text-xl text-white/90 leading-relaxed">
            Join Memora AI and help seniors live safer,
            healthier, and more connected lives.
          </p>

          <div className="mt-10 space-y-4 text-lg">
            <p>✓ AI Voice Assistance</p>
            <p>✓ Smart Medicine Reminders</p>
            <p>✓ Memory Replay Features</p>
            <p>✓ Emergency SOS Support</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="p-10 lg:p-14 flex flex-col justify-center">

          <h2 className="text-4xl font-bold text-gray-800">
            Sign Up
          </h2>

          <p className="text-gray-500 mt-3">
            Create your Memora AI account
          </p>

          {/* Name */}
          <div className="mt-10">
            <label className="text-sm font-medium text-gray-600">
              Full Name
            </label>

            <div className="mt-2 flex items-center border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-teal-500">
              <User className="text-gray-400" size={20} />

              <input
                type="text"
                placeholder="Enter your name"
                className="w-full outline-none ml-3 bg-transparent"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div className="mt-6">
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
                placeholder="Create password"
                className="w-full outline-none ml-3 bg-transparent"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Button */}
          <button
            onClick={signup}
            disabled={loading}
            className="mt-8 w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          {/* Footer */}
          <p className="text-center text-gray-500 mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-teal-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>

          <Link
            to="/"
            className="text-center mt-4 text-gray-400 hover:text-teal-600"
          >
            ← Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
