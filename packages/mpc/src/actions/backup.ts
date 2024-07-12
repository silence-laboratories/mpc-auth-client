// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { MpcError, MpcErrorCode } from "../error";
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
				throw new MpcError("Backup failed", MpcErrorCode.BackupFailed);
			}
		} catch (error) {
			if (error instanceof MpcError) {
				throw error;
			}
			if (error instanceof Error) {
				throw new MpcError(error.message, MpcErrorCode.BackupFailed);
			}
			throw new MpcError("unknown-error", MpcErrorCode.UnknownError);
		}
	};
}
