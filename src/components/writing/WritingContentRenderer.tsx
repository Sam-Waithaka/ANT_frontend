import { useMemo } from "react";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { normalizeLexicalContent } from "../portal/writing/editor/serialization";
import { ChurchBlockNode } from "../portal/writing/editor/nodes/ChurchBlockNode";
import { EditableBlockQuoteNode } from "../portal/writing/editor/nodes/EditableBlockQuoteNode";
import { ScriptureBlockNode } from "../portal/writing/editor/nodes/ScriptureBlockNode";
import { ScriptureReferenceNode } from "../portal/writing/editor/nodes/ScriptureReferenceNode";
import { ReflectionBlockNode } from "../portal/writing/editor/nodes/ReflectionBlockNode";
import { PrayerBlockNode } from "../portal/writing/editor/nodes/PrayerBlockNode";
import { ApplicationBlockNode } from "../portal/writing/editor/nodes/ApplicationBlockNode";
import {
  ChurchBlockMediaContext,
  mediaEmbedMap,
  type WritingMediaEmbedLike,
} from "../portal/writing/editor/nodes/ChurchBlockMediaContext";
import { writingEditorTheme } from "./lexicalTheme";

type WritingContentRendererProps = {
  contentJson?: unknown;
  darkMode: boolean;
  emptyMessage?: string;
  mediaEmbeds?: WritingMediaEmbedLike[];
};

const WritingContentRenderer = ({
  contentJson,
  darkMode,
  emptyMessage = "This article does not have content yet.",
  mediaEmbeds = [],
}: WritingContentRendererProps) => {
  const initialContent = useMemo(
    () => normalizeLexicalContent(contentJson),
    [contentJson],
  );
  const media = useMemo(() => mediaEmbedMap(mediaEmbeds), [mediaEmbeds]);
  const initialConfig = useMemo(
    () => ({
      editable: false,
      editorState: JSON.stringify(initialContent),
      namespace: "aic-njoro-writing-content",
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        LinkNode,
        AutoLinkNode,
        ChurchBlockNode,
        EditableBlockQuoteNode,
        ScriptureBlockNode,
        ScriptureReferenceNode,
        ReflectionBlockNode,
        PrayerBlockNode,
        ApplicationBlockNode,
      ],
      onError: (error: Error) => {
        throw error;
      },
      theme: writingEditorTheme,
    }),
    [initialContent],
  );

  return (
    <ChurchBlockMediaContext.Provider value={media}>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          ErrorBoundary={LexicalErrorBoundary}
          contentEditable={
            <ContentEditable
              aria-label="Article preview content"
              className={
                "whitespace-pre-wrap break-words outline-none " +
                (darkMode ? "text-stone-100" : "text-zinc-950")
              }
              contentEditable={false}
            />
          }
          placeholder={
            <p className={darkMode ? "text-stone-400" : "text-zinc-600"}>
              {emptyMessage}
            </p>
          }
        />
        <ListPlugin />
        <LinkPlugin />
      </LexicalComposer>
    </ChurchBlockMediaContext.Provider>
  );
};

export default WritingContentRenderer;
