import Checklist from "@editorjs/checklist";
import CodeTool from "@editorjs/code";
import Delimiter from "@editorjs/delimiter";
import Header from "@editorjs/header";
import InlineCode from "@editorjs/inline-code";
import List from "@editorjs/list";
import Marker from "@editorjs/marker";
import Paragraph from "@editorjs/paragraph";
import Quote from "@editorjs/quote";
import Warning from "@editorjs/warning";

export const STATUS_OPTIONS = [
    { value: "todo", label: "Todo" },
    { value: "in_progress", label: "In Progress" },
    { value: "on_hold", label: "On Hold" },
    { value: "code_review", label: "Code Review" },
    { value: "done", label: "Done" },
    { value: "cancelled", label: "Cancelled" },
];

export const PRIORITY_OPTIONS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

export const DEBOUNCE_DELAY = 1500;

export const EDITOR_INIT_DELAY = 150;

export const EDITOR_TOOLS_CONFIG = {
    paragraph: {
        class: Paragraph,
        inlineToolbar: true,
        config: { placeholder: 'Start writing here...' }
    },
    header: {
        class: Header,
        config: {
            placeholder: 'Enter a header',
            levels: [2, 3, 4],
            defaultLevel: 3
        },
        inlineToolbar: true,
    },
    list: { class: List, inlineToolbar: true },
    checklist: { class: Checklist, inlineToolbar: true },
    quote: {
        class: Quote,
        inlineToolbar: true,
        config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: 'Quote\'s author',
        },
    },
    code: CodeTool,
    delimiter: Delimiter,
    warning: Warning,
    marker: Marker,
    inlineCode: InlineCode,
};
