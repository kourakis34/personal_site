"""Check the home-page "pick my brain" arrow in WebKit (Safari) and Chromium.

Usage:
  npm run build && npx vite preview --port 4173 &
  python3 scripts/check_arrow.py http://localhost:4173/ [screenshot_dir]

Needs: pip install playwright && python3 -m playwright install webkit chromium
Exits non-zero if the arrow is misplaced, overlaps the text/photo, or misbehaves.
"""
import asyncio
import sys

from playwright.async_api import async_playwright

SIZES = [
    (1024, 768), (1280, 800), (1366, 768), (1440, 900), (1440, 620), (1512, 982),
    (1728, 1117), (1920, 1080), (2560, 1440), (900, 900), (820, 1180), (375, 812),
]

PROBE = """() => {
  const R = e => { const x = e.getBoundingClientRect(); return {l:x.left, t:x.top, r:x.right, b:x.bottom}; };
  const svg = document.querySelector('.brain-arrow');
  const body = document.querySelector('.brain-arrow-path');
  const head = document.querySelector('.brain-arrow-head');
  const cs = getComputedStyle(svg);
  return {
    display: cs.display, visibility: cs.visibility, opacity: cs.opacity,
    ready: svg.classList.contains('is-ready'),
    dash: getComputedStyle(body).strokeDasharray,
    body: R(body), head: R(head),
    line: R(document.querySelector('.brain-line')),
    bio: R(document.querySelector('.bio')),
    chat: R(document.querySelector('.chat-console')),
    photo: R(document.querySelector('.photo-frame')),
  };
}"""


def overlaps(a, b, slack=0):
    return a["l"] < b["r"] - slack and a["r"] > b["l"] + slack and a["t"] < b["b"] - slack and a["b"] > b["t"] + slack


def check(info, label):
    errs = []
    if info["display"] == "none":
        return errs  # stacked/mobile layout: intentionally hidden
    if not info["ready"] or info["visibility"] != "visible":
        return errs + [f"{label}: arrow not shown"]
    h, c, b, ln = info["head"], info["chat"], info["body"], info["line"]
    gap = c["l"] - h["r"]
    if not (2 <= gap <= 24):
        errs.append(f"{label}: arrowhead {gap:.0f}px from chat box (want 2-24)")
    mid = (h["t"] + h["b"]) / 2
    if not (c["t"] - 6 <= mid <= c["t"] + 48):
        errs.append(f"{label}: arrowhead y={mid:.0f} not at chat top ({c['t']:.0f})")
    if b["l"] < ln["r"] + 2:
        errs.append(f"{label}: arrow starts inside the text")
    if overlaps(b, info["photo"], slack=2):
        errs.append(f"{label}: arrow crosses the photo")
    if info["dash"] not in ("none", ""):
        errs.append(f"{label}: leftover dash style {info['dash']}")
    return errs


async def run(url, shots):
    errors = []
    async with async_playwright() as p:
        for name, bt in (("webkit", p.webkit), ("chromium", p.chromium)):
            browser = await bt.launch()
            for w, h in SIZES:
                label = f"{name} {w}x{h}"
                page = await browser.new_page(viewport={"width": w, "height": h}, color_scheme="dark")
                await page.goto(url, wait_until="networkidle")
                await page.wait_for_timeout(3200)  # intro + draw-on animation
                info = await page.evaluate(PROBE)
                errs = check(info, label)
                if shots and (w, h) in ((1280, 800), (1440, 620), (1920, 1080)):
                    await page.screenshot(path=f"{shots}/{name}-{w}x{h}.png")
                if info["display"] != "none" and not errs:
                    # Opening the chat hides the arrow; closing brings it back aligned.
                    await page.click(".cc-label")
                    await page.wait_for_timeout(450)
                    if float((await page.evaluate(PROBE))["opacity"]) > 0.05:
                        errs.append(f"{label}: arrow visible while chat is open")
                    await page.keyboard.press("Escape")
                    await page.wait_for_timeout(600)
                    errs += check(await page.evaluate(PROBE), label + " after closing chat")
                    # Resize and make sure it re-aligns.
                    await page.set_viewport_size({"width": w + 160, "height": h})
                    await page.wait_for_timeout(400)
                    errs += check(await page.evaluate(PROBE), label + f" resized to {w + 160}")
                print(("FAIL " if errs else "ok   ") + label)
                errors += errs
                await page.close()
            await browser.close()
    for e in errors:
        print("  -", e)
    return 1 if errors else 0


if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4173/"
    shots = sys.argv[2] if len(sys.argv) > 2 else None
    sys.exit(asyncio.run(run(url, shots)))
