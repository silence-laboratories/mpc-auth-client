import type { IP1KeyShare } from "@silencelaboratories/ecdsa-tss";
import { BackupAction } from "../actions/backup";
import { KeygenAction } from "../actions/keygen";
import { PairingAction } from "../actions/pairing";
import { SignAction } from "../actions/sign";
import { MpcError, MpcErrorCode } from "../error";
import { LocalStorageManager } from "../storage/localStorage";
import type { IStorage } from "../storage/types";
import { HttpClient } from "../transport/httpClient";
import type {
	Options,
	PairingSessionData,
	SignMetadata,
	StorageData,
} from "../types";
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
	#storage?: IStorage;
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
		} else {
			this.#storage = customStorage;
		}
		if (!this.#storage) {
			throw new MpcError(
				"Storage not initialized",
				MpcErrorCode.StorageFetchFailed,
			);
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
	getPairedDeviceOS() {
		return this.accountManager.getPairedDeviceOS();
	}

	/**
	 * Retrieves the distribution key from storage.
	 * @returns The distribution key if available.
	 * @throws {MpcError} If the storage is not initialized.
	 * @public
	 */
	async getDistributionKey() {
		if (!this.#storage)
			throw new MpcError(
				"Storage not initialized",
				MpcErrorCode.StorageFetchFailed,
			);
		const silentShareStorage = await this.#storage.getStorageData();

		if (!silentShareStorage.distributedKey) {
			throw new MpcError(
				"Distributed key not found",
				MpcErrorCode.WalletNotCreated,
			);
		}

		return silentShareStorage.distributedKey;
	}

	/**
	 * Checks if the device is paired.
	 * @returns An object indicating if the device is paired and additional pairing information.
	 * @throws {MpcError} If the storage is not initialized.
	 * @public
	 */
	async isPaired() {
		if (!this.#storage)
			throw new MpcError(
				"Storage not initialized",
				MpcErrorCode.StorageFetchFailed,
			);
		try {
			const deviceName = this.accountManager.getPairedDeviceOS();
			return {
				isPaired: true,
				deviceName,
			};
		} catch {
			return {
				isPaired: false,
				deviceName: null,
			};
		}
	}

	/**
	 * Initializes the pairing process and returns a QR code for pairing.
	 * @returns A QR code for pairing.
	 * @public
	 */
	async initPairing() {
		const qrCode = await this.#pairingAction.init(this.#walletId);
		return qrCode;
	}

	/**
	 * Starts the pairing session.
	 * @returns The result of starting the pairing session.
	 * @public
	 */
	async runStartPairingSession() {
		return await this.#pairingAction.startPairingSession();
	}

	/**
	 * Ends the pairing session with the provided session data.
	 * @param {PairingSessionData} pairingSessionData - The data from the pairing session.
	 * @param {string} [currentAccountAddress] - The current account address, to serve re-pairing operation.
	 * @param {string} [password] - The password, if available, to serve re-pairing operation.
	 * @returns The result of ending the pairing session.
	 * @throws {MpcError} If the storage is not initialized.
	 * @public
	 */
	async runEndPairingSession(
		pairingSessionData: PairingSessionData,
		currentAccountAddress?: string,
		password?: string,
	) {
		if (!this.#storage)
			throw new MpcError(
				"Storage not initialized",
				MpcErrorCode.StorageFetchFailed,
			);
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
	}

	/**
	 * Refreshes the pairing information and session token.
	 * @returns The new pairing data.
	 * @throws {MpcError} If the storage is not initialized.
	 * @public
	 */
	async refreshPairing() {
		if (!this.#storage)
			throw new MpcError(
				"Storage not initialized",
				MpcErrorCode.StorageFetchFailed,
			);
		const silentShareStorage: StorageData =
			await this.#storage.getStorageData();
		const pairingData = silentShareStorage.pairingData;
		if (!pairingData) {
			throw new MpcError(
				"Pairing data not found",
				MpcErrorCode.WalletNotCreated,
			);
		}
		const result = await this.#pairingAction.refreshToken(pairingData);
		this.#storage.setStorageData(silentShareStorage);
		return result.newPairingData;
	}

	/**
	 * Runs the key generation process.
	 * @returns The result of the key generation process.
	 * @throws {MpcError} If the storage is not initialized.
	 * @public
	 */
	async runKeygen() {
		if (!this.#storage)
			throw new MpcError(
				"Storage not initialized",
				MpcErrorCode.StorageFetchFailed,
			);
		const { pairingData, silentShareStorage } =
			await this.getPairingDataAndStorage();

		if (!pairingData) {
			throw new MpcError(
				"Pairing data not found",
				MpcErrorCode.WalletNotCreated,
			);
		}
		const x1 = fromHexStringToBytes(await requestEntropy());
		const accountId = 1;
		const result = await this.#keygenAction.keygen(pairingData, accountId, x1);
		this.#storage.setStorageData({
			...silentShareStorage,
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
	}

	/**
	 * Runs the backup process with the provided password.
	 * @param {string} password - The password for encrypting the backup.
	 * @public
	 */
	async runBackup(password: string) {
		const { pairingData, silentShareStorage } =
			await this.getPairingDataAndStorage();
		if (!pairingData) {
			throw new MpcError(
				"Pairing data not found",
				MpcErrorCode.WalletNotCreated,
			);
		}
		if (password.length === 0) {
			await this.#backupAction.backup(pairingData, "", "", this.#walletId);
			return;
		}

		if (password && password.length >= 8 && silentShareStorage.distributedKey) {
			try {
				const encryptedMessage = await aeadEncrypt(
					JSON.stringify(silentShareStorage.distributedKey),
					password,
				);
				await this.#backupAction.backup(
					pairingData,
					encryptedMessage,
					getAddressFromPubkey(silentShareStorage.distributedKey.publicKey),
					this.#walletId,
				);
			} catch (error) {
				if (error instanceof Error) {
					throw error;
				}
				throw new MpcError("unkown-error", MpcErrorCode.UnknownError);
			}
		}
	}

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
	async runSign(
		hashAlg: string,
		message: string,
		messageHashHex: string,
		signMetadata: SignMetadata,
		accountId: number,
		keyShare: IP1KeyShare,
	) {
		const { pairingData } = await this.getPairingDataAndStorage();
		if (!pairingData) {
			throw new MpcError(
				"Pairing data not found",
				MpcErrorCode.WalletNotCreated,
			);
		}

		const messageHash = fromHexStringToBytes(
			messageHashHex.startsWith("0x")
				? messageHashHex.slice(2)
				: messageHashHex,
		);
		if (messageHash.length !== 32) {
			throw new MpcError(
				"Invalid length of messageHash, should be 32 bytes",
				MpcErrorCode.InvalidMessageHashLength,
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
	}

	/**
	 * Signs out by clearing the storage data.
	 * @throws {MpcError} If the storage is not initialized.
	 * @public
	 */
	async signOut() {
		if (!this.#storage)
			throw new MpcError(
				"Storage not initialized",
				MpcErrorCode.StorageFetchFailed,
			);
		this.#storage.clearStorageData();
	}

	private async getPairingDataAndStorage() {
		if (!this.#storage)
			throw new MpcError(
				"Storage not initialized",
				MpcErrorCode.StorageFetchFailed,
			);
		const silentShareStorage: StorageData =
			await this.#storage.getStorageData();
		let pairingData = silentShareStorage.pairingData;
		if (!pairingData) {
			throw new MpcError(
				"Pairing data not found",
				MpcErrorCode.WalletNotCreated,
			);
		}
		if (pairingData.tokenExpiration < Date.now() - this.#TOKEN_LIFE_TIME) {
			pairingData = await this.refreshPairing();
		}
		return { pairingData, silentShareStorage };
	}
}
