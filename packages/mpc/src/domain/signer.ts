// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import type {
	Provider,
	TransactionRequest,
} from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import { getAddress } from "@ethersproject/address";
import { hexlify } from "@ethersproject/bytes";
import {
	type BytesLike,
	type Signature,
	hexZeroPad,
	joinSignature,
	splitSignature,
} from "@ethersproject/bytes";
import { _TypedDataEncoder, hashMessage } from "@ethersproject/hash";
import { keccak256 } from "@ethersproject/keccak256";
import { resolveProperties } from "@ethersproject/properties";
import { _toUtf8String } from "@ethersproject/strings/lib/utf8";
import {
	type UnsignedTransaction,
	serialize,
} from "@ethersproject/transactions";
import type { ethers } from "ethers";
import { concat, toUtf8Bytes } from "ethers/lib/utils";
import { MpcError, MpcErrorCode } from "../error";
import type { DistributedKey } from "../types";
import type { MpcAuthenticator } from "./authenticator";

/**
 * Represents a signer that utilizes Multi-Party Computation (MPC) for signing Ethereum transactions and messages.
 * This class extends the ethers.js abstract Signer class, integrating with a custom MPC SDK for the cryptographic operations.
 *
 * @class MpcSigner
 * @extends {Signer}
 *
 * @property {MpcAuthenticator} mpcAuth - MPC SDK instance used for signing operations.
 * @property {DistributedKey} distributedKey - Distributed key of the signer.
 * @property {string} address - Ethereum address associated with this signer.
 * @constructor
 * Creates an instance of MpcSigner.
 * @param {MpcAuthenticator} mpcAuth - MPC SDK instance for signing operations. MUST NOT be used to create MpcSigner instance.
 */
export class MpcSigner extends Signer {
	#mpcAuth: MpcAuthenticator;
	#distributedKey?: DistributedKey;
	#address?: string;
	static #instance: MpcSigner | null = null;

	/**
	 *
	 * @param mpcAuth
	 * @returns An instance of MpcSigner. IMPORTANT: This method should be called before using the MpcSigner class.
	 */
	static instance = async (mpcAuth: MpcAuthenticator) => {
		console.time("MpcSigner init");
		if (MpcSigner.#instance === null) {
			MpcSigner.#instance = new MpcSigner(mpcAuth);
			await MpcSigner.#instance.#build();
		}
		console.timeEnd("MpcSigner init");
		return MpcSigner.#instance;
	};

	constructor(mpcAuth: MpcAuthenticator) {
		super();
		this.#mpcAuth = mpcAuth;
	}

	#build = async() => {
		const distributedKey = await this.#mpcAuth.getDistributionKey();
		this.#distributedKey = distributedKey;
		const eoa = await this.#mpcAuth.accountManager.getEoa();
		if (!eoa) {
			throw new MpcError("EOA not found", MpcErrorCode.AccountNotCreated);
		}
		this.#address = eoa;
	}

	/**
	 * Returns the Ethereum address associated with this signer.
	 *
	 * @returns {Promise<string>} The Ethereum address as a promise.
	 */
	async getAddress(): Promise<string> {
		if (!this.#address) {
			throw new MpcError(
				"Address not found",
				MpcErrorCode.WalletNotCreated,
			);
		}
		return this.#address;
	}

	/**
	 * Signs a given message using the signer's private key. Get the signature from MpcAuthenticator.
	 *
	 * @param {ethers.utils.Bytes} message - The message to sign.
	 * @returns {Promise<string>} The signed message as a promise.
	 */
	async signMessage(message: ethers.utils.Bytes): Promise<string> {
		const messagePrefix = "\x19Ethereum Signed Message:\n";

		const messageDigest = hashMessage(message);
		const messageSome = concat([
			toUtf8Bytes(messagePrefix),
			toUtf8Bytes(String(message.length)),
			message,
		]);

		const distributionKey = await this.#mpcAuth.getDistributionKey();
		const hexMessage = hexlify(messageSome);
		const signSdk = await this.#mpcAuth.runSign(
			"keccak256",
			hexMessage,
			messageDigest,
			"eth_sign",
			distributionKey.accountId,
			distributionKey.keyShareData,
		);

		const signBytes = Buffer.from(signSdk.signature, "hex");
		const r = signBytes.subarray(0, 32);
		const s = signBytes.subarray(32, 64);
		const recid = signSdk.recId;

		const split = splitSignature({
			recoveryParam: recid,
			r: hexZeroPad(`0x${r.toString("hex")}`, 32),
			s: hexZeroPad(`0x${s.toString("hex")}`, 32),
		});

		const signedMsg = joinSignature(split);

		return signedMsg;
	}

	/**
	 * Signs a transaction with the signer's private key. Get the signature from MpcAuthenticator.
	 *
	 * @param {TransactionRequest} transaction - The transaction to sign.
	 * @returns {Promise<string>} The signed transaction as a promise.
	 */
	async signTransaction(transaction: TransactionRequest): Promise<string> {
		return resolveProperties(transaction).then(async (tx: any) => {
			if (tx.from != null) {
				if (getAddress(tx.from) !== this.#address) {
					throw new Error(
						`transaction from address mismatch (from:${tx.from} address:${this.#address})`,
					);
				}
				tx.from = undefined;
			}

			const signature = await this.signDigest(
				keccak256(serialize(<UnsignedTransaction>tx)),
			);

			return serialize(<UnsignedTransaction>tx, signature);
		});
	}

	/**
	 * Signs a digest with the signer's private key.
	 *
	 * @param {BytesLike} digest - The digest to sign.
	 * @returns {Promise<Signature>} The signature as a promise.
	 */
	async signDigest(digest: BytesLike): Promise<Signature> {
		const messageDigest = hexlify(digest);
		if (!this.#distributedKey) {
			throw new MpcError(
				"Distributed key not found",
				MpcErrorCode.WalletNotCreated,
			);
		}
		const sign = await this.#mpcAuth.runSign(
			"keccak256",
			" ",
			messageDigest,
			"eth_sign",
			this.#distributedKey.accountId,
			this.#distributedKey.keyShareData,
		);

		const signBytes = Buffer.from(sign.signature, "hex");
		const r = signBytes.subarray(0, 32);
		const s = signBytes.subarray(32, 64);
		const recid = sign.recId;

		return splitSignature({
			recoveryParam: recid,
			r: hexZeroPad(`0x${r.toString("hex")}`, 32),
			s: hexZeroPad(`0x${s.toString("hex")}`, 32),
		});
	}

	/**
	 * Connects the signer with a provider.
	 *
	 * @param {Provider} provider - The ETH provider to connect with.
	 * @returns {MpcSigner} A new instance of MpcSigner connected with the specified provider.
	 */
	connect(_provider: Provider): MpcSigner {
		return new MpcSigner(this.#mpcAuth);
	}
}
