#!/usr/bin/env node
import { Game } from "./game";
import { stopTrack } from "./audio";
import { closeProfileDashboard } from "./profile-server";
import { loadPlayer, savePlayer } from "./save";
import { enterGameScreen, leaveGameScreen } from "./ui/screen";
let player = loadPlayer();
const restore = () => { if (process.stdin.isTTY) process.stdin.setRawMode(false); stopTrack(); closeProfileDashboard(); leaveGameScreen(); };
process.on("SIGINT", () => { savePlayer(player); restore(); process.exit(0); });
process.on("uncaughtException", error => { restore(); console.error(error); process.exit(1); });
enterGameScreen();
new Game(player).run().then(() => { savePlayer(player); restore(); }).catch(error => { restore(); console.error(error); process.exitCode = 1; });
