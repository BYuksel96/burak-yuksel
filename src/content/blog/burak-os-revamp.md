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
