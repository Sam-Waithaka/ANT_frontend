import { useMemo } from 'react';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { normalizeLexicalContent } from '../portal/writing/editor/serialization';
import { writingEditorTheme } from './lexicalTheme';

type WritingContentRendererProps = {
  contentJson?: unknown;
  darkMode: boolean;
  emptyMessage?: string;
};

const WritingContentRenderer = ({
  contentJson,
  darkMode,
  emptyMessage = 'This article does not have content yet.',
}: WritingContentRendererProps) => {
  const initialContent = useMemo(() => normalizeLexicalContent(contentJson), [contentJson]);
  const initialConfig = useMemo(() => ({
    editable: false,
    editorState: JSON.stringify(initialContent),
    namespace: 'aic-njoro-writing-content',
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode],
    onError: (error: Error) => {
      throw error;
    },
    theme: writingEditorTheme,
  }), [initialContent]);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        ErrorBoundary={LexicalErrorBoundary}
        contentEditable={<ContentEditable aria-label="Article preview content" className={'whitespace-pre-wrap break-words outline-none ' + (darkMode ? 'text-stone-100' : 'text-zinc-950')} contentEditable={false} />}
        placeholder={<p className={darkMode ? 'text-stone-400' : 'text-zinc-600'}>{emptyMessage}</p>}
      />
      <ListPlugin />
      <LinkPlugin />
    </LexicalComposer>
  );
};

export default WritingContentRenderer;