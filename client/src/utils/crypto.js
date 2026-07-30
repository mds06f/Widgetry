// Client-Side Zero-Knowledge End-to-End Encryption (E2EE) Utility via Web Crypto API (AES-GCM)

export async function encryptPayload(dataObj, secretKey) {
  const enc = new TextEncoder();
  const encodedData = enc.encode(JSON.stringify(dataObj));
  const encodedKey = enc.encode(secretKey);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encodedKey,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const encryptedContent = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    derivedKey,
    encodedData
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedContent))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
  };
}

export async function decryptPayload(encryptedObj, secretKey) {
  const { ciphertext, iv, salt } = encryptedObj;
  const enc = new TextEncoder();
  const encodedKey = enc.encode(secretKey);

  const saltArray = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));
  const ivArray = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const ciphertextArray = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encodedKey,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltArray,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decryptedContent = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivArray },
    derivedKey,
    ciphertextArray
  );

  const dec = new TextDecoder();
  return JSON.parse(dec.decode(decryptedContent));
}
