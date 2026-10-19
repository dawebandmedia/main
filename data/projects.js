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
