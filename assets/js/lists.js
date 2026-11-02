/* Contact List — hidden admin page (tzehlim.com/lists). Data: Google Sheets API v4; edits post to the Google Form via the row's edit link. */
const ICON_HOME = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><polyline points=\"9 22 9 12 15 12 15 22\"/></svg>";
const ICON_PHONE = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z\"/></svg>";
const ICON_MAIL = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"/><polyline points=\"22,6 12,13 2,6\"/></svg>";
const ICON_USERS = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/></svg>";

                // ================== GOOGLE SHEETS API CONFIG ==================
        const SPREADSHEET_ID = '1qzhAXJx2qiUvZLuiGUb4fZHgu1xrNvtQIHNad2BU49w';  // ←←← CHANGE THIS
        const API_KEY = 'AIzaSyDOM8i0EBoefSdqq5opT8XgwhS05bIPky0';                          // ←←← CHANGE THIS

        // Change these to match your exact tab/sheet names
        const CONTACTS_RANGE = 'All Contacts DATA!A:Z';
        const CLASSES_RANGE  = 'Classes!A:Z';

        let contacts = [];
        let classes = [];
        let currentFiltered = [];
        let selectedClassId = '';

        async function loadAllData() {
            document.getElementById('loadingMessage').style.display = 'block';
            document.getElementById('errorMessage').classList.add('hidden');
            document.getElementById('manualLoadSection').classList.add('hidden');

            try {
                const [contactsData, classesData] = await Promise.all([
                    fetchSheetData(CONTACTS_RANGE),
                    fetchSheetData(CLASSES_RANGE)
                ]);

                contacts = parseContacts(contactsData);
                classes = parseClasses(classesData);
                populateCustomDropdown();
                filterByClass();
            } catch (err) {
                console.error('Load failed:', err);
                document.getElementById('errorMessage').innerHTML = `
                    Error: ${err.message}<br><br>
                    Check console (F12) for details.
                `;
                document.getElementById('errorMessage').classList.remove('hidden');
            } finally {
                document.getElementById('loadingMessage').style.display = 'none';
            }
        }

        async function fetchSheetData(range) {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to load ${range} (404)`);
            const data = await res.json();
            return data.values || [];
        }

                function parseContacts(rows) {
            const result = [];
            for (let i = 1; i < rows.length; i++) {
                const cols = rows[i];
                if (!cols || cols.length < 14) continue;
                const c = {
                    firstName: (cols[1] || '').trim(),
                    lastName: (cols[2] || '').trim(),
                    firstNameHeb: (cols[3] || '').trim(),
                    lastNameHeb: (cols[4] || '').trim(),
                    address: (cols[5] || '').trim(),
                    apt: (cols[6] || '').trim(),
                    city: (cols[7] || '').trim(),
                    state: (cols[8] || '').trim(),
                    zip: (cols[9] || '').trim(),
                    phone: (cols[10] || '').trim(),
                    email: (cols[11] || '').trim(),
                    classId: (cols[12] || '').trim(),
                    editUrl: (cols[13] || '').trim()
                };
                if (c.firstName || c.lastName || c.firstNameHeb) {
                    c.hebrewName = (c.firstNameHeb && c.lastNameHeb) ? `${c.firstNameHeb} ${c.lastNameHeb}`.trim() : '';
                    c.englishName = `${c.firstName} ${c.lastName}`.trim() || 'No English Name';
                    result.push(c);
                }
            }
            return result;
        }

        function parseClasses(rows) {
            const result = [];
            for (let i = 1; i < rows.length; i++) {
                const cols = rows[i];
                if (!cols || cols.length < 3) continue;
                const cls = {
                    name: (cols[0] || '').trim(),
                    id: (cols[1] || '').trim(),
                    download: (cols[2] || '').trim()
                };
                if (cls.name && cls.id) result.push(cls);
            }
            return result;
        }



        // Custom Dropdown Functions
        function populateCustomDropdown() {
            filterDropdownOptions();
        }

        function toggleDropdown() {
            const menu = document.getElementById('dropdownMenu');
            menu.classList.toggle('hidden');
            menu.classList.toggle('show');
            document.getElementById('dropdownTrigger').setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');
            if (!menu.classList.contains('hidden')) document.getElementById('dropdownSearch').focus();
        }

        function filterDropdownOptions() {
            const search = document.getElementById('dropdownSearch').value.toLowerCase();
            const optionsDiv = document.getElementById('dropdownOptions');
            optionsDiv.innerHTML = '';

            const filteredClasses = classes.filter(cls => cls.name.toLowerCase().includes(search));

            if (filteredClasses.length === 0) {
                optionsDiv.innerHTML = '<div class="no-classes">No classes found</div>';
                return;
            }

            filteredClasses.forEach(cls => {
                const option = document.createElement('div');
                option.className = 'dropdown-option';
                option.innerHTML = ICON_USERS + ` ${escape(cls.name)}`;
                option.onclick = () => selectClass(cls.id, cls.name);
                optionsDiv.appendChild(option);
            });
        }

        function selectClass(id, name) {
            selectedClassId = id;
            document.getElementById('selectedClass').textContent = name || 'All Classes';
            document.getElementById('dropdownMenu').classList.add('hidden');
            document.getElementById('dropdownMenu').classList.remove('show');
            document.getElementById('dropdownSearch').value = '';
            filterByClass();
        }

        // Manual Load
        function loadManualContacts() {
            const textarea = document.getElementById('manualCsv');
            const csv = textarea.value.trim();
            if (!csv) return alert('Paste CSV first!');
            try {
                contacts = parseContactsCSV(csv);
                document.getElementById('manualLoadSection').classList.add('hidden');
                document.getElementById('loadingMessage').style.display = 'none';
                filterByClass();
                alert('Loaded manually! Refresh to sync with sheet.');
            } catch (err) {
                alert('Invalid CSV format: ' + err.message);
            }
        }

        function filterByClass() {
            const query = document.getElementById('searchInput').value.trim().toLowerCase();
            let filtered = contacts;

            if (selectedClassId) {
                filtered = filtered.filter(c => c.classId === selectedClassId);
            }

            if (query) {
                filtered = filtered.filter(c => {
                    const text = `${c.firstName} ${c.lastName} ${c.firstNameHeb} ${c.lastNameHeb} ${c.phone} ${c.email} ${c.address} ${c.city}`.toLowerCase();
                    return text.includes(query);
                });
            }

            currentFiltered = filtered;
            renderContacts(currentFiltered);
            document.getElementById('contactStats').textContent = `${currentFiltered.length} contact${currentFiltered.length !== 1 ? 's' : ''} found`;
            updateExportButton(selectedClassId);
        }

        function updateExportButton(classId) {
            const btn = document.getElementById('exportBtn');
            if (classId) {
                const cls = classes.find(c => c.id === classId);
                if (cls && cls.download) {
                    btn.href = cls.download;
                    btn.classList.remove('hidden');
                    return;
                }
            }
            btn.classList.add('hidden');
        }

        function renderContacts(list) {
            const container = document.getElementById('contactList');
            container.innerHTML = '';

            if (list.length === 0) {
                container.innerHTML = '<div class="empty" style="grid-column:1/-1">No contacts found</div>';
                return;
            }

            list.forEach((c, i) => {
                const card = document.createElement('div');
                card.className = 'contact-card';

                const displayName = c.hebrewName || c.englishName;
                const showEnglish = c.englishName && c.firstName && c.lastName;

                card.innerHTML = `
                    <div class="head">
                        <h3 class="hebrew" style="text-align:center">${escape(displayName)}</h3>
                        ${showEnglish ? `<p>${escape(c.englishName)}</p>` : ''}
                    </div>
                    <div class="body">
                        ${c.address ? `<div class="row">${ICON_HOME}<div>${escape(c.address)}${c.apt ? ', ' + escape(c.apt) : ''}<br>${escape(c.city)}, ${escape(c.state)} ${escape(c.zip)}</div></div>` : ''}
                        ${c.phone ? `<div class="row">${ICON_PHONE}<a class="tel" href="tel:${escape(c.phone).replace(/[^\d+]/g, '')}">${escape(c.phone)}</a></div>` : ''}
                        ${c.email ? `<div class="row">${ICON_MAIL}<span>${escape(c.email)}</span></div>` : ''}
                    </div>
                    <div class="foot">
                        <button type="button" onclick="openEditModal(${i})" class="btn btn-dark">Edit Contact</button>
                    </div>
                `;
                container.appendChild(card);
            });
            document.getElementById('loadingMessage').style.display = 'none';
        }

        function escape(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

        function openEditModal(localIndex) {
            const contact = currentFiltered[localIndex];
            if (!contact) return;
            const globalIndex = contacts.indexOf(contact);
            if (globalIndex === -1) return;

            const c = contacts[globalIndex];
            document.getElementById('editIndex').value = globalIndex;
            document.getElementById('editClassId').value = c.classId || '';
            document.getElementById('editFirstName').value = c.firstName || '';
            document.getElementById('editLastName').value = c.lastName || '';
            document.getElementById('editFirstNameHeb').value = c.firstNameHeb || '';
            document.getElementById('editLastNameHeb').value = c.lastNameHeb || '';
            document.getElementById('editAddress').value = c.address || '';
            document.getElementById('editApt').value = c.apt || '';
            document.getElementById('editCity').value = c.city || '';
            document.getElementById('editState').value = c.state || '';
            document.getElementById('editZip').value = c.zip || '';
            document.getElementById('editPhone').value = c.phone || '';
            document.getElementById('editEmail').value = c.email || '';

            window.currentEditUrl = c.editUrl;
            document.getElementById('editModal').classList.remove('hidden');
        }

        function closeEditModal() {
            document.getElementById('editModal').classList.add('hidden');
        }

        function showSuccess() {
            const toast = document.getElementById('successToast');
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        document.getElementById('editForm').onsubmit = function(e) {
            e.preventDefault();
            const i = parseInt(document.getElementById('editIndex').value);
            const editUrl = window.currentEditUrl;
            if (!editUrl) return alert('No edit link');

            const formId = editUrl.match(/\/forms\/d\/e\/([a-zA-Z0-9_-]+)/)?.[1];
            const editToken = editUrl.match(/[?&]edit2=([a-zA-Z0-9_-]+)/)?.[1];
            if (!formId || !editToken) return alert('Invalid edit link');

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
            form.target = 'hiddenFrame';

            addField(form, 'edit2', editToken);
            new URLSearchParams(editUrl.split('?')[1] || '').forEach((v, k) => {
                if (k !== 'edit2') addField(form, k, v);
            });

            addField(form, 'entry.2736575', document.getElementById('editClassId').value);

            const fields = {
                'entry.1928189506': document.getElementById('editFirstName').value.trim(),
                'entry.503319169':  document.getElementById('editLastName').value.trim(),
                'entry.394270608':  document.getElementById('editFirstNameHeb').value.trim(),
                'entry.467827251':  document.getElementById('editLastNameHeb').value.trim(),
                'entry.2092213234': document.getElementById('editAddress').value.trim(),
                'entry.815425392': document.getElementById('editApt').value.trim(),
                'entry.1724087910': document.getElementById('editCity').value.trim(),
                'entry.657969011':  document.getElementById('editState').value.trim(),
                'entry.1455006125': document.getElementById('editZip').value.trim(),
                'entry.492335552': document.getElementById('editPhone').value.trim(),
                'entry.1301301651': document.getElementById('editEmail').value.trim()
            };

            Object.entries(fields).forEach(([k, v]) => addField(form, k, v));

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);

            Object.assign(contacts[i], {
                firstName: fields['entry.1928189506'],
                lastName: fields['entry.503319169'],
                firstNameHeb: fields['entry.394270608'],
                lastNameHeb: fields['entry.467827251'],
                address: fields['entry.2092213234'],
                apt: fields['entry.815425392'],
                city: fields['entry.1724087910'],
                state: fields['entry.657969011'],
                zip: fields['entry.1455006125'],
                phone: fields['entry.492335552'],
                email: fields['entry.1301301651'],
                hebrewName: fields['entry.394270608'] && fields['entry.467827251'] ? `${fields['entry.394270608']} ${fields['entry.467827251']}`.trim() : '',
                englishName: `${fields['entry.1928189506']} ${fields['entry.503319169']}`.trim()
            });

            filterByClass();
            closeEditModal();
            showSuccess();
        };

        function addField(form, name, value) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value || '';
            form.appendChild(input);
        }

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-dropdown')) {
                document.getElementById('dropdownMenu').classList.add('hidden');
                document.getElementById('dropdownMenu').classList.remove('show');
            }
        });

        document.addEventListener('DOMContentLoaded', loadAllData);
    
        // Manual CSV fallback (the original page called parseContactsCSV without defining it)
        function parseContactsCSV(text) {
            const rows = []; let field = '', row = [], q = false;
            for (let i = 0; i < text.length; i++) {
                const ch = text[i], n = text[i + 1];
                if (ch === '"' && q && n === '"') { field += '"'; i++; }
                else if (ch === '"') q = !q;
                else if (ch === ',' && !q) { row.push(field); field = ''; }
                else if ((ch === '\n' || ch === '\r') && !q) { if (field || row.length) { row.push(field); rows.push(row); row = []; field = ''; } if (ch === '\r' && n === '\n') i++; }
                else field += ch;
            }
            if (field || row.length) { row.push(field); rows.push(row); }
            return parseContacts(rows);
        }

        // Wire up controls (formerly inline onclick/onkeyup attributes)
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('refreshBtn').addEventListener('click', loadAllData);
            document.getElementById('dropdownTrigger').addEventListener('click', toggleDropdown);
            document.getElementById('dropdownSearch').addEventListener('keyup', filterDropdownOptions);
            document.getElementById('searchInput').addEventListener('keyup', filterByClass);
            document.getElementById('manualBtn').addEventListener('click', loadManualContacts);
            document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
            document.addEventListener('keydown', e => { if (e.key === 'Escape') closeEditModal(); });
        });
