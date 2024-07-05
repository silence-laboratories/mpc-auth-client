// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { MpcError, MpcErrorCode } from "../error";
import type { AccountData, StorageData, V0StorageData } from "../types";
import type { IStorage } from "./types";

export class LocalStorageManager implements IStorage {
	private VERSION = 1;
	constructor(walletId: string) {
		localStorage.setItem("walletId", walletId);
		this.migrate();
	}

	/**
	 * Get wallet id from local storage
	 *
	 * @returns walletId
	 */
	getWalletId(): string {
		const walletId = localStorage.getItem("walletId");
		if (walletId === null) {
			throw new MpcError(
				"Wallet id is not found",
				MpcErrorCode.StorageFetchFailed,
			);
		}
		return walletId;
	}

	/**
	 * Check if a storage exist for the wallet
	 *
	 * @returns true if exists, false otherwise
	 */
	isStorageExist = (): boolean => {
		const walletId = this.getWalletId();
		const data = localStorage.getItem(walletId);
		return data !== null;
	};

	/**
	 * Delete the stored data, if it exists.
	 */
	clearStorageData = () => {
		const walletId = this.getWalletId();
		localStorage.removeItem(walletId);
	};

	/**
	 * Save SilentShareStorage
	 *
	 * @param data obj to save
	 */
	setStorageData = (data: StorageData) => {
		if (data === null) {
			throw new MpcError(
				"Storage data cannot be null",
				MpcErrorCode.StorageDataInvalid,
			);
		}
		const walletId = this.getWalletId();
		data.version = this.VERSION;
		localStorage.setItem(walletId, JSON.stringify(data));
	};

	/**
	 * Retrieve SilentShareStorage
	 *
	 * @returns SilentShareStorage object
	 */
	getStorageData = (): StorageData => {
		const _isStorageExist = this.isStorageExist();
		if (!_isStorageExist) {
			throw new MpcError(
				"Wallet is not paired",
				MpcErrorCode.StorageFetchFailed,
			);
		}

		const walletId = this.getWalletId();
		const state = localStorage.getItem(walletId);

		if (!state) {
			throw new MpcError(
				"Wallet failed to fetch state",
				MpcErrorCode.StorageFetchFailed,
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
	getV0StorageData = (): V0StorageData => {
		const _isStorageExist = this.isStorageExist();
		if (!_isStorageExist) {
			throw new MpcError(
				"Wallet is not paired",
				MpcErrorCode.StorageFetchFailed,
			);
		}

		const walletId = this.getWalletId();
		const state = localStorage.getItem(walletId);

		if (!state) {
			throw new MpcError(
				"Wallet failed to fetch state",
				MpcErrorCode.StorageFetchFailed,
			);
		}

		const jsonObject: V0StorageData = JSON.parse(state as string);

		return jsonObject;
	};

	migrate = () => {
		if (!this.isStorageExist()) {
			return;
		}

		if (this.version < 1) {
			const walletAccountV0 = JSON.parse(
				localStorage.getItem("walletAccount") || "null",
			);
			const eoaV0 = JSON.parse(
				localStorage.getItem("eoa") || "null",
			) as AccountData | null;
			const passwordReadyV0 = JSON.parse(
				localStorage.getItem("passwordReady") || "false",
			) as boolean;

			const V0StorageData = this.getV0StorageData();
			const pairingData = V0StorageData.newPairingState
				? V0StorageData.newPairingState.pairingData
				: null;
			const distributedKey = V0StorageData.newPairingState
				? V0StorageData.newPairingState.distributedKey
				: null;
			// Update v0 storage data to v1
			const storageData = this.getStorageData();
			storageData.eoa = eoaV0 ? eoaV0.address : null;
			storageData.walletAccount = walletAccountV0;
			storageData.passwordReady = passwordReadyV0;
			storageData.pairingData = pairingData;
			storageData.distributedKey = distributedKey;
			(storageData as any).newPairingState = undefined;

			this.setStorageData(storageData);
			localStorage.removeItem("walletAccount");
			localStorage.removeItem("eoa");
			localStorage.removeItem("passwordReady");
		}
	};

	private get version(): number {
		const storageData = this.getStorageData();
		const version = storageData.version;
		return version || 0;
	}
}
