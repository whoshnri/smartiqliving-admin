/**
 * `@editorjs/checklist` and `@editorjs/marker` ship no type declarations at all
 * (no `types` field, no `.d.ts` in the package), so importing them under
 * `strict` fails with "could not find a declaration file". Typing them as
 * `ToolConstructable` matches how the typed tools behave and keeps the editor's
 * tool map honest, rather than casting the whole map to `any`.
 */

declare module "@editorjs/checklist" {
  import type { ToolConstructable } from "@editorjs/editorjs";

  const Checklist: ToolConstructable;
  export default Checklist;
}

declare module "@editorjs/marker" {
  import type { ToolConstructable } from "@editorjs/editorjs";

  const Marker: ToolConstructable;
  export default Marker;
}

/**
 * `@editorjs/embed` does ship `dist/index.d.ts`, but its `package.json`
 * `exports` map does not expose it, so TypeScript cannot resolve the types and
 * falls back to the untyped `.mjs`. Declaring the module here sidesteps the
 * broken export map.
 */
declare module "@editorjs/embed" {
  import type { ToolConstructable } from "@editorjs/editorjs";

  const Embed: ToolConstructable;
  export default Embed;
}
