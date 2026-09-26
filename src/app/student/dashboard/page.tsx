"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ExternalLink, ShieldCheck, Share2 } from "lucide-react";
import { CertificateTemplate } from "@/components/CertificateTemplate";

export default function StudentDashboard() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndCerts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("recipient_email", user.email)
        .order("created_at", { ascending: false });

      if (data) setCertificates(data);
      setLoading(false);
    };

    fetchUserAndCerts();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleAddToLinkedIn = (cert: any) => {
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cert.credential_name)}&organizationName=CERTIFY&issueYear=${cert.issue_date.split('-')[0]}&issueMonth=${cert.issue_date.split('-')[1]}&certUrl=${encodeURIComponent(`${window.location.origin}/credential/${cert.id}`)}&certId=${cert.id}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">Loading Digital Wallet...</div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#000]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-green-500" />
            <span className="font-display font-bold tracking-widest text-lg">CERTIFY</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-gray-400">{user?.email}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-2">My Digital Wallet</h1>
          <p className="text-gray-400">View, share, and manage your cryptographically verified credentials.</p>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-[#111] border border-gray-800 rounded-xl p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No credentials yet</h3>
            <p className="text-gray-500">When an institution issues a certificate to your email, it will appear here instantly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                <div className="aspect-[1.414/1] bg-black p-4 relative pointer-events-none">
                   <div className="absolute inset-0 scale-[1] transform origin-top-left p-4">
                     <CertificateTemplate 
                       credential={cert.payload || {
                         id: cert.id,
                         recipientName: cert.recipient_name,
                         credentialName: cert.credential_name,
                         issueDate: cert.issue_date,
                         template: 'classic'
                       }}
                       signature={cert.signature}
                     />
                   </div>
                </div>
                
                <div className="p-6 bg-[#111] border-t border-gray-800 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{cert.credential_name}</h3>
                      {cert.status === 'revoked' ? (
                         <span className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-mono tracking-widest uppercase rounded border border-red-500/20">Revoked</span>
                      ) : (
                         <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-mono tracking-widest uppercase rounded border border-green-500/20">Verified</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-6">Issued on {new Date(cert.issue_date).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link href={`/credential/${cert.id}`} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <ExternalLink className="w-4 h-4" /> View Public
                    </Link>
                    <button onClick={() => handleAddToLinkedIn(cert)} disabled={cert.status === 'revoked'} className="flex-1 bg-[#0a66c2] hover:bg-[#004182] text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                      <Share2 className="w-4 h-4" /> LinkedIn
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
