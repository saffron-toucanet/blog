const K = "theme";

type Theme = "light" | "dark";
type Mode = Theme | "system";

const sys = (): Theme =>
  matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const stored = (): Theme | null => {
  try {
    const v = localStorage.getItem(K);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
};

const mode = (): Mode => stored() ?? "system";

const effective = (): Theme => stored() ?? sys();

const apply = (next: Mode): void => {
  try {
    if (next === "system") localStorage.removeItem(K);
    else localStorage.setItem(K, next);
  } catch {
    /* ignore */
  }
  if (next === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", next);
  }
};

const cycle = (current: Mode): Mode =>
  current === "system" ? "light" : current === "light" ? "dark" : "system";

const sync = (btn: HTMLButtonElement): void => {
  const current = mode();
  const eff = effective();
  const label =
    current === "system" ? "System" : current === "dark" ? "Dark" : "Light";
  btn.textContent = label;
  btn.setAttribute(
    "aria-label",
    current === "system"
      ? `Theme: system (${eff}). Click for light.`
      : current === "light"
        ? "Theme: light. Click for dark."
        : "Theme: dark. Click to follow system.",
  );
  btn.setAttribute("aria-pressed", eff === "dark" ? "true" : "false");
};

const boot = (): void => {
  const btn = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (!btn) return;
  sync(btn);
  btn.addEventListener("click", () => {
    apply(cycle(mode()));
    sync(btn);
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (mode() === "system") sync(btn);
  });
};

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", boot)
  : boot();
