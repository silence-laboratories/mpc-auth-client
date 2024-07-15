// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { BaseError, BaseErrorCode } from "../error";
import type { PairingData } from "../storage/types";
import type { HttpClient } from "../transport/httpClient";
import type { BackupConversation } from "../types";

export class BackupAction {
	#httpClient: HttpClient;
	constructor(httpClient: HttpClient) {
		this.#httpClient = httpClient;
	}

	backup = async (
		pairingData: PairingData,
		encryptedMessage: string,
		address: string,
		walletId: string,
	) => {
		try {
			const response = await this.#httpClient.sendMessage(
				pairingData.token,
				"backup",
				{
					backupData: encryptedMessage,
					pairingId: pairingData.pairingId,
					createdAt: Date.now(),
					expiry: 30000,
					address,
					walletId,
				} as BackupConversation,
				false,
			);
			if (response) {
				throw new BaseError("Backup failed", BaseErrorCode.BackupFailed);
			}
		} catch (error) {
			if (error instanceof BaseError) {
				throw error;
			}
			if (error instanceof Error) {
				throw new BaseError(error.message, BaseErrorCode.BackupFailed);
			}
			throw new BaseError("unknown-error", BaseErrorCode.UnknownError);
		}
	};
}
