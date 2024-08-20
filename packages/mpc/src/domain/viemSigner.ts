// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import * as viem from "viem";
import { toAccount } from "viem/accounts";
import { BaseError, BaseErrorCode } from "../error";
import type { DistributedKey } from "../storage/types";
import type { MpcAuthenticator } from "./authenticator";

/**
 * Represents a signer that utilizes Multi-Party Computation (MPC) for signing Ethereum transactions and messages
 *
 * @class ViemSigner
 *
 * @property {MpcAuthenticator} mpcAuth - MPC SDK instance used for signing operations.
 * @property {DistributedKey} distributedKey - Distributed key of the signer.
 * @property {viem.Hex} address - Ethereum address associated with this signer.
 * Creates an instance of ViemSigner. IMPORTANT: MUST NOT be used to create ViemSigner instance.
 */
export class ViemSigner {
  #mpcAuth: MpcAuthenticator;
  #distributedKey?: DistributedKey;
  #address?: viem.Hex;
  #viemAccount?: viem.LocalAccount;
  static #instance: ViemSigner | null = null;

  /**
   *
   * @param mpcAuth
   * @returns An instance of ViemSigner. IMPORTANT: This builder method MUST BE called to create the ViemSigner instance.
   */

  static instance = async (mpcAuth: MpcAuthenticator) => {
    if (ViemSigner.#instance === null) {
      ViemSigner.#instance = new ViemSigner(mpcAuth);
      await ViemSigner.#instance.#build();
    }
    return ViemSigner.#instance;
  };

  constructor(mpcAuth: MpcAuthenticator) {
    this.#mpcAuth = mpcAuth;
  }

  #build = async () => {
    const distributedKey = await this.#mpcAuth.getDistributionKey();
    this.#distributedKey = distributedKey;
    const eoa = (await this.#mpcAuth.accountManager.getEoa()) as viem.Hex;
    if (!eoa) {
      throw new BaseError(
        "Init Signer failed due to EOA not found",
        BaseErrorCode.WalletNotCreated
      );
    }
    this.#address = eoa as viem.Hex;
    this.#viemAccount = await this.createViemAccount();
    return this.#viemAccount;
  };

  /**
   *  Create a new viem custom account for signing transactions using the MPC network.
   * @returns {Promise<viem.LocalAccount>} The viemAccount as a promise.
   * @throws {BaseError} If the viemAccount is not created.
   *
   */

  getViemAccount = async (): Promise<viem.LocalAccount> => {
    if (!this.#viemAccount) {
      throw new BaseError(
        "Viem account not created",
        BaseErrorCode.WalletNotCreated
      );
    }
    return this.#viemAccount;
  };
  /**
   * Signs a given message using the signer's distributed private key.
   * The signing process is handled by MpcAuthenticator and returns the signature components.
   *
   * @param {any} message - The message to sign. This can be a string,Hex or other serializable data.
   * @returns {Promise<{signature: any, r: string, s: string, v: bigint, recid: number}>}
   * An object containing the complete signature, along with its `r`, `s`, `v` components, and the recovery id (`recid`).
   */

  signMessageWithSilentWallet = async (message: any) => {
    if (!this.#distributedKey) {
      throw new BaseError(
        "Distributed key not found",
        BaseErrorCode.WalletNotCreated
      );
    }
    const messageToBytes = viem.toBytes(message);
    const messageWithPrefix = viem.toPrefixedMessage({ raw: messageToBytes });
    const messageDigest = viem.hashMessage({ raw: messageToBytes });
    const signature = await this.#mpcAuth.runSign(
      "keccak256",
      messageWithPrefix,
      messageDigest,
      "eth_sign",
      this.#distributedKey.accountId,
      this.#distributedKey.keyShareData
    );
    const signBytes = Buffer.from(signature.signature, "hex");
    const r = viem.toHex(signBytes.subarray(0, 32));
    const s = viem.toHex(signBytes.subarray(32, 64));
    const recid = signature.recId;
    const v = recid === 0 ? BigInt(27) : BigInt(28);

    return { signature, r, s, v, recid };
  };
  /**
   * Creates a new viem LocalAccount instance that uses the signMessageWithSilentWallet method
   * to sign messages, transactions, and typed data.
   *
   * @returns {Promise<viem.LocalAccount>} A promise that resolves to a viem LocalAccount instance.
   */
  createViemAccount = async (): Promise<viem.LocalAccount> => {
    const address = this.#address;
    const signMessageWithSilentWallet =
      this.signMessageWithSilentWallet.bind(this);
    return toAccount({
      address: address as `0x${string}`,
      async signMessage({ message }) {
        message = (() => {
          if (typeof message === "string") {
            return viem.stringToHex(message);
          }
          if (typeof message.raw === "string") {
            return message.raw;
          }
          return viem.bytesToHex(message.raw);
        })();
        const sign = await signMessageWithSilentWallet(message);

        const signature: viem.Signature = {
          r: sign.r as viem.Hex,
          s: sign.s as viem.Hex,
          v: sign.recid === 0 ? BigInt(27) : BigInt(28),
          yParity: sign.recid,
        };
        return viem.serializeSignature(signature);
      },
      async signTransaction(transaction) {
        const signTransaction = await signMessageWithSilentWallet(transaction);
        return viem.serializeTransaction(signTransaction);
      },
      async signTypedData(typedData) {
        const sign = await signMessageWithSilentWallet(typedData);

        const signature: viem.Signature = {
          r: sign.r as viem.Hex,
          s: sign.s as viem.Hex,
          v: sign.recid === 0 ? BigInt(27) : BigInt(28),
          yParity: sign.recid,
        };
        return viem.serializeSignature(signature);
      },
    });
  };
}
