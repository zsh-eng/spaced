"use client";

import { trpc } from "@/utils/trpc";
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
import { history } from "@milkdown/plugin-history";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { Uploader, upload, uploadConfig } from "@milkdown/plugin-upload";
import {
  blockquoteAttr,
  bulletListAttr,
  commonmark,
  headingAttr,
  inlineCodeAttr,
  paragraphAttr,
} from "@milkdown/preset-commonmark";
import { gfm } from "@milkdown/preset-gfm";
import type { Node } from "@milkdown/prose/model";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { useEffect, useRef } from "react";

type Props = {
  value: string;
  disabled?: boolean;
  onChange?: (content: string) => void;
  border?: boolean;
};

export function getMarkdown(editor: Editor | undefined) {
  if (!editor) return "";

  return editor.action((ctx) => {
    const editorView = ctx.get(editorViewCtx);
    const serializer = ctx.get(serializerCtx);
    return serializer(editorView.state.doc);
  });
}

// https://stackoverflow.com/questions/36280818/how-to-convert-file-to-base64-in-javascript
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

const MilkdownEditor = ({ disabled, value, onChange, border }: Props) => {
  const mutation = trpc.image.upload.useMutation({});

  // See https://milkdown.dev/docs/api/plugin-upload
  const uploader: Uploader = async (files, schema) => {
    const images: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (!file) {
        continue;
      }

      // You can handle whatever the file type you want, we handle image here.
      if (!file.type.includes("image")) {
        continue;
      }

      images.push(file);
    }

    const nodes: Array<Node | undefined> = await Promise.all(
      images.map(async (image) => {
        const base64String = await toBase64(image);
        const link = await mutation.mutateAsync({
          base64String,
          name: image.name,
        });

        return schema.nodes.image.createAndFill({
          src: link,
          alt: image.name,
        }) as Node;
      }),
    );

    return nodes.filter(Boolean) as Node[];
  };

  const editorClasses = cn(
    "mx-auto outline-none px-3 py-2",
    border && "border border-input rounded-sm",
  );

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

        ctx.update(uploadConfig.key, (prev) => ({
          ...prev,
          uploader,
        }));
      })
      .use(commonmark)
      .use(gfm)
      .use(clipboard)
      .use(history)
      .use(listener)
      .use(upload),
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
