// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import type { StorageData } from "../types";

export interface IStorage {
	isStorageExist: () => Promise<boolean>;
	clearStorageData: () => Promise<void>;
	setStorageData: (data: StorageData) => Promise<void>;
	getStorageData: () => Promise<StorageData>;
}
