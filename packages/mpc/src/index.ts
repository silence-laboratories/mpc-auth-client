// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { StoragePlatform, WalletId } from "./constants";
import { MpcAuthenticator } from "./domain/authenticator";
import { MpcSigner } from "./domain/signer";
import { ViemSigner } from "./domain/viemSigner";
import { BaseError } from "./error";
import type {
	AccountData,
	PairingSessionData,
	StorageData,
} from "./storage/types";
import type { IStorage } from "./storage/types";

export { MpcAuthenticator, MpcSigner, StoragePlatform, WalletId, BaseError,ViemSigner };
export type { AccountData, IStorage, StorageData, PairingSessionData };
