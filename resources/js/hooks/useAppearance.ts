import { useEffect, useState, useCallback } from "react";
import { Appearance } from "@/types";

const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === "undefined") return;
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    if (typeof document === "undefined") return;
    const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;
    const isDark =
        appearance === "dark" || (appearance === "system" && prefersDark);
    document.documentElement.classList.toggle("dark", isDark);
};

export function useAppearance() {
    const initialAppearance = (getCookie("appearance") as Appearance) || "system";
    const [appearance, setAppearance] = useState<Appearance>(initialAppearance);

    useEffect(() => {
        applyTheme(appearance);
    }, [appearance]);

    useEffect(() => {
        if (appearance !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const listener = () => applyTheme("system");
        mq.addEventListener("change", listener);
        return () => mq.removeEventListener("change", listener);
    }, [appearance]);

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);
        setCookie("appearance", mode);
        applyTheme(mode);
    }, []);

    return { appearance, updateAppearance } as const;
}
