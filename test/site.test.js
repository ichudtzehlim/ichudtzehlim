// Static checks for the tzehlim.com site: run with `node --test` from the project folder.
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const SITE = path.join(__dirname, '..', 'site');

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const files = walk(SITE);
const htmls = files.filter(f => f.endsWith('.html'));
const read = f => fs.readFileSync(f, 'utf8');

test('GitHub Pages essentials exist', () => {
  for (const f of ['index.html', '404.html', 'CNAME', 'favicon.ico', 'robots.txt', 'assets/style.css', 'assets/logo.png'])
    assert.ok(fs.existsSync(path.join(SITE, f)), f + ' missing');
  assert.strictEqual(read(path.join(SITE, 'CNAME')).trim(), 'tzehlim.com');
  assert.match(read(path.join(SITE, 'robots.txt')), /Disallow: \/lists/);
});

test('all file and folder names are ASCII', () => {
  for (const f of files) assert.ok(/^[\x20-\x7e]+$/.test(path.relative(SITE, f)), 'non-ASCII path: ' + f);
});

test('every page is RTL Yiddish (except the English admin list), has a title and viewport', () => {
  for (const f of htmls) {
    const s = read(f), rel = path.relative(SITE, f);
    assert.match(s, /<meta name="viewport" content="width=device-width, initial-scale=1/, rel);
    assert.match(s, /<title>[^<]{3,}<\/title>/, rel);
    if (rel === 'lists/index.html') { assert.match(s, /noindex,nofollow/); continue; }
    if (rel === 'chabura/sheet.html') continue;
    assert.match(s, /<html lang="yi" dir="rtl">/, rel);
  }
});

test('local links and assets resolve', () => {
  const bad = [];
  for (const f of htmls) {
    const s = read(f), rel = path.relative(SITE, f);
    for (const m of s.matchAll(/(?:href|src)="([^"#?]*)(?:[#?][^"]*)?"/g)) {
      const u = m[1];
      if (!u || /^(https?:|mailto:|tel:|sms:|data:|javascript:)/.test(u)) continue;
      if (rel === '404.html' && u.startsWith('/')) { const t = path.join(SITE, u); if (!fs.existsSync(t) && !fs.existsSync(path.join(t, 'index.html'))) bad.push(rel + ' -> ' + u); continue; }
      let t = path.resolve(path.dirname(f), u);
      if (u.endsWith('/') || fs.existsSync(t) && fs.statSync(t).isDirectory()) t = path.join(t, 'index.html');
      if (!fs.existsSync(t)) bad.push(rel + ' -> ' + u);
    }
  }
  assert.deepStrictEqual(bad, []);
});

test('core content carried over from the old site', () => {
  const home = read(path.join(SITE, 'index.html'));
  for (const t of ["פארן 'איחוד בלעטל' דריקט דא", 'חבורת תורתי', 'מהנעשה והנשמע', 'קול צעהלים', 'אינפארמאציע ווינקל', 'צו באקומען אלע מודעות אויף אימעיל דריקט דא', 'tel:+17183161781', 'tel:+17166234793', '1gsh5iuPRANfYB0uEblU9LbT8AV1x3Ieg'])
    assert.ok(home.includes(t), 'home missing ' + t);
  const info = read(path.join(SITE, 'info/index.html'));
  for (const t of ['ichudtzehlim@gmail.com', '133 Rodney St', '02.313.6091', '1.917.710.4852', '1400 Wellwood Ave', '559 Bedford Ave', '1.718.237.4500', '40 Lynch St'])
    assert.ok(info.includes(t), 'info missing ' + t);
  const folders = ['1rErfxMILgbxpLNQ27_ybqh9gFtNoXE8L', '1eAm_aIvxJWr3PsWHupb52WYD0RPr1v62', '1GyG1KWmOBtMxLQPKJ-_UjUrLisahIjOh', '12oukwfI_iuCiQjduXArF_jr42XCMYpnF', '1QZLBwSM3z1FZqZkfHxElVgR1zIcd_Y6s', '1P7L4UhuvEmsmmvXUr3PZ3VB6rFIlHosv', '1O-wo1PwzXGhE4EVUwy6heln-lZ_yt8Fr'];
  const all = htmls.map(read).join('\n');
  for (const id of folders) assert.ok(all.includes('embeddedfolderview?id=' + id), 'drive folder ' + id);
  for (const id of ['1sfka7sjEVhtR7JQFTknI3wKCZc4BA3_u', '1xuUbdIbLkvllUJ6R-EmzrIIhUgPMW_wf', '1DVVey3l3uK3rOSnG_Hp-smF35eTEvwmb', '1QDAUaqlKyeIfRfBE_elzw9Z3dM0sx8DA'])
    assert.ok(all.includes(id), 'audio ' + id);
  assert.ok(all.includes('https://secure.cardknox.com/tzehlim'));
  assert.ok(all.includes('kolhalashon.com/#/regularSite/ravs/7292/1/1'));
});

test('embedded pages keep their data sources and form ids', () => {
  const js = n => read(path.join(SITE, 'assets/js', n));
  assert.ok(js('emails.js').includes('2PACX-1vQCCZDzcEYUFKdDrVXemgMcdJdVDxz3csz1vQrjg-yFrGloSoqsDnDEpfWSBREbyr3RJ9j-3DYf2Z6U/pub?gid=1044385484'));
  assert.ok(js('emails.js').includes('images.weserv.nl'));
  assert.ok(js('messages.js').includes('2PACX-1vQ93gzam3TJCV7PJKOzFH8Hc3PpRnfY-RvJGuNCyAIbN0X0t9rAa6jTpAUmdDCLPkgQjsTzCN3UfCLG/pub?gid=0'));
  assert.ok(js('gilyonos.js').includes('2PACX-1vRSdc8zFgG0-X144Bpj7FyVDH856c5WD6OUCDhMKT9ocB79jvWy5FxRoaEWgUv14qZqwVYMrxkaQimk/pub?gid=1281224612'));
  const su = js('signup.js');
  for (const t of ['1FAIpQLScQ9TmFqmSrqWeR4BLreKxL9m9IeeiShX6Hj3c_6lVBVc8WUA/formResponse', 'entry.360877976', 'entry.1873145806', 'gid=1755956710']) assert.ok(su.includes(t), t);
  const un = js('unsubscribe.js');
  for (const t of ['edit2', 'entry.360877976', 'gid=1755956710']) assert.ok(un.includes(t), t);
  const li = js('lists.js');
  for (const t of ["'All Contacts DATA!A:Z'", "'Classes!A:Z'", 'sheets.googleapis.com/v4/spreadsheets', 'entry.2736575', 'entry.1928189506', 'entry.1301301651', 'hiddenFrame']) assert.ok(li.includes(t), t);
  assert.ok(read(path.join(SITE, 'chabura/sheet.html')).includes('2PACX-1vRSpmrxEpZa5utQAbgrONyc6QBQkh1Anhvb1hlV54SMsK-MBcX5dI3z5SB73bDsUCl6h8FimCBlOipO'));
});

test('hidden list page is not linked from the public pages', () => {
  for (const f of htmls) {
    if (f.includes(path.join('lists', 'index.html'))) continue;
    assert.ok(!/href="[^"]*lists\/?"/.test(read(f)), path.relative(SITE, f));
  }
  assert.ok(!read(path.join(SITE, 'sitemap.xml')).includes('/lists'));
});

test('phone numbers are tappable tel: links', () => {
  const s = read(path.join(SITE, 'info/index.html'));
  for (const t of ['tel:+17183161781', 'tel:+17166234793', 'tel:+97223136091', 'tel:+19177104852', 'tel:+17182374500']) assert.ok(s.includes('href="' + t + '"'), t);
});

test('no placeholders left', () => {
  for (const f of htmls) assert.ok(!/(lorem ipsum|TODO|\{root\}|undefined<)/i.test(read(f)), path.relative(SITE, f));
});

test('mobile: reader pages open list-first with a back button, emails reflow on phones', () => {
  for (const p of ['notices/emails/index.html', 'notices/messages/index.html', 'gilyonos/index.html']) {
    const h = read(path.join(SITE, p));
    assert.match(h, /id="menuBtn"[^>]*aria-label="צוריק צו דער רשימה"/, p + ' back button');
  }
  const rc = read(path.join(SITE, 'assets/js/reader-common.js'));
  assert.ok(rc.includes("classList.add('viewing')") && rc.includes('pushState') && rc.includes('popstate'));
  assert.ok(read(path.join(SITE, 'assets/js/emails.js')).includes('@media (max-width:699px)'));
  const css = read(path.join(SITE, 'assets/style.css'));
  for (const q of ['@media (max-width:600px)', '@media (max-width:767px)', '.app.viewing .app-view', '.grid-3.mini']) assert.ok(css.includes(q), q);
  assert.ok(read(path.join(SITE, 'index.html')).includes('grid grid-3 mini'));
});
