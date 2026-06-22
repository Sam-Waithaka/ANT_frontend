import type { WritingUpdatePayload } from '../types/writing';

export type CoverImageChange = number | string | null | undefined;

type WritingDraftFields = Omit<WritingUpdatePayload, 'og_image'>;

// Omitting an untouched relation prevents unrelated autosaves from clearing it.
export const buildWritingDraftPayload = (
  fields: WritingDraftFields,
  coverImageChange: CoverImageChange,
): WritingUpdatePayload => {
  if (coverImageChange === undefined) return fields;

  return {
    ...fields,
    og_image: coverImageChange,
  };
};
