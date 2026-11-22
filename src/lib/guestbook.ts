// The guestbook is a fixed book: PAGES pages of LINES_PER_PAGE lines. A message starts on any free
// line: up to MAX_NOTE_LINES lines of note, then one line with the signature ("— Mia, Norway") and the
// date. It needs that many free lines in a row. Lines are split by character count (not by the
// browser), so a message takes the same lines on every screen. Later the server uses the same functions
// to check that a message fits where it was signed.

export const PAGES = 8;
export const LINES_PER_PAGE = 24;
export const CHARS_PER_LINE = 44;
export const MAX_NOTE_LINES = 3;
/** Note lines plus the signature line. */
export const MAX_LINES = MAX_NOTE_LINES + 1;
/** Characters the signature may use; the rest of its line holds the date. */
export const SIGNATURE_CHARS = 32;

/** The signature line's text, shortened with "…" if the name and country don't fit. */
export function signatureOf(name: string, country?: string): string {
  const sig = `— ${name.trim()}${country ? `, ${country}` : ""}`;
  return sig.length > SIGNATURE_CHARS ? `${sig.slice(0, SIGNATURE_CHARS - 1).trimEnd()}…` : sig;
}

/** Splits a note into lines of at most `width` characters. Words move to the next line whole; a word
 * longer than a line is cut. */
export function wrap(note: string, width = CHARS_PER_LINE): string[] {
  const words = note.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    for (let i = 0; i < word.length; i += width) {
      const piece = word.slice(i, i + width);
      if (line && line.length + 1 + piece.length > width) {
        lines.push(line);
        line = piece;
      } else {
        line = line ? `${line} ${piece}` : piece;
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
/** The date stamp beside a signature: "21 NOV 2026". Takes a Date or "2026-11-21". */
export function stampOf(date: Date | string): string {
  const [y, m, d] =
    typeof date === "string" ? date.split("-").map(Number) : [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** How many lines from `line` on are free (stops at a taken line, the page end, or MAX_LINES). */
export function roomAt(taken: boolean[], line: number): number {
  let room = 0;
  while (room < MAX_LINES && line + room < taken.length && !taken[line + room]) room++;
  return room;
}

/**
 * An illegible scribble standing in for a message that isn't approved yet: a wavy pen line about as
 * long as the text would be. An SVG path for a viewBox of CHARS_PER_LINE * 9 by 26.
 */
export function scribble(chars: number, seed: number): string {
  let s = (seed % 2147483646) + 1;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const width = Math.min(chars, CHARS_PER_LINE) * 8.6;
  let d = `M0 ${(12 + rnd() * 4).toFixed(1)}`;
  for (let x = 0; x < width; ) {
    const step = 5 + rnd() * 6;
    d += ` Q${(x + step / 2).toFixed(1)} ${(2 + rnd() * 22).toFixed(1)} ${(x + step).toFixed(1)} ${(8 + rnd() * 10).toFixed(1)}`;
    x += step;
  }
  return d;
}
