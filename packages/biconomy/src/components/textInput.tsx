"use client";
import { useState } from "react";

interface TextInputProps {
    label: string;
    placeholder: string;
    value: string;
    setValue: (value: string) => void;
    error: string;
    style?: any;
    props?: any;
    containerClass?: string;
    inputClass?: string;
    icon?: any;
}

export const TextInput = ({
    label,
    placeholder,
    value,
    setValue,
    error,
    containerClass,
    inputClass,
    icon,
    ...props
}: TextInputProps) => {
    const handleInputChange = (e: any) => {
        e.preventDefault();
        setValue(e.target.value);
    };
    const [typing, setTyping] = useState(false);

    return (
        <div
            className={`${containerClass} sm:flex sm:flex-row items-center mb-4 gap-1 inline-flex`}
        >
            <div className="text-[#25272C] b2-regular text-nowrap w-[60px]">
                {label}
            </div>

            <div className="relative">
                <input
                    className={`${inputClass} rounded-[4px] w-[100%] sm:w-[12.6vw] px-3 py-2 bg-white-primary border border-solid border-[#D5D9E2] outline-none focus:border-white-disable
                ${error !== "" ? "!border-red-400" : ""}
                hover:border-gray-400
                focus:border-primary-500`}
                    placeholder={placeholder}
                    onChange={handleInputChange}
                    onFocus={() => setTyping(true)}
                    onBlur={() => setTyping(false)}
                    type="text"
                    {...props}
                />
                {error && !typing && (
                    <div className="text-red-400 text-sm absolute top-[25%] right-2">
                        {error}
                    </div>
                )}
                {!error && icon && (
                    <div className="absolute top-[20%] right-2">{icon}</div>
                )}
            </div>
        </div>
    );
};
