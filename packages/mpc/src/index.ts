// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import type { AccountData, StorageData, PairingSessionData } from "./storage/types";
import { BaseError } from './error';
import type { IStorage } from "./storage/types";
import { StoragePlatform, WalletId,  } from "./constants";
import { MpcAuthenticator } from "./domain/authenticator";
import { MpcSigner } from "./domain/signer";

export { MpcAuthenticator, MpcSigner, StoragePlatform, WalletId, BaseError };
export type { AccountData, IStorage, StorageData, PairingSessionData };
