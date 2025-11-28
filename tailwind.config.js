import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
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
        "bg-purple-500",
        "bg-green-500",
        "bg-red-500",

        // Status badge colors
        "bg-gray-100",
        "bg-blue-100",
        "bg-amber-100",
        "bg-purple-100",
        "bg-green-100",
        "bg-red-100",
        "text-gray-700",
        "text-blue-700",
        "text-amber-700",
        "text-purple-700",
        "text-green-700",
        "text-red-700",

        // Priority colors
        "text-gray-600",
        "text-amber-600",
        "text-red-600",
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
