"use client";

import {
  Editor,
  defaultValueCtx,
  editorViewCtx,
  editorViewOptionsCtx,
  rootCtx,
  serializerCtx,
} from "@milkdown/core";
import { clipboard } from "@milkdown/plugin-clipboard";
import { history } from "@milkdown/plugin-history";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
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

type Props = {
  value: string;
  disabled?: boolean;
  onChange?: (content: string) => void;
};

const editorClasses = "mx-auto outline-none px-3 py-2";

export function getMarkdown(editor: Editor | undefined) {
  if (!editor) return "";

  return editor.action((ctx) => {
    const editorView = ctx.get(editorViewCtx);
    const serializer = ctx.get(serializerCtx);
    return serializer(editorView.state.doc);
  });
}

const MilkdownEditor = ({ disabled, value, onChange }: Props) => {
  // Create a ref to store the current editing state
  const disabledRef = useRef(disabled);
  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);
  const isEditable = () => !disabledRef.current;

  const { get } = useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);

        // Add attributes to the editor container
        ctx.update(editorViewOptionsCtx, (prev) => ({
          ...prev,
          attributes: {
            class: editorClasses,
            spellcheck: "false",
          },
          editable: isEditable,
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

        ctx.set(defaultValueCtx, value);

        const listener = ctx.get(listenerCtx);
        listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
          if (markdown === prevMarkdown) {
            return;
          }
          onChange && onChange(markdown);
        });
      })
      .use(commonmark)
      .use(gfm)
      .use(clipboard)
      .use(history)
      .use(listener),
  );

  return <Milkdown />;
};

MilkdownEditor.displayName = "MilkdownEditor";

export const MarkdownEditor = (props: Props) => {
  return (
    <MilkdownProvider>
      <MilkdownEditor {...props} />
    </MilkdownProvider>
  );
};

MarkdownEditor.displayName = "MarkdownEditor";
