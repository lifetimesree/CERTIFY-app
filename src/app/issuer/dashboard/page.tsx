"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Download, Ban, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function IssuerDashboard() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("certificates")
      .select("*")
      .eq("issuer_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setCertificates(data);
    setLoading(false);
  };

  const handleRevoke = async (id: string) => {
    if (confirm("Are you sure you want to administratively revoke this certificate? This permanently invalidates verification.")) {
      await supabase.from("certificates").update({ status: 'revoked' }).eq("id", id);
      fetchCertificates();
    }
  };

  const handleDownloadJson = (cert: any) => {
    const payload = {
      credential: cert.payload,
      signature: cert.signature,
      publicKey: cert.public_key,
      algorithm: "RSA-PSS-SHA256"
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `credential-${cert.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const totalIssued = certificates.length;
  const validCount = certificates.filter(c => c.status === 'issued').length;
  const revokedCount = certificates.filter(c => c.status === 'revoked').length;

  if (loading) return <div className="p-20 text-center text-gray-500">Loading Registry...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8 pb-4 border-b border-gray-800">
        <div className="max-w-2xl">
          <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-gray-500 mb-6 flex items-center gap-2">
            ISSUER PORTAL <span className="text-gray-600">/</span> OVERVIEW
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white leading-[1.1] mb-6">
            Your credentials, <span className="text-gray-600">accounted for.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Issue, track, and revoke digitally signed certificates. All records are permanently secured in the Supabase registry.
          </p>
        </div>
        
        <div className="shrink-0">
          <Link 
            href="/issuer/issue" 
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-5 hover:bg-gray-200 transition-colors font-medium text-lg border border-transparent"
          >
            <Plus size={20} />
            Issue credential
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-800 bg-[#0a0a0a]">
        <div className="p-8 border-b md:border-b-0 md:border-r border-gray-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-mono tracking-widest text-gray-500 uppercase">Total Issued</h3>
            <FileText className="text-gray-600" size={18} />
          </div>
          <p className="text-5xl font-bold text-white font-display">{totalIssued}</p>
        </div>
        <div className="p-8 border-b md:border-b-0 md:border-r border-gray-800 relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-mono tracking-widest text-gray-500 uppercase">Currently Valid</h3>
            <CheckCircle2 className="text-green-500" size={18} />
          </div>
          <p className="text-5xl font-bold text-green-500 font-display">{validCount}</p>
        </div>
        <div className="p-8 relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-mono tracking-widest text-gray-500 uppercase">Revoked</h3>
            <AlertTriangle className="text-red-500" size={18} />
          </div>
          <p className="text-5xl font-bold text-red-500 font-display">{revokedCount}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-gray-800 pb-4">
          <div>
             <div className="text-[10px] font-mono tracking-widest text-blue-500 uppercase mb-2">CREDENTIAL HISTORY</div>
             <h2 className="text-3xl font-bold text-white tracking-tight">Recent issuance</h2>
          </div>
          <div className="text-[10px] font-mono tracking-widest uppercase text-gray-500 flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> DB SYNCED
          </div>
        </div>
        
        {certificates.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-gray-800 bg-[#0a0a0a]">
            <p className="text-gray-500 font-medium">No credentials issued yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b-2 border-gray-800 text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                  <th className="px-4 py-4 font-semibold w-1/4">Credential</th>
                  <th className="px-4 py-4 font-semibold w-1/4">Recipient</th>
                  <th className="px-4 py-4 font-semibold w-1/6">Issued</th>
                  <th className="px-4 py-4 font-semibold w-1/6">Status</th>
                  <th className="px-4 py-4 font-semibold text-right w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-[#111] transition-colors group">
                    <td className="px-4 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-gray-700 bg-black flex items-center justify-center text-xs font-mono text-gray-400 shrink-0">
                          {cert.credential_name.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-base">{cert.credential_name}</div>
                          <div className="text-gray-500 font-mono text-[10px] tracking-wider mt-1">{cert.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-6">
                      <div className="font-medium text-white">{cert.recipient_name}</div>
                      <div className="text-gray-500 text-xs mt-1">{cert.recipient_email}</div>
                    </td>
                    <td className="px-4 py-6 text-gray-400 whitespace-nowrap font-medium">
                      {format(new Date(cert.issue_date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-6">
                      <span className={clsx(
                        "px-3 py-1 text-[11px] font-mono tracking-widest uppercase border",
                        cert.status === 'issued' ? "border-green-500/30 text-green-500 bg-green-500/10" : "border-red-500/30 text-red-500 bg-red-500/10"
                      )}>
                        {cert.status}
                      </span>
                    </td>
                    <td className="px-4 py-6 text-right space-x-2">
                      <button 
                        onClick={() => handleDownloadJson(cert)}
                        className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors inline-flex"
                        title="Download Payload"
                      >
                        <Download size={16} />
                      </button>
                      {cert.status === 'issued' && (
                        <button 
                          onClick={() => handleRevoke(cert.id)}
                          className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded transition-colors inline-flex"
                          title="Revoke Credential"
                        >
                          <Ban size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
