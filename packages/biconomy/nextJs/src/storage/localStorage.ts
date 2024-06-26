"use client";
import { WALLET_STATUS } from "@/constants";

export function setPairingStatus(status: WALLET_STATUS) {
    localStorage.setItem("pairingStatus", status);
}

export function getPairingStatus(): WALLET_STATUS {
    return (localStorage.getItem("pairingStatus") ?? "Unpaired") as WALLET_STATUS;
}
