// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.
"use client";
import { getWalletStatus } from "@/app/storage/localStorage";
import { WALLET_STATUS } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// This hook is used to switch screens based on the wallet state in FIRST time load
export const useSwitchScreen = () => {
    const router = useRouter();
    const initializeScreen = () => {
        const status = getWalletStatus();
        if (status === WALLET_STATUS.Minted) {
            router.replace("/homescreen");
        } else if (status === WALLET_STATUS.BackedUp) {
            router.replace("/mint");
        } else if (status === WALLET_STATUS.Paired) {
            router.replace("/backup");
        } else if (status === WALLET_STATUS.Mismatched) {
            router.replace("/mismatchAccounts");
        } else if (status === WALLET_STATUS.Unpaired) {
            router.replace("/intro");
        }
    };
    useEffect(() => {
        initializeScreen();
    }, []);
};
