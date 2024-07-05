// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

export class MpcError extends Error {
  code: number;
  constructor(message: string, code: MpcErrorCode) {
    super(JSON.stringify({ message, code }));
    this.name = "MpcError";
    this.code = code;
  }
}

export enum MpcErrorCode {
  StorageDataInvalid = 1,
  StorageFetchFailed = 2,
  HttpError = 3,
  // Action errors
  PairingFailed = 4,
  KeygenFailed = 5,
  BackupFailed = 6,
  SignFailed = 7,

  KeygenResourceBusy = 8,
  SignResourceBusy = 9,
  InternalLibError = 10,
  PhoneDenied = 11,
  InvalidBackupData = 12,
  InvalidMessageHashLength = 13,
  WalletNotCreated = 14,
  AccountNotCreated = 15,
  UnknownError = 16,
}
