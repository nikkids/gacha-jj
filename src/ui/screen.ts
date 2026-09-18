/**
 * Keep the game out of the terminal's normal scrollback buffer. Every view
 * is drawn in the alternate buffer and is replaced in place on navigation.
 */
let active = false;

export function enterGameScreen(): void {
  if (!process.stdout.isTTY || active) return;
  active = true;
  process.stdout.write("\x1b[?1049h\x1b[H\x1b[2J\x1b[?25l");
}

export function redraw(content: string): void {
  process.stdout.write("\x1b[H\x1b[2J" + content);
}

export function leaveGameScreen(): void {
  if (!active) return;
  active = false;
  process.stdout.write("\x1b[0m\x1b[?25h\x1b[?1049l");
}
