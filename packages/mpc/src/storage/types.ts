// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import type { StorageData } from "../types";

export interface IStorage {
	isStorageExist: () => boolean;
	clearStorageData: () => void;
	setStorageData: (data: StorageData) => void;
	getStorageData: () => StorageData;
	getWalletId: () => string;
	migrate?: () => void;
}
