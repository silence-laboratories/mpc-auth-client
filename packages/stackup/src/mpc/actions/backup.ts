// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { MpcError, MpcErrorCode } from '../error';
import { BackupConversation, PairingData } from '../types';
import { sendMessage } from '../transport/firebaseApi';

export const backup = async (
	pairingData: PairingData,
	encryptedMessage: string,
	address: string,
) => {
	try {
		let walletId = localStorage.getItem("walletId");
		const response = await sendMessage(
			pairingData.token,
			'backup',
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
			throw new MpcError('Backup failed', MpcErrorCode.BackupFailed);
		}
	} catch (error) {
		if (error instanceof MpcError) {
			throw error;
		} else if (error instanceof Error) {
			throw new MpcError(error.message, MpcErrorCode.BackupFailed);
		} else throw new MpcError('unknown-error', MpcErrorCode.UnknownError);
	}
};
