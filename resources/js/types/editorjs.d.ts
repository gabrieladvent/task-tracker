declare module "@editorjs/paragraph" {
    import { BlockTool, BlockToolConstructorOptions } from "@editorjs/editorjs";

    interface ParagraphConfig {
        placeholder?: string;
        preserveBlank?: boolean;
    }

    interface ParagraphData {
        text: string;
    }

    export default class Paragraph implements BlockTool {
        constructor(
            config: BlockToolConstructorOptions<ParagraphData, ParagraphConfig>
        );
        render(): HTMLElement;
        save(block: HTMLElement): ParagraphData;
        static get isReadOnlySupported(): boolean;
    }
}

declare module "@editorjs/header" {
    import { BlockTool, BlockToolConstructorOptions } from "@editorjs/editorjs";

    interface HeaderConfig {
        placeholder?: string;
        levels?: number[];
        defaultLevel?: number;
    }

    interface HeaderData {
        text: string;
        level: number;
    }

    export default class Header implements BlockTool {
        constructor(
            config: BlockToolConstructorOptions<HeaderData, HeaderConfig>
        );
        render(): HTMLElement;
        save(block: HTMLElement): HeaderData;
        static get isReadOnlySupported(): boolean;
    }
}

declare module "@editorjs/list" {
    import { BlockTool, BlockToolConstructorOptions } from "@editorjs/editorjs";

    interface ListData {
        style: "ordered" | "unordered";
        items: string[];
    }

    export default class List implements BlockTool {
        constructor(config: BlockToolConstructorOptions<ListData, any>);
        render(): HTMLElement;
        save(block: HTMLElement): ListData;
        static get isReadOnlySupported(): boolean;
    }
}

declare module "@editorjs/checklist" {
    import { BlockTool, BlockToolConstructorOptions } from "@editorjs/editorjs";

    interface ChecklistItem {
        text: string;
        checked: boolean;
    }

    interface ChecklistData {
        items: ChecklistItem[];
    }

    export default class Checklist implements BlockTool {
        constructor(config: BlockToolConstructorOptions<ChecklistData, any>);
        render(): HTMLElement;
        save(block: HTMLElement): ChecklistData;
        static get isReadOnlySupported(): boolean;
    }
}

declare module "@editorjs/quote" {
    import { BlockTool, BlockToolConstructorOptions } from "@editorjs/editorjs";

    interface QuoteData {
        text: string;
        caption: string;
        alignment: "left" | "center";
    }

    interface QuoteConfig {
        quotePlaceholder?: string;
        captionPlaceholder?: string;
    }

    export default class Quote implements BlockTool {
        constructor(
            config: BlockToolConstructorOptions<QuoteData, QuoteConfig>
        );
        render(): HTMLElement;
        save(block: HTMLElement): QuoteData;
        static get isReadOnlySupported(): boolean;
    }
}

declare module "@editorjs/code" {
    import { BlockTool, BlockToolConstructorOptions } from "@editorjs/editorjs";

    interface CodeData {
        code: string;
    }

    export default class CodeTool implements BlockTool {
        constructor(config: BlockToolConstructorOptions<CodeData, any>);
        render(): HTMLElement;
        save(block: HTMLElement): CodeData;
        static get isReadOnlySupported(): boolean;
    }
}

declare module "@editorjs/delimiter" {
    import { BlockTool, BlockToolConstructorOptions } from "@editorjs/editorjs";

    export default class Delimiter implements BlockTool {
        constructor(config: BlockToolConstructorOptions<any, any>);
        render(): HTMLElement;
        save(): { [key: string]: any };
        static get isReadOnlySupported(): boolean;
    }
}

declare module "@editorjs/warning" {
    import { BlockTool, BlockToolConstructorOptions } from "@editorjs/editorjs";

    interface WarningData {
        title: string;
        message: string;
    }

    interface WarningConfig {
        titlePlaceholder?: string;
        messagePlaceholder?: string;
    }

    export default class Warning implements BlockTool {
        constructor(
            config: BlockToolConstructorOptions<WarningData, WarningConfig>
        );
        render(): HTMLElement;
        save(block: HTMLElement): WarningData;
        static get isReadOnlySupported(): boolean;
    }
}

declare module "@editorjs/marker" {
    import {
        InlineTool,
        InlineToolConstructorOptions,
    } from "@editorjs/editorjs";

    export default class Marker implements InlineTool {
        constructor(config: InlineToolConstructorOptions);
        surround(range: Range): void;
        render(): HTMLElement;
        checkState(selection: Selection): boolean;
        static get isInline(): boolean;
        static get title(): string;
    }
}

declare module "@editorjs/inline-code" {
    import {
        InlineTool,
        InlineToolConstructorOptions,
    } from "@editorjs/editorjs";

    export default class InlineCode implements InlineTool {
        constructor(config: InlineToolConstructorOptions);
        surround(range: Range): void;
        render(): HTMLElement;
        checkState(selection: Selection): boolean;
        static get isInline(): boolean;
        static get title(): string;
    }
}
