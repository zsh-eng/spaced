"use client";

import { cn } from "@/utils/ui";
import {
  Editor,
  defaultValueCtx,
  editorViewCtx,
  editorViewOptionsCtx,
  rootCtx,
  serializerCtx,
} from "@milkdown/core";
import { clipboard } from "@milkdown/plugin-clipboard";
import {
  blockquoteAttr,
  bulletListAttr,
  commonmark,
  headingAttr,
  inlineCodeAttr,
  paragraphAttr,
} from "@milkdown/preset-commonmark";
import { gfm } from "@milkdown/preset-gfm";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { useEffect, useRef } from "react";
import { history } from "@milkdown/plugin-history";

type Props = {
  initialContent: string;
  editing: boolean;
  onSaveContent: (content: string) => void;
};

const editorClasses =
  "milkdown-editor mx-auto outline-none h-60 overflow-y-auto border border-input px-3 py-2 rounded-md";

const MilkdownEditor = ({ initialContent, editing, onSaveContent }: Props) => {
  // Create a ref to store the current editing state
  const editingRef = useRef(editing);
  useEffect(() => {
    console.log("editable", editing);
    editingRef.current = editing;
  }, [editing]);
  const isEditing = () => editingRef.current;

  const { get } = useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        console.log("Editor");
        ctx.set(rootCtx, root);

        // Add attributes to the editor container
        ctx.update(editorViewOptionsCtx, (prev) => ({
          ...prev,
          attributes: {
            class: editorClasses,
            spellcheck: "false",
          },
          editable: isEditing,
        }));

        // Add attributes to nodes and marks
        ctx.set(headingAttr.key, (node) => {
          const level = node.attrs.level;
          if (level === 1) {
            return {
              class:
                "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
              "data-el-type": "h1",
            };
          }

          if (level === 2) {
            return {
              class:
                "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
              "data-el-type": "h2",
            };
          }

          if (level === 3) {
            return {
              class: "scroll-m-20 text-2xl font-semibold tracking-tight",
              "data-el-type": "h3",
            };
          }

          if (level === 4) {
            return {
              class: "scroll-m-20 text-xl font-semibold tracking-tight",
              "data-el-type": "h4",
            };
          }

          return {
            class: "text-lg font-semibold",
          };
        });

        ctx.set(paragraphAttr.key, () => ({
          class: "leading-7",
        }));

        ctx.set(blockquoteAttr.key, () => ({
          class: "mt-6 border-l-2 pl-6 italic",
        }));

        ctx.set(bulletListAttr.key, () => ({
          class: "my-6 ml-6 list-disc [&>li]:mt-2",
        }));

        ctx.set(inlineCodeAttr.key, () => ({
          class:
            "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        }));

        ctx.set(defaultValueCtx, initialContent);
      })
      .use(commonmark)
      .use(gfm)
      .use(clipboard)
      .use(history),
  );

  const editor = get();

  useEffect(() => {
    if (editing) return;

    if (!editor) return;
    const markdown = editor.action((ctx) => {
      const editorView = ctx.get(editorViewCtx);
      const serializer = ctx.get(serializerCtx);
      return serializer(editorView.state.doc);
    });

    onSaveContent(markdown);
  }, [editing, onSaveContent, editor]);

  return <Milkdown />;
};

export const MilkdownEditorWrapper = (props: Props) => {
  return (
    <MilkdownProvider>
      <MilkdownEditor {...props} />
    </MilkdownProvider>
  );
};
