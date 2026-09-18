import { Aura, RealmId, Rarity } from "../models";
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
type TrackRow = [name: string, rarity: Rarity, fileSlug?: string];
const create = (rows: TrackRow[]): Aura[] => rows.map(([name, rarity, fileSlug]) => { const key = fileSlug || slug(name); return { id: `track-${key}`, name, rarity, rarityDisplay: rarity.toUpperCase(), baseChance: RARITY_ODDS[rarity], realm: "music", description: "Track koleksi JJ RNG.", visualSymbol: "♫", audioFile: `${key}.mp3` }; });
export const RARITY_ODDS: Record<Rarity, number> = { Common: 2, Uncommon: 5, Rare: 25, Epic: 100, Legendary: 500, Mythic: 2500, Secret: 10000 };
export const auras: Aura[] = [
  ...create([["Garam dan Madu", "Common"], ["Cinta Ini Istimewa", "Common"], ["Astaga Bercanda", "Common"], ["Ku Bukan Superstar", "Common"], ["Hold On X Goyang Dumang", "Common", "hold-on"], ["Sudah Terbiasa Terjadi Tante", "Rare"], ["Curi Curi Pandang", "Rare"], ["Body Pata Pata", "Rare"], ["Dora Dora", "Epic"], ["Konco Mesra", "Epic"], ["Hotel Room", "Epic", "hotel_room"], ["Dola Dola", "Legendary"], ["Faja Skali", "Legendary"], ["Dalinda", "Mythic"]])
];
