"use client";
import * as React from "react";
import { cn } from "@/utils/ui";

const Layout = ({ children }: { children: React.ReactNode }) => {

    const className = "h-max max-w-[720px]";
    const step = 1;
    const overlay = true;
    return step ? (
        <>
            <div
                className={cn(
                    "relative flex flex-col justify-center py-6 px-10 border rounded-[8px] border-gray-700  w-[92vw] lg:w-[52.75vw] m-auto bg-white-primary",
                    className
                )}
            >
                {children}
            </div>
        </>
    ) : (
        <div
            className={cn(
                "relative flex flex-col justify-center py-6 px-10 border rounded-[8px] border-gray-700  w-[92vw] lg:w-[52.75vw] m-auto bg-white-primary",
                className
            )}
        >
            {overlay && (
                <div className="absolute z-50 inset-0 bg-white-primary bg-opacity-50"></div>
            )}
            {children}
        </div>
    );
};

export default Layout;
