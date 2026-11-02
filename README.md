# tzehlim.com — איחוד צעהלים

Static website (plain HTML / CSS / JS, no build step), ready for GitHub Pages.

## Put it online (GitHub Pages)

1. **Create a repository** on GitHub (e.g. `tzehlim`), Public.
2. **Upload the files**: open the repo → *Add file* → *Upload files* → drag in **everything inside the `site/` folder**
   (so `index.html`, `CNAME`, `404.html` and the folders sit at the top level of the repo) → *Commit changes*.
3. **Turn on Pages**: *Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save*.
4. **Custom domain**: still in *Settings → Pages*, type `tzehlim.com` under *Custom domain* and Save
   (the `CNAME` file already contains `tzehlim.com`).
5. **DNS** (at the company where tzehlim.com is registered — remove the old Google Sites records first):
   | Type  | Host / Name | Value |
   |-------|-------------|-------|
   | A     | @           | 185.199.108.153 |
   | A     | @           | 185.199.109.153 |
   | A     | @           | 185.199.110.153 |
   | A     | @           | 185.199.111.153 |
   | CNAME | www         | `<your-github-username>.github.io` |
6. Wait for the DNS check to turn green (minutes to a few hours), then tick **Enforce HTTPS**.

## Updating content

Most content updates itself from the Google Sheets / Drive files that the old site already used
(אימעיל'ס, טעקסט מעסעדזשעס, גליונות, לוח השבוע, sign-up list, contact list) — keep updating those sheets as before.
Text pages are plain HTML; edit them on GitHub (pencil icon) and commit.

## Pages

| Address | Page |
|---|---|
| `/` | איחוד צעהלים (home) |
| `/info/` | אינפארמאציע ווינקל |
| `/kol/` | קול צעהלים |
| `/kol/dayan/` | שיעורי הג' הדומ"ץ שליט"א (link to Kol Halashon) |
| `/kol/parsha/` | שיערים על הפרשה |
| `/kol/parsha/5784-bereishis/` … `5784-devarim/`, `5785-bereishis/`, `5785-shemos/` | Drive folders per סדר |
| `/chabura/` | חבורת תורתי – שיעור השבוע (weekly sheet: `/chabura/sheet.html`) |
| `/chabura/parnes/` | פרנס היום |
| `/chabura/donate/` | זייט מנדב (Cardknox) |
| `/notices/emails/` | אימעיל'ס |
| `/notices/messages/` | טעקסט מעסעדזשעס |
| `/notices/signup/` | סיינט אייך אויף |
| `/notices/unsubscribe/` | Unsubscribe |
| `/gilyonos/` | איחוד בלעטל – גליונות |
| `/news/` | מהנעשה והנשמע |
| `/lists/` | Contact List (hidden: not linked anywhere, noindex, blocked in robots.txt) |

Note: `/lists/` is hidden, not password-protected — anyone who knows the address can open it.

## Files

- `assets/style.css` – the whole design (colors at the top: brown `#2d1b0a` / gold `#d4af37`); the phone/tablet layout is the "Mobile pass" section at the bottom
- `assets/site.js` – menu + photo viewer
- `assets/js/*.js` – the Google-Sheets-driven pages (same sheet URLs, form IDs and entry IDs as before)
- `assets/img/` – photos and פרנס היום posters copied from the old Google Site
- `test/site.test.js` – `node --test` checks (links, RTL, data sources)
