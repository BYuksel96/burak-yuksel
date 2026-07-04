# Burak OS Revamp Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new Blog.exe post titled "Rebuilding My Portfolio Helped Me Find the Builder In Me Again" with localized Blog.exe summaries and regression coverage.

**Architecture:** The canonical source post is a Markdown file in `src/content/blog`. Blog.exe renders that collection at build time and annotates title, description, and body surfaces with i18n keys based on the Markdown slug, so the new slug also needs entries in all language dictionaries. Tests guard the post structure, key themes, tag keys, translation coverage, and generated route behavior.

**Tech Stack:** Astro content collections, Markdown, vanilla Node tests, existing i18n dictionaries, static Astro build.

---

### Task 1: Add Blog Post Regression Tests

**Files:**
- Modify: `src/scripts/blog-app.test.mjs`
- Modify: `src/scripts/i18n.test.mjs`

- [ ] **Step 1: Add a BlogApp content test**

In `src/scripts/blog-app.test.mjs`, add helpers near the other read helpers:

```js
const readBurakOsRevampPost = () =>
  readFileSync(new URL('../content/blog/burak-os-revamp.md', import.meta.url), 'utf8');
```

Add this test after the date-formatting or deep-link tests:

```js
test('Burak OS revamp post captures the approved builder story', () => {
  const post = readBurakOsRevampPost();

  assert.match(post, /title: "Rebuilding My Portfolio Helped Me Find the Builder In Me Again"/);
  assert.match(post, /canonicalSlug: "rebuilding-my-portfolio-helped-me-find-the-builder-in-me-again"/);
  assert.match(post, /## TL;DR/);
  assert.match(post, /The Portfolio Wasn't Bad\. It Just Felt Flat\./);
  assert.match(post, /Finding the Builder Again/);
  assert.match(post, /What We Built/);
  assert.match(post, /The Funny-Honest Reality of Building With Codex/);
  assert.match(post, /The Role Is Changing/);
  assert.match(post, /Maze\.exe/);
  assert.match(post, /delivery discipline/);
  assert.match(post, /AI builds, but you still steer/);
  assert.doesNotMatch(post, /career break/i);
});
```

- [ ] **Step 2: Add an i18n coverage test**

In `src/scripts/i18n.test.mjs`, update the `translation helper interpolates localized UI copy` test with:

```js
assert.equal(translate('blog.tagsByKey.codex', 'en'), 'Codex');
assert.equal(translate('blog.tagsByKey.portfolio', 'de'), 'Portfolio');
```

In the `content-heavy blog and resume entries have localized session copy` test, add:

```js
const englishRevampPost = getTranslatedBlogPost('burak-os-revamp', 'en');
assert.equal(englishRevampPost.title, 'Rebuilding My Portfolio Helped Me Find the Builder In Me Again');
assert.match(englishRevampPost.bodyHtml, /Burak OS/);
assert.match(englishRevampPost.bodyHtml, /builder/i);

const turkishRevampPost = getTranslatedBlogPost('burak-os-revamp', 'tr');
assert.match(turkishRevampPost.bodyHtml, /Burak OS/);
assert.match(turkishRevampPost.bodyHtml, /Codex/);
```

- [ ] **Step 3: Run failing tests**

Run:

```bash
node --test src/scripts/blog-app.test.mjs src/scripts/i18n.test.mjs
```

Expected: failure because `src/content/blog/burak-os-revamp.md` and the new i18n keys do not exist yet.

### Task 2: Add the Markdown Blog Post

**Files:**
- Create: `src/content/blog/burak-os-revamp.md`

- [ ] **Step 1: Create the post with approved structure**

Create `src/content/blog/burak-os-revamp.md` with this content:

```md
---
title: "Rebuilding My Portfolio Helped Me Find the Builder In Me Again"
description: "How rebuilding my portfolio into Burak OS became a creative experiment in AI-assisted development, delivery discipline and rediscovering the joy of building."
canonicalSlug: "rebuilding-my-portfolio-helped-me-find-the-builder-in-me-again"
pubDate: 2026-07-03
updatedDate: 2026-07-03
tags: ["AI", "Codex", "Vibe Coding", "Portfolio", "Software Development", "Building in Public"]
---

## TL;DR

I rebuilt my portfolio into **Burak OS**, a tiny browser-based operating system built with Codex, because a normal portfolio suddenly felt too flat for the way I wanted to show my work. What started as a creative experiment became a reminder that I still love building. It also taught me something important about AI-assisted development: the tools are powerful, but the magic is not one giant prompt. It is taste, structure, testing, delivery discipline and knowing how to steer.

---

## The Portfolio Wasn't Bad. It Just Felt Flat.

My old portfolio was not bad.

In fact, it was already more creative than a standard "here is my CV, here is my LinkedIn, please hire me" website. It had personality. It did the job. It existed, which is more than I could say for the many imaginary portfolio redesigns I had carried around in my head for years.

But it started to feel flat.

Not broken. Not embarrassing. Just... finished in a way that no longer matched where my head was.

Recently I have been creating different websites, testing different designs, trying out new functionality and using Codex as part of that process. Some of it has been practical. Some of it has been experimental. Some of it has absolutely started with "I wonder if this is possible" and then eaten the next several hours of my life.

So my own website became the obvious playground.

If I was already experimenting with AI-assisted development, different interaction patterns and more playful interfaces, why should my portfolio stay sensible?

Famous last words.

---

## Why An Operating System?

I did not want the site to feel like a page someone scrolls through once and forgets.

I wanted it to feel discoverable. Like someone was opening up a small workspace and poking around inside my brain a little. Not in a creepy way. More in a "this person clearly enjoys making things and has hidden something in the Bin" kind of way.

That was the spark behind **Burak OS**.

Instead of a conventional portfolio structure, everything became an app:

- **Resume.exe** for my career history
- **Blog.exe** for posts and thoughts
- **GitHub.exe** for public projects
- **Downloads** for the CV
- **Bin** for the things you probably should not open, which of course means you absolutely should

It gave the site a clearer metaphor. More importantly, it gave me harder problems to solve.

A normal portfolio asks: "Can you make this look nice?"

Burak OS asked:

- Can this behave like a tiny desktop?
- Can windows open, close, focus and restore properly?
- Can it work on mobile without becoming unusable?
- Can posts open in tabs?
- Can folders drag?
- Can a game hide inside the Bin?
- Can this still be fully static?
- Can Codex help me build all of that without the whole thing turning into soup?

That last question was doing a lot of work.

---

## Finding the Builder Again

Over the last few years, my work moved more and more into delivery, programme leadership and helping teams get complicated things over the line.

I enjoy that world. I like structure. I like untangling ambiguity. I like helping people move from "everything is on fire" to "okay, we have a plan."

But the further I moved into that space, the less time I spent actually building things myself.

That is not a dramatic tragedy. Nobody needs to play sad piano over it. But it is a shift. You can still be technical, still understand systems, still guide teams, and somehow feel that the builder part of you has gone a little quiet.

This project woke that part back up.

Codex lowered the friction of starting. My delivery brain helped keep the work moving. The software engineering part of me came back in through the side door, asking annoying but useful questions:

- What is the smallest working slice?
- How do we know this actually works?
- What happens on mobile?
- What state should persist?
- What should reset?
- What edge case is going to make me regret my choices tomorrow?

It felt like bringing two parts of myself back into the same room.

The builder and the delivery person.

Turns out they get on quite well when they are both pointed at something fun.

---

## What We Built

The funny thing about calling something a "portfolio revamp" is that it sounds small.

This was not small.

It became a little static operating system with apps, folders, games, language support, state management, mobile quirks, accessibility fixes and enough responsive testing to make me question whether pixels are emotionally stable.

Some highlights:

### Resume.exe

The resume stopped being a flat timeline and became a **Career File Explorer**.

Each part of my journey is now a file. You select a file, inspect the details and move through the story more like exploring an archive than reading a traditional CV page.

That felt right. Careers are not just bullet points. They are chapters, decisions, lessons, mistakes, pivots and little moments that make more sense when you can open them up.

### Blog.exe

The blog became an internal browser-style app.

Posts open as tabs. The archive stays available. Sharing still works. Existing blog routes still deep-link into the OS.

This was one of those ideas that sounds simple until you remember tabs need state, focus, close behaviour, canonical URLs, mobile scrolling and all the tiny details that make something feel usable instead of cursed.

### GitHub.exe

GitHub.exe pulls live public repository data from GitHub without tokens, login or iframes.

It shows repo details, languages, stars, update dates and commit counts where GitHub allows it. It also had to handle loading, errors and API limits gracefully, because the internet loves humility.

### Downloads and Bin

Downloads became a real folder with a CV download confirmation.

Bin started as an empty folder, then became something much more fun.

Because obviously the Bin is where you hide the good stuff.

### Maze.exe

This was my favourite part.

I love gaming, and I love the idea of people discovering easter eggs around the site. So we hid a playable 8-bit maze game inside the Bin.

No sensible portfolio strategy document says, "Add a maze game to the rubbish bin."

Which is exactly why I loved it.

Maze.exe became a proper little game: generated levels, collectibles, scoring, monsters, gateways, touch controls, keyboard controls, local high scores and even optional chiptune-style music.

This was the point where the project fully admitted what it was.

Not just a portfolio.

A playground.

### Quiz.exe

Then came Quiz.exe, another hidden Bin app, this time turning Agile and delivery knowledge into a small quiz game.

It has an Arcade mode and a Coach mode, scoring, progress, explanations and question randomisation. Slightly ridiculous? Yes. On brand? Also yes.

### Theme, Lock Screen and Language Support

The OS picked up a light/dark theme toggle, a power-button lock screen, language switching across English, Spanish, French, German and Turkish, and a fair amount of accessibility and focus work.

The language picker even taught us a classic UI lesson: a thing can look visible and still be functionally useless if pointer events are landing somewhere else.

Beautiful. Painful. Educational.

### Responsive Polish

A lot of the work was not glamorous.

It was wrapping long titles. Fixing mobile overflow. Making sure tabs did not squash into nonsense. Checking that share menus stayed inside the screen. Making Resume.exe readable on small phones. Making games playable with touch controls.

Basically: all the stuff that turns "cool demo" into "someone might actually use this without quietly judging me."

---

## The Funny-Honest Reality of Building With Codex

This project made me even more convinced that AI-assisted development is powerful.

It also made me even more convinced that anyone selling it as "just write one perfect prompt and relax" is either exaggerating or has never tried to make a responsive UI behave on a small phone.

Codex helped me move quickly. Very quickly.

But the speed only worked because the work was broken down. Build one slice. Test it. Correct it. Move on. Keep context tight. Keep the goal clear. Do not ask for the entire universe in one prompt and then act shocked when Saturn comes back with a broken navbar.

There were moments where Codex was brilliant.

There were also moments where it needed steering, reminders, sharper constraints or a firm "no, that is not what we agreed."

The biggest lesson was not that AI replaces the builder.

It was that AI changes what building feels like.

AI can generate, refactor, wire up tests, chase edge cases and move through boilerplate at a pace that still feels strange. But someone still has to hold the product in their head. Someone still has to decide what good looks like. Someone still has to notice when the UI technically works but emotionally feels like a cupboard falling over.

AI builds, but you still steer.

That was true in my first vibe coding experiments, and it became even more obvious here.

---

## The Role Is Changing

I do think the developer role is changing.

Maybe people call it AI Engineer. Maybe something else sticks. I am less interested in the label than the shape of the work.

Because this kind of building is not just "write code faster."

It is a blend:

- technical judgement
- delivery discipline
- product thinking
- taste
- testing
- user empathy
- prompt design
- knowing when to zoom in
- knowing when to stop the AI wandering off with confidence

That blend feels familiar to me.

My delivery/programme background helped me structure the work. My software engineering background helped me understand the trade-offs. Codex helped reduce the friction between idea and implementation.

The interesting part was not any one of those things on its own.

It was the combination.

That is what made this project feel different.

---

## What This Project Taught Me

A few lessons I am taking forward:

1. **Start smaller than your ambition.**  
   Big ideas work better when they are delivered in slices.

2. **AI is not a vending machine.**  
   You do not insert prompt, receive finished product and walk away smugly. You guide, review, test and correct.

3. **Delivery discipline still matters.**  
   Especially when the tool can move quickly. Speed without structure just creates faster mess.

4. **Taste matters more, not less.**  
   AI can produce options. It cannot always tell you which option feels right for your site, your voice or your users.

5. **Testing is the seatbelt.**  
   The more Codex helped move fast, the more valuable tests and rendered QA became.

6. **Play is underrated.**  
   The maze game was not necessary. That is exactly why it made the site feel more alive.

7. **I still love building.**  
   That one mattered most.

---

## Go Explore

This revamp reminded me that the builder in me did not disappear.

It was just waiting for the right excuse.

Burak OS became that excuse: a creative, slightly ridiculous, surprisingly technical playground that let me blend delivery discipline, software engineering, AI-assisted development and a bit of gaming-brain chaos into one place.

It is not perfect.

Good.

That means it is alive.

Go explore it. Open the apps. Check the Bin. See what you can find.
```

- [ ] **Step 2: Run the BlogApp test again**

Run:

```bash
node --test src/scripts/blog-app.test.mjs
```

Expected: the new BlogApp post-shape test passes once the file exists; i18n tests may still fail until Task 3.

### Task 3: Add Blog.exe i18n Summaries and Tag Keys

**Files:**
- Modify: `src/scripts/i18n-data-en.js`
- Modify: `src/scripts/i18n-data-es.js`
- Modify: `src/scripts/i18n-data-fr.js`
- Modify: `src/scripts/i18n-data-de.js`
- Modify: `src/scripts/i18n-data-tr.js`

- [ ] **Step 1: Add tag keys to every language dictionary**

Add these keys inside each `blog.tagsByKey` object:

```js
codex: 'Codex',
portfolio: 'Portfolio',
```

For Spanish, French, German, and Turkish, keep `Codex` and `Portfolio` as recognizable product/domain terms.

- [ ] **Step 2: Add the English Blog.exe summary**

Inside `EN_TRANSLATIONS.blog.posts`, add:

```js
'burak-os-revamp': {
  title: 'Rebuilding My Portfolio Helped Me Find the Builder In Me Again',
  description:
    'How rebuilding my portfolio into Burak OS became a creative experiment in AI-assisted development, delivery discipline and rediscovering the joy of building.',
  bodyHtml:
    '<h2>TL;DR</h2><p>I rebuilt my portfolio into Burak OS as a creative Codex experiment, and it helped me reconnect with hands-on building after spending more time in delivery and programme leadership.</p><h2>Why Burak OS?</h2><p>The old portfolio was not bad, but I wanted something more interactive, discoverable and personal: a tiny workspace people could explore instead of a flat CV page.</p><h2>What We Built</h2><p>Resume.exe, Blog.exe, GitHub.exe, Downloads, Bin, Maze.exe, Quiz.exe, theme controls, a lock screen, language support and a lot of responsive polish turned the site into a playful static operating system.</p><h2>What Codex Taught Me</h2><p>AI-assisted development is powerful, but it is not one-shot magic. AI builds, but you still steer with taste, structure, testing and delivery discipline.</p><h2>The Truth</h2><p>This project reminded me that the builder in me did not disappear. It was waiting for the right excuse.</p>',
},
```

- [ ] **Step 3: Add compact translated summaries**

Add matching `burak-os-revamp` entries to ES, FR, DE, and TR dictionaries. Keep them concise, ASCII-safe, and structurally aligned with the English `bodyHtml`.

Spanish:

```js
'burak-os-revamp': {
  title: 'Reconstruir mi portfolio me ayudo a encontrar de nuevo al builder en mi',
  description:
    'Como reconstruir mi portfolio en Burak OS se convirtio en un experimento creativo con AI, disciplina de entrega y el placer de volver a construir.',
  bodyHtml:
    '<h2>TL;DR</h2><p>Reconstrui mi portfolio como Burak OS, un experimento creativo con Codex, y me ayudo a reconectar con construir despues de pasar mas tiempo en entrega y liderazgo de programas.</p><h2>Por que Burak OS?</h2><p>El portfolio anterior no estaba mal, pero queria algo mas interactivo, descubrible y personal: un pequeno espacio de trabajo que la gente pudiera explorar en vez de una pagina plana de CV.</p><h2>Que construimos</h2><p>Resume.exe, Blog.exe, GitHub.exe, Downloads, Bin, Maze.exe, Quiz.exe, temas, pantalla de bloqueo, idiomas y mucho pulido responsive convirtieron el sitio en un sistema operativo estatico y jugueton.</p><h2>Que me enseno Codex</h2><p>El desarrollo asistido por AI es potente, pero no es magia de un solo prompt. AI construye, pero tu sigues dirigiendo con criterio, estructura, pruebas y disciplina de entrega.</p><h2>La verdad</h2><p>Este proyecto me recordo que el builder en mi no habia desaparecido. Solo esperaba la excusa correcta.</p>',
},
```

French:

```js
'burak-os-revamp': {
  title: 'Reconstruire mon portfolio m a aide a retrouver le builder en moi',
  description:
    'Comment reconstruire mon portfolio en Burak OS est devenu une experience creative avec l IA, la discipline de livraison et le plaisir de construire.',
  bodyHtml:
    '<h2>TL;DR</h2><p>J ai reconstruit mon portfolio en Burak OS, une experience creative avec Codex, et cela m a aide a me reconnecter a la construction apres plus de temps passe dans la livraison et le leadership programme.</p><h2>Pourquoi Burak OS?</h2><p>L ancien portfolio n etait pas mauvais, mais je voulais quelque chose de plus interactif, decouvrable et personnel: un petit espace de travail a explorer plutot qu une page de CV plate.</p><h2>Ce que nous avons construit</h2><p>Resume.exe, Blog.exe, GitHub.exe, Downloads, Bin, Maze.exe, Quiz.exe, themes, ecran de verrouillage, langues et beaucoup de polish responsive ont transforme le site en petit systeme d exploitation statique et joueur.</p><h2>Ce que Codex m a appris</h2><p>Le developpement assiste par IA est puissant, mais ce n est pas de la magie en un prompt. L IA construit, mais il faut toujours guider avec gout, structure, tests et discipline de livraison.</p><h2>La verite</h2><p>Ce projet m a rappele que le builder en moi n avait pas disparu. Il attendait seulement la bonne excuse.</p>',
},
```

German:

```js
'burak-os-revamp': {
  title: 'Mein Portfolio neu zu bauen hat den Builder in mir wieder geweckt',
  description:
    'Wie der Umbau meines Portfolios zu Burak OS zu einem kreativen Experiment mit AI, Delivery-Disziplin und der Freude am Bauen wurde.',
  bodyHtml:
    '<h2>TL;DR</h2><p>Ich habe mein Portfolio als Burak OS neu gebaut, ein kreatives Experiment mit Codex, und es hat mich nach mehr Zeit in Delivery und Programmleitung wieder mit dem aktiven Bauen verbunden.</p><h2>Warum Burak OS?</h2><p>Das alte Portfolio war nicht schlecht, aber ich wollte etwas Interaktiveres, Entdeckbareres und Persoenlicheres: einen kleinen Arbeitsbereich zum Erkunden statt einer flachen CV-Seite.</p><h2>Was wir gebaut haben</h2><p>Resume.exe, Blog.exe, GitHub.exe, Downloads, Bin, Maze.exe, Quiz.exe, Themes, Lock Screen, Sprachwechsel und viel Responsive-Polish haben die Seite in ein verspieltes statisches Betriebssystem verwandelt.</p><h2>Was Codex mir beigebracht hat</h2><p>AI-unterstuetzte Entwicklung ist stark, aber keine Ein-Prompt-Magie. AI baut, aber du steuerst weiter mit Geschmack, Struktur, Tests und Delivery-Disziplin.</p><h2>Die Wahrheit</h2><p>Dieses Projekt hat mich daran erinnert, dass der Builder in mir nicht verschwunden war. Er hat nur auf die richtige Ausrede gewartet.</p>',
},
```

Turkish:

```js
'burak-os-revamp': {
  title: 'Portfolyomu yeniden yapmak icimdeki builderi yeniden bulmami sagladi',
  description:
    'Portfolyomu Burak OS haline getirmenin AI destekli gelistirme, teslim disiplini ve yeniden insa etme keyfiyle nasil yaratıcı bir deneye donustugu.',
  bodyHtml:
    '<h2>TL;DR</h2><p>Portfolyomu Codex ile yaratıcı bir deney olarak Burak OS seklinde yeniden yaptim ve teslim/program liderligine daha fazla kaydiktan sonra yeniden insa etmeyle bag kurmami sagladi.</p><h2>Neden Burak OS?</h2><p>Eski portfolio kotu degildi, ama daha etkilesimli, kesfedilebilir ve kisisel bir sey istedim: duz bir CV sayfasi yerine gezilebilen kucuk bir calisma alani.</p><h2>Ne insa ettik</h2><p>Resume.exe, Blog.exe, GitHub.exe, Downloads, Bin, Maze.exe, Quiz.exe, tema kontrolleri, kilit ekrani, dil destegi ve bolca responsive polish siteyi oyuncu bir statik isletim sistemine cevirdi.</p><h2>Codex bana ne ogretti</h2><p>AI destekli gelistirme guclu, ama tek promptluk sihir degil. AI insa eder, ama zevk, yapi, test ve teslim disipliniyle direksiyonda hala sen varsindir.</p><h2>Gercek</h2><p>Bu proje bana icimdeki builderin kaybolmadigini hatirlatti. Sadece dogru bahaneyi bekliyordu.</p>',
},
```

- [ ] **Step 4: Run i18n tests**

Run:

```bash
node --test src/scripts/i18n.test.mjs
```

Expected: all i18n tests pass and `collectMissingTranslationKeys()` remains empty.

### Task 4: Verify Build and Generated Blog Output

**Files:**
- Generated: `dist/`

- [ ] **Step 1: Run focused tests**

Run:

```bash
node --test src/scripts/blog-app.test.mjs src/scripts/i18n.test.mjs
```

Expected: all focused tests pass.

- [ ] **Step 2: Run full script tests**

Run:

```bash
node --test src/scripts/*.test.mjs
```

Expected: all script tests pass.

- [ ] **Step 3: Run production build**

Run:

```bash
env ASTRO_TELEMETRY_DISABLED=1 npm run build
```

Expected: Astro build passes and includes the new blog route for `/blog/rebuilding-my-portfolio-helped-me-find-the-builder-in-me-again/`.

- [ ] **Step 4: Check generated output contains the new post**

Run:

```bash
rg -n "Rebuilding My Portfolio Helped Me Find the Builder In Me Again|burak-os-revamp|Maze.exe|AI builds, but you still steer" dist/index.html dist/blog src/content/blog/burak-os-revamp.md
```

Expected: matches appear in the Markdown source and generated `dist` HTML.

- [ ] **Step 5: Check diff hygiene**

Run:

```bash
git diff --check
```

Expected: no whitespace errors.

### Task 5: Update Handoff Notes

**Files:**
- Modify: `BRAIN.md`

- [ ] **Step 1: Add a running-log note**

Add a new top entry under `## Running Log`:

```md
- 2026-07-03: Burak OS revamp blog post completed. Added `src/content/blog/burak-os-revamp.md` with the approved title `Rebuilding My Portfolio Helped Me Find the Builder In Me Again`, covering the portfolio-to-OS revamp, rediscovering hands-on building, Codex-assisted development, feature highlights, Maze.exe as the favorite easter egg, and the blended delivery/technical builder mindset. Added Blog.exe and i18n regressions plus compact EN/ES/FR/DE/TR Blog.exe summaries and new `codex`/`portfolio` tag labels so language switching does not expose raw translation keys. Verification passed with focused Blog/i18n tests, full `node --test src/scripts/*.test.mjs`, `env ASTRO_TELEMETRY_DISABLED=1 npm run build`, generated-output checks for the new post route/content, and `git diff --check`.
```

- [ ] **Step 2: Re-run diff hygiene**

Run:

```bash
git diff --check
```

Expected: no whitespace errors.
