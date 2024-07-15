// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import type { IStorage } from "./storage/types";
import type { StoragePlatform, WalletId } from "./constants";

export type Options = {
	walletId: WalletId;
	storagePlatform: StoragePlatform;
	customStorage?: IStorage;
	isDev?: boolean;
};
export interface Message {
	message?: string;
	nonce?: string;
	round: number;
	party: number;
}

export interface KeygenConversation {
	createdAt: number;
	expiry: number;
	isApproved: boolean | null;
	accountId: number;
	sessionId: string;
	message: Message;
}

export type SignMetadata =
	| "legacy_transaction"
	| "eth_transaction"
	| "eth_sign"
	| "personal_sign"
	| "eth_signTypedData"
	| "eth_signTypedData_v1"
	| "eth_signTypedData_v2"
	| "eth_signTypedData_v3"
	| "eth_signTypedData_v4";

export interface SignConversation {
	createdAt: number;
	expiry: number;
	isApproved: boolean | null;
	accountId: number;
	hashAlg: string;
	signMessage: string;
	messageHash: string;
	signMetadata: SignMetadata;
	publicKey: string;
	sessionId: string;
	message: Message;
	walletId: string;
}

export interface BackupConversation {
	createdAt: number;
	expiry: number;
	backupData: string;
	isBackedUp: boolean | null;
	pairingId: string;
	address: string;
	walletId: string;
}

export type DeviceOS = "ios" | "android";

