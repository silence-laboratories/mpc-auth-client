"use client";
import * as React from "react";
import Footer from "@/components/footer";

import { usePathname } from "next/navigation";
import { WALLET_STATUS } from "@/constants";
import { getWalletStatus } from "@/app/storage/localStorage";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const showFooter = pathname === "/intro" && getWalletStatus() === WALLET_STATUS.Unpaired;
    return (
        <>
            <div>{children}</div>
            {showFooter && (
                <div className="mt-6 w-full flex justify-center">
                    <Footer />
                </div>
            )}
        </>
    );
};

export default Layout;