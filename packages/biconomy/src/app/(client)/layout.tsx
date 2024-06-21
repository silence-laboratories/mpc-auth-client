"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { WALLET_ID } from "@/constants";
import { useSwitchScreen } from "@/hooks/useSwitchScreen";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    useSwitchScreen();
    useEffect(() => {
        localStorage.setItem("walletId", WALLET_ID);
        setIsClient(true);
    }, [router]);
    return isClient ? children : null;
};

export default Layout;
