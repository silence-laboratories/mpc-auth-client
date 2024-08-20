// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.
import { forwardRef, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/utils/ui";

interface PasswordInputProps extends InputProps {
    error?: PasswordInputErr;
}

export enum PasswordInputErr {
    Empty = "Password is required",
    Short = "Password must be at least 8 characters",
    Confirm = "Confirm password is not match",
    NotAllowed = "Password is not allowed",
    IncorrectPassword = "Incorrect password",
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, error = "", ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const disabled =
            props.value === "" || props.value === undefined || props.disabled;
        const inputStyle =
            error?.length > 0
                ? "border-[#DC2626] bg-[#B91C1C0D]"
                : "bg-[#F6F7F9] border-[#8695AA]";

        return (
            <>
                <div className="relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        className={cn(
                            `hide-password-toggle pr-10 h-[47px]`,
                            inputStyle,
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={disabled}
                    >
                        {showPassword && !disabled ? (
                            <EyeIcon
                                className="h-4 w-4"
                                aria-hidden="true"
                                color={`${
                                    error?.length > 0 ? "#FCA5A5" : "#B1BBC8"
                                }`}
                            />
                        ) : (
                            <EyeOffIcon
                                className="h-4 w-4"
                                aria-hidden="true"
                                color={`${
                                    error?.length > 0 ? "#FCA5A5" : "#B1BBC8"
                                }`}
                            />
                        )}
                        <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                        </span>
                    </Button>

                    {/* hides browsers password toggles */}
                    <style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
                </div>
                {error && (
                    <p className="mt-1 text-red-700 b2-regular">
                        {error.toString()}
                    </p>
                )}
            </>
        );
    }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
