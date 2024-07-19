// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

type BaseErrorParameters = {
	cause?: BaseError | Error | undefined;
	details?: string | undefined;
	docsUrl?: string | undefined;
	metaMessages?: string[] | undefined;
};

export class BaseError extends Error {
	version = 1;
	code: number;
	details: string;
	docsUrl?: string;

	constructor(
		shortMessage: string,
		code: BaseErrorCode,
		opts: BaseErrorParameters = {},
	) {
		super(JSON.stringify({ message: shortMessage, code }));

		this.name = "MpcError";
		this.code = code;

		const details =
			opts.cause instanceof BaseError
				? opts.cause.details
				: opts.cause?.message
					? opts.cause.message
					: opts.details;

		this.message = [
			shortMessage,
			"",
			`Code: ${code}`,
			...(details ? [`Details: ${details}`] : []),
			...(opts.metaMessages ? [...opts.metaMessages] : []),
			...(opts.docsUrl ? [`Docs: ${opts.docsUrl}`] : []),
			`Version: ${this.version}`,
		].join("\n");

		this.details = details ?? "Unknown";
		this.docsUrl = opts.docsUrl;

		// Capture stack trace if available
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, BaseError);
		}
	}
}

export enum BaseErrorCode {
	StorageWriteFailed = 1,
	StorageFetchFailed = 2,
	HttpError = 3,
	// Action errors
	PairingFailed = 4,
	KeygenFailed = 5,
	BackupFailed = 6,
	SignFailed = 7,
	RecoverFailed = 8,

	KeygenResourceBusy = 9,
	SignResourceBusy = 10,
	InternalLibError = 11,
	PhoneDenied = 12,
	InvalidBackupData = 13,
	InvalidMessageHashLength = 14,
	WalletNotCreated = 15,
	UnknownError = 16,
}
