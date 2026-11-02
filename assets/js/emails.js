/* אימעיל'ס — reads the published Google Sheet and shows each email's HTML body */
(function(){
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQCCZDzcEYUFKdDrVXemgMcdJdVDxz3csz1vQrjg-yFrGloSoqsDnDEpfWSBREbyr3RJ9j-3DYf2Z6U/pub?gid=1044385484&single=true&output=csv";
const IMG_PROXY = "https://images.weserv.nl/?url=";

function cleanHTML(html) {
  if (!html) return "<p style='color:#b8860b;text-align:center'>די אימעיל איז נאך נישט פארפעסטיקט.</p>";
  html = html.replace(/^"|"$/g, "").replace(/""/g, '"');
  return html.replace(/https?:\/\/drive\.google\.com\/[^"' ]+/g, link => {
    let id = null;
    if (link.includes("thumbnail?id=")) id = link.split("thumbnail?id=")[1]?.split("&")[0];
    else if (link.includes("uc?id=")) id = link.split("uc?id=")[1]?.split("&")[0];
    else if (link.includes("open?id=")) id = link.split("open?id=")[1]?.split("&")[0];
    else if (link.includes("/file/d/")) id = link.split("/file/d/")[1]?.split("/")[0];
    return id ? IMG_PROXY + encodeURIComponent("https://drive.google.com/uc?export=view&id=" + id) : link;
  });
}

const content = document.getElementById("content");
const FRAME_CSS = "<style>html,body{margin:0;background:#fff}body{padding:12px;font-family:system-ui,Arial,sans-serif;line-height:1.6;color:#222;overflow-wrap:anywhere}img{max-width:100% !important;height:auto !important}table,td,th{max-width:100% !important}"
  /* phones: let the 700px email template reflow to the screen instead of shrinking it to tiny text */
  + "@media (max-width:699px){body{padding:0}table{width:100% !important}[style*='padding']{padding-left:6px !important;padding-right:6px !important}[style*='border:18px']{border-width:6px !important}td[style*='font-size:14px']{font-size:15px !important}}"
  + "</style><base target='_blank'>";

let currentFit = null;
window.addEventListener("resize", () => { if (currentFit) currentFit(); });

function show(row) {
  const frame = document.createElement("iframe");
  frame.title = row.label;
  frame.setAttribute("sandbox", "allow-same-origin allow-popups allow-popups-to-escape-sandbox");
  frame.style.width = "100%";
  frame.srcdoc = "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>" + FRAME_CSS + "</head><body>" + (cleanHTML(row.html) || "<p style='color:#b8860b;text-align:center'>קיין אינהאלט</p>") + "</body></html>";
  // fit the email to the panel: shrink wide (700px) email layouts on phones, then size the frame to its content
  const fit = () => {
    try {
      const d = frame.contentDocument;
      if (!d || !d.body) return;
      d.body.style.zoom = "";
      const avail = frame.clientWidth, wide = d.documentElement.scrollWidth;
      if (avail && wide > avail + 2) d.body.style.zoom = (avail / wide).toFixed(3);
      const h = d.documentElement.scrollHeight * (parseFloat(d.body.style.zoom) || 1);
      // desktop: fill the panel; phones: the page itself scrolls, so the frame is just as tall as the email
      frame.style.height = (window.innerWidth < 768 ? Math.max(h, 200) : Math.max(h, content.clientHeight - 4)) + "px";
    } catch (e) {}
  };
  currentFit = fit;
  frame.addEventListener("load", () => { fit(); frame.contentDocument.querySelectorAll("img").forEach(i => i.addEventListener("load", fit)); setTimeout(fit, 800); setTimeout(fit, 2500); });
  content.innerHTML = "";
  content.scrollTop = 0;
  content.appendChild(frame);
}

const ui = TZ.shell({ onSelect: show, emptyText: "קיין דאַטן געפֿונען" });

fetch(CSV_URL)
  .then(r => r.text())
  .then(text => {
    const rows = TZ.parseCSV(text);
    if (rows.length < 2) {
      ui.state("קיין דאַטן געפֿונען");
      content.innerHTML = "<p class='app-state'>קיין דאַטן געפֿונען</p>";
      return;
    }
    const emails = rows.slice(1).reverse().map(row => ({
      date: row[0] || "",
      label: row[1] || "אָן טיטל",
      html: row[2] || ""
    }));
    ui.render(emails);
    ui.first();
  })
  .catch(() => {
    ui.state("נישט געלאדן<br>פראבירט שפעטער", true);
    content.innerHTML = "<p class='app-state err'>נישט געלאדן<br>פראבירט שפעטער</p>";
  });
})();
