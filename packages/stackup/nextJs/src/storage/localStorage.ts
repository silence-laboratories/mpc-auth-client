"use client";
import { WALLET_STATUS } from "@/constants";

export function setWalletStatus(status: WALLET_STATUS) {
    localStorage.setItem("pairingStatus", status);
}

export function getWalletStatus(): WALLET_STATUS {
    return (localStorage.getItem("pairingStatus") ?? "Unpaired") as WALLET_STATUS;
}
