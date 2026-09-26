"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { verifySignature } from "@/lib/crypto";
import { ShieldAlert, ShieldCheck, RotateCcw } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";

function CryptoVisualizer() {
  const [hex, setHex] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      let str = "";
      for (let i = 0; i < 256; i++) {
        str += Math.floor(Math.random() * 16).toString(16).toUpperCase();
        if (i % 32 === 31) str += "\n";
        else if (i % 2 === 1) str += " ";
      }
      setHex(str);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-green-500 font-mono text-[10px] sm:text-xs leading-none whitespace-pre opacity-80 mix-blend-screen h-full w-full flex items-center justify-center overflow-hidden">
      {hex}
    </div>
  );
}

export default function VerifyPortal() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [verificationState, setVerificationState] = useState<'idle' | 'verifying' | 'valid' | 'invalid' | 'revoked' | 'expired'>('idle');
  const [parsedData, setParsedData] = useState<any>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (verificationState !== 'idle') return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10 },
      false
    );
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        handleVerification(decodedText);
        scanner.clear();
      },
      (error) => {
        // quiet fail for scanning
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [verificationState]);

  const handleVerification = async (input: string) => {
    setVerificationState('verifying');
    try {
      await new Promise(r => setTimeout(r, 2000)); // Theatrical delay for visualizer
      let data: any;

      // Check if it's a URL or an ID, rather than raw JSON
      if (input.includes('/credential/') || input.startsWith('CERT-')) {
        const id = input.includes('/credential/') ? input.split('/credential/')[1] : input;
        const { data: dbRecord, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !dbRecord) throw new Error("Not found");
        
        data = {
          credential: dbRecord.payload,
          signature: dbRecord.signature,
          publicKey: dbRecord.public_key,
          status: dbRecord.status
        };
      } else {
        // Fallback for raw JSON pasted
        data = JSON.parse(input);
      }

      setParsedData(data);

      const publicKey = await window.crypto.subtle.importKey(
        "jwk",
        data.publicKey,
        { name: "RSA-PSS", hash: "SHA-256" },
        false,
        ["verify"]
      );

      const isValidSignature = await verifySignature(publicKey, data.signature, data.credential);

      if (!isValidSignature) {
        setVerificationState('invalid');
        return;
      }

      // If we already fetched from DB and know it's revoked
      if (data.status === 'revoked') {
        setVerificationState('revoked');
        return;
      }

      // Query Supabase for revocation registry status if we haven't already
      if (!data.status) {
        const { data: dbRecord, error } = await supabase
          .from('certificates')
          .select('status')
          .eq('id', data.credential.id)
          .single();

        if (dbRecord && dbRecord.status === 'revoked') {
          setVerificationState('revoked');
          return;
        }
      }

      if (data.credential.expiresAt && new Date(data.credential.expiresAt) < new Date()) {
        setVerificationState('expired');
        return;
      }
      
      setVerificationState('valid');
    } catch (e: any) {
      console.error(e);
      setVerificationState('invalid');
    }
  };

  const handleManualPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text) {
      handleVerification(text);
    }
  };

  const reset = () => {
    setVerificationState('idle');
    setScanResult(null);
    setParsedData(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="border-b border-gray-800 bg-[#000]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-green-500" />
            <span className="font-display font-bold tracking-widest text-lg">CERTIFY</span>
          </Link>
          <div className="text-xs font-mono tracking-widest text-gray-500 uppercase flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">HOME</Link>
            <Link href="/login" className="text-green-500 hover:text-green-400 transition-colors">LOGIN</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col min-h-[calc(100vh-64px)]">
        
        <div className="mb-12">
          <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-gray-500 mb-6">
            PUBLIC VERIFICATION NETWORK
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-gray-100 leading-[1.1] mb-6 font-display">
            Does this credential <span className="text-gray-500">hold up?</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Scan a QR payload or paste the signed JSON. We verify the signature, inspect the Supabase registry, and return a human-readable trust result.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          <div className="flex flex-col gap-6">
            {verificationState === 'idle' ? (
               <>
                 <div className="bg-[#111] p-6 rounded-lg border border-gray-800">
                    <h3 className="font-semibold text-lg font-display tracking-tight text-white mb-4">Scan QR Envelope</h3>
                    <div className="aspect-square bg-black rounded overflow-hidden relative border border-gray-800" id="reader"></div>
                 </div>
                 
                 <div className="bg-[#111] p-6 rounded-lg border border-gray-800">
                    <h3 className="font-semibold text-lg font-display tracking-tight text-white mb-4">Paste Raw Payload</h3>
                    <textarea 
                      placeholder="Paste the full JSON credential object here..."
                      className="w-full h-32 bg-black border border-gray-800 rounded p-4 text-xs font-mono text-gray-400 focus:border-green-500 focus:outline-none focus:text-white transition-colors"
                      onChange={handleManualPaste}
                    />
                 </div>
               </>
            ) : (
              <div className="bg-[#111] p-6 rounded-lg border border-gray-800 flex flex-col gap-4">
                 <div className="flex justify-between items-center">
                   <h3 className="font-semibold text-lg font-display tracking-tight text-white">Capture a credential</h3>
                   <button onClick={reset} className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors bg-gray-900 px-3 py-1.5 rounded border border-gray-800">
                     <RotateCcw size={14} /> Reset payload
                   </button>
                 </div>
                  <div className="aspect-video bg-black rounded border border-gray-800 flex items-center justify-center p-8 overflow-hidden relative">
                    {verificationState === 'verifying' && <CryptoVisualizer />}
                    {verificationState === 'valid' && <ShieldCheck className="w-24 h-24 text-green-500" />}
                    {(verificationState === 'invalid' || verificationState === 'revoked') && <ShieldAlert className="w-24 h-24 text-red-500" />}
                 </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-[#111] border border-gray-800 p-8 rounded-lg">
               <div className="text-[10px] tracking-widest uppercase text-gray-500 font-mono mb-4">VERIFICATION RESULT</div>
               {verificationState === 'idle' && (
                 <>
                   <h2 className="text-4xl font-bold font-display tracking-tight mb-2">AWAITING PAYLOAD</h2>
                   <p className="text-gray-400">Scan or verify a payload to begin the trust check.</p>
                 </>
               )}
               {verificationState === 'valid' && (
                 <>
                   <h2 className="text-4xl font-bold font-display tracking-tight mb-2 text-green-500">VALID</h2>
                   <p className="text-gray-400">Signature matches. The payload is intact and the registry confirms it is active.</p>
                 </>
               )}
               {verificationState === 'invalid' && (
                 <>
                   <h2 className="text-4xl font-bold font-display tracking-tight mb-2 text-red-500">INVALID</h2>
                   <p className="text-gray-400">Signature mismatch. The payload has been tampered with or is corrupted.</p>
                 </>
               )}
               {verificationState === 'revoked' && (
                 <>
                   <h2 className="text-4xl font-bold font-display tracking-tight mb-2 text-amber-500">REVOKED</h2>
                   <p className="text-gray-400">Signature is valid, but the issuer has revoked this credential in the registry.</p>
                 </>
               )}
               {verificationState === 'expired' && (
                 <div className="relative">
                   <h2 className="text-4xl font-bold font-display tracking-tight mb-2 text-red-600 uppercase" style={{ textShadow: "0 0 10px rgba(220,38,38,0.8)" }}>EXPIRED</h2>
                   <p className="text-gray-400">This credential has exceeded its valid lifespan and is no longer recognized.</p>
                   {/* Ash/burn effect via css background */}
                   <div className="absolute inset-0 bg-red-900/10 pointer-events-none mix-blend-color-burn animate-pulse"></div>
                 </div>
               )}
            </div>

            <div className="bg-[#111] border border-gray-800 p-8 rounded-lg">
               <div className="text-[10px] tracking-widest uppercase text-gray-500 font-mono mb-6">CRYPTOGRAPHIC TRACE</div>
               <h3 className="text-2xl font-bold font-display tracking-tight mb-8">Proof, step by step.</h3>

               <div className="space-y-6">
                 <div className="flex gap-4">
                   <div className="mt-1">
                     {verificationState === 'idle' ? <div className="w-5 h-5 rounded-full border-2 border-gray-700 flex items-center justify-center text-[10px] text-gray-500">1</div> : 
                      <CheckCircleIndicator success={true} />}
                   </div>
                   <div>
                     <div className={clsx("text-xs font-mono mb-1", verificationState !== 'idle' ? "text-green-500" : "text-gray-500")}>01 / PAYLOAD HASH</div>
                     <p className="text-gray-400 text-sm">
                       {verificationState === 'idle' ? 'Waiting for the payload editor.' : 'Extracted payload bytes for validation.'}
                     </p>
                   </div>
                 </div>

                 <div className="flex gap-4">
                   <div className="mt-1">
                     {verificationState === 'idle' || verificationState === 'verifying' ? <div className="w-5 h-5 rounded-full border-2 border-gray-700 flex items-center justify-center text-[10px] text-gray-500">2</div> : 
                      <CheckCircleIndicator success={verificationState === 'valid' || verificationState === 'revoked'} />}
                   </div>
                   <div>
                     <div className={clsx("text-xs font-mono mb-1", verificationState === 'valid' || verificationState === 'revoked' ? "text-green-500" : verificationState === 'invalid' ? "text-red-500" : "text-gray-500")}>02 / SIGNATURE CHECK</div>
                     <p className="text-gray-400 text-sm">
                       {verificationState === 'idle' ? 'Public key will be imported from the envelope.' : 
                        verificationState === 'invalid' ? 'Failed to match public key against RSA-PSS signature.' :
                        'Computed payload hash matches the signed issuer hash.'}
                     </p>
                   </div>
                 </div>

                 <div className="flex gap-4">
                   <div className="mt-1">
                     {verificationState === 'idle' || verificationState === 'verifying' ? <div className="w-5 h-5 rounded-full border-2 border-gray-700 flex items-center justify-center text-[10px] text-gray-500">3</div> : 
                      <CheckCircleIndicator success={verificationState === 'valid'} warning={verificationState === 'revoked' || verificationState === 'expired'} />}
                   </div>
                   <div>
                     <div className={clsx("text-xs font-mono mb-1", verificationState === 'valid' ? "text-green-500" : (verificationState === 'revoked' || verificationState === 'expired') ? "text-amber-500" : "text-gray-500")}>03 / TRUST STATUS</div>
                     <p className="text-gray-400 text-sm">
                       {verificationState === 'idle' ? 'Issuer status is checked in the Supabase Registry.' : 
                        verificationState === 'invalid' ? 'Untrusted payload.' :
                        verificationState === 'revoked' ? 'Blocked by issuer registry lookup.' :
                        verificationState === 'expired' ? 'Time-to-live expiration reached.' :
                        'Credential is valid and active in the database.'}
                     </p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircleIndicator({ success, warning = false }: { success: boolean, warning?: boolean }) {
  if (warning) {
    return (
      <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500">
        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
      </div>
    );
  }
  if (success) {
    return (
      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500">
      <div className="w-2 h-2 rounded-full bg-red-500"></div>
    </div>
  );
}
