// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { BaseError, BaseErrorCode } from "../error";

describe("Test BaseError", () => {
	it("should match the inline snapshot for a simple error message", () => {
		expect(
			new BaseError("An error occurred.", BaseErrorCode.InternalLibError),
		).toMatchInlineSnapshot(`
            [MpcError: An error occurred.

            Code: 10
            Version: 1]
        `);
	});

	it("should match the inline snapshot for an error message with details", () => {
		expect(
			new BaseError("An error occurred.", BaseErrorCode.InternalLibError, {
				details: "details",
			}),
		).toMatchInlineSnapshot(`
            [MpcError: An error occurred.

            Code: 10
            Details: details
            Version: 1]
        `);
	});

	it("should match the inline snapshot for an error message with details and docs", () => {
		expect(
			new BaseError("An error occurred.", BaseErrorCode.InternalLibError, {
				details: "details",
				docsUrl: "docs",
			}),
		).toMatchInlineSnapshot(`
            [MpcError: An error occurred.

            Code: 10
            Details: details
            Docs: docs
            Version: 1]
        `);
	});

	it("should match the inline snapshot for an error message with details and meta", () => {
		expect(
			new BaseError("An error occurred.", BaseErrorCode.InternalLibError, {
				details: "details",
				metaMessages: ["- reason1", "- reason2"],
			}),
		).toMatchInlineSnapshot(`
            [MpcError: An error occurred.

            Code: 10
            Details: details
            - reason1
            - reason2
            Version: 1]
        `);
	});
});
