export type accountType = {
    address: string;
};

export type pairingStatusType = "Paired" | "Unpaired";

export function setEoa(eoa: accountType) {
    localStorage.setItem("eoa", JSON.stringify(eoa));
}

export function getEoa(): accountType {
    return JSON.parse(localStorage.getItem("eoa") || "{}");
}

export function setWalletAccount(walletAccount: accountType) {
    localStorage.setItem("walletAccount", JSON.stringify(walletAccount));
}

export function getWalletAccount(): accountType {
    return JSON.parse(localStorage.getItem("walletAccount") || "{}");
}

export function setPairingStatus(status: pairingStatusType) {
    localStorage.setItem("pairingStatus", status);
}

export function getPairingStatus(): pairingStatusType {
    return localStorage.getItem("pairingStatus") as pairingStatusType;
}

export function setTxHash(txHash: string) {
    localStorage.setItem("txnHash", JSON.stringify(txHash));
}

export function getTxHash() {
    return JSON.parse(localStorage.getItem("txHash") || "{}");
}

export function clearLocalStorage() {
    setPairingStatus("Unpaired");
    localStorage.removeItem("eoa");
    localStorage.removeItem("walletAccount");
}

export function isPasswordReady() {
    return JSON.parse(localStorage.getItem("passwordReady") || "false");
}

export function setPasswordReady() {
    localStorage.setItem("passwordReady", JSON.stringify(true));
}
