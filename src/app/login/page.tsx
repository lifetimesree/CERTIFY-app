"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"student" | "admin">("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [adminSecret, setAdminSecret] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isLogin && role === "admin" && adminSecret !== "HACKATHON2026") {
      setError("Invalid Admin Invite Code.");
      setLoading(false);
      return;
    }

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      
      const userRole = data.user?.user_metadata?.role || "student";
      router.push(userRole === "admin" ? "/issuer/dashboard" : "/student/dashboard");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
        },
      });
      if (error) {
        setError(error.message);
      } else {
        router.push(role === "admin" ? "/issuer/dashboard" : "/student/dashboard");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 bg-[url('/noise.png')] opacity-95">
      <div className="max-w-md w-full bg-[#111] border border-gray-800 rounded-xl shadow-2xl p-8">
        <Link href="/" className="flex justify-center items-center gap-2 mb-8 text-white hover:opacity-80 transition-opacity">
          <ShieldCheck className="w-8 h-8 text-green-500" />
          <span className="font-display font-bold tracking-widest text-xl">CERTIFY</span>
        </Link>
        
        <h2 className="text-2xl font-display font-bold text-white mb-2 text-center">
          {isLogin ? "Welcome Back" : "Create an Account"}
        </h2>
        <p className="text-gray-400 text-sm text-center mb-8">
          {isLogin ? "Access your digital wallet or issuer portal." : "Join the verifiable credentials network."}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="flex bg-[#000] rounded-lg p-1 border border-gray-800 mb-4">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  role === "student" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  role === "admin" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Admin / Issuer
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#000] border border-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#000] border border-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && role === "admin" && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-amber-500 mb-2">Admin Invite Code</label>
              <input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                required
                className="w-full bg-[#000] border border-amber-500/50 text-amber-500 px-4 py-3 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Secret Code"
              />
              <p className="text-[10px] text-gray-500 mt-1">Hint: The code for the hackathon is HACKATHON2026</p>
            </div>
          )}

          {error && <div className="text-red-500 text-sm mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? "Authenticating..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-gray-400 text-sm hover:text-white transition-colors"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
