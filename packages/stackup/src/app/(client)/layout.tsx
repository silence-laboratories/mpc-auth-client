"use client";
import { getPairingStatus } from "@/mpc/storage/wallet";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import "animate.css";
import { WALLET_ID, WALLET_STATUS } from "@/constants";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
        localStorage.setItem("walletId", WALLET_ID);
        if (getPairingStatus() == WALLET_STATUS.Paired) {
            router.replace("/homescreen");
        }
    }, [router]);

    if (!isClient) return null;
    return children;
};

export default Layout;
