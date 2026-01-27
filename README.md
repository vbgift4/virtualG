```markdown
# Birthday Website (GitHub Pages)

This is a simple static birthday website ready for GitHub Pages.

Files included:
- index.html
- styles.css
- script.js

Assets required (create an `assets` folder in the repo root and add these files):
- `song.mp3` — the music file you want to play when she taps the homepage.
- `balloons.gif` — animated balloons GIF displayed on the hero.
- `flower1.jpg` ... `flower6.jpg` — six flower images for the Flowers section.

How to publish:
1. Push the repository to GitHub (see instructions in repository root).
2. In the repository settings, enable Pages (use the `main` branch and root `/` directory).
3. Visit the published URL provided by GitHub Pages.

Customization tips:
- Replace the YouTube URLs in `index.html` (playlist items) with your chosen videos by replacing the `data-youtube` attribute values (use embed URLs like `https://www.youtube.com/embed/VIDEO_ID`).
- To change the text of messages, edit `script.js` or the HTML content directly.
- Swap the "B‑Day" logo: replace the `button.logo` content with an `<img src="assets/logo.svg">` and style as needed.

Mobile friendliness:
- The layout is responsive and should work well on phones and desktops. The hero requires a tap (user gesture) to start the audio — this is intentional for mobile browsers.

If you want, I can generate a patch file you can apply (or a zip of all files) — tell me which you prefer.
```
