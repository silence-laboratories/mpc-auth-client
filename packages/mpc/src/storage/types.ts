// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import type { IP1KeyShare } from "@silencelaboratories/ecdsa-tss";
export interface IStorage {
	isStorageExist: () => Promise<boolean>;
	clearStorageData: () => Promise<void>;
	setStorageData: (data: StorageData) => Promise<void>;
	getStorageData: () => Promise<StorageData>;
}

export interface PairingData {
	pairingId: string;
	webEncPublicKey: string;
	webEncPrivateKey: string;
	webSignPublicKey: string;
	webSignPrivateKey: string;
	token: string;
	tokenExpiration: number;
	appPublicKey: string;
	deviceName: string;
}

export interface PairingSessionData {
	token: string;
	appPublicKey: string;
	deviceName: string;
	tokenExpiration: number;
	backupData?: string | undefined;
}

export interface DistributedKey {
	accountId: number;
	publicKey: string;
	keyShareData: IP1KeyShare;
}

export type V0StorageData = {
	pairingData: PairingData;
	newPairingState?: {
		pairingData: PairingData | null;
		distributedKey: DistributedKey | null;
	};
};

export interface StorageData {
	version?: number;
	pairingData: PairingData | null;
	distributedKey: DistributedKey | null;
	walletAccount?: AccountData;
	eoa: string | null;
	passwordReady?: boolean;
}

export type AccountData = {
	address: string;
};