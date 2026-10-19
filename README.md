# DA Web & Media — Portfolio

Your portfolio site. Concept: **Orbit → Timeline**. The orbit dot from your logo is the motion language of the whole site: it's the cursor, the loading head, the playhead, and the point every transition bursts out of.

- **Preloader:** your circle logo; the ring is the loading bar, and the screen collapses into the orbit dot.
- **3D hero:** your DA mark rebuilt from ~14,000 particles (three.js + custom GLSL). The particles part around the cursor, and on scroll the orbit flattens into a video timeline that rides onto the next section.
- **Work:** a pinned horizontal "reel" with WebGL thumbnails (liquid hover, chromatic aberration, scroll bend), filters, and a full-screen project view that opens with a shader wipe.
- **Process:** an edit timeline with a playhead that scrubs as you scroll.
- **Footer:** the mark assembles from particles and the dot finally completes its orbit.

No build tools and no npm. It's plain HTML, CSS and JavaScript, so it runs on GitHub Pages as-is.

---

## 1. What's in the folder

```
index.html            the page (text for About, Services, Process lives here)
data/
  projects.js         ← YOUR PORTFOLIO. Edit this to add/remove projects
  testimonials.js     ← client quotes
  site.js             ← email, social links, contact form, filter order
assets/
  projects/           ← one folder per project (images, videos)
  brand/              your logo (vector + original files), favicon, link-preview image
  fonts/              Unbounded, Manrope, JetBrains Mono (self-hosted)
css/main.css          all styles; colors and sizes are at the top
js/                   the code, one file per feature (well commented)
vendor/               three.js, GSAP, Lenis (bundled, so no CDN needed)
```

---

## 2. Preview it on your computer

The site uses JavaScript modules, which browsers block when you just double-click `index.html`. Run a tiny local server instead. Pick one:

- **VS Code (easiest):** install the free **Live Server** extension, right-click `index.html`, and choose **Open with Live Server**.
- **Node installed:** in this folder run `npx serve` and open the address it prints.
- **Python installed:** in this folder run `python -m http.server 8000` and open http://localhost:8000

---

## 3. Add a project (about 2 minutes)

1. **Make a folder** for it: `assets/projects/my-project-name/`
2. **Drop in your images.** Name the main one `cover.jpg`. Extra images can be `01.jpg`, `02.jpg`, …
   - Use **.jpg** or **.webp**, about **1600 px wide**, ideally **under 400 KB** each (squoosh.app or tinyjpg.com shrink them for free).
   - Thumbnails look best at **16:10** (e.g. 1600×1000).
3. **Open `data/projects.js`**, copy the TEMPLATE block at the bottom, paste it right after the `[` at the top of the list, and fill it in:

```js
  {
    slug: 'my-project-name',              // lowercase-with-dashes, unique
    title: 'Project Title',
    category: 'Web',                       // Web, Video or Graphics (must match data/site.js)
    year: '2026',
    client: 'Client name',                 // optional, '' hides it
    role: 'Design & development',          // optional
    thumbnail: 'assets/projects/my-project-name/cover.jpg',
    images: [
      'assets/projects/my-project-name/01.jpg',
      'assets/projects/my-project-name/02.jpg',
    ],
    video: '',                             // optional, see below
    description: 'One short paragraph.',   // or ['Paragraph one', 'Paragraph two']
    link: 'https://example.com',           // optional "Visit live project" button
  },
```

4. **Save and refresh.** The card, filter counts, detail page and "next project" link all update by themselves.

**Videos:** put a YouTube, Vimeo or Facebook video link in `video`, and it plays inside the project page. You can also use a file (`'assets/projects/my-project-name/reel.mp4'`), but keep files under 25 MB (GitHub's browser-upload limit). For anything longer, use YouTube or Vimeo.

**Remove the samples:** delete the six blocks marked `sample: true` in `data/projects.js` and the six `assets/projects/sample-…` folders.

**Order:** projects appear in the order they're listed. First in the list = first in the reel.

**Common slip:** every `{ … }` block needs a comma after its closing `}`. If the page stops showing projects, check for a missing comma or quote (open the browser console with F12; it points to the line).

---

## 4. Add testimonials

Open `data/testimonials.js`, copy the example inside the `[ ]`, remove the `//` at the start of each line, and edit it. Until there's at least one, the section shows a "Your project could be the first" invitation. To hide the section instead, set `hideTestimonialsWhenEmpty: true` in `data/site.js`.

Only publish real quotes, with the client's permission.

---

## 5. Change text, email, socials and the form

| What | Where |
|---|---|
| Email, Facebook and other social links | `data/site.js` |
| About, Services and Process wording | `index.html` (look for the `EDIT:` comments) |
| Page title, description, link-preview text | top of `index.html` |
| Colors and type sizes | top of `css/main.css` (`:root { … }`) |

**Contact form:** out of the box, "Send message" opens the visitor's email app with the message filled in, addressed to your email. To receive messages without that step, create a free form at **formspree.io**, copy its endpoint (looks like `https://formspree.io/f/abcdwxyz`), and paste it into `formEndpoint` in `data/site.js`.

The About, Services and Process copy is a starting draft written from your Facebook intro. Rewrite it in your own voice, and keep only services you actually offer.

---

## 6. Put it on GitHub (free hosting with GitHub Pages)

### Option A: entirely in the browser (no Git needed)

1. **Create an account** at github.com if you don't have one.
2. **Create a repository:** click **+** (top right) → **New repository**.
   - Name it `da-portfolio`, or name it exactly **`YOUR-USERNAME.github.io`** to get the shorter address `https://YOUR-USERNAME.github.io/`.
   - Set it to **Public**, and leave "Add a README" unticked.
   - Click **Create repository**.
3. **Upload the files:** on the new repository page, click **uploading an existing file** (or **Add file → Upload files**).
   - Open the `da-portfolio` folder on your computer, select **everything inside it** (not the folder itself), and drag it into the upload area. Folders keep their structure in Chrome, Edge and Firefox.
   - Check that `index.html` will sit at the top level, next to the `assets`, `css`, `data`, `js` and `vendor` folders.
   - GitHub accepts up to 100 files per upload and 25 MB per file. This project is about 82 files and under 5 MB, so one upload is enough.
   - Type a message like "First version" and click **Commit changes**.
4. **Turn on GitHub Pages:** go to **Settings → Pages** (in the left sidebar, under "Code, planning, and automation").
   - Under **Build and deployment**, set **Source** to **Deploy from a branch**.
   - Set **Branch** to **main** and the folder to **/(root)**, then click **Save**.
5. **Wait 1–2 minutes** and refresh the Pages settings. Your live address appears at the top, e.g. `https://YOUR-USERNAME.github.io/da-portfolio/`.
6. **Set your real address** so link previews work: in `index.html` and `data/site.js`, replace every `YOUR-GITHUB-USERNAME.github.io/da-portfolio/` with your actual address. Edit them right on GitHub (open the file → pencil icon → **Commit changes**).

### Updating the site later

- **In the browser:** open the file on GitHub → pencil icon → edit → **Commit changes**. To add images, open the project's folder → **Add file → Upload files**.
- **Every commit republishes the site automatically** within a minute or two. If you don't see a change, hard-refresh (Ctrl+Shift+R / Cmd+Shift+R).

### Option B: GitHub Desktop (nicer for frequent updates)

1. Install **GitHub Desktop** (desktop.github.com) and sign in.
2. **File → Add local repository →** choose the `da-portfolio` folder. When asked, click **create a repository** here.
3. Click **Publish repository**, untick "Keep this code private", then publish.
4. Turn on Pages as in step 4 above.
5. From then on: edit files on your computer → GitHub Desktop shows the changes → write a summary → **Commit to main** → **Push origin**.

### Option C: command line

```bash
cd da-portfolio
git init
git add .
git commit -m "First version"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/da-portfolio.git
git push -u origin main
```
Then turn on Pages as in step 4.

### Custom domain (optional)

If you buy a domain (e.g. `dawebandmedia.com`), add it in **Settings → Pages → Custom domain** and follow GitHub's DNS instructions. Then update the URLs in `index.html` and `data/site.js` again.

### Refresh the Facebook link preview

After going live, paste your URL into Facebook's **Sharing Debugger** (developers.facebook.com/tools/debug) and click **Scrape Again**, so the post preview shows your logo image.

---

## 7. Performance and accessibility (already handled)

- **Phones:** about half the particles, a capped pixel ratio, no pinned sections, a stacked gallery and plain images instead of WebGL thumbnails.
- **Reduced motion:** when a visitor's system asks for less motion, the site turns off smooth scrolling, pinning, particle animation, cursor effects and text animations, and uses quick fades.
- **Lazy loading:** three.js is only downloaded when WebGL is available. The gallery's WebGL loads when you approach it. Render loops pause when off screen or in a background tab.
- **No-WebGL fallback:** the flat vector logo shows instead of the particle scene.
- **Keyboard:** skip link, visible focus, Esc closes the project view and menu, and focus stays inside the open project.
- **SEO:** semantic headings, meta description, Open Graph and Twitter cards, structured data (JSON-LD) and a shareable URL for each project (`#/work/slug`).

---

## 8. Troubleshooting

- **Images don't show online but do locally:** GitHub is case-sensitive. `Cover.JPG` and `cover.jpg` are different files. Match the names exactly in `projects.js`.
- **Blank or frozen page:** open the console (F12 → Console). The site prints a clear message, often a typo in `data/projects.js`.
- **Page works online but not when double-clicked:** expected. See section 2.
- **Fonts look plain:** check that `assets/fonts` was uploaded.

---

## Credits and licenses

- three.js r186 (MIT), GSAP 3.15 with ScrollTrigger, SplitText, ScrambleText, Flip, DrawSVG, CustomEase ("Standard No Charge" license), Lenis 1.3.27 (MIT). All are in `/vendor`, unmodified (Lenis was bundled from its official source).
- Fonts: Unbounded, Manrope and JetBrains Mono, all under the SIL Open Font License (see `assets/fonts`).
- Logo: vectorized from your DA Web & Media logo files. Originals are in `assets/brand/original`.
