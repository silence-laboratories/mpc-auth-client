// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Silence x Pimlico AA Wallet Demo",
    description: "Silence x Pimlico AA Wallet Demo",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="app-container">
                    <nav className="w-full z-20 top-0 start-0 border-b border-gray-700 bg-white-primary mb-6 pl-[160px] pr-[100px]">
                        <div className="flex w-full flex-wrap items-center justify-between h-[8.88vh]">
                            <div className="flex items-center">
                                <Image
                                    priority={true}
                                    src="/slxpimlico.svg"
                                    alt="logo 1"
                                    className="mr-10"
                                    width="237"
                                    height="33"
                                />
                                <Image
                                    priority={true}
                                    src="/demoLogo.svg"
                                    alt="Demo Logo"
                                    width="163"
                                    height="30"
                                />
                            </div>
                            <div className="flex items-left">
                                <a
                                    href="https://docs.silencelaboratories.com/duo"
                                    target="_blank"
                                    className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                                >
                                    View Documentation
                                </a>
                            </div>
                        </div>
                    </nav>

                    <div className="w-full relative" style={{ zIndex: 1 }}>
                        <Image
                            priority={true}
                            className="bg-pattern-2nd-layer -z-10"
                            src="/pattern.png"
                            alt=""
                            width="1280"
                            height="720"
                        ></Image>
                        {children}
                    </div>
                </div>
            </body>
        </html>
    );
}
