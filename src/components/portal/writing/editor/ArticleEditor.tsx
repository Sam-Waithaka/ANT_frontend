import { useMemo, useState } from 'react';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { $getRoot } from 'lexical';
import EditorStatus, { type EditorSaveState } from './EditorStatus';
import EditorToolbar from './EditorToolbar';
import {
  countLexicalWords,
  lexicalContentToText,
  normalizeLexicalContent,
  type LexicalContentJson,
} from './serialization';

type ArticleEditorProps = {
  contentJson?: unknown;
  darkMode: boolean;
  editable?: boolean;
  onChange?: (contentJson: LexicalContentJson, plainText: string) => void;
  placeholder?: string;
  saveState?: EditorSaveState;
};

const editorTheme = {
  heading: {
    h1: 'font-serif text-4xl leading-tight',
    h2: 'font-serif text-3xl leading-tight',
    h3: 'font-serif text-2xl leading-tight',
  },
  link: 'text-red-800 underline underline-offset-2',
  list: {
    listitem: 'ml-6',
    ol: 'my-4 list-decimal pl-6',
    ul: 'my-4 list-disc pl-6',
  },
  paragraph: 'mb-4 leading-8',
  quote: 'my-6 border-l-2 border-red-800/50 pl-5 font-serif text-xl leading-8 text-zinc-700',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline underline-offset-2',
  },
};

const ArticleEditor = ({
  contentJson,
  darkMode,
  editable = true,
  onChange,
  placeholder = 'Start writing your article... Use the toolbar to shape the message.',
  saveState = 'idle',
}: ArticleEditorProps) => {
  const initialContent = useMemo(() => normalizeLexicalContent(contentJson), [contentJson]);
  const [plainText, setPlainText] = useState(() => lexicalContentToText(initialContent));
  const surfaceClass = darkMode ? 'border-white/10 bg-zinc-950 text-stone-100' : 'border-black/10 bg-white text-zinc-950';
  const contentClass = darkMode ? 'text-stone-100 placeholder:text-stone-500' : 'text-zinc-950 placeholder:text-zinc-400';

  const initialConfig = useMemo(() => ({
    editorState: JSON.stringify(initialContent),
    namespace: 'aic-njoro-writing-studio',
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode],
    onError: (error: Error) => {
      throw error;
    },
    theme: editorTheme,
  }), [initialContent]);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <section aria-label="Article body editor" className={`overflow-hidden rounded-3xl border shadow-lg ${surfaceClass}`}>
        {editable ? <EditorToolbar darkMode={darkMode} /> : null}
        <div className="relative min-h-96 px-5 py-6 sm:px-7 sm:py-8">
          <RichTextPlugin
            ErrorBoundary={LexicalErrorBoundary}
            contentEditable={(
              <ContentEditable
                aria-label="Article body"
                className={`min-h-80 whitespace-pre-wrap break-words outline-none ${contentClass}`}
                contentEditable={editable}
              />
            )}
            placeholder={<p className={`pointer-events-none absolute left-5 top-6 sm:left-7 sm:top-8 ${darkMode ? 'text-stone-500' : 'text-zinc-400'}`}>{placeholder}</p>}
          />
        </div>
        <OnChangePlugin
          onChange={(editorState) => {
            const nextContent = normalizeLexicalContent(editorState.toJSON());
            const nextText = editorState.read(() => $getRoot().getTextContent());
            setPlainText(nextText);
            onChange?.(nextContent, nextText);
          }}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <EditorStatus
          characterCount={plainText.length}
          darkMode={darkMode}
          saveState={saveState}
          wordCount={countLexicalWords(plainText)}
        />
      </section>
    </LexicalComposer>
  );
};

export default ArticleEditor;
