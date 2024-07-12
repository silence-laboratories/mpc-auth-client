// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import type { AccountData, StorageData } from "./types";
import type { IStorage } from "./storage/types";
import { StoragePlatform, WalletId,  } from "./constants";
import { MpcAuthenticator } from "./domain/authenticator";
import { MpcSigner } from "./domain/signer";

export { MpcAuthenticator, MpcSigner, StoragePlatform, WalletId };
export type { AccountData, IStorage, StorageData };
