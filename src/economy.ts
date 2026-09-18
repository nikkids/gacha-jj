import { Rarity } from "./models";
export const explorationGold = 2;
export const duplicateGold: Record<Rarity, number> = { Common: 3, Uncommon: 5, Rare: 10, Epic: 20, Legendary: 50, Mythic: 120, Secret: 300 };
export const upgradeCosts = [0, 30, 90, 220]; // index is target level
