import type { AudioVisualItem } from '../../../types/audioVisual';
import MediaRail from '../MediaRail';

type RelatedMediaRowProps = {
  darkMode: boolean;
  items: AudioVisualItem[];
};

const RelatedMediaRow = ({ darkMode, items }: RelatedMediaRowProps) => (
  <MediaRail darkMode={darkMode} initialVisibleItems={5} items={items} title="Related Messages" />
);

export default RelatedMediaRow;
