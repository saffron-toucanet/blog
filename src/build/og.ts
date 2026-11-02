import { SITE_DESCRIPTION, SITE_TITLE } from "./config.ts";
import { escapeXml } from "./xml.ts";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

function wrapLines(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [SITE_TITLE];

  const lines: string[] = [];
  let current = "";
  let wordIndex = 0;

  while (wordIndex < words.length && lines.length < maxLines) {
    const word = words[wordIndex]!;
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      wordIndex += 1;
      continue;
    }
    if (current) {
      lines.push(current);
      current = "";
      continue;
    }
    lines.push(`${word.slice(0, Math.max(1, maxChars - 1))}…`);
    wordIndex += 1;
    current = "";
  }
  if (current && lines.length < maxLines) lines.push(current);

  if (wordIndex < words.length && lines.length > 0) {
    const last = lines[lines.length - 1]!;
    const trimmed = last.replace(/\s+\S*$/, "").replace(/[.,;:]$/, "");
    lines[lines.length - 1] =
      trimmed.length > 0 ? `${trimmed}…` : `${last.slice(0, Math.max(1, maxChars - 1))}…`;
  }

  return lines.slice(0, maxLines);
}

function titleFontSize(lines: number): number {
  if (lines >= 3) return 56;
  if (lines === 2) return 68;
  return 84;
}

/** Brand card used for home, tags, and 404. */
export function renderDefaultOgSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" role="img" aria-labelledby="title">
  <title id="title">${escapeXml(`${SITE_TITLE} — ${SITE_DESCRIPTION}`)}</title>
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d5dbe6"/>
      <stop offset="42%" stop-color="#e9ecf1"/>
      <stop offset="100%" stop-color="#e6e9f0"/>
    </linearGradient>
  </defs>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#paper)"/>
  <circle cx="1020" cy="-60" r="340" fill="#c8d0dc" opacity="0.55"/>
  <circle cx="-40" cy="560" r="220" fill="#c5cbd6" opacity="0.35"/>
  <text x="96" y="250" font-family="Georgia, 'Times New Roman', serif" font-size="104" font-weight="700" fill="#1a1d22">${escapeXml(SITE_TITLE)}</text>
  <text x="96" y="330" font-family="system-ui, -apple-system, sans-serif" font-size="40" fill="#4a515c">${escapeXml(SITE_DESCRIPTION)}</text>
  <rect x="96" y="390" width="140" height="18" rx="3" fill="#1c4d89"/>
  <text x="96" y="540" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#4a515c">blog.doxiebytes.com</text>
</svg>
`;
}

/** Per-post Open Graph card with title + brand. */
export function renderPostOgSvg(input: {
  title: string;
  description?: string;
  date?: string;
}): string {
  const lines = wrapLines(input.title, 26, 3);
  const size = titleFontSize(lines.length);
  const startY = lines.length === 1 ? 280 : lines.length === 2 ? 250 : 230;
  const titleTspans = lines
    .map((line, i) => {
      const y = startY + i * (size + 12);
      return `<tspan x="96" y="${y}">${escapeXml(line)}</tspan>`;
    })
    .join("");
  const desc = (input.description ?? "").trim();
  const descLine =
    desc.length > 0
      ? escapeXml(desc.length > 90 ? `${desc.slice(0, 87).trimEnd()}…` : desc)
      : escapeXml(SITE_DESCRIPTION);
  const meta = [input.date, SITE_TITLE].filter(Boolean).join(" · ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" role="img" aria-labelledby="title">
  <title id="title">${escapeXml(`${input.title} · ${SITE_TITLE}`)}</title>
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#dde2ea"/>
      <stop offset="55%" stop-color="#e9ecf1"/>
      <stop offset="100%" stop-color="#e6e9f0"/>
    </linearGradient>
  </defs>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#paper)"/>
  <circle cx="1080" cy="80" r="280" fill="#c8d0dc" opacity="0.45"/>
  <text x="96" y="120" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" letter-spacing="0.04em" fill="#1c4d89">${escapeXml(SITE_TITLE.toUpperCase())}</text>
  <text font-family="Georgia, 'Times New Roman', serif" font-size="${size}" font-weight="700" fill="#1a1d22">${titleTspans}</text>
  <text x="96" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="30" fill="#4a515c">${descLine}</text>
  <rect x="96" y="520" width="96" height="10" rx="2" fill="#1c4d89"/>
  <text x="96" y="570" font-family="system-ui, -apple-system, sans-serif" font-size="26" fill="#4a515c">${escapeXml(meta)}</text>
</svg>
`;
}

export const OG_IMAGE_SIZE = { width: OG_WIDTH, height: OG_HEIGHT } as const;

export function postOgPath(slug: string): string {
  return `/images/og/${slug}.svg`;
}
