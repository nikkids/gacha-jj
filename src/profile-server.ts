import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { auras } from "./data/auras";
import { upgradeCosts } from "./economy";
import { Player } from "./models";
import { luckMultiplier } from "./rng";
import { trackFile } from "./audio";

let server: http.Server | undefined;
let dashboardUrl: string | undefined;

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] as string);
const rarityClass = (rarity: string) => rarity.toLowerCase();

function dashboard(player: Player): string {
  const rarePlus = ["Rare", "Epic", "Legendary", "Mythic", "Secret"].reduce((sum, rarity) => sum + player.rarityFinds[rarity as keyof typeof player.rarityFinds], 0);
  const nextLevel = player.luckLevel + 1;
  const upgradeCost = upgradeCosts[nextLevel];
  const canUpgrade = nextLevel <= 4 && player.gold >= upgradeCost;
  const cards = auras.map(aura => {
    const found = player.discovered.includes(aura.id);
    const playButton = found ? `<button class="play" type="button" onclick="toggleTrack(this, '/audio/${aura.id}')">▶ Play</button>` : "";
    return `<article class="aura ${found ? rarityClass(aura.rarity) : "hidden"}"><div class="symbol">${found ? aura.visualSymbol : "?"}</div><div><strong>${found ? escapeHtml(aura.name) : aura.rarity === "Secret" ? "████████" : "Undiscovered"}</strong><small>${found ? aura.rarity : aura.rarity === "Secret" ? "???" : aura.rarity}</small>${playButton}</div></article>`;
  }).join("");
  const upgrade = nextLevel <= 4 ? `<form action="/upgrade" method="post"><button ${canUpgrade ? "" : "disabled"}>Upgrade Luck ke ${luckMultiplier(nextLevel).toFixed(2)}× · ${upgradeCost} Gold</button><small>${canUpgrade ? "Luck meningkatkan peluang Aura langka, tanpa menjamin drop." : `Butuh ${Math.max(0, upgradeCost - player.gold)} Gold lagi.`}</small></form>` : "<small>Luck sudah mencapai level maksimum MVP.</small>";
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gacha JJ — Profile</title><style>
  :root{color-scheme:dark;--ink:#f6f1df;--muted:#a8aa9f;--panel:#18221e;--line:#42564a;--accent:#f0bb54}*{box-sizing:border-box}body{margin:0;min-height:100vh;color:var(--ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:radial-gradient(circle at 18% 0,#355348,transparent 38%),linear-gradient(135deg,#0e1513,#202a24)}main{max-width:1040px;margin:auto;padding:42px 24px 70px}.eyebrow{color:var(--accent);letter-spacing:.16em;font-size:.75rem}h1{font-family:Georgia,serif;font-size:clamp(2.2rem,7vw,4.4rem);margin:.25rem 0}.sub{color:var(--muted);max-width:650px;line-height:1.6}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:32px 0}.stat,.collection{border:1px solid var(--line);background:color-mix(in srgb,var(--panel) 90%,transparent);border-radius:12px;padding:18px}.stat span{display:block;color:var(--muted);font-size:.72rem;text-transform:uppercase;letter-spacing:.08em}.stat b{display:block;font-size:1.55rem;margin-top:7px;color:var(--accent)}h2{font-family:Georgia,serif;font-size:1.8rem;margin:0 0 6px}.collection>p{color:var(--muted);margin-top:0}.auras{display:grid;grid-template-columns:repeat(auto-fit,minmax(205px,1fr));gap:10px}.aura{display:flex;align-items:center;gap:13px;padding:13px;border-left:3px solid #aaa;background:#111914;border-radius:7px}.aura .symbol{font-size:1.5rem;width:28px;text-align:center}.aura strong,.aura small{display:block}.aura small{margin-top:3px;color:var(--muted);font-size:.72rem}.uncommon{border-color:#63c174}.rare{border-color:#6099ef}.epic{border-color:#bd78e8}.legendary{border-color:#e7b94f}.mythic{border-color:#50d6d8}.secret{border-color:#ee6f70}.hidden{opacity:.43;border-color:#555}form{margin-top:13px}button{display:block;border:0;border-radius:7px;background:var(--accent);color:#1b1810;padding:10px 13px;font:inherit;font-weight:bold;cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}.play{margin-top:9px;padding:5px 8px;font-size:.75rem;background:#d8e9df}form small{margin-top:8px}@media(max-width:650px){main{padding:28px 16px}.grid{grid-template-columns:repeat(2,1fr)}}</style></head><body><main><div class="eyebrow">LOCAL PLAYER PROFILE · GACHA JJ</div><h1>Penjelajah Beat</h1><p class="sub">Dashboard ini hanya berjalan di perangkatmu. Kembali ke terminal untuk spin, lalu refresh halaman ini untuk melihat koleksi terbaru.</p><section class="grid"><div class="stat"><span>Track ditemukan</span><b>${player.discovered.length} / ${auras.length}</b></div><div class="stat"><span>Total spin</span><b>${player.totalSpins.toLocaleString("id-ID")}</b></div><div class="stat"><span>Rare+ ditemukan</span><b>${rarePlus.toLocaleString("id-ID")}</b></div><div class="stat"><span>Luck · Gold</span><b>${luckMultiplier(player.luckLevel).toFixed(2)}× · ${player.gold}</b>${upgrade}</div></section><section class="collection"><h2>Koleksi Track</h2><p>Track ditemukan dapat diputar atau dihentikan dengan tombol yang sama.</p><div class="auras">${cards}</div></section></main><script>let jjAudio;let jjButton;function toggleTrack(button,url){if(jjAudio&&!jjAudio.paused&&jjAudio.src.endsWith(url)){jjAudio.pause();jjAudio.currentTime=0;button.textContent='▶ Play';return}if(jjAudio){jjAudio.pause();jjAudio.currentTime=0}if(jjButton)jjButton.textContent='▶ Play';jjAudio=new Audio(url);jjButton=button;jjAudio.play();button.textContent='■ Stop';jjAudio.onended=()=>{button.textContent='▶ Play'}};</script></body></html>`;
}

function openBrowser(url: string): void {
  const [file, args]: [string, string[]] = process.platform === "darwin" ? ["open", [url]] : process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : ["xdg-open", [url]];
  const child = spawn(file, args, { detached: true, stdio: "ignore" });
  child.unref();
}

/** Starts one localhost-only dashboard and opens it in the user's browser. */
export async function openProfileDashboard(getPlayer: () => Player, save: () => void): Promise<string> {
  if (!server) {
    server = http.createServer((request, response) => {
      const url = new URL(request.url || "/", "http://127.0.0.1");
      if (request.method === "GET" && url.pathname.startsWith("/audio/")) {
        const id = decodeURIComponent(url.pathname.slice("/audio/".length));
        const track = auras.find(aura => aura.id === id);
        if (!track || !getPlayer().discovered.includes(track.id)) { response.writeHead(404); response.end("Track not found"); return; }
        const file = trackFile(track);
        if (!file) { response.writeHead(404); response.end("MP3 not found"); return; }
        response.writeHead(200, { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" });
        fs.createReadStream(file).on("error", () => response.destroy()).pipe(response); return;
      }
      if (request.method === "POST" && request.url === "/upgrade") {
        const player = getPlayer(); const target = player.luckLevel + 1; const cost = upgradeCosts[target];
        if (target <= 4 && player.gold >= cost) { player.gold -= cost; player.luckLevel = target; save(); }
        response.writeHead(303, { Location: "/" }); response.end(); return;
      }
      if (request.url !== "/" && request.url !== "/index.html") { response.writeHead(404); response.end("Not found"); return; }
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      response.end(dashboard(getPlayer()));
    });
    await new Promise<void>((resolve, reject) => {
      server!.once("error", reject);
      server!.listen(0, "127.0.0.1", () => { server!.off("error", reject); resolve(); });
    });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Unable to start local profile server.");
    dashboardUrl = `http://127.0.0.1:${address.port}`;
    server.unref();
  }
  openBrowser(dashboardUrl!);
  return dashboardUrl!;
}

export function closeProfileDashboard(): void { server?.close(); server = undefined; dashboardUrl = undefined; }
