import { useNavigate } from 'react-router-dom';
import { useScriptureReaderContext } from '../contexts/ScriptureReaderStore';
import type { Project52ReadingBlock } from '../types/project52';

type OpenProject52ReadingOptions = {
  navigateToScripture?: boolean;
};

export const useOpenProject52Reading = () => {
  const navigate = useNavigate();
  const { openScripture } = useScriptureReaderContext();

  return (
    blocks: Project52ReadingBlock[],
    options: OpenProject52ReadingOptions = {},
  ) => {
    const block = blocks[0];

    if (!block) {
      return;
    }

    openScripture({
      book: block.book,
      chapter: block.startChapter,
    });

    if (options.navigateToScripture !== false) {
      navigate('/scripture');
    }
  };
};
