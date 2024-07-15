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
import { hashMessage } from "@ethersproject/hash";
import { keccak256 } from "@ethersproject/keccak256";
import { resolveProperties } from "@ethersproject/properties";
import {
	type UnsignedTransaction,
	serialize,
} from "@ethersproject/transactions";
import type { ethers } from "ethers";
import { concat, toUtf8Bytes } from "ethers/lib/utils";
import { BaseError, BaseErrorCode } from "../error";
import type { DistributedKey } from "../storage/types";
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
 * @property {Provider} [provider] - Ethers.js provider instance to interact with the Ethereum network. This is required for client that can't interact with the Ethereum provider in runtime.
 * Creates an instance of MpcSigner. IMPORTANT: MUST NOT be used to create MpcSigner instance.
 */
export class MpcSigner extends Signer {
	#mpcAuth: MpcAuthenticator;
	#distributedKey?: DistributedKey;
	#address?: string;
	readonly provider?: ethers.providers.Provider; // MUST BE public
	static #instance: MpcSigner | null = null;

	/**
	 *
	 * @param mpcAuth
	 * @returns An instance of MpcSigner. IMPORTANT: This builder method MUST BE called to create the MpcSigner instance.
	 */
	static instance = async (mpcAuth: MpcAuthenticator, provider?: Provider) => {
		if (MpcSigner.#instance === null) {
			MpcSigner.#instance = new MpcSigner(mpcAuth, provider);
			await MpcSigner.#instance.#build();
		}
		return MpcSigner.#instance;
	};

	constructor(mpcAuth: MpcAuthenticator, provider?: Provider) {
		super();
		this.#mpcAuth = mpcAuth;
		this.provider = provider;
	}

	#build = async () => {
		const distributedKey = await this.#mpcAuth.getDistributionKey();
		this.#distributedKey = distributedKey;
		const eoa = await this.#mpcAuth.accountManager.getEoa();
		if (!eoa) {
			throw new BaseError("Init Signer failed due to EOA not found", BaseErrorCode.WalletNotCreated);
		}
		this.#address = eoa;
	};

	/**
	 * Returns the Ethereum address associated with this signer.
	 *
	 * @returns {Promise<string>} The Ethereum address as a promise.
	 */
	getAddress = async (): Promise<string> => {
		if (!this.#address) {
			throw new BaseError("Address not found", BaseErrorCode.WalletNotCreated);
		}
		return this.#address;
	};

	/**
	 * Signs a given message using the signer's private key. Get the signature from MpcAuthenticator.
	 *
	 * @param {ethers.utils.Bytes} message - The message to sign.
	 * @returns {Promise<string>} The signed message as a promise.
	 */
	signMessage = async (message: ethers.utils.Bytes): Promise<string> => {
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
	};

	/**
	 * Signs a transaction with the signer's private key. Get the signature from MpcAuthenticator.
	 *
	 * @param {TransactionRequest} transaction - The transaction to sign.
	 * @returns {Promise<string>} The signed transaction as a promise.
	 */
	signTransaction = async (
		transaction: TransactionRequest,
	): Promise<string> => {
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
	};

	/**
	 * Signs a digest with the signer's private key.
	 *
	 * @param {BytesLike} digest - The digest to sign.
	 * @returns {Promise<Signature>} The signature as a promise.
	 */
	signDigest = async (digest: BytesLike): Promise<Signature> => {
		const messageDigest = hexlify(digest);
		if (!this.#distributedKey) {
			throw new BaseError(
				"Distributed key not found",
				BaseErrorCode.WalletNotCreated,
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
	};

	/**
	 * Connects the signer with a provider.
	 *
	 * @param {Provider} provider - The ETH provider to connect with.
	 * @returns {MpcSigner} A new instance of MpcSigner connected with the specified provider.
	 */
	connect = (provider: Provider): MpcSigner => {
		return new MpcSigner(this.#mpcAuth, provider);
	};
}
