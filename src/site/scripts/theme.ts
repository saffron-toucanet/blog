/** Theme toggle: data-theme + localStorage. Target <1KB emitted. */
const K = "theme";

const sys = (): "light" | "dark" =>
  matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const get = (): "light" | "dark" | null => {
  try {
    const v = localStorage.getItem(K);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
};

const now = (): "light" | "dark" => get() ?? sys();

const set = (t: "light" | "dark"): void => {
  try {
    localStorage.setItem(K, t);
  } catch {
    /* ignore */
  }
  document.documentElement.setAttribute("data-theme", t);
};

const label = (btn: HTMLButtonElement): void => {
  const next = now() === "dark" ? "light" : "dark";
  btn.setAttribute("aria-label", `Switch to ${next} theme`);
  btn.textContent = next === "dark" ? "Dark" : "Light";
};

const boot = (): void => {
  const btn = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (!btn) return;
  label(btn);
  btn.addEventListener("click", () => {
    set(now() === "dark" ? "light" : "dark");
    label(btn);
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!get()) label(btn);
  });
};

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", boot)
  : boot();
