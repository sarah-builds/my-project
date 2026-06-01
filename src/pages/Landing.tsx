import { Link } from "react-router-dom";
import {
  HeartHandshake,
  Brain,
  Pill,
  Mic,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-100 overflow-hidden">

      {/* Navbar */}
<nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">

  <h1 className="text-3xl font-extrabold text-teal-700">
    Memora AI
  </h1>

  <div className="flex items-center gap-4">

    <Link
      to="/login"
      className="bg-white hover:bg-gray-100 text-teal-700 px-6 py-3 rounded-2xl shadow-lg transition-all font-semibold"
    >
      Login
    </Link>

    <Link
      to="/signup"
      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl shadow-lg transition-all font-semibold"
    >
      Get Started
    </Link>

  </div>

</nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-16 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-5 py-2 rounded-full mb-8">
            <HeartHandshake size={18} />
            <span className="font-medium">
              AI-Powered Elderly Care
            </span>
          </div>

          <h1 className="text-6xl lg:text-7xl font-black leading-tight text-gray-900">
            Smart Care
            <span className="block text-teal-600">
              for Loved Ones
            </span>
          </h1>

          <p className="mt-8 text-xl text-gray-600 leading-relaxed max-w-xl">
            Memora AI helps seniors manage medicines,
            schedules, memories, and family connections
            through a simple and intelligent experience.
          </p>

          <div className="mt-10 flex flex-wrap gap-5">
            <Link
              to="/signup"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl flex items-center gap-2 transition-all"
            >
              Start Free
              <ArrowRight size={22} />
            </Link>

  
<Link
  to="/demo"
  className="bg-white hover:bg-gray-100 px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg transition-all"
>
  Live Demo
</Link>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-6">
            <div>
              <h2 className="text-4xl font-bold text-teal-600">24/7</h2>
              <p className="text-gray-500 mt-1">AI Support</p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-teal-600">100%</h2>
              <p className="text-gray-500 mt-1">Secure Care</p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-teal-600">Easy</h2>
              <p className="text-gray-500 mt-1">To Use</p>
            </div>
          </div>
        </div>

        {/* Right Side Card */}
        <div className="relative">

          {/* Background Glow */}
          <div className="absolute inset-0 bg-teal-300 blur-3xl opacity-20 rounded-full"></div>

          <div className="relative bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100">

            <div className="space-y-6">

              <div className="flex items-center gap-5 p-5 rounded-2xl bg-teal-50 hover:scale-105 transition-all">
                <div className="bg-teal-600 p-4 rounded-2xl text-white">
                  <Mic size={30} />
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    Voice Assistant
                  </h3>
                  <p className="text-gray-500">
                    Speak naturally with AI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 p-5 rounded-2xl bg-cyan-50 hover:scale-105 transition-all">
                <div className="bg-cyan-600 p-4 rounded-2xl text-white">
                  <Pill size={30} />
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    Medicine Reminders
                  </h3>
                  <p className="text-gray-500">
                    Never miss important doses
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 p-5 rounded-2xl bg-purple-50 hover:scale-105 transition-all">
                <div className="bg-purple-600 p-4 rounded-2xl text-white">
                  <Brain size={30} />
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    Memory Replay
                  </h3>
                  <p className="text-gray-500">
                    Reconnect with memories
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 p-5 rounded-2xl bg-green-50 hover:scale-105 transition-all">
                <div className="bg-green-600 p-4 rounded-2xl text-white">
                  <ShieldCheck size={30} />
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    Emergency Safety
                  </h3>
                  <p className="text-gray-500">
                    Fast emergency access
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section */}
      <section className="pb-16 px-8">
        <div className="max-w-6xl mx-auto bg-white rounded-[40px] shadow-xl p-10 border border-gray-100">

          <div className="grid md:grid-cols-3 gap-10 text-center">

            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                Smart Scheduling
              </h3>

              <p className="mt-3 text-gray-500">
                Manage appointments and daily routines effortlessly.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                Family Connected
              </h3>

              <p className="mt-3 text-gray-500">
                Keep families informed and emotionally connected.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                Elder Friendly
              </h3>

              <p className="mt-3 text-gray-500">
                Large UI, voice support, and simple interactions.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
