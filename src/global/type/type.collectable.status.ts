export const COLLECTABLE_SELECTED = 'selected' as const;
export const COLLECTABLE_ACHIEVED = 'achieved' as const;
export const COLLECTABLE_UNACHIEVED = 'unachieved' as const;

export type CollectableStatus = 'selected' | 'achieved' | 'unachieved';
