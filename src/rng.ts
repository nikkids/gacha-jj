import { auras, RARITY_ODDS } from "./data/auras";
import { Aura, Player, RealmId, Rarity } from "./models";
const rarities: Rarity[] = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic", "Secret"];
export const luckMultiplier = (level: number) => [1, 1.1, 1.25, 1.5][level - 1] ?? 1.5;
export function rollAura(player: Player): Aura {
  const luck = luckMultiplier(player.luckLevel);
  const available = rarities.filter(rarity => auras.some(aura => aura.rarity === rarity));
  const weighted = available.map((rarity, index) => ({ rarity, weight: (1 / RARITY_ODDS[rarity]) * Math.pow(luck, index) }));
  let roll = Math.random() * weighted.reduce((sum, item) => sum + item.weight, 0);
  const choice = weighted.find(item => (roll -= item.weight) <= 0)?.rarity ?? "Common";
  const options = auras.filter(a => a.rarity === choice);
  return options[Math.floor(Math.random() * options.length)];
}
