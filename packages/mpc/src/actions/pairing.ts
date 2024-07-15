// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import _sodium from "libsodium-wrappers-sumo";
import { BaseError, BaseErrorCode } from "../error";
import type { HttpClient } from "../transport/httpClient";
import type {
	DistributedKey,
	PairingData,
	PairingSessionData,
} from "../storage/types";
import * as utils from "../utils";
import { aeadDecrypt } from "../crypto";

export enum PairingRemark {
	WALLET_MISMATCH = "WALLET_MISMATCH",
	NO_BACKUP_DATA_WHILE_REPAIRING = "NO_BACKUP_DATA_WHILE_REPAIRING",
	INVALID_BACKUP_DATA = "INVALID_BACKUP_DATA",
}

export interface PairingDataInit {
	pairingId: string;
	encPair: _sodium.KeyPair;
	signPair: _sodium.KeyPair;
}

export class PairingAction {
	#pairingDataInit?: PairingDataInit;
	#httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.#httpClient = httpClient;
	}

	init = async (walletId: string) => {
		try {
			const pairingId = await utils.randomPairingId();

			await _sodium.ready;
			const encPair = _sodium.crypto_box_keypair();
			const signPair = _sodium.crypto_sign_keypair();

			this.#pairingDataInit = {
				pairingId,
				encPair,
				signPair,
			};

			const qrCode = JSON.stringify({
				walletId,
				pairingId,
				webEncPublicKey: _sodium.to_hex(encPair.publicKey),
				signPublicKey: _sodium.to_hex(signPair.publicKey),
			});

			return qrCode;
		} catch (error) {
			if (error instanceof BaseError) {
				throw error;
			}
			if (error instanceof Error) {
				throw new BaseError(error.message, BaseErrorCode.PairingFailed);
			}
			throw new BaseError("unkown-error", BaseErrorCode.UnknownError);
		}
	};

	startPairingSession = async () => {
		try {
			if (!this.#pairingDataInit) {
				throw new BaseError(
					"Pairing data not initialized",
					BaseErrorCode.PairingFailed,
				);
			}

			const pairingId = this.#pairingDataInit.pairingId;
			const signature = _sodium.crypto_sign_detached(
				pairingId,
				this.#pairingDataInit.signPair.privateKey,
			);

			const pairingSessionData = await this.#httpClient.getTokenEndpoint(
				pairingId,
				_sodium.to_hex(signature),
			);
			return pairingSessionData;
		} catch (error) {
			if (error instanceof BaseError) {
				throw error;
			}
			if (error instanceof Error) {
				throw new BaseError(error.message, BaseErrorCode.PairingFailed);
			}
			throw new BaseError("unkown-error", BaseErrorCode.UnknownError);
		}
	};

	endPairingSession = async (
		pairingSessionData: PairingSessionData,
		currentAccountAddress?: string,
		password?: string,
	) => {
		if (!this.#pairingDataInit) {
			throw new BaseError(
				"Pairing data not initialized",
				BaseErrorCode.PairingFailed,
			);
		}
		try {
			const startTime = Date.now();
			const sessionToken = pairingSessionData.token;

			let distributedKey: DistributedKey | undefined;
			let accountAddress: string | undefined;

			if (pairingSessionData.backupData && password) {
				const recoverData = await this.#recoverFromBackup(
					sessionToken,
					pairingSessionData.backupData,
					password,
				);
				distributedKey = recoverData.distributedKey;
				accountAddress = recoverData.accountAddress;
			}

			await this.#validateRePairing(
				sessionToken,
				accountAddress,
				currentAccountAddress,
			);

			const pairingData: PairingData = {
				pairingId: this.#pairingDataInit.pairingId,
				webEncPublicKey: _sodium.to_hex(
					this.#pairingDataInit.encPair.publicKey,
				),
				webEncPrivateKey: _sodium.to_hex(
					this.#pairingDataInit.encPair.privateKey,
				),
				webSignPublicKey: _sodium.to_hex(
					this.#pairingDataInit.signPair.publicKey,
				),
				webSignPrivateKey: _sodium.to_hex(
					this.#pairingDataInit.signPair.privateKey,
				),
				appPublicKey: pairingSessionData.appPublicKey,
				token: sessionToken,
				tokenExpiration: pairingSessionData.tokenExpiration,
				deviceName: pairingSessionData.deviceName,
			};
			return {
				pairingData,
				distributedKey: distributedKey ?? null,
				elapsedTime: Date.now() - startTime,
				deviceName: pairingSessionData.deviceName,
			};
		} catch (error) {
			if (error instanceof BaseError) {
				throw error;
			}
			if (error instanceof Error) {
				throw new BaseError(error.message, BaseErrorCode.PairingFailed);
			}
			throw new BaseError("unkown-error", BaseErrorCode.UnknownError);
		}
	};

	refreshToken = async (pairingData: PairingData) => {
		try {
			const startTime = Date.now();
			const signature = _sodium.crypto_sign_detached(
				pairingData.token,
				_sodium.from_hex(pairingData.webSignPrivateKey),
			);

			const data = await this.#httpClient.refreshTokenEndpoint(
				pairingData.token,
				_sodium.to_hex(signature),
			);
			const newPairingData: PairingData = {
				...pairingData,
				...data,
			};
			return {
				newPairingData: newPairingData,
				elapsedTime: Date.now() - startTime,
			};
		} catch (error) {
			if (error instanceof BaseError) {
				throw error;
			}
			if (error instanceof Error) {
				throw new BaseError(error.message, BaseErrorCode.HttpError);
			}
			throw new BaseError("unkown-error", BaseErrorCode.UnknownError);
		}
	};

	#recoverFromBackup = async (
		token: string,
		backupData: string,
		password: string,
	): Promise<{ distributedKey: DistributedKey; accountAddress: string }> => {
		if (!this.#pairingDataInit) {
			throw new BaseError(
				"Pairing data not initialized",
				BaseErrorCode.PairingFailed,
			);
		}
		try {
			const decreptedMessage = await aeadDecrypt(backupData, password);
			const distributedKey = JSON.parse(
				utils.uint8ArrayToUtf8String(decreptedMessage),
			);
			const accountAddress = utils.getAddressFromPubkey(
				distributedKey.publicKey,
			);
			return {
				distributedKey,
				accountAddress,
			};
		} catch (error) {
			try {
				await this.#httpClient.sendMessage(
					token,
					"pairing",
					{
						isPaired: false,
						pairingRemark: PairingRemark.INVALID_BACKUP_DATA,
					},
					false,
					this.#pairingDataInit.pairingId,
				);
			} catch (error) {
				if (error instanceof BaseError) {
					throw error;
				}
				if (error instanceof Error) {
					throw new BaseError(error.message, BaseErrorCode.HttpError);
				}
				throw new BaseError("unkown-error", BaseErrorCode.HttpError);
			}

			if (error instanceof BaseError) {
				throw error;
			}
			throw new BaseError(
				"wrong secret key for the given ciphertext",
				BaseErrorCode.InvalidBackupData,
			);
		}
	};

	#validateRePairing = async (
		sessionToken: string,
		accountAddress?: string,
		currentAccountAddress?: string,
	) => {
		if (!this.#pairingDataInit) {
			throw new BaseError(
				"Pairing data not initialized",
				BaseErrorCode.PairingFailed,
			);
		}
		if (currentAccountAddress && !accountAddress) {
			await this.#httpClient.sendMessage(
				sessionToken,
				"pairing",
				{
					isPaired: false,
					pairingRemark: PairingRemark.NO_BACKUP_DATA_WHILE_REPAIRING,
				},
				false,
				this.#pairingDataInit.pairingId,
			);

			throw new BaseError(
				"No backup data while repairing",
				BaseErrorCode.PairingFailed,
			);
		}
		if (
			currentAccountAddress &&
			accountAddress &&
			currentAccountAddress !== accountAddress
		) {
			await this.#httpClient.sendMessage(
				sessionToken,
				"pairing",
				{
					isPaired: true,
					pairingRemark: PairingRemark.WALLET_MISMATCH,
				},
				false,
				this.#pairingDataInit.pairingId,
			);
		} else
			await this.#httpClient.sendMessage(
				sessionToken,
				"pairing",
				{
					isPaired: true,
				},
				false,
				this.#pairingDataInit.pairingId,
			);
	};
}
