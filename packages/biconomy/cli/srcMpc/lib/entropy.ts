import { promises as fs } from 'fs';
import { SdkError, ErrorCode } from "../error";
import _sodium from "libsodium-wrappers";

// Helper function to read the private key from config.json
const getPrivateKey = async () => {
  return "0x1213242112"
};

export const requestEntropy = async (salt?: Uint8Array) => {
  // Load the private key from config.json
  const privateKey = await getPrivateKey();
  // Assuming the private key is stored in hex format in the config
  const privateKeyBytes = _sodium.from_hex(privateKey);
  const usedSalt = salt ? salt : _sodium.randombytes_buf(32);
  // Use the private key bytes and salt to generate deterministic entropy
  return _sodium.to_hex(_sodium.crypto_generichash(32, privateKeyBytes, usedSalt));
};

export const encMessage = async (message: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const nonce = _sodium.randombytes_buf(_sodium.crypto_secretbox_NONCEBYTES);
  const entropyHex = await requestEntropy(salt);
  const encKey = _sodium
    .from_hex(entropyHex)
    .subarray(0, _sodium.crypto_secretbox_KEYBYTES);
  return `${_sodium.to_hex(salt)}.${_sodium.to_hex(
    nonce
  )}.${_sodium.to_base64(_sodium.crypto_secretbox_easy(message, nonce, encKey))}`;
};

export const decMessage = async (cipherText: string): Promise<Uint8Array> => {
  const array = cipherText.split(".");
  if (array.length !== 3) {
    throw new SdkError("Invalid backup data", ErrorCode.InvalidBackupData);
  } else {
    const salt = _sodium.from_hex(array[0]);
    const entropyHex = await requestEntropy(salt);
    const encKey = _sodium
      .from_hex(entropyHex)
      .subarray(0, _sodium.crypto_secretbox_KEYBYTES);
    const nonce = _sodium.from_hex(array[1]);
    const cipherMessage = _sodium.from_base64(array[2]);
    return _sodium.crypto_secretbox_open_easy(cipherMessage, nonce, encKey);
  }
};
