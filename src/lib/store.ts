import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CredentialData {
  recipientName: string;
  recipientEmail: string;
  credentialName: string;
  fieldOfStudy: string;
  issuerName: string;
  issueDate: string;
  honors?: string;
  notes?: string;
  template: string;
  id: string;
}

export interface IssuedCertificate {
  credential: CredentialData;
  signature: string; // Base64
  publicKey: JsonWebKey;
  algorithm: string;
  status: 'valid' | 'revoked';
  // Allow payload for backwards compatibility with old local storage data
  payload?: any; 
}

interface CertStore {
  certificates: IssuedCertificate[];
  issuerKeys: {
    publicKeyJwk: JsonWebKey | null;
    privateKeyJwk: JsonWebKey | null;
  };
  previewTheme: string | null;
  setPreviewTheme: (theme: string | null) => void;
  setKeys: (publicKeyJwk: JsonWebKey, privateKeyJwk: JsonWebKey) => void;
  issueCertificate: (cert: IssuedCertificate) => void;
  revokeCertificate: (id: string) => void;
  getCertificateById: (id: string) => IssuedCertificate | undefined;
}

export const useCertStore = create<CertStore>()(
  persist(
    (set, get) => ({
      certificates: [],
      issuerKeys: { publicKeyJwk: null, privateKeyJwk: null },
      previewTheme: null,
      setPreviewTheme: (theme) => set({ previewTheme: theme }),
      setKeys: (publicKeyJwk, privateKeyJwk) => set({ issuerKeys: { publicKeyJwk, privateKeyJwk } }),
      issueCertificate: (cert) =>
        set((state) => ({ certificates: [cert, ...state.certificates] })),
      revokeCertificate: (id) =>
        set((state) => ({
          certificates: state.certificates.map((c) =>
            (c.credential?.id || c.payload?.id) === id ? { ...c, status: 'revoked' } : c
          ),
        })),
      getCertificateById: (id) => {
        return get().certificates.find(c => (c.credential?.id || c.payload?.id) === id);
      }
    }),
    {
      name: 'cert-platform-storage',
    }
  )
);
