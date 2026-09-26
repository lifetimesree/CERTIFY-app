"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { ShieldAlert, CheckCircle2, FileJson } from "lucide-react";
import { CertificateTemplate } from "@/components/CertificateTemplate";
import { useCertStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

// Minimal helper to sign payload
async function signPayload(privateKey: CryptoKey, payload: any) {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  const signature = await window.crypto.subtle.sign(
    { name: "RSA-PSS", saltLength: 32 },
    privateKey,
    data
  );
  
  // Convert ArrayBuffer to Base64Url
  const signatureArray = Array.from(new Uint8Array(signature));
  const base64 = window.btoa(String.fromCharCode.apply(null, signatureArray));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export default function IssuePage() {
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientEmail: "",
    courseName: "Bachelor of Science",
    fieldOfStudy: "Computer Science",
    issueDate: new Date().toISOString().split('T')[0],
    expiresAt: "",
    template: "classic",
    honors: "",
    notes: ""
  });

  const [batchData, setBatchData] = useState("");
  const [mode, setMode] = useState<"single" | "batch">("single");

  const [loading, setLoading] = useState(false);
  const [issuedPreview, setIssuedPreview] = useState<any | null>(null);
  
  const { issuerKeys, setPreviewTheme } = useCertStore();

  useEffect(() => {
    setPreviewTheme(formData.template);
    return () => setPreviewTheme(null); // cleanup on unmount
  }, [formData.template, setPreviewTheme]);
  const router = useRouter();
  const supabase = createClient();

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuerKeys) return alert("Keys not generated");
    
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const privateKey = await window.crypto.subtle.importKey(
        "jwk",
        issuerKeys.privateKeyJwk as any,
        { name: "RSA-PSS", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const credentialData = {
        id: "CERT-" + new Date().getFullYear() + "-" + uuidv4().split('-')[0].toUpperCase(),
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        credentialName: formData.courseName,
        fieldOfStudy: formData.fieldOfStudy || "Computer Science",
        issuerName: "CERTIFY PLATFORM",
        issueDate: formData.issueDate,
        expiresAt: formData.expiresAt || undefined,
        template: formData.template || "classic",
        honors: formData.honors,
        notes: formData.notes,
      };

      const signature = await signPayload(privateKey, credentialData);

      const cert = {
        id: credentialData.id,
        recipient_email: credentialData.recipientEmail,
        recipient_name: credentialData.recipientName,
        credential_name: credentialData.credentialName,
        issue_date: credentialData.issueDate,
        issuer_id: user.id,
        payload: credentialData,
        signature,
        public_key: issuerKeys.publicKeyJwk,
        status: "issued"
      };

      const { error } = await supabase.from("certificates").insert(cert);
      if (error) throw error;

      setIssuedPreview(cert);
    } catch (error) {
      console.error("Signing failed", error);
      alert("Failed to issue credential.");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuerKeys) return alert("Keys not generated");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const privateKey = await window.crypto.subtle.importKey(
        "jwk",
        issuerKeys.privateKeyJwk as any,
        { name: "RSA-PSS", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const rows = batchData.trim().split('\n');
      const inserts = [];

      for (const row of rows) {
        const [email, name, credential, date] = row.split(',').map(s => s.trim());
        if (!email || !name) continue;

        const credentialData = {
          id: "CERT-" + new Date().getFullYear() + "-" + uuidv4().split('-')[0].toUpperCase(),
          recipientName: name,
          recipientEmail: email,
          credentialName: credential || formData.courseName,
          fieldOfStudy: formData.fieldOfStudy || "Computer Science",
          issuerName: "CERTIFY PLATFORM",
          issueDate: date || formData.issueDate,
          expiresAt: formData.expiresAt || undefined,
          template: formData.template || "classic",
          honors: "",
          notes: "",
        };

        const signature = await signPayload(privateKey, credentialData);

        inserts.push({
          id: credentialData.id,
          recipient_email: credentialData.recipientEmail,
          recipient_name: credentialData.recipientName,
          credential_name: credentialData.credentialName,
          issue_date: credentialData.issueDate,
          issuer_id: user.id,
          payload: credentialData,
          signature,
          public_key: issuerKeys.publicKeyJwk,
          status: "issued"
        });
      }

      if (inserts.length > 0) {
        const { error } = await supabase.from("certificates").insert(inserts);
        if (error) throw error;
        alert(`Successfully issued ${inserts.length} credentials!`);
        router.push('/issuer/dashboard');
      }
    } catch (error) {
      console.error("Batch issuing failed", error);
      alert("Failed to issue batch.");
    } finally {
      setLoading(false);
    }
  };

  if (issuedPreview) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-6 flex items-start gap-4">
          <CheckCircle2 className="mt-1" />
          <div>
            <h2 className="text-xl font-bold">Credential Issued Successfully</h2>
            <p className="mt-1 opacity-90">The certificate has been cryptographically signed and added to the Supabase registry.</p>
          </div>
        </div>

        <div className="bg-[#111] rounded-xl shadow-lg overflow-hidden border border-gray-800">
          <div className="bg-[#000] px-6 py-4 border-b border-gray-800 font-medium flex justify-between text-white">
            <span>Live Preview</span>
            <span className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded">ID: {issuedPreview.id}</span>
          </div>
          <div className="p-8 flex justify-center">
             <div className="max-w-[800px] w-full">
               <CertificateTemplate credential={issuedPreview.payload} signature={issuedPreview.signature} />
             </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/issuer/dashboard')}
            className="px-6 py-3 bg-gray-900 border border-gray-800 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Return to Dashboard
          </button>
          <button 
            onClick={() => {
              setIssuedPreview(null);
              setFormData({ ...formData, recipientName: "", recipientEmail: "" });
            }}
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 font-medium"
          >
            Issue Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 text-white">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Issue a Certificate</h1>
          <p className="text-gray-400 mt-2">Create a credential and seal its payload into the database.</p>
        </div>

        <div className="flex bg-[#000] rounded-lg p-1 border border-gray-800">
          <button onClick={() => setMode("single")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === "single" ? "bg-[#111] text-white border border-gray-700" : "text-gray-500 hover:text-gray-300"}`}>Single Issuance</button>
          <button onClick={() => setMode("batch")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === "batch" ? "bg-[#111] text-white border border-gray-700" : "text-gray-500 hover:text-gray-300"}`}>Batch Issuance</button>
        </div>

        {mode === "single" ? (
          <form onSubmit={handleIssue} className="space-y-6 bg-[#000] p-8 rounded-xl shadow-sm border border-gray-800">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-800 pb-2">Recipient Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Full Name</label>
                  <input required type="text" className="w-full bg-[#111] border-gray-800 border p-2 text-sm focus:ring-green-500 focus:border-green-500 text-white rounded" 
                    value={formData.recipientName} onChange={e => setFormData({...formData, recipientName: e.target.value})} placeholder="e.g. Jordan Lee" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Email Address</label>
                  <input required type="email" className="w-full bg-[#111] border-gray-800 border p-2 text-sm focus:ring-green-500 focus:border-green-500 text-white rounded" 
                    value={formData.recipientEmail} onChange={e => setFormData({...formData, recipientEmail: e.target.value})} placeholder="name@example.edu" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-800 pb-2">Credential Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Credential Name</label>
                  <input required type="text" className="w-full bg-[#111] border-gray-800 border p-2 text-sm focus:ring-green-500 focus:border-green-500 text-white rounded" 
                    value={formData.courseName} onChange={e => setFormData({...formData, courseName: e.target.value})} placeholder="Bachelor of Science" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Field of Study</label>
                  <input required type="text" className="w-full bg-[#111] border-gray-800 border p-2 text-sm focus:ring-green-500 focus:border-green-500 text-white rounded" 
                    value={formData.fieldOfStudy} onChange={e => setFormData({...formData, fieldOfStudy: e.target.value})} placeholder="Computer Science" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Issue Date</label>
                  <input required type="date" className="w-full bg-[#111] border-gray-800 border p-2 text-sm focus:ring-green-500 focus:border-green-500 text-white rounded" 
                    value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Expiry Date (Optional)</label>
                  <input type="date" className="w-full bg-[#111] border-gray-800 border p-2 text-sm focus:ring-green-500 focus:border-green-500 text-white rounded" 
                    value={formData.expiresAt} onChange={e => setFormData({...formData, expiresAt: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Certificate Theme</label>
                  <select className="w-full bg-[#111] border-gray-800 border p-2 text-sm focus:ring-green-500 focus:border-green-500 text-white rounded" 
                    value={formData.template} onChange={e => setFormData({...formData, template: e.target.value})}>
                    <option value="classic">Classic Dark (Elegant)</option>
                    <option value="brutalist">Brutalist (Stark & Bold)</option>
                    <option value="avantgarde">Avant-Garde (Mamenchisa Style)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-[#111] p-4 rounded-lg flex gap-3 text-sm border border-gray-800">
              <ShieldAlert className="text-gray-500 shrink-0" size={20} />
              <p className="text-gray-400 text-xs">
                When you click issue, a unique ID and an RSA-PSS cryptographic signature will be generated locally and pushed to Supabase.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing Payload..." : "Issue & Sign Credential"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBatchIssue} className="space-y-6 bg-[#000] p-8 rounded-xl shadow-sm border border-gray-800">
             <div className="space-y-4">
               <h3 className="font-semibold text-gray-300 border-b border-gray-800 pb-2">Batch CSV Upload</h3>
               <p className="text-xs text-gray-500 mb-4">Paste multiple records to issue them all at once. Format: <br/><code className="text-green-500 bg-green-500/10 px-1">email, name, credential (optional), date (optional)</code></p>
               <textarea
                 required
                 className="w-full bg-[#111] border-gray-800 border p-4 text-sm focus:ring-green-500 focus:border-green-500 text-white rounded font-mono h-48"
                 placeholder="jordan@example.edu, Jordan Lee, Bachelor of Science, 2026-09-25&#10;taylor@example.edu, Taylor Swift, Bachelor of Arts, 2026-09-25"
                 value={batchData}
                 onChange={(e) => setBatchData(e.target.value)}
               ></textarea>
             </div>
             <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <FileJson className="w-5 h-5" />
              {loading ? "Signing Batch..." : "Sign & Issue Batch"}
            </button>
          </form>
        )}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-8 space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Live Preview</h2>
          <div className="bg-[#111] rounded-xl shadow-lg border border-gray-800 p-6">
            <div className="w-full">
              <CertificateTemplate credential={{...formData, id: 'preview-id', credentialName: formData.courseName}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
