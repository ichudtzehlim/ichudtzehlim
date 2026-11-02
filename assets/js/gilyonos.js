/* גליונות — reads the published Google Sheet of gilyonos (Drive PDFs): preview + download */
(function(){
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRSdc8zFgG0-X144Bpj7FyVDH856c5WD6OUCDhMKT9ocB79jvWy5FxRoaEWgUv14qZqwVYMrxkaQimk/pub?gid=1281224612&single=true&output=csv";

const content = document.getElementById("content");
const dlBtn = document.getElementById("dl");
const openBtn = document.getElementById("openPdf");

function show(g) {
  content.innerHTML = "";
  const iframe = document.createElement("iframe");
  iframe.title = g.label;
  iframe.src = g.preview;
  iframe.setAttribute("allow", "autoplay");
  content.appendChild(iframe);
  dlBtn.href = g.download; dlBtn.hidden = false;
  openBtn.href = g.view; openBtn.hidden = false;
}

const ui = TZ.shell({ onSelect: show, emptyText: "קיין גליונות" });

fetch(CSV_URL)
  .then(r => r.text())
  .then(text => {
    const rows = TZ.parseCSV(text).slice(1).reverse();
    const items = [];
    rows.forEach(cols => {
      if (cols.length < 3) return;
      const date = (cols[0] || "").split(' ')[0];
      const title = cols[1] || "גליון";
      const link = cols[2] || "";
      const fileId = link.match(/[\w\-]{25,}/)?.[0];
      if (!fileId) return;
      items.push({
        date: date,
        label: title,
        preview: `https://drive.google.com/file/d/${fileId}/preview?rm=minimal`,
        download: `https://drive.google.com/uc?id=${fileId}&export=download`,
        view: `https://drive.google.com/file/d/${fileId}/view`
      });
    });
    ui.render(items);
    ui.first();
  })
  .catch(() => {
    ui.state("נישט געלאדן<br>פראבירט שפעטער", true);
  });
})();
