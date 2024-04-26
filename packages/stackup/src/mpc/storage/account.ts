export type accountType = {
    address: string;
};

export function setEoa(eoa: accountType) {
    localStorage.setItem("eoa", JSON.stringify(eoa));
}

export function getEoa(): accountType {
    return JSON.parse(localStorage.getItem("eoa") || "null");
}

export function setWalletAccount(walletAccount: accountType) {
    localStorage.setItem("walletAccount", JSON.stringify(walletAccount));
}

export function getWalletAccount(): accountType {
    return JSON.parse(localStorage.getItem("walletAccount") || "null");
}

export function setTxHash(txHash: string) {
    localStorage.setItem("txnHash", JSON.stringify(txHash));
}

export function getTxHash() {
    return JSON.parse(localStorage.getItem("txHash") || "{}");
}

export function clearAccount() {
    localStorage.removeItem("eoa");
    localStorage.removeItem("walletAccount");
}

export function isPasswordReady() {
    return JSON.parse(localStorage.getItem("passwordReady") || "false");
}

export function setPasswordReady() {
    localStorage.setItem("passwordReady", JSON.stringify(true));
}
