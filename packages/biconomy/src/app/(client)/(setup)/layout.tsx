"use client";
import * as React from "react";
import { cn } from "@/utils/ui";
import Footer from "@/components/footer";

import { usePathname } from "next/navigation";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const className = "h-max max-w-[720px]";
    const pathname = usePathname();
    const showFooter = pathname === "/intro";
    return (
        <>
            <div
                className={cn(
                    "relative flex flex-col justify-center py-6 px-10 border rounded-[8px] border-gray-700  w-[92vw] lg:w-[52.75vw] m-auto bg-white-primary",
                    className
                )}
            >
                {children}
            </div>
            {showFooter && (
                <div className="mt-6 w-full flex justify-center">
                    <Footer />
                </div>
            )}
        </>
    );
};

export default Layout;
