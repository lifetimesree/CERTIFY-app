export async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );

  const publicKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

  return { publicKeyJwk, privateKeyJwk };
}

export async function importPrivateKey(jwk: JsonWebKey) {
  return await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );
}

export async function importPublicKey(jwk: JsonWebKey) {
  return await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    },
    false,
    ["verify"]
  );
}

export async function signPayload(privateKey: CryptoKey, payload: object) {
  const enc = new TextEncoder();
  const encoded = enc.encode(JSON.stringify(payload));
  const signature = await window.crypto.subtle.sign(
    {
      name: "RSA-PSS",
      saltLength: 32,
    },
    privateKey,
    encoded
  );

  return arrayBufferToBase64(signature);
}

export async function verifySignature(publicKey: CryptoKey, signatureBase64: string, payload: any) {
  const enc = new TextEncoder();
  
  // Postgres JSONB strips whitespace and reorders keys.
  // We MUST reconstruct the exact insertion order to verify the signature.
  const orderedKeys = [
    "id", "recipientName", "recipientEmail", "credentialName", 
    "fieldOfStudy", "issuerName", "issueDate", "expiresAt", "template", 
    "honors", "notes"
  ];
  const orderedPayload: any = {};
  for (const key of orderedKeys) {
    if (payload[key] !== undefined) {
      orderedPayload[key] = payload[key];
    }
  }
  
  const encoded = enc.encode(JSON.stringify(orderedPayload));
  const signatureBuffer = base64ToArrayBuffer(signatureBase64);

  return await window.crypto.subtle.verify(
    {
      name: "RSA-PSS",
      saltLength: 32,
    },
    publicKey,
    signatureBuffer,
    encoded
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}
