import _sodium from "libsodium-wrappers-sumo";
import {aeadEncrypt, aeadDecrypt} from "@/mpc/crypto"
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });
import { uint8ArrayToUtf8String } from "@/mpc/utils";

describe("Test aeadEncrypt", () => {
    it("should encrypt and decrypt the message", async () => {
        await _sodium.ready;
        const password = "password";
        const message = "This is a secret message";
        const encrypted = await aeadEncrypt(message, password);
        const decrypted = await aeadDecrypt(encrypted, password);
        const plain = uint8ArrayToUtf8String(decrypted);
        expect(plain).toEqual(message);
    });

    it("should throw an error if the password is incorrect", async () => {
        await _sodium.ready;
        const password = "password";
        const wrongPassword = "wrongPassword";
        const message = "This is a secret message";
        const encrypted = await aeadEncrypt(message, password);
        await expect(aeadDecrypt(encrypted, wrongPassword)).rejects.toThrow();
    });

    it("should not throw errors if encrypt the empty password", async () => {
        await _sodium.ready;
        const password = "";
        const message = "This is a secret message";
        await expect(aeadEncrypt(message, password)).resolves.not.toThrow();
    });
});