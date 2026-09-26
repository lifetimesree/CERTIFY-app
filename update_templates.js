const fs = require('fs');
const content = import { QRCodeSVG } from "qrcode.react";

interface CertificateTemplateProps {
  credential: any;
  signature?: string;
}

export function CertificateTemplate({ credential, signature }: CertificateTemplateProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cert-platform-drab.vercel.app';
  
  const qrData = \\/credential/\\;
  
  if (credential.template === "avantgarde") {
    return (
      <div className="w-full aspect-[1.414/1] bg-[#f4f4f0] text-black p-[5cqi] flex flex-col justify-between relative overflow-hidden group @container print-exact border border-gray-300 shadow-sm">
        <div className="relative z-10 pt-[2cqi] px-[2cqi] flex justify-between items-start">
          <div className="w-[40cqi]">
            <p className="text-[1.2cqi] font-sans font-bold uppercase tracking-[0.2em] mb-[1cqi]">Certificate of Achievement</p>
            <p className="text-[1.2cqi] font-sans leading-relaxed opacity-70">
              This document serves as an authentic cryptographic record verifying the successful completion of the requirements set forth.
            </p>
          </div>
          <div className="text-right flex flex-col items-end">
            <h1 className="text-[4cqi] font-serif italic tracking-tighter leading-none mb-[1cqi]">Certify.</h1>
            <div className="font-mono text-[1.2cqi] opacity-50">ID: {credential.id}</div>
          </div>
        </div>

        <div className="relative z-10 px-[2cqi] my-auto">
          <div className="text-[10cqi] font-serif text-black leading-[0.8] tracking-tighter mb-[2cqi] -ml-[0.5cqi] break-words hyphens-auto" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
            {credential.recipientName || "Recipient Name"}
          </div>
          
          <div className="flex gap-[4cqi] items-end">
            <h2 className="text-[3cqi] font-sans font-medium uppercase tracking-tight max-w-[50cqi] leading-[1.1]">
              {credential.credentialName || "Credential Name"}
            </h2>
            {credential.honors && (
              <p className="text-[1.8cqi] font-serif italic opacity-60 mb-[0.5cqi]">{credential.honors}</p>
            )}
          </div>
        </div>

        <div className="relative z-10 w-full flex justify-between items-end pb-[2cqi] px-[2cqi]">
          <div className="flex gap-[8cqi]">
            <div className="text-left flex flex-col border-t border-black pt-[1cqi]">
              <span className="text-[1cqi] font-sans font-bold tracking-widest uppercase mb-[0.5cqi]">Issued On</span>
              <span className="font-serif italic text-[1.8cqi]">{credential.issueDate ? new Date(credential.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date'}</span>
            </div>
            
            <div className="text-left flex flex-col border-t border-black pt-[1cqi]">
              <span className="text-[1cqi] font-sans font-bold tracking-widest uppercase mb-[0.5cqi]">Signature</span>
              <span className="font-mono text-[1.2cqi] w-[20cqi] truncate mt-1 opacity-70">
                {signature ? \\...\ : 'Unsigned'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <QRCodeSVG value={qrData} size={120} style={{ width: '8cqi', height: '8cqi' }} level="L" includeMargin={false} fgColor="#000000" bgColor="transparent" />
          </div>
        </div>
      </div>
    );
  }

  if (credential.template === "brutalist") {
    return (
      <div className="w-full aspect-[1.414/1] bg-[#09090b] text-white p-[5cqi] flex flex-col justify-between relative overflow-hidden group @container print-exact border border-gray-800">
        <div className="absolute top-0 right-0 w-[40cqi] h-[40cqi] bg-red-600 rounded-full mix-blend-difference blur-[10cqi] opacity-50 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        
        <div className="relative z-10 pt-[2cqi] px-[2cqi] flex justify-between items-start border-b-2 border-white/20 pb-[2cqi]">
          <div>
            <h1 className="text-[4cqi] font-display font-black tracking-tighter uppercase text-white leading-none">CERTIFY</h1>
            <h3 className="text-red-500 font-mono uppercase tracking-widest text-[1cqi] mt-[1cqi]">PROTOCOL_V1 // VALIDATED</h3>
          </div>
          <div className="text-right">
            <div className="text-white font-mono font-bold text-[1.2cqi] tracking-tighter uppercase mb-[0.5cqi]">ID_{credential.id}</div>
          </div>
        </div>

        <div className="relative z-10 px-[2cqi] my-[4cqi] flex-1 flex flex-col justify-center">
          <div className="text-[8.5cqi] font-display font-black text-white leading-[0.85] tracking-tighter uppercase mix-blend-exclusion break-words hyphens-auto" style={{ overflowWrap: 'break-word', wordBreak: 'break-word', textWrap: 'balance' }}>
            {credential.recipientName || "Recipient Name"}
          </div>
          
          <div className="mt-[4cqi] grid grid-cols-2 gap-[4cqi]">
            <div>
              <div className="text-red-500 font-mono text-[1cqi] uppercase tracking-widest mb-[1cqi]">ACHIEVEMENT</div>
              <h2 className="text-[3cqi] font-sans font-bold tracking-tight text-white uppercase leading-[1.1]">
                {credential.credentialName || "Credential Name"}
              </h2>
            </div>
            <div>
              <div className="text-red-500 font-mono text-[1cqi] uppercase tracking-widest mb-[1cqi]">TIMESTAMP</div>
              <div className="font-mono text-[2cqi] font-bold text-white">
                {credential.issueDate}
              </div>
              {credential.honors && (
                <div className="mt-[2cqi] font-mono text-[1.2cqi] text-white/70 border-l-2 border-red-500 pl-[1cqi]">
                  {credential.honors}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full flex justify-between items-end pt-[2cqi] px-[2cqi] border-t-2 border-white/20">
          <div className="text-left flex flex-col">
            <span className="text-[1cqi] font-mono tracking-widest text-red-500 uppercase mb-[0.5cqi]">CRYPTOGRAPHIC_HASH</span>
            <span className="font-mono text-[1.2cqi] text-white w-[30cqi] truncate">
              {signature ? \\\ : 'UNSIGNED_DRAFT'}
            </span>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="bg-white p-[0.5cqi]">
              <QRCodeSVG value={qrData} size={120} style={{ width: '8cqi', height: '8cqi' }} level="L" includeMargin={false} fgColor="#000000" bgColor="#ffffff" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Classic Template (Default)
  return (
    <div className="w-full aspect-[1.414/1] bg-[#030303] text-white p-[5cqi] flex flex-col justify-between relative overflow-hidden group @container print-exact">
      <div className="absolute top-0 right-0 w-[80cqi] h-[80cqi] bg-gradient-to-bl from-zinc-900 via-transparent to-transparent opacity-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      
      <div className="absolute inset-[2cqi] border border-white/10 pointer-events-none">
         <div className="absolute top-0 left-0 w-[1cqi] h-[1cqi] border-t border-l border-white/50 -translate-x-[1px] -translate-y-[1px]"></div>
         <div className="absolute top-0 right-0 w-[1cqi] h-[1cqi] border-t border-r border-white/50 translate-x-[1px] -translate-y-[1px]"></div>
         <div className="absolute bottom-0 left-0 w-[1cqi] h-[1cqi] border-b border-l border-white/50 -translate-x-[1px] translate-y-[1px]"></div>
         <div className="absolute bottom-0 right-0 w-[1cqi] h-[1cqi] border-b border-r border-white/50 translate-x-[1px] translate-y-[1px]"></div>
      </div>

      <div className="relative z-10 pt-[1cqi] px-[2cqi] flex justify-between items-start">
        <div>
          <h3 className="text-white/40 font-mono uppercase tracking-[0.4em] text-[1.2cqi] mb-[1cqi]">OFFICIAL CREDENTIAL</h3>
          <h1 className="text-[3cqi] font-display font-bold tracking-tight uppercase text-white/90 leading-none">CERTIFY</h1>
        </div>
        <div className="text-right">
          <div className="text-white/40 font-mono text-[1.2cqi] tracking-widest uppercase mb-[0.5cqi]">ID NUMBER</div>
          <div className="font-mono text-[1.5cqi] text-white/70 leading-none">{credential.id}</div>
        </div>
      </div>

      <div className="relative z-10 px-[2cqi] my-auto">
        <p className="text-white/50 font-mono uppercase tracking-[0.2em] text-[1.5cqi] mb-[2cqi]">This certifies that</p>
        
        <div className="text-[8.5cqi] font-serif italic text-white mb-[3cqi] leading-[0.9] tracking-tight break-words hyphens-auto" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
          {credential.recipientName || "Recipient Name"}
        </div>
        
        <p className="text-white/50 font-display uppercase tracking-widest text-[1.5cqi] mb-[1.5cqi]">has successfully achieved</p>
        <h2 className="text-[4cqi] font-display font-bold tracking-tighter text-white uppercase max-w-[80cqi] leading-[1.1]">
          {credential.credentialName || "Credential Name"}
        </h2>
        
        {credential.honors && (
          <p className="text-[2cqi] font-serif italic text-white/60 mt-[2cqi] flex items-center gap-[2cqi]">
            <span className="w-[6cqi] h-px bg-white/20"></span>
            {credential.honors}
          </p>
        )}
      </div>

      <div className="relative z-10 w-full flex justify-between items-end pb-[1cqi] px-[2cqi]">
        <div className="flex gap-[6cqi]">
          <div className="text-left flex flex-col">
            <span className="text-[1.2cqi] font-mono tracking-widest text-white/40 uppercase mb-[1cqi]">DATE OF ISSUE</span>
            <span className="font-medium font-mono text-[1.8cqi] text-white/80">{credential.issueDate ? new Date(credential.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date'}</span>
          </div>
          
          <div className="text-left flex flex-col">
            <span className="text-[1.2cqi] font-mono tracking-widest text-white/40 uppercase mb-[1cqi]">CRYPTOGRAPHIC SIGNATURE</span>
            <span className="font-mono text-[1.5cqi] text-white/60 w-[25cqi] truncate mt-0.5 opacity-70">
              {signature ? \\...\ : 'Unsigned Draft'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="p-[1cqi] bg-white rounded-sm border border-gray-300">
            <QRCodeSVG 
              value={qrData} 
              size={120}
              style={{ width: '10cqi', height: '10cqi' }}
              level="L"
              includeMargin={false}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
          <span className="text-[1cqi] text-white/40 mt-[1.5cqi] font-mono tracking-widest uppercase">SCAN FOR PROOF</span>
        </div>
      </div>
    </div>
  );
}

fs.writeFileSync('src/components/CertificateTemplate.tsx', content);
