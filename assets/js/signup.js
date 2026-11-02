/* סיינט אייך אויף — posts to the Google Form; duplicate check against the published sheet */
(function(){
// Check duplicate email
async function emailExists(email) {
  try {
    const res = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQCCZDzcEYUFKdDrVXemgMcdJdVDxz3csz1vQrjg-yFrGloSoqsDnDEpfWSBREbyr3RJ9j-3DYf2Z6U/pub?gid=1755956710&single=true&output=csv');
    const text = await res.text();
    const lines = text.split('\n').slice(1);
    const emails = lines.map(l => l.split(',')[1]?.replace(/"/g, '').trim().toLowerCase());
    return emails.includes(email.toLowerCase());
  } catch (e) {
    return false;
  }
}

const form = document.getElementById('signupForm');
form.onsubmit = async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const btn = form.querySelector('button[type="submit"]');

  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address');
    return;
  }

  // Loading
  btn.disabled = true;
  btn.innerHTML = '<svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Signing up...';

  const exists = await emailExists(email);
  if (exists) {
    form.style.display = 'none';
    document.getElementById('error').classList.remove('hidden');
    return;
  }

  const formData = new FormData();
  formData.append('entry.360877976', email);
  const name = document.querySelector('[name="entry.1873145806"]')?.value.trim();
  if (name) formData.append('entry.1873145806', name);

  await fetch('https://docs.google.com/forms/d/e/1FAIpQLScQ9TmFqmSrqWeR4BLreKxL9m9IeeiShX6Hj3c_6lVBVc8WUA/formResponse', {
    method: 'POST',
    body: formData,
    mode: 'no-cors'
  });

  form.style.display = 'none';
  document.getElementById('confirmation').classList.remove('hidden');
};
})();
