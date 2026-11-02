/* טעקסט מעסעדזשעס — reads the published Google Sheet of text messages (+ Drive images) */
(function(){
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ93gzam3TJCV7PJKOzFH8Hc3PpRnfY-RvJGuNCyAIbN0X0t9rAa6jTpAUmdDCLPkgQjsTzCN3UfCLG/pub?gid=0&single=true&output=csv";
const IMG_PROXY = "https://images.weserv.nl/?url=";

function getImageUrl(link) {
  if (!link) return null;
  const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? IMG_PROXY + encodeURIComponent("https://drive.google.com/uc?export=view&id=" + match[1]) : null;
}
function linkify(escaped) {
  return escaped.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

const content = document.getElementById("content");

function show(m) {
  let html = `<div class="message-box"><span class="message-date">${TZ.esc(m.date)}</span>`;
  if (m.message) html += linkify(TZ.esc(m.message)).replace(/\n/g, "<br>");
  if (m.imageUrl) html += `<img src="${m.imageUrl}" alt="בילד" loading="lazy">`;
  if (!m.message && !m.imageUrl) html += "קיין אינהאלט";
  html += `</div>`;
  content.innerHTML = html;
  content.scrollTop = 0;
}

const ui = TZ.shell({ onSelect: show, emptyText: "קיין בריוון" });

fetch(CSV_URL)
  .then(r => r.text())
  .then(text => {
    const rows = TZ.parseCSV(text);
    if (rows.length <= 1) {
      ui.state("קיין בריוון");
      content.innerHTML = "<p class='app-state'>קיין בריוון</p>";
      return;
    }
    const messages = rows.slice(1).reverse().map(row => {   // newest first
      const message = row[1] || "";
      return {
        date: row[0] || "",
        message: message,
        text: message,
        imageUrl: getImageUrl(row[2] || ""),
        label: message.length > 55 ? message.substring(0, 55) + "..." : (message || "בילד")
      };
    });
    ui.render(messages);
    ui.first();
  })
  .catch(() => {
    ui.state("נישט געלאדן<br>פראבירט שפעטער ווידער", true);
    content.innerHTML = "<p class='app-state err'>נישט געלאדן<br>פראבירט שפעטער ווידער</p>";
  });
})();
