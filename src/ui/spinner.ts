import { box, paint } from "./display";
import { redraw } from "./screen";

const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));
const rarityTrail = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC", "SECRET"];

/** A short visual ritual. It never affects the random roll that follows. */
export async function playSpinAnimation(): Promise<void> {
  const sigils = ["✧", "✦", "◈", "✺", "✦", "✧"];
  for (let frame = 0; frame < sigils.length; frame++) {
    const previous = rarityTrail[(frame + rarityTrail.length - 1) % rarityTrail.length].toLowerCase();
    const current = paint(`› ${rarityTrail[frame]} ‹`, "1;33");
    const next = rarityTrail[(frame + 1) % rarityTrail.length].toLowerCase();
    const ticker = `${previous}   ${current}   ${next}`;
    redraw(box("♫ GACHA JJ · NOW SPINNING ♫", ["", `                    ${sigils[frame]}`, "", "          Menyelaraskan frekuensi lagu...", "", `  ${ticker}`, "", frame < sigils.length - 1 ? "          Naikkan volumenya..." : "             ✦ REVEAL ✦", ""]));
    await sleep(frame === sigils.length - 1 ? 160 : 105);
  }
}
