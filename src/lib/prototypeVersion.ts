/** In-app prototype variants — switched from `Layout` (state only, no URL). */
export const PROTOTYPE_VERSION_IDS = ['v1', 'v2', 'v3'] as const;
export type PrototypeVersionId = (typeof PROTOTYPE_VERSION_IDS)[number];

export const PROTOTYPE_VERSION_LABELS: Record<PrototypeVersionId, string> = {
  v1: 'V1',
  v2: 'V2',
  v3: 'V3',
};
