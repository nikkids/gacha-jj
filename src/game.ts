import { auras } from "./data/auras";
import { duplicateGold, explorationGold } from "./economy";
import { playTrack, stopTrack, ensureMusicDirectory, musicDirectory, openMusicDirectory } from "./audio";
import { Player } from "./models";
import { openProfileDashboard } from "./profile-server";
import { luckMultiplier, rollAura } from "./rng";
import { savePlayer } from "./save";
import { auraReveal } from "./ui/display";
import { choose, waitForContinue } from "./ui/menu";
import { redraw } from "./ui/screen";
import { playSpinAnimation } from "./ui/spinner";

export class Game {
  constructor(private player: Player) { ensureMusicDirectory(); }
  private save() { savePlayer(this.player); }
  async run(): Promise<void> {
    while (true) {
      const choice = await choose("♫ GACHA JJ ♫", [`Gold: ${this.player.gold}  ·  Luck: ${luckMultiplier(this.player.luckLevel).toFixed(2)}x  ·  Spins: ${this.player.totalSpins}`, "", "Gacha lagu JJ Indo. Koleksi track, cari rarity tinggi.", "Audio bawaan diputar otomatis saat track didapat."], ["✨ Spin Track", "👤 Profile & Collection", "🎵 Buka folder MP3", "Exit"]);
      if (choice < 0 || choice === 3) return;
      if (choice === 0) await this.spin(); else if (choice === 1) await this.profile(); else await this.musicFolder();
    }
  }
  private async spin(): Promise<void> {
    await playSpinAnimation();
    const track = rollAura(this.player); const fresh = !this.player.discovered.includes(track.id); const duplicate = fresh ? 0 : duplicateGold[track.rarity];
    this.player.totalSpins++; this.player.rarityFinds[track.rarity]++; this.player.gold += explorationGold + duplicate;
    if (fresh) this.player.discovered.push(track.id); this.save();
    const hasAudio = playTrack(track);
    redraw(auraReveal(track, fresh, duplicate, hasAudio) + "\n"); await waitForContinue(); stopTrack();
  }
  private async profile(): Promise<void> {
    const url = await openProfileDashboard(() => this.player, () => this.save());
    await choose("PROFILE DASHBOARD", ["Dashboard profilmu sudah dibuka di browser.", url, "", `${this.player.discovered.length} / ${auras.length} track ditemukan.`, "Refresh browser setelah spin untuk data terbaru."], ["Return to Gacha JJ"]);
  }
  private async musicFolder(): Promise<void> { openMusicDirectory(); await choose("FOLDER MP3 LOKAL", ["Folder override sudah dibuka di file manager:", musicDirectory(), "", "Audio bawaan paket sudah langsung aktif.", "Masukkan MP3 di sini hanya bila ingin mengganti audio bawaan."], ["Return to Gacha JJ"]); }
}
