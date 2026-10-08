# Maison Miléora — Café & Pâtisserie

A complete, bilingual (Macedonian / English) presentation website for a fictional premium café
and artisan bakery in Skopje. Built as a university project for a small business /
organisation website, with plain HTML, CSS and JavaScript — no build step, no frameworks,
no internet connection required.

**Open `index.html` in any browser to start.**

---

## 1. Pages

| File | Page |
| --- | --- |
| `index.html` | Home — hero, about preview, signature selection, why choose us, services, team, gallery, blog, testimonials, contact preview |
| `about.html` | About Us — our story, the founders, mission, vision, values, timeline, statistics |
| `menu.html` | Menu — coffee, tea, bakery, cakes & desserts, macarons, cold drinks (with sticky category navigation) |
| `services.html` | Services — dine-in, takeaway, coffee to go, catering, custom cakes, private events |
| `team.html` | Our Team — five team members with photos, roles and biographies |
| `gallery.html` | Gallery — filterable grid, images open in a lightbox |
| `blog.html` | Blog / News — five articles |
| `blog-*.html` | The five full articles, each with related posts |
| `contact.html` | Contact — details, opening hours, contact form, map, social media |
| `reservation.html` | Table reservation form |
| `privacy-policy.html`, `cookie-policy.html`, `terms.html` | Legal pages |
| `404.html` | Custom error page |

Supporting files: `sitemap.xml`, `robots.txt`.

## 2. Folder structure

```
mila project/
├── index.html … 404.html        18 HTML pages
├── sitemap.xml, robots.txt      SEO
├── README.md
└── assets/
    ├── css/
    │   ├── style.css            design system + all components
    │   └── fonts.css            @font-face rules for the self-hosted fonts
    ├── js/
    │   ├── i18n.js              622 Macedonian translation strings
    │   └── main.js              language switching, navigation, lightbox,
    │                            forms, cookie consent, scroll effects
    ├── fonts/                   Cormorant Garamond + Montserrat (woff2,
    │                            Latin + Cyrillic, self-hosted for offline use)
    └── img/                     63 optimised images
```

## 3. How the bilingual system works

* Every translatable element carries `data-i18n="key"`; placeholders use `data-i18n-attr="placeholder:key"`.
* The English text lives in the HTML (so the page is readable and indexable without JavaScript);
  the Macedonian text lives in `assets/js/i18n.js`.
* `МК / EN` in the header switches instantly, updates `<html lang>`, page titles and meta descriptions.
* The choice is stored in `localStorage`, and internal links carry `?lang=mk` — so the language
  also survives navigation when the site is opened directly from a USB stick or folder
  (`file://`), where browsers block `localStorage`.
* You can link straight to a language: `index.html?lang=mk`.

## 4. What works

* Navigation, all internal links, all buttons — no dead links, no empty pages
* Mobile hamburger menu with a full-screen drawer
* Contact form and reservation form with field validation, inline error messages and a
  success confirmation (front-end only — a static site has no server to send mail, so the
  submission is simulated; connect a form service or PHP handler to make it live)
* Gallery filtering by category and a keyboard-accessible lightbox (arrow keys, `Esc`)
* Testimonials slider (auto-rotating, pauses on hover)
* Cookie consent banner with Accept / Reject / Cookie Settings, per-category toggles,
  stored choice, and a "Cookie settings" link in the footer to reopen it
* Sticky menu-category navigation that highlights the section you are reading
* Embedded OpenStreetMap map (needs an internet connection; everything else works offline)

## 5. Design

* **Colours:** cream/ivory background, dark olive `#616236`, pink lace `#efc9e3`,
  gold `#c9b05b`, blush `#fadbe2`, warm beige and dark brown accents
* **Typography:** Cormorant Garamond (serif, headings and logo) + Montserrat (body)
* **Logo:** text logo with a gold monogram frame, in the header, footer and home page
* **Motion:** subtle reveal-on-scroll, image zoom on hover, smooth transitions;
  fully disabled for visitors who prefer reduced motion
* **Responsive:** tested from 360 px phones through tablets to large desktops

## 6. Accessibility & SEO

* Skip-to-content link, visible focus rings, ARIA labels, keyboard-operable menu and lightbox
* Descriptive `alt` text on every image, correct H1 → H2 → H3 hierarchy, high contrast text
* Unique page titles and meta descriptions in both languages, canonical URLs, Open Graph tags
* Structured data (schema.org `CafeOrCoffeeShop` and `BlogPosting`), `sitemap.xml`, `robots.txt`
* Lazy-loaded images with explicit width/height, self-hosted subset fonts, no external JS

## 7. Credits

* Photography: free stock images (Pixabay licence), optimised and cropped for this project.
  The photographs of the founders were supplied by them.
* Fonts: Cormorant Garamond and Montserrat (SIL Open Font License), self-hosted.
* Map: OpenStreetMap contributors.
* Maison Miléora is a fictional business created for this university project. The address,
  phone number, e-mail and reviews are invented.

---

## Македонски

Оваа веб-страница е универзитетски проект: презентациска страница за измислено премиум
кафуле и патисерија „Maison Miléora“ во Скопје. Изработена е со чист HTML, CSS и JavaScript,
без рамки и без потреба од интернет — доволно е да се отвори `index.html`.

Страницата е целосно двојазична (македонски и англиски). Јазикот се менува со копчето
**МК / EN** во заглавието и останува зачуван додека се движите низ страниците.
Директен линк на македонски: `index.html?lang=mk`.

Вклучува: почетна страница, за нас, мени со цени, услуги, тим, галерија со lightbox,
новости со пет статии, контакт со формулар и мапа, резервација на маса, политика за
приватност и колачиња, услови за користење и сопствена 404 страница.
