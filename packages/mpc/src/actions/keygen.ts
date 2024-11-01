// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import {
  type IP1KeyShare,
  P1KeyGen,
  randBytes,
} from "@silencelaboratories/ecdsa-tss";
import _sodium, { base64_variants } from "libsodium-wrappers-sumo";
import { BaseError, BaseErrorCode } from "../error";
import type { PairingData } from "../storage/types";
import type { HttpClient } from "../transport/httpClient";
import type { KeygenConversation } from "../types";
import * as utils from "../utils";

type KeygenResult = {
  publicKey: string;
  keyShareData: IP1KeyShare;
  elapsedTime: number;
};

export class KeygenAction {
  #running = false;
  #httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.#httpClient = httpClient;
  }

  keygen = async (
    pairingData: PairingData,
    accountIdNumber: number,
    x1: Uint8Array
  ): Promise<KeygenResult> => {
    try {
      if (this.#running) {
        throw new BaseError(
          "Keygen already running",
          BaseErrorCode.KeygenResourceBusy
        );
      }
      this.#running = true;

      const startTime = Date.now();
      const sessionId = _sodium.to_hex(await randBytes(32));
      const accountId = accountIdNumber;
      const p1 = new P1KeyGen(sessionId, x1);
      await p1.init();

      let round = 1;

      let keygenConversation: KeygenConversation = {
        accountId,
        createdAt: Date.now(),
        expiry: 30000,
        message: {
          party: 1,
          round,
        },
        sessionId,
        isApproved: null,
      };

      let keyshare: IP1KeyShare | null = null;
      let expectResponse = true;
      await _sodium.ready;
      while (keyshare === null) {
        let decryptedMessage: string | null = null;
        if (
          keygenConversation.message.message &&
          keygenConversation.message.nonce
        ) {
          decryptedMessage = utils.uint8ArrayToUtf8String(
            _sodium.crypto_box_open_easy(
              utils.b64ToUint8Array(keygenConversation.message.message),
              _sodium.from_hex(keygenConversation.message.nonce),
              _sodium.from_hex(pairingData.appPublicKey),
              _sodium.from_hex(pairingData.webEncPrivateKey)
            )
          );
        }
        const decodedMessage = decryptedMessage
          ? utils.b64ToString(decryptedMessage)
          : null;
        const msg = await p1.processMessage(decodedMessage).catch((error) => {
          throw new BaseError(
            `Internal library error: ${error}`,
            BaseErrorCode.InternalLibError
          );
        });
        if (msg.p1_key_share) {
          keyshare = msg.p1_key_share;
          expectResponse = false;
        }
        const nonce = _sodium.randombytes_buf(_sodium.crypto_box_NONCEBYTES);
        const encMessage = utils.Uint8ArrayTob64(
          _sodium.crypto_box_easy(
            _sodium.to_base64(msg.msg_to_send, base64_variants.ORIGINAL),
            nonce,
            _sodium.from_hex(pairingData.appPublicKey),
            _sodium.from_hex(pairingData.webEncPrivateKey)
          )
        );
        keygenConversation = {
          ...keygenConversation,
          message: {
            party: 1,
            round,
            message: encMessage,
            nonce: _sodium.to_hex(nonce),
          },
        };
        const keygenConversationNew = await this.#httpClient.sendMessage(
          pairingData.token,
          "keygen",
          keygenConversation,
          expectResponse
        );

        if (expectResponse && keygenConversationNew) {
          keygenConversation = keygenConversationNew;
        }
        if (keygenConversation.isApproved === false) {
          throw new BaseError(
            "User(phone) denied keygen",
            BaseErrorCode.PhoneDenied
          );
        }
        round++;
      }
      this.#running = false;

      return {
        publicKey: keyshare.public_key,
        keyShareData: keyshare,
        elapsedTime: Date.now() - startTime,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        if (error.code !== BaseErrorCode.KeygenResourceBusy) {
          this.#running = false;
        }
        throw error;
      }
      if (error instanceof Error) {
        throw new BaseError(error.message, BaseErrorCode.KeygenFailed);
      }
      throw new BaseError("unknown-error", BaseErrorCode.UnknownError);
    }
  };
}
