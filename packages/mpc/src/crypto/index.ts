// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import _sodium from "libsodium-wrappers-sumo";
import { BaseError, BaseErrorCode } from "../error";

export const requestEntropy = async (salt?: Uint8Array) => {
  const usedSalt = salt ? salt : _sodium.randombytes_buf(32);
  return _sodium.to_hex(_sodium.randombytes_buf_deterministic(32, usedSalt));
};

export const aeadEncrypt = async (message: string, pwd: string) => {
  const nonce = _sodium.randombytes_buf(_sodium.crypto_secretbox_NONCEBYTES);
  const salt = _sodium.randombytes_buf(_sodium.crypto_pwhash_SALTBYTES);
  const encKey = _sodium.crypto_pwhash(
    _sodium.crypto_secretbox_KEYBYTES,
    pwd,
    salt,
    _sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    _sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    _sodium.crypto_pwhash_ALG_DEFAULT // argon2id
  );

  return `${_sodium.to_hex(salt)}.${_sodium.to_hex(
    nonce
  )}.${_sodium.crypto_secretbox_easy(message, nonce, encKey, "base64")}`;
};

export const aeadDecrypt = async (
  cipherText: string,
  pwd: string
): Promise<Uint8Array> => {
  const array = cipherText.split(".");
  if (array.length !== 3) {
    throw new BaseError("Invalid backup data", BaseErrorCode.InvalidBackupData);
  }
  const salt = _sodium.from_hex(array[0]);

  const encKey = _sodium.crypto_pwhash(
    _sodium.crypto_secretbox_KEYBYTES,
    pwd,
    salt,
    _sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    _sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    _sodium.crypto_pwhash_ALG_DEFAULT // argon2id
  );

  const nonce = _sodium.from_hex(array[1]);
  const cipherMessage = _sodium.from_base64(array[2]);
  return _sodium.crypto_secretbox_open_easy(cipherMessage, nonce, encKey);
};
