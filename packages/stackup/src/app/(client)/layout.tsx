"use client";
import { getPairingStatus } from "@/mpc/storage/wallet";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import "animate.css";
import { WALLET_ID } from "@/constants";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    useEffect(() => {
        localStorage.setItem("walletId", WALLET_ID);
        if (getPairingStatus() == "Paired") {
            router.replace("/homescreen");
        }
        setIsClient(true);
    }, [router]);

    if (!isClient) return null;
    return children;
};

export default Layout;
