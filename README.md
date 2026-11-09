# Inbait

**Your inbox, their bait.** Inbait is a free, hands-on security-awareness trainer that lets you *play the target* of phishing and social-engineering attacks in a safe, fictional sandbox — then shows you exactly what gave each one away.

🔗 **Live site:** https://indocanadian416.github.io/Inbait/

---

## What it is

Inbait looks and feels like a normal mail client, but every message, call, chat, pop-up and text inside it is practice. Some are **bait**, some are **genuine**, and your job is to tell them apart. You get instant, plain-language feedback on every decision.

Unlike a corporate email gateway, Inbait lets people *rehearse the moment of the attack* — including the things that happen after a click, in the browser or on the phone, where filters can't help.

## Why it exists

Most phishing defence is invisible to the person being targeted: a gateway quietly blocks mail, and staff never build the instinct to spot what slips through. Inbait flips that around. It turns spotting scams into something you can practise, repeat and measure — like a flight simulator for your inbox.

It's built for:

- **Employees** building a sharper eye for phishing, vishing, smishing and browser scams.
- **Security and IT teams** who want a friendly, no-login way to run awareness practice.
- **Anyone** who wants to stop getting hooked.

## What you can practise

| Section | What it covers |
|---|---|
| **Inbox** | Email phishing vs. genuine mail — executive/wire fraud, fake MFA resets, malicious attachments, and safe internal notices. |
| **Calls** | Voice phishing (vishing), including **callback phishing** where the scam gets *you* to dial the attacker. |
| **Chat** | Impostor IT helpdesks and normal team collaboration. |
| **Browser** | What happens *after the click*: fake sign-in pages, ClickFix "paste-and-run" traps, OAuth consent phishing, and fake update prompts. |
| **Texts** | Smishing (delivery-fee scams) vs. genuine one-time codes. |
| **Challenge** | A mixed, shuffled test with **no hints until the end** — scored, with a verdict, per-item review and a shareable result. |
| **Hook Radar** | A quick read on scam trends that are circulating now, each linked straight to a lesson and a scenario to practise. |
| **Got Hooked?** | A calm checklist of what to do if you think you fell for something. |

## Safe by design

- **Everything is fictional.** Every brand, person, email, domain and phone number is made up. All links use reserved, non-resolving `.example` domains, and phone numbers use the reserved `555-01xx` range.
- **Nothing is real or clickable.** "Links" in scenarios never navigate anywhere — they only reveal where they *would* go, so you can learn to read a URL.
- **Nothing leaves your device.** There are no accounts and no tracking. Your progress and Hook Score are stored only in your own browser, and you can reset them any time from the About page.
- **Locked-down by default.** A strict Content Security Policy means the page loads only its own files and makes no outside network calls.

## Running it locally

Inbait is a static site — no build step, no dependencies. Serve the `site/` folder with any static web server:

```bash
cd site
python3 -m http.server 8099
```

Then open http://localhost:8099/.

## Tech

Plain HTML, CSS and vanilla JavaScript (ES modules), with a service worker for offline use and a PWA manifest so it can be installed. Scenario content lives in simple JSON files under `site/content/`, so new scenarios can be added without touching the code.

---

Created by Pratik.
