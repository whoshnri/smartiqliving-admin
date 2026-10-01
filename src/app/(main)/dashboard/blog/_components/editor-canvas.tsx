"use client";

import { useEffect, useRef } from "react";

import type { OutputData } from "@editorjs/editorjs";

import EditorJS from "@editorjs/editorjs";

import type { EditorJsDocument } from "@/types";

import { createEditorTools } from "./editor-tools";

import "@/styles/editorjs.css";

interface EditorCanvasProps {
  /** Seeded once, on the first successful mount. Later changes are ignored. */
  initialData: EditorJsDocument;
  /** Receives the live instance so the surrounding form can call `save()`. */
  editorRef: React.RefObject<EditorJS | null>;
}

export function EditorCanvas({ initialData, editorRef }: EditorCanvasProps) {
  const holderRef = useRef<HTMLDivElement>(null);

  // The document is captured for the lifetime of the component. Re-seeding on
  // every render would fight the user's typing.
  const seedRef = useRef(initialData);

  /**
   * Editor.js throws if it is destroyed before `isReady` resolves, and React 19
   * StrictMode mounts, unmounts and remounts an effect in quick succession.
   * Chaining both halves of the lifecycle through one promise keeps teardown
   * and the next construction strictly ordered — without it, the second editor
   * is built while the first is still being torn down and both end up attached
   * to the same holder.
   */
  const lifecycleRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;

    // Held in an object so TypeScript does not narrow it to `null` across the
    // async callback below.
    const state: { editor: EditorJS | null } = { editor: null };
    let cancelled = false;

    lifecycleRef.current = lifecycleRef.current.then(async () => {
      if (cancelled) return;

      const instance = new EditorJS({
        holder,
        placeholder: "Write the article…",
        data: (seedRef.current ?? { blocks: [] }) as OutputData,
        tools: createEditorTools(),
      });

      state.editor = instance;
      editorRef.current = instance;

      await instance.isReady;
    });

    return () => {
      cancelled = true;

      lifecycleRef.current = lifecycleRef.current
        .then(() => {
          const instance = state.editor;
          if (!instance) return;

          instance.destroy();
          if (editorRef.current === instance) editorRef.current = null;
        })
        .catch(() => {
          // Destroying an already-detached editor throws; nothing to recover.
        });
    };
  }, [editorRef]);

  return <div ref={holderRef} className="blog-editor" />;
}

export default EditorCanvas;
