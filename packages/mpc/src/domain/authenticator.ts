// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import type { IP1KeyShare } from "@silencelaboratories/ecdsa-tss";
import { BackupAction } from "../actions/backup";
import { KeygenAction } from "../actions/keygen";
import { PairingAction } from "../actions/pairing";
import { SignAction } from "../actions/sign";
import { BaseError, BaseErrorCode } from "../error";
import { LocalStorageManager } from "../storage/localStorage";
import type { IStorage, PairingData } from "../storage/types";
import { HttpClient } from "../transport/httpClient";
import type { Options, SignMetadata } from "../types";
import type { PairingSessionData, StorageData } from "../storage/types";
import { fromHexStringToBytes, getAddressFromPubkey } from "../utils";
import { AccountManager } from "./account";
import { aeadEncrypt, requestEntropy } from "../crypto";
import { StoragePlatform, type WalletId } from "../constants";

/**
 * Represents an authenticator for managing MPC (Multi-Party Computation) operations such as pairing, key generation, signing, and backup.
 * This class encapsulates the logic for interacting with the underlying storage, managing accounts, and communicating with a remote server for MPC operations.
 *
 * @class MpcAuthenticator
 *
 * @property {AccountManager} accountManager - The manager for account-related operations.
 * @property {HttpClient} httpClient - The HTTP client for making requests to the server.
 * @property {PairingAction} pairingAction - The action for pairing operations.
 * @property {KeygenAction} keygenAction - The action for key generation operations.
 * @property {SignAction} signAction - The action for signing operations.
 * @property {BackupAction} backupAction - The action for backup operations.
 * @property {WalletId} walletId - The wallet identifier.
 * @constructor
 * Creates an instance of MpcAuthenticator. IMPORTANT: MUST NOT be used to create MpcAuthenticator instance.
 */
export class MpcAuthenticator {
	/**
	 * The lifetime of a token in milliseconds.
	 * @private
	 */
	#TOKEN_LIFE_TIME = 60000;
	/**
	 * The storage interface for persisting data.
	 * @private
	 */
	#storage: IStorage;
	/**
	 * The wallet identifier.
	 * @private
	 */
	#walletId: WalletId;
	/**
	 * The HTTP client for making requests to the server.
	 * @private
	 */
	#httpClient: HttpClient;
	#pairingAction: PairingAction;
	#keygenAction: KeygenAction;
	#signAction: SignAction;
	#backupAction: BackupAction;

	/**
	 * The manager for account-related operations.
	 * @public
	 */
	accountManager: AccountManager;

	static #instance: MpcAuthenticator | null = null;

	/**
	 *
	 * @param configs
	 * @returns An instance of MpcAuthenticator. IMPORTANT: This builder method MUST BE called to create the MpcAuthenticator instance.
	 */
	static instance = (configs: Options) => {
		if (MpcAuthenticator.#instance === null) {
			MpcAuthenticator.#instance = new MpcAuthenticator(configs);
		}
		return MpcAuthenticator.#instance;
	};

	constructor(configs: Options) {
		const {
			storagePlatform = StoragePlatform.Browser,
			customStorage,
			walletId,
			isDev,
		} = configs;

		this.#walletId = walletId;

		// Set Storage by platform
		if (storagePlatform === StoragePlatform.Browser) {
			this.#storage = new LocalStorageManager(walletId);
		} else if (customStorage) {
			this.#storage = customStorage;
		} else {
			throw new BaseError("Missing Storage", BaseErrorCode.StorageFetchFailed, {
				details: "Storage is required to initialize MpcAuthenticator",
			});
		}

		// Account Manager
		this.accountManager = new AccountManager(this.#storage);

		// HTTP Client
		this.#httpClient = new HttpClient(
			isDev
				? "https://us-central1-mobile-wallet-mm-snap-staging.cloudfunctions.net"
				: "https://us-central1-mobile-wallet-mm-snap.cloudfunctions.net",
		);

		// MPC Actions
		this.#pairingAction = new PairingAction(this.#httpClient);
		this.#keygenAction = new KeygenAction(this.#httpClient);
		this.#signAction = new SignAction(this.#httpClient);
		this.#backupAction = new BackupAction(this.#httpClient);
	}

	/**
	 * Retrieves the operating system of party 2 device.
	 * @returns The operating system of party 2 device.
	 * @public
	 */
	getPairedDeviceOS = () => {
		return this.accountManager.getPairedDeviceOS();
	};

	/**
	 * Retrieves the distribution key from storage.
	 * @returns The distribution key if available.
	 * @throws {BaseError} If the storage is not initialized.
	 * @public
	 */
	getDistributionKey = async () => {
		const storageData = await this.#storage.getStorageData();

		if (!storageData.distributedKey) {
			throw new BaseError(
				"Distributed key not found",
				BaseErrorCode.WalletNotCreated,
			);
		}

		return storageData.distributedKey;
	};

	/**
	 * Initializes the pairing process and returns a QR code for pairing.
	 * @returns A QR code for pairing.
	 * @public
	 */
	initPairing = async () => {
		const qrCode = await this.#pairingAction.init(this.#walletId);
		return qrCode;
	};

	/**
	 * Starts the pairing session.
	 * @returns The result of starting the pairing session.
	 * @public
	 */
	runStartPairingSession = async () => {
		return await this.#pairingAction.startPairingSession();
	};

	/**
	 * Ends the pairing session with the provided session data.
	 * @param {PairingSessionData} pairingSessionData - The data from the pairing session.
	 * @param {string} [currentAccountAddress] - The current account address, to serve re-pairing operation.
	 * @param {string} [password] - The password, if available, to serve re-pairing operation.
	 * @returns The result of ending the pairing session.
	 * @throws {BaseError} If the storage is not initialized.
	 * @public
	 */
	runEndPairingSession = async (
		pairingSessionData: PairingSessionData,
		currentAccountAddress?: string,
		password?: string,
	) => {
		const result = await this.#pairingAction.endPairingSession(
			pairingSessionData,
			currentAccountAddress,
			password,
		);
		const distributedKey = result.distributedKey;

		const eoa = distributedKey
			? getAddressFromPubkey(distributedKey.publicKey)
			: null;

		this.#storage.setStorageData({
			...result,
			eoa,
		});

		return {
			pairingStatus: "paired",
			newAccountAddress: eoa,
			deviceName: result.deviceName,
			elapsedTime: result.elapsedTime,
		};
	};

	/**
	 * Runs the key generation process.
	 * @returns The result of the key generation process.
	 * @throws {BaseError} If the storage is not initialized.
	 * @public
	 */
	runKeygen = async () => {
		const storageData: StorageData = await this.#storage.getStorageData();
		const pairingData = await this.#checkPairingExpiration(
			storageData.pairingData,
		);

		const x1 = fromHexStringToBytes(await requestEntropy());

		const accountId = 1;
		const result = await this.#keygenAction.keygen(pairingData, accountId, x1);
		this.#storage.setStorageData({
			...storageData,
			distributedKey: {
				publicKey: result.publicKey,
				accountId,
				keyShareData: result.keyShareData,
			},
			eoa: getAddressFromPubkey(result.publicKey),
		});
		return {
			distributedKey: {
				publicKey: result.publicKey,
				accountId: accountId,
				keyShareData: result.keyShareData,
			},
			elapsedTime: result.elapsedTime,
		};
	};

	/**
	 * Runs the backup process with the provided password.
	 * @param {string} password - The password for encrypting the backup.
	 * @public
	 */
	runBackup = async (password: string) => {
		const storageData: StorageData = await this.#storage.getStorageData();
		const pairingData = await this.#checkPairingExpiration(
			storageData.pairingData,
		);

		if (!pairingData) {
			throw new BaseError(
				"Pairing data not found",
				BaseErrorCode.WalletNotCreated,
				{ details: "Storage is not found while running backup" },
			);
		}
		if (password.length === 0) {
			await this.#backupAction.backup(pairingData, "", "", this.#walletId);
			return;
		}

		if (password && password.length >= 8 && storageData.distributedKey) {
			try {
				const encryptedMessage = await aeadEncrypt(
					JSON.stringify(storageData.distributedKey),
					password,
				);
				await this.#backupAction.backup(
					pairingData,
					encryptedMessage,
					getAddressFromPubkey(storageData.distributedKey.publicKey),
					this.#walletId,
				);
			} catch (error) {
				if (error instanceof Error) {
					throw error;
				}
				throw new BaseError("unkown-error", BaseErrorCode.UnknownError);
			}
		}
	};

	/**
	 * Runs the signing process with the provided parameters.
	 * @param {string} hashAlg - The hash algorithm to use.
	 * @param {string} message - The message to sign.
	 * @param {string} messageHashHex - The hexadecimal representation of the message hash.
	 * @param {SignMetadata} signMetadata - Metadata for the signing process.
	 * @param {number} accountId - The account ID.
	 * @param {IP1KeyShare} keyShare - The key share for signing.
	 * @returns The result of the signing process.
	 * @public
	 */
	runSign = async (
		hashAlg: string,
		message: string,
		messageHashHex: string,
		signMetadata: SignMetadata,
		accountId: number,
		keyShare: IP1KeyShare,
	) => {
		const storageData: StorageData = await this.#storage.getStorageData();
		const pairingData = await this.#checkPairingExpiration(
			storageData.pairingData,
		);

		const messageHash = fromHexStringToBytes(
			messageHashHex.startsWith("0x")
				? messageHashHex.slice(2)
				: messageHashHex,
		);
		if (messageHash.length !== 32) {
			throw new BaseError(
				"Invalid length of messageHash, should be 32 bytes",
				BaseErrorCode.InvalidMessageHashLength,
			);
		}

		const walletId = this.#walletId;

		return await this.#signAction.sign({
			pairingData,
			keyShare,
			hashAlg,
			message: message.startsWith("0x") ? message.slice(2) : message,
			messageHash,
			signMetadata,
			accountId,
			walletId,
		});
	};

	/**
	 * Signs out by clearing the storage data.
	 * @throws {BaseError} If the storage is not initialized.
	 * @public
	 */
	signOut = async () => {
		this.#storage.clearStorageData();
	};

	#refreshPairing = async () => {
		const storageData: StorageData = await this.#storage.getStorageData();
		const pairingData = storageData.pairingData;
		if (!pairingData) {
			throw new BaseError(
				"Pairing data not found",
				BaseErrorCode.WalletNotCreated,
			);
		}
		const result = await this.#pairingAction.refreshToken(pairingData);
		this.#storage.setStorageData(storageData);
		return result.newPairingData;
	};

	#checkPairingExpiration = async (pairingData: PairingData | null) => {
		if (!pairingData) {
			throw new BaseError(
				"Pairing data not found",
				BaseErrorCode.WalletNotCreated,
				{
					details:
						"Pairing data is not found while checking session expiration",
				},
			);
		}

		if (pairingData.tokenExpiration < Date.now() - this.#TOKEN_LIFE_TIME) {
			return await this.#refreshPairing();
		}
		return pairingData;
	};
}
