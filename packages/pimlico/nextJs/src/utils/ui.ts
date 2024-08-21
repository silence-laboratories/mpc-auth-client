// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const className = "h-max max-w-[720px]";
export const layoutClassName = cn(
    "relative flex flex-col justify-center py-6 px-10 border rounded-[8px] border-gray-700  w-[92vw] lg:w-[52.75vw] m-auto bg-white-primary",
    className
);
