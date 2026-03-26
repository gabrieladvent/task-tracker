import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.tsx",
    ],

    safelist: [
        // Status dot colors
        "bg-gray-500",
        "bg-blue-500",
        "bg-amber-500",
        "bg-violet-500",
        "bg-pink-500",
        "bg-sky-500",
        "bg-green-500",
        "bg-red-500",
        "dark:bg-gray-600",
        "dark:bg-blue-600",
        "dark:bg-amber-600",
        "dark:bg-violet-600",
        "dark:bg-pink-600",
        "dark:bg-sky-600",
        "dark:bg-green-600",
        "dark:bg-red-600",

        // Status badge colors
        "bg-gray-100",
        "bg-blue-100",
        "bg-amber-100",
        "bg-violet-100",
        "bg-pink-100",
        "bg-sky-100",
        "bg-green-100",
        "bg-red-100",
        "text-gray-700",
        "text-blue-700",
        "text-amber-700",
        "text-violet-700",
        "text-pink-700",
        "text-sky-700",
        "text-green-700",
        "text-red-700",
        "dark:bg-gray-700",
        "dark:bg-blue-900/40",
        "dark:bg-amber-900/40",
        "dark:bg-violet-900/40",
        "dark:bg-pink-900/40",
        "dark:bg-sky-900/40",
        "dark:bg-green-900/40",
        "dark:bg-red-900/40",
        "dark:text-gray-200",
        "dark:text-blue-300",
        "dark:text-amber-300",
        "dark:text-violet-300",
        "dark:text-pink-300",
        "dark:text-sky-300",
        "dark:text-green-300",
        "dark:text-red-300",

        // Priority colors
        "text-gray-600",
        "text-amber-600",
        "text-red-600",
        "dark:text-gray-400",
        "dark:text-amber-400",
        "dark:text-red-400",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "ui-monospace",
                    "SFMono-Regular",
                    "Menlo",
                    "Monaco",
                    "Consolas",
                    "Liberation Mono",
                    "Courier New",
                    "monospace",
                ],
            },
        },
    },

    plugins: [forms],
};
