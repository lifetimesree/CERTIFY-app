"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, Download } from "lucide-react";
import { CertificateTemplate } from "@/components/CertificateTemplate";



export default function PublicCredentialPage() {
  const { id } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchAndVerify = async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setCert(data);

      // Verify signature mathematically
      try {
        const cryptoKey = await window.crypto.subtle.importKey(
          "jwk",
          data.public_key,
          { name: "RSA-PSS", hash: "SHA-256" },
          true,
          ["verify"]
        );

        const encoder = new TextEncoder();
        
        // Postgres JSONB strips whitespace and reorders keys.
        // We MUST reconstruct the exact insertion order to verify the signature.
        const orderedKeys = [
          "id", "recipientName", "recipientEmail", "credentialName", 
          "fieldOfStudy", "issuerName", "issueDate", "expiresAt", "template", 
          "honors", "notes"
        ];
        const orderedPayload: any = {};
        for (const key of orderedKeys) {
          if (data.payload[key] !== undefined) {
            orderedPayload[key] = data.payload[key];
          }
        }
        
        const dataToVerify = encoder.encode(JSON.stringify(orderedPayload));
        
        // Base64Url to Uint8Array
        const base64Url = data.signature;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const pad = base64.length % 4;
        const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
        const binaryString = window.atob(padded);
        const signatureBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          signatureBytes[i] = binaryString.charCodeAt(i);
        }

        const valid = await window.crypto.subtle.verify(
          { name: "RSA-PSS", saltLength: 32 },
          cryptoKey,
          signatureBytes,
          dataToVerify
        );

        if (valid && data.payload.expiresAt && new Date(data.payload.expiresAt) < new Date()) {
          setIsExpired(true);
        }

        setIsValid(valid);
      } catch (err) {
        console.error("Verification error", err);
        setIsValid(false);
      }
      setLoading(false);
    };

    fetchAndVerify();
  }, [id, supabase]);

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">Loading Verification...</div>;

  if (!cert) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white flex-col gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h1 className="text-2xl font-bold">Credential Not Found</h1>
        <p className="text-gray-400">This certificate does not exist in the registry.</p>
        <Link href="/" className="text-green-500 hover:underline">Return Home</Link>
      </div>
    );
  }

  const theme = cert.payload.template || "classic";
  
  return (
    <div className={`min-h-screen bg-[#030303] text-white print:bg-white print:text-black transition-colors duration-500 overflow-hidden`}>
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className={`border-b border-gray-800 bg-[#000] print:hidden`}>
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className={`flex items-center gap-2 text-white`}>
              <ShieldCheck className={`w-6 h-6 text-green-500`} />
              <span className="font-display font-bold tracking-widest text-lg">CERTIFY</span>
            </Link>
            <button onClick={() => window.history.length > 2 ? router.back() : router.push('/')} className={`text-xs font-mono tracking-widest uppercase border px-4 py-2 rounded flex items-center gap-2 transition-colors text-gray-400 border-gray-800 hover:text-white hover:bg-gray-900`}>
              ← Go Back
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center flex-1">
        <div className="w-full mb-8 text-center flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
          <h1 className="text-3xl font-display font-bold">{cert.recipient_name}'s Credential</h1>
          
          <div className="flex gap-4 items-center">
            {cert.status === 'revoked' ? (
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg text-sm font-medium">
                <AlertTriangle className="w-4 h-4" /> Administratively Revoked
              </div>
            ) : isExpired ? (
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg text-sm font-medium">
                <AlertTriangle className="w-4 h-4" /> Credential Expired
              </div>
            ) : isValid ? (
               <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-2 rounded-lg text-sm font-medium">
                 <ShieldCheck className="w-4 h-4" /> Cryptographically Verified & Authentic
               </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg text-sm font-medium">
                <AlertTriangle className="w-4 h-4" /> Cryptographic Verification Failed
              </div>
            )}
            
            <button 
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

        <div className={`w-full overflow-hidden shadow-2xl relative ${cert.status === 'revoked' || isExpired ? 'opacity-80' : ''} print:shadow-none`}>
          {(cert.status === 'revoked' || isExpired) && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
                <div className="border-4 border-red-500 text-red-500 font-display font-bold text-6xl tracking-widest uppercase p-4 transform -rotate-12 rounded bg-black/50">
                  {isExpired ? 'EXPIRED' : 'REVOKED'}
                </div>
             </div>
          )}
          <CertificateTemplate 
            credential={cert.payload}
            signature={cert.signature}
          />
        </div>
        
        <div className="w-full mt-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 print:hidden">
           <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-800 pb-2">Verification Details</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
             <div>
               <span className="block text-xs font-mono text-gray-600 mb-1">CREDENTIAL ID</span>
               {cert.id}
             </div>
             <div>
               <span className="block text-xs font-mono text-gray-600 mb-1">ISSUE DATE</span>
               {new Date(cert.issue_date).toLocaleDateString()}
             </div>
             <div>
               <span className="block text-xs font-mono text-gray-600 mb-1">CRYPTOGRAPHIC ALGORITHM</span>
               RSA-PSS SHA-256
             </div>
             <div>
               <span className="block text-xs font-mono text-gray-600 mb-1">BLOCKCHAIN / DB STATUS</span>
               {cert.status === 'issued' ? 'Valid in Registry' : 'Revoked in Registry'}
             </div>
           </div>
        </div>

      </main>
      </div>
    </div>
  );
}
