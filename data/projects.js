/* ==========================================================================
   YOUR PORTFOLIO  —  every project on the site comes from this one list.

   HOW TO ADD A PROJECT (about 2 minutes)
   1. Create a folder for it:        assets/projects/my-project-name/
   2. Drop its images (and video) in that folder. Use .jpg or .webp,
      about 1600px wide, under ~400 KB each. Name the main one cover.jpg.
   3. Copy the TEMPLATE block at the bottom of this file, paste it at the
      TOP of the list (first = shown first), and fill in the values.
   4. Save, refresh the site. That's it.

   HOW TO REMOVE THE SAMPLES
   Delete the blocks that have  sample: true  and their folders in
   assets/projects/ (the ones whose names start with "sample-").

   FIELD GUIDE
   slug         short unique id, lowercase-with-dashes. Used in the link:
                yoursite.com/#/work/my-project-name
   title        project name shown on the card and detail page
   category     must match one of the filters in data/site.js (Web, Video, Graphics)
   year         e.g. '2026'
   client       optional — leave '' to hide
   role         optional — what you did, e.g. 'Design & development'
   thumbnail    image shown in the gallery (16:10 looks best)
   images       extra images for the detail page, in order. [] for none
   video        optional. Either a file:  'assets/projects/x/reel.mp4'
                or a link from YouTube, Vimeo or Facebook. '' for none
   description  one paragraph in quotes, or several:  ['First…', 'Second…']
   link         optional live website/video link — shows a "Visit" button
   sample       only on the placeholder projects; delete it on real ones
   ========================================================================== */

export default [
  {
    slug: 'orbit-solar-system',
    title: 'ORBIT: Interactive Solar System',
    category: 'Web',
    year: '2026',
    client: 'Personal project',
    role: 'Concept, design & 3D development',
    thumbnail: 'assets/projects/orbit-solar-system/cover.jpg',
    images: [
      'assets/projects/orbit-solar-system/01.jpg',
      'assets/projects/orbit-solar-system/02.jpg',
      'assets/projects/orbit-solar-system/03.jpg',
      'assets/projects/orbit-solar-system/04.jpg',
      'assets/projects/orbit-solar-system/05.jpg',
      'assets/projects/orbit-solar-system/06.jpg',
      'assets/projects/orbit-solar-system/07.jpg',
      'assets/projects/orbit-solar-system/08.jpg',
    ],
    video: '',
    description: [
      'A real-time 3D model of the Solar System that runs right in the browser, no app or download needed. You can fly from the Sun out to Pluto, orbit any planet, follow it along its path, or sit back and take the guided tour.',
      'It is built on real data. Planet positions come from NASA JPL orbital elements, so the sky you see matches the date on screen. Earth spins on real time, the Moon shows its actual phase, and the planets wear NASA surface maps. Each world has its own info panel with live distances and a side-by-side size comparison with Earth.',
      'Extras include time controls to speed up, pause or rewind the years, a telescope view of deep-sky objects like the Andromeda Galaxy and the Orion Nebula, and an optional soundtrack. It works on desktop and mobile. Built with Three.js and WebGL.',
    ],
    link: 'https://dawebandmedia.github.io/solarsystem/',
  },
  {
    slug: 'audrea-cove-resort',
    title: 'Audrea Cove Resort',
    category: 'Web',
    year: '2026',
    client: 'Concept project',
    role: 'Concept, design & full-stack build',
    thumbnail: 'assets/projects/audrea-cove-resort/cover.jpg',
    images: [
      'assets/projects/audrea-cove-resort/01.jpg',
      'assets/projects/audrea-cove-resort/02.jpg',
      'assets/projects/audrea-cove-resort/03.jpg',
      'assets/projects/audrea-cove-resort/04.jpg',
      'assets/projects/audrea-cove-resort/05.jpg',
      'assets/projects/audrea-cove-resort/06.jpg',
      'assets/projects/audrea-cove-resort/07.jpg',
      'assets/projects/audrea-cove-resort/08.jpg',
    ],
    video: '',
    description: [
      'A complete website for a fictional beach resort in Laiya, San Juan, Batangas, built to show what a small Philippine resort can have online: a calm, editorial look in deep teal and cream, a short weekend-escape story from Metro Manila, and three stays to choose from: Garden Terrace Room, Sea View Suite and Cove Pool Villa.',
      'The site walks guests through everything they need to plan the trip: activities, a dining menu, a gallery, directions from Manila and a guest FAQ.',
      'It goes past brochure level. Guests check availability, see weekday and weekend rates, book a room, pay a deposit and print their confirmation. Behind it sits a staff dashboard with bookings, a calendar, a payments ledger, housekeeping, reports and CSV export. The full version runs on Cloudflare Workers with a database. The public demo saves bookings only in your browser, and no real payments are taken.',
    ],
    link: 'https://dawebandmedia.github.io/audreacoveresort/',
  },
  {
    slug: 'sample-brand-website',
    title: 'Café Website',
    category: 'Web',
    year: '2026',
    client: '',
    role: 'Design & development',
    thumbnail: 'assets/projects/sample-brand-website/cover.jpg',
    images: [
      'assets/projects/sample-brand-website/01.jpg',
      'assets/projects/sample-brand-website/02.jpg',
    ],
    video: '',
    description: [
      'This is a sample entry so you can see how a website project looks on your portfolio. Replace it with one of your own builds.',
      'Use this space to tell the story in two or three short paragraphs: what the client needed, what you made, and what changed after launch.',
    ],
    link: '',
    sample: true,
  },
  {
    slug: 'sample-promo-video',
    title: 'Promo Film',
    category: 'Video',
    year: '2026',
    client: '',
    role: 'Edit, color & sound',
    thumbnail: 'assets/projects/sample-promo-video/cover.jpg',
    images: [
      'assets/projects/sample-promo-video/01.jpg',
      'assets/projects/sample-promo-video/02.jpg',
    ],
    video: '',
    description: [
      'Sample video project. Add a YouTube, Vimeo or Facebook link (or an .mp4 file) in the "video" field and it plays right here on the detail page.',
    ],
    link: '',
    sample: true,
  },
  {
    slug: 'sample-brand-identity',
    title: 'Brand Identity',
    category: 'Graphics',
    year: '2026',
    client: '',
    role: 'Logo & brand kit',
    thumbnail: 'assets/projects/sample-brand-identity/cover.jpg',
    images: [
      'assets/projects/sample-brand-identity/01.jpg',
      'assets/projects/sample-brand-identity/02.jpg',
    ],
    video: '',
    description: 'Sample graphics project. Show the logo, colors, type and a few real-world applications of the brand.',
    link: '',
    sample: true,
  },
  {
    slug: 'sample-landing-page',
    title: 'Landing Page',
    category: 'Web',
    year: '2026',
    client: '',
    role: 'UI design & build',
    thumbnail: 'assets/projects/sample-landing-page/cover.jpg',
    images: [
      'assets/projects/sample-landing-page/01.jpg',
      'assets/projects/sample-landing-page/02.jpg',
    ],
    video: '',
    description: 'Sample landing page project. A good place for a before-and-after, or the result the page delivered.',
    link: '',
    sample: true,
  },
  {
    slug: 'sample-social-reels',
    title: 'Social Reels',
    category: 'Video',
    year: '2026',
    client: '',
    role: 'Short-form editing',
    thumbnail: 'assets/projects/sample-social-reels/cover.jpg',
    images: [
      'assets/projects/sample-social-reels/01.jpg',
      'assets/projects/sample-social-reels/02.jpg',
    ],
    video: '',
    description: 'Sample short-form video project for reels and stories.',
    link: '',
    sample: true,
  },
  {
    slug: 'sample-social-kit',
    title: 'Social Media Kit',
    category: 'Graphics',
    year: '2026',
    client: '',
    role: 'Templates & post design',
    thumbnail: 'assets/projects/sample-social-kit/cover.jpg',
    images: [
      'assets/projects/sample-social-kit/01.jpg',
      'assets/projects/sample-social-kit/02.jpg',
    ],
    video: '',
    description: 'Sample graphics project: a set of social post templates in one consistent style.',
    link: '',
    sample: true,
  },
];

/* --------------------------------------------------------------------------
   TEMPLATE — copy everything between the dashed lines (including the { } and
   the comma), paste it right after the  [  near the top, then edit it.
   --------------------------------------------------------------------------
  {
    slug: 'my-project-name',
    title: 'Project Title',
    category: 'Web',
    year: '2026',
    client: 'Client name',
    role: 'What you did',
    thumbnail: 'assets/projects/my-project-name/cover.jpg',
    images: [
      'assets/projects/my-project-name/01.jpg',
      'assets/projects/my-project-name/02.jpg',
    ],
    video: '',
    description: 'One short paragraph about the project.',
    link: 'https://example.com',
  },
   -------------------------------------------------------------------------- */
