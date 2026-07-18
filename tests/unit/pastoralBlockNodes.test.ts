import { createEditor } from 'lexical';
import { describe, expect, it } from 'vitest';
import { $createApplicationBlockNode, ApplicationBlockNode } from '../../src/components/writing/editor/nodes/ApplicationBlockNode';
import { $createPrayerBlockNode, PrayerBlockNode } from '../../src/components/writing/editor/nodes/PrayerBlockNode';
import { $createReflectionBlockNode, ReflectionBlockNode } from '../../src/components/writing/editor/nodes/ReflectionBlockNode';

describe('Pastoral Lexical blocks', () => {
  it('serializes reflection attribution separately from its meditation', () => {
    const editor = createEditor({ nodes: [ReflectionBlockNode] });
    let serialized: unknown;
    editor.update(() => { serialized = $createReflectionBlockNode({ authorVoice: 'Pastoral Reflection', content: 'All things work together for good.', title: 'Meditation' }).exportJSON(); });
    expect(serialized).toMatchObject({ data: { authorVoice: 'Pastoral Reflection', content: 'All things work together for good.', title: 'Meditation' }, type: 'reflection-block' });
    editor.update(() => { const node = $createReflectionBlockNode({ content: 'Initial reflection.' }); node.setData({ authorVoice: 'Pastoral Reflection', content: 'Updated reflection.' }); expect(node.getData()).toEqual({ authorVoice: 'Pastoral Reflection', content: 'Updated reflection.' }); });
  });

  it('keeps prayer and application as distinct content types', () => {
    const prayerEditor = createEditor({ nodes: [PrayerBlockNode] });
    const applicationEditor = createEditor({ nodes: [ApplicationBlockNode] });
    let prayer: unknown;
    let application: unknown;
    prayerEditor.update(() => { prayer = $createPrayerBlockNode({ content: 'Lord, teach us to obey.', title: 'Closing Prayer' }).exportJSON(); });
    applicationEditor.update(() => { application = $createApplicationBlockNode({ content: 'Read Psalm 119 this week.', title: 'For This Week' }).exportJSON(); });
    expect(prayer).toMatchObject({ type: 'prayer-block' });
    expect(application).toMatchObject({ type: 'application-block' });
  });
});
