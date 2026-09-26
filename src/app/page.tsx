"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, FileCheck, Search, Key, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white selection:text-black font-sans">
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{ backgroundImage: 'linear-gradient(#1f1f1f 1px, transparent 1px), linear-gradient(90deg, #1f1f1f 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      ></div>

      <nav className="relative z-10 border-b border-gray-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-xl tracking-tighter">
            <ShieldCheck className="text-white" />
            CERTIFY
          </div>
          <div className="flex items-center gap-6 text-sm font-mono tracking-widest uppercase text-gray-400">
            <Link href="/login" className="hover:text-white transition-colors text-green-500 font-bold border border-green-500/20 bg-green-500/10 px-4 py-2 rounded">Login</Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-xs font-mono tracking-widest uppercase text-gray-400 mb-8">
                <span className="w-2 h-2 bg-green-500"></span> PROTOCOL V1 ONLINE
              </div>
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold font-display tracking-tighter leading-[0.95] mb-8">
                Truth, sealed <br />
                <span className="text-gray-500">in cryptography.</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl leading-relaxed mb-12">
                A modern platform to generate, sign, and instantly verify digital credentials. 
                Secured by Supabase and verified via RSA-PSS signatures.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 font-semibold hover:bg-gray-200 transition-colors"
                >
                  Sign In / Register <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-900 bg-black px-6 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-900">
              <div className="bg-black p-12">
                <Key className="w-8 h-8 text-white mb-6" />
                <h3 className="text-2xl font-bold font-display mb-4 tracking-tight">Decentralized Trust</h3>
                <p className="text-gray-400 leading-relaxed">
                  Signatures are computed using the Web Crypto API (RSA-PSS / SHA-256). Every credential proves its own authenticity.
                </p>
              </div>
              <div className="bg-black p-12">
                <FileCheck className="w-8 h-8 text-white mb-6" />
                <h3 className="text-2xl font-bold font-display mb-4 tracking-tight">Public Digital Wallets</h3>
                <p className="text-gray-400 leading-relaxed">
                  Students get a persistent, shareable public URL for their verified credentials that they can instantly add to LinkedIn.
                </p>
              </div>
              <div className="bg-black p-12">
                <Search className="w-8 h-8 text-white mb-6" />
                <h3 className="text-2xl font-bold font-display mb-4 tracking-tight">Revocation Registry</h3>
                <p className="text-gray-400 leading-relaxed">
                  The verification network automatically consults the Supabase database to ensure the credential hasn't been administratively revoked.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-900 px-6 py-12 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-600 uppercase tracking-widest">
          <div>© {new Date().getFullYear()} CERTIFY PLATFORM</div>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
