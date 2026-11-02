/* Unsubscribe — finds the email's form edit link in the published sheet and blanks the email field */
(function(){
function parseCSV(csv) {
  return csv.split(/\r?\n/)
    .filter(l => l.trim())
    .slice(1)
    .map(row => {
      const cols = row.split(',');
      return { email: cols[1]?.trim() || "", editLink: cols[3]?.trim() || "" };
    });
}

document.getElementById('unsubscribeForm').addEventListener('submit', async e => {
  e.preventDefault();
  const emailValue = document.getElementById('email').value.trim().toLowerCase();
  const form = document.getElementById('unsubscribeForm');
  const confirmation = document.getElementById('confirmation');
  const errorBox = document.getElementById('error');
  const btn = e.target.querySelector('button');
  const original = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = '<svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Working...';

  try {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQCCZDzcEYUFKdDrVXemgMcdJdVDxz3csz1vQrjg-yFrGloSoqsDnDEpfWSBREbyr3RJ9j-3DYf2Z6U/pub?gid=1755956710&single=true&output=csv";
    const res = await fetch(csvUrl);
    const csv = await res.text();
    const rows = parseCSV(csv);
    const entry = rows.find(r => r.email.toLowerCase() === emailValue);

    if (!entry || !entry.editLink) {
      form.style.display = "none";
      errorBox.classList.remove("hidden");
      return;
    }

    const urlObj = new URL(entry.editLink);
    const editKey = urlObj.searchParams.get("edit2");
    const postUrl = entry.editLink.replace("viewform", "formResponse") + "&edit2=" + editKey;

    const fd = new FormData();
    fd.append("entry.360877976", "");

    await fetch(postUrl, { method: "POST", body: fd, mode: "no-cors" });

    form.style.display = "none";
    confirmation.classList.remove("hidden");
  } catch (err) {
    alert("Something went wrong. Please try again.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = original;
  }
});
})();
