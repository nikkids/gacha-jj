export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" | "Secret";
export type RealmId = "music";
export interface Aura { id: string; name: string; rarity: Rarity; rarityDisplay: string; baseChance: number; realm: RealmId; description: string; visualSymbol: string; audioFile: string; }
export interface Realm { id: RealmId; name: string; symbol: string; atmosphere: string; }
export interface Player { gameMode: "jj-rng"; discovered: string[]; gold: number; luckLevel: number; totalSpins: number; rarityFinds: Record<Rarity, number>; }
