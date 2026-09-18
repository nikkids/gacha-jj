import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Player, Rarity } from "./models";
const rarityFinds = (): Record<Rarity, number> => ({ Common: 0, Uncommon: 0, Rare: 0, Epic: 0, Legendary: 0, Mythic: 0, Secret: 0 });
export const freshPlayer = (): Player => ({ gameMode: "jj-rng", discovered: [], gold: 0, luckLevel: 1, totalSpins: 0, rarityFinds: rarityFinds() });
// The override is useful for automated tests; players never need to set it.
export const dataDir = () => process.env.GACHA_JJ_DATA_DIR || process.env.NIKKI_REALMS_DATA_DIR || (process.platform === "darwin" ? path.join(os.homedir(), "Library", "Application Support", "gacha-jj") : path.join(process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share"), "gacha-jj"));
const savePath = () => path.join(dataDir(), "save.json");
export function loadPlayer(): Player {
  try { const saved = JSON.parse(fs.readFileSync(savePath(), "utf8")); if (saved.gameMode !== "jj-rng") return freshPlayer(); return { ...freshPlayer(), ...saved, rarityFinds: { ...rarityFinds(), ...saved.rarityFinds } }; }
  catch (error: unknown) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") { try { fs.mkdirSync(dataDir(), { recursive: true }); fs.renameSync(savePath(), `${savePath()}.corrupt-${Date.now()}`); } catch { /* a fresh save is still safe */ } } return freshPlayer(); }
}
export function savePlayer(player: Player): void {
  try { fs.mkdirSync(dataDir(), { recursive: true }); const temp = `${savePath()}.tmp`; fs.writeFileSync(temp, JSON.stringify(player, null, 2), "utf8"); fs.renameSync(temp, savePath()); }
  catch { /* A read-only home directory should never make the game unplayable. */ }
}
