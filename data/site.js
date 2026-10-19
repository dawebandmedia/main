/* ==========================================================================
   SITE SETTINGS  —  edit these values, save, refresh.
   Everything here is plain text inside quotes. Keep the commas at line ends.
   ========================================================================== */

export default {
  name: 'DA Web & Media',
  tagline: 'Website Design • Video Editing • Digital Creative',

  // Where enquiries go. Shown on the contact section and used by the form.
  email: 'dawebanddesign@gmail.com',

  // Your live address once it's on GitHub Pages, e.g. 'https://dawebandmedia.github.io/'
  // (also update the same address in the <head> of index.html for link previews).
  siteUrl: 'https://YOUR-GITHUB-USERNAME.github.io/da-portfolio/',

  // CONTACT FORM
  // Leave empty ('') and the form opens the visitor's email app with the message ready to send.
  // To receive messages without the email app, create a free form at https://formspree.io
  // and paste its endpoint here, e.g. 'https://formspree.io/f/abcdwxyz'
  formEndpoint: '',

  // SOCIAL LINKS — add, remove or reorder. Only links with a url are shown.
  socials: [
    { label: 'Facebook', url: 'https://www.facebook.com/dawebandmedia/' },
    { label: 'Instagram', url: '' },
    { label: 'TikTok', url: '' },
    { label: 'YouTube', url: '' },
    { label: 'LinkedIn', url: '' },
  ],

  // PORTFOLIO FILTERS — the order of the filter buttons above your work.
  // A project's "category" in data/projects.js must match one of these exactly.
  categories: ['Web', 'Video', 'Graphics'],

  // TESTIMONIALS — when data/testimonials.js is empty, the section shows a
  // "your project could be the first" message. Set to true to hide it instead.
  hideTestimonialsWhenEmpty: false,
};
