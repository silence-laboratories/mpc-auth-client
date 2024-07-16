// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { BaseError, BaseErrorCode } from "../error";
import type { AccountData, StorageData, V0StorageData } from "./types";
import type { IStorage } from "./types";

export class LocalStorageManager implements IStorage {
	#VERSION = 1;
	#walletId: string;
	constructor(walletId: string) {
		this.#walletId = walletId;
		this.migrate();
	}


	/**
	 * Delete the stored data, if it exists.
	 */
	clearStorageData = async () => {
		localStorage.removeItem(this.#walletId);
	};

	/**
	 * Save SilentShareStorage
	 *
	 * @param data obj to save
	 */
	setStorageData = async (data: StorageData) => {
		if (data === null) {
			throw new BaseError(
				"Storage data cannot be null",
				BaseErrorCode.StorageWriteFailed,
			);
		}
		data.version = this.#VERSION;
		localStorage.setItem(this.#walletId, JSON.stringify(data));
	};

	/**
	 * Retrieve SilentShareStorage
	 *
	 * @returns SilentShareStorage object
	 */
	getStorageData = async (): Promise<StorageData> => {
		const state = localStorage.getItem(this.#walletId);

		if (!state) {
			throw new BaseError(
				"Wallet data is null",
				BaseErrorCode.StorageFetchFailed,
			);
		}

		const jsonObject: StorageData = JSON.parse(state as string);
		return jsonObject;
	};

	/**
	 * Retrieve SilentShareStorage
	 *
	 * @returns SilentShareStorage object
	 */
	#getV0StorageData = async (): Promise<V0StorageData> => {
		const state = localStorage.getItem(this.#walletId);

		if (!state) {
			throw new BaseError(
				"Wallet failed to fetch state",
				BaseErrorCode.StorageFetchFailed,
			);
		}

		const jsonObject: V0StorageData = JSON.parse(state as string);
		return jsonObject;
	};

	migrate = async () => {
        const state = localStorage.getItem(this.#walletId);
		if (!state) {
            return;
        }
		const version = await this.#getVersion();
		if (version < 1) {
			const walletAccountV0 = JSON.parse(
				localStorage.getItem("walletAccount") || "null",
			);
			const eoaV0 = JSON.parse(
				localStorage.getItem("eoa") || "null",
			) as AccountData | null;
			const passwordReadyV0 = JSON.parse(
				localStorage.getItem("passwordReady") || "false",
			) as boolean;

			const V0StorageData = await this.#getV0StorageData();
			const pairingData = V0StorageData.pairingData;
			const distributedKey = V0StorageData.newPairingState
				? V0StorageData.newPairingState.distributedKey
				: null;
			// Update v0 storage data to v1
			const storageData = await this.getStorageData();
			storageData.eoa = eoaV0 ? eoaV0.address : null;
			storageData.walletAccount = walletAccountV0;
			storageData.passwordReady = passwordReadyV0;
			storageData.pairingData = pairingData;
			storageData.distributedKey = distributedKey;
			(storageData as any).newPairingState = undefined;

			await this.setStorageData(storageData);
			localStorage.removeItem("walletAccount");
			localStorage.removeItem("eoa");
			localStorage.removeItem("passwordReady");
		}
	};

	#getVersion = async (): Promise<number> => {
		const storageData = await this.getStorageData();
		const version = storageData.version;
		return version || 0;
	};
}