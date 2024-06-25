import { AccountData } from "../../types";

export class AccountManager {
  setEoa(eoa: AccountData) {
    localStorage.setItem("eoa", JSON.stringify(eoa));
  }

  getEoa(): AccountData {
    return JSON.parse(localStorage.getItem("eoa") || "null");
  }

  setOldEoa(eoa: AccountData) {
    localStorage.setItem("oldEoa", JSON.stringify(eoa));
  }

  getOldEoa(): AccountData {
    return JSON.parse(localStorage.getItem("oldEoa") || "null");
  }

  setSmartContractAccount(walletAccount: AccountData) {
    localStorage.setItem("walletAccount", JSON.stringify(walletAccount));
  }

  getSmartContractAccount(): AccountData {
    return JSON.parse(localStorage.getItem("walletAccount") || "null");
  }

  setTxHash(txHash: string) {
    localStorage.setItem("txnHash", txHash);
  }

  getTxHash() {
    return localStorage.getItem("txnHash");
  }

  clearAccount() {
    this.clearOldAccount();
    localStorage.removeItem("eoa");
    localStorage.removeItem("passwordReady");
  }

  clearOldAccount() {
    localStorage.removeItem("oldEoa");
    localStorage.removeItem("walletAccount");
  }

  isPasswordReady() {
    return JSON.parse(localStorage.getItem("passwordReady") || "false");
  }

  setPasswordReady(isPasswordReady = true) {
    localStorage.setItem("passwordReady", JSON.stringify(isPasswordReady));
  }
}
