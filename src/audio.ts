import fs from "node:fs";
import path from "node:path";
import { ChildProcess, spawn } from "node:child_process";
import { Aura } from "./models";
import { dataDir } from "./save";

export const musicDirectory = () => path.join(dataDir(), "music");
const bundledMusicDirectory = () => path.resolve(__dirname, "..", "music");
export function ensureMusicDirectory(): string { try { fs.mkdirSync(musicDirectory(), { recursive: true }); } catch { /* The game still works without optional local audio. */ } return musicDirectory(); }
export function trackFile(track: Aura): string | undefined {
  ensureMusicDirectory();
  const localFile = path.join(musicDirectory(), track.audioFile);
  if (fs.existsSync(localFile)) return localFile;
  const bundledFile = path.join(bundledMusicDirectory(), track.audioFile);
  return fs.existsSync(bundledFile) ? bundledFile : undefined;
}

export function openMusicDirectory(): void {
  const folder = ensureMusicDirectory();
  const [command, args]: [string, string[]] = process.platform === "darwin" ? ["open", [folder]] : process.platform === "linux" ? ["xdg-open", [folder]] : ["explorer", [folder]];
  const child = spawn(command, args, { detached: true, stdio: "ignore" });
  child.on("error", () => undefined); child.unref();
}

let activePlayer: ChildProcess | undefined;

/** Stops the currently playing gacha track, if the platform player supports it. */
export function stopTrack(): void {
  if (!activePlayer) return;
  activePlayer.kill();
  activePlayer = undefined;
}

/** Best-effort local MP3 playback. Missing players/files fail silently. */
export function playTrack(track: Aura): boolean {
  const file = trackFile(track);
  if (!file) return false;
  stopTrack();
  const [command, args]: [string, string[]] = process.platform === "darwin" ? ["afplay", [file]] : process.platform === "linux" ? ["xdg-open", [file]] : ["cmd", ["/c", "start", "", file]];
  const child = spawn(command, args, { stdio: "ignore" });
  activePlayer = child;
  child.on("error", () => { if (activePlayer === child) activePlayer = undefined; });
  child.on("exit", () => { if (activePlayer === child) activePlayer = undefined; });
  child.unref();
  return true;
}
