"use client";

import React, { useState } from "react";
import { Button } from "@/components/button";
import { Progress } from "@/components/progress";
import { useRouter } from "next/navigation";
import { Label } from "../ui/label";
import { PasswordInput, PasswordInputErr } from "./passwordInput";
import { PasswordCheckItem, PasswordCheckState } from "./passwordCheckItem";
import { checkPassword } from "@/utils/password";
import LoadingScreen from "../loadingScreen";

export const PasswordEnterScreen: React.FunctionComponent<{
    onProceed: (password: string) => Promise<void>;
}> = ({ onProceed }) => {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [passwordErr, setPasswordErr] = useState<PasswordInputErr>();
    const [isLoading, setIsLoading] = useState(false);

    const [passwordCheckState, setPasswordCheckState] = useState<{
        lengthCheck: PasswordCheckState;
        numberCheck: PasswordCheckState;
        lowerCaseCheck: PasswordCheckState;
        upperCaseCheck: PasswordCheckState;
        specialCharCheck: PasswordCheckState;
    }>({
        lengthCheck: "init",
        numberCheck: "init",
        lowerCaseCheck: "init",
        upperCaseCheck: "init",
        specialCharCheck: "init",
    });

    const handlePasswordOnchange = (pwd: string) => {
        const passwordCheck = checkPassword(pwd);
        setPasswordCheckState({
            lengthCheck: passwordCheck.lengthCheck ? "checked" : "unchecked",
            numberCheck: passwordCheck.numberCheck ? "checked" : "unchecked",
            lowerCaseCheck: passwordCheck.lowerCaseCheck
                ? "checked"
                : "unchecked",
            upperCaseCheck: passwordCheck.upperCaseCheck
                ? "checked"
                : "unchecked",
            specialCharCheck: passwordCheck.specialCharCheck
                ? "checked"
                : "unchecked",
        });

        const isPasswordAllow =
            passwordCheck.lengthCheck &&
            passwordCheck.numberCheck &&
            passwordCheck.lowerCaseCheck &&
            passwordCheck.upperCaseCheck &&
            passwordCheck.specialCharCheck;
        if (!isPasswordAllow) {
            setPasswordErr(PasswordInputErr.NotAllowed);
        } else {
            setPasswordErr(undefined);
        }
        setCurrentPassword(pwd);
    };

    const handleProceed = async () => {
        if (passwordErr) {
            return;
        }
        if (currentPassword.length < 8) {
            setPasswordErr(PasswordInputErr.Short);
            return;
        }
        setIsLoading(true);
        await onProceed(currentPassword);
        setIsLoading(false);
        router.replace("/mint");
    };

    return (
        <div>
            <div className="absolute w-full top-0 right-0">
                <Progress
                    className="w-[99.5%]"
                    value={50}
                    style={{ height: "4px" }}
                />
            </div>
            <Button
                className="rounded-full bg-gray-custom min-w-max aspect-square"
                size="icon"
                disabled={true}
                onClick={() => {
                    console.log("clicked");
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M16.1705 4.4545C16.6098 4.89384 16.6098 5.60616 16.1705 6.0455L10.216 12L16.1705 17.9545C16.6098 18.3938 16.6098 19.1062 16.1705 19.5455C15.7312 19.9848 15.0188 19.9848 14.5795 19.5455L7.8295 12.7955C7.39017 12.3562 7.39017 11.6438 7.8295 11.2045L14.5795 4.4545C15.0188 4.01517 15.7312 4.01517 16.1705 4.4545Z"
                        fill="#B1BBC8"
                    />
                </svg>
            </Button>
            <div className="h2-bold text-blackleading-[38.4px] mt-4 w-full text-center">
                Enter your password
            </div>
            {isLoading && <LoadingScreen>Pairing...</LoadingScreen>}
            {!isLoading && (
                <form onSubmit={(event) => {
                    event.preventDefault(); // Prevent the form from refreshing the page
                    handleProceed();
                }}>
                    <p className="b2-regular text-[#8E95A2]">
                        To unlock your backup on this device, enter the password
                        that you had set during account creation.
                    </p>

                    <div className="w-full my-6 px-14">
                        <Label htmlFor="current_password">
                            Enter a password
                        </Label>
                        <PasswordInput
                            id="current_password"
                            error={passwordErr}
                            value={currentPassword}
                            onChange={(e) => {
                                handlePasswordOnchange(e.target.value);
                            }}
                            autoComplete="current-password"
                            placeholder="password"
                        />

                        <div className="b2-regular flex flex-col border border-[#8695AA] rounded-lg my-4 p-2 bg-[rgba(82, 96, 119, 0.05)]">
                            <div className="flex text-[#64748B] mb-2">
                                <svg
                                    className="mr-1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="17"
                                    viewBox="0 0 16 17"
                                    fill="none"
                                >
                                    <path
                                        d="M8 2.25C4.55375 2.25 1.75 5.05375 1.75 8.5C1.75 11.9462 4.55375 14.75 8 14.75C11.4462 14.75 14.25 11.9462 14.25 8.5C14.25 5.05375 11.4462 2.25 8 2.25ZM8 4.8125C8.1607 4.8125 8.31779 4.86015 8.4514 4.94943C8.58502 5.03871 8.68916 5.1656 8.75065 5.31407C8.81215 5.46253 8.82824 5.6259 8.79689 5.78351C8.76554 5.94112 8.68815 6.08589 8.57452 6.19952C8.46089 6.31315 8.31612 6.39054 8.15851 6.42189C8.0009 6.45324 7.83753 6.43715 7.68907 6.37565C7.5406 6.31416 7.41371 6.21002 7.32443 6.0764C7.23515 5.94279 7.1875 5.7857 7.1875 5.625C7.1875 5.40951 7.2731 5.20285 7.42548 5.05048C7.57785 4.8981 7.78451 4.8125 8 4.8125ZM9.5 11.875H6.75C6.61739 11.875 6.49021 11.8223 6.39645 11.7286C6.30268 11.6348 6.25 11.5076 6.25 11.375C6.25 11.2424 6.30268 11.1152 6.39645 11.0214C6.49021 10.9277 6.61739 10.875 6.75 10.875H7.625V8.125H7.125C6.99239 8.125 6.86521 8.07232 6.77145 7.97855C6.67768 7.88479 6.625 7.75761 6.625 7.625C6.625 7.49239 6.67768 7.36521 6.77145 7.27145C6.86521 7.17768 6.99239 7.125 7.125 7.125H8.125C8.25761 7.125 8.38479 7.17768 8.47855 7.27145C8.57232 7.36521 8.625 7.49239 8.625 7.625V10.875H9.5C9.63261 10.875 9.75979 10.9277 9.85355 11.0214C9.94732 11.1152 10 11.2424 10 11.375C10 11.5076 9.94732 11.6348 9.85355 11.7286C9.75979 11.8223 9.63261 11.875 9.5 11.875Z"
                                        fill="#8695AA"
                                    />
                                </svg>
                                <div>Password must contain at least</div>
                            </div>
                            <ul
                                className="ml-5 text-[#609AFA]"
                                style={{ listStyleType: "disc" }}
                            >
                                <PasswordCheckItem
                                    label="Eight (8) characters"
                                    state={passwordCheckState.lengthCheck}
                                />

                                <PasswordCheckItem
                                    label="One Number"
                                    state={passwordCheckState.numberCheck}
                                />

                                <PasswordCheckItem
                                    label="One Lower case alphabet"
                                    state={passwordCheckState.lowerCaseCheck}
                                />

                                <PasswordCheckItem
                                    label="One Upper case alphabet"
                                    state={passwordCheckState.upperCaseCheck}
                                />

                                <PasswordCheckItem
                                    label="One special character (@,$,#,! etc)"
                                    state={passwordCheckState.specialCharCheck}
                                />
                            </ul>
                        </div>
                    </div>

                    <div className="w-full justify-center items-center flex flex-col">
                        <Button
                            type="submit"
                            className="bg-indigo-primary hover:bg-indigo-hover active:bg-indigo-active w-1/2"
                            onClick={handleProceed}
                        >
                            Proceed
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};
