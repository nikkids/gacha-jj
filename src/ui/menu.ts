import { box, paint } from "./display";
import { redraw } from "./screen";
export async function choose(title: string, lines: string[], options: string[]): Promise<number> {
  // A menu cannot be played through a pipe; exit cleanly instead of choosing a
  // surprising default action (which could otherwise cause an endless spin loop).
  if (!process.stdin.isTTY || !process.stdout.isTTY) return -1;
  let selected = 0;
  const render = () => { redraw(box(title, [...lines, "", ...options.map((option, index) => `${index === selected ? paint("❯", "1;36") : " "} ${option}`), "", "↑ ↓ to move · Enter to choose"])); };
  return new Promise(resolve => {
    const input = process.stdin; input.setRawMode(true); input.resume(); input.setEncoding("utf8"); render();
    const done = (value: number) => { input.off("data", onKey); input.setRawMode(false); input.pause(); resolve(value); };
    const onKey = (key: string) => { if (key === "\u0003") done(-1); else if (key === "\r" || key === "\n") done(selected); else if (key === "\u001b[A" || key === "k") { selected = (selected + options.length - 1) % options.length; render(); } else if (key === "\u001b[B" || key === "j") { selected = (selected + 1) % options.length; render(); } };
    input.on("data", onKey);
  });
}

/** Wait without redrawing. Used for reveals so their contents stay visible. */
export async function waitForContinue(): Promise<void> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return;
  const input = process.stdin;
  input.setRawMode(true);
  input.resume();
  input.setEncoding("utf8");
  await new Promise<void>(resolve => {
    const onKey = (key: string) => {
      if (key === "\r" || key === "\n" || key === " ") done();
      else if (key === "\u0003") process.emit("SIGINT");
    };
    const done = () => { input.off("data", onKey); input.setRawMode(false); input.pause(); resolve(); };
    input.on("data", onKey);
  });
}
