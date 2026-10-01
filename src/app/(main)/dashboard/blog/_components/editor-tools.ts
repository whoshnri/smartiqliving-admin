import type { EditorConfig, ToolConstructable } from "@editorjs/editorjs";

import Checklist from "@editorjs/checklist";
import CodeTool from "@editorjs/code";
import Delimiter from "@editorjs/delimiter";
import Embed from "@editorjs/embed";
import Header from "@editorjs/header";
import ImageTool from "@editorjs/image";
import InlineCode from "@editorjs/inline-code";
import Marker from "@editorjs/marker";
import NestedList from "@editorjs/nested-list";
import Quote from "@editorjs/quote";
import Table from "@editorjs/table";
import Warning from "@editorjs/warning";

import { uploadImageToR2 } from "./blog-upload";

/**
 * `@editorjs/nested-list` and `@editorjs/table` both type `render()`/their
 * constructor slightly out of step with the core's `ToolConstructable` — the
 * nested-list returns `Element` where `HTMLElement` is expected, and table
 * requires a `config` the core treats as optional. Both work at runtime; only
 * the published typings disagree. Narrowed here instead of casting the whole
 * tool map to `any`, which would lose checking on every other tool.
 */
function asTool(Tool: unknown): ToolConstructable {
  return Tool as ToolConstructable;
}

/**
 * The tool map for the blog editor.
 *
 * The object keys become the stored block `type`, so they are chosen to match
 * what the public renderer understands — notably `list`, which is registered
 * as that name while the nested-list implementation provides nesting.
 */
export function createEditorTools(): EditorConfig["tools"] {
  return {
    header: {
      class: Header,
      config: {
        // The page owns the H1, so headings inside the body start at H2.
        levels: [2, 3, 4],
        defaultLevel: 2,
        placeholder: "Section heading",
      },
    },
    list: {
      class: asTool(NestedList),
      inlineToolbar: true,
      config: { defaultStyle: "unordered" },
    },
    checklist: {
      class: Checklist,
      inlineToolbar: true,
    },
    quote: {
      class: Quote,
      inlineToolbar: true,
      config: {
        quotePlaceholder: "Quote",
        captionPlaceholder: "Attribution",
      },
    },
    code: {
      class: CodeTool,
      config: { placeholder: "Code snippet" },
    },
    table: {
      class: asTool(Table),
      inlineToolbar: true,
      config: { rows: 2, cols: 3, withHeadings: true },
    },
    image: {
      class: ImageTool,
      config: {
        captionPlaceholder: "Caption",
        uploader: {
          uploadByFile: async (file: Blob) => ({
            success: 1 as const,
            file: { url: await uploadImageToR2(file as File) },
          }),
          // Pasting an external URL skips storage entirely.
          uploadByUrl: async (url: string) => ({
            success: 1 as const,
            file: { url },
          }),
        },
      },
    },
    embed: {
      class: Embed,
      config: {
        services: {
          youtube: true,
          vimeo: true,
          twitter: true,
          instagram: true,
          linkedin: true,
        },
      },
    },
    warning: {
      class: Warning,
      inlineToolbar: true,
      config: {
        titlePlaceholder: "Title",
        messagePlaceholder: "Message",
      },
    },
    delimiter: Delimiter,
    marker: Marker,
    inlineCode: InlineCode,
  };
}
