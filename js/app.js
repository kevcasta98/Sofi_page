/* ══════════════════════════════════════
   SOFI'S UNIVERSE — app.js
   Books · Timeline · Letters · Admin
══════════════════════════════════════ */

// ── ADMIN PIN (cambiá este número) ──
const ADMIN_PIN = '3010'; // Cambialo por tu PIN secreto

// ── STATE ──
let isAdmin = false;
let books = [];
let moments = [];
let selectedBook = null;
let currentRating = 0;
let momentPhotoData = null;
let bookToEdit = null;

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  generateStars();
  initCursor();
  initScrollReveal();
  initNav();
  loadData();
  renderAll();
});

// ══════════════════════════════════════
// STARS
// ══════════════════════════════════════
function generateStars() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 140; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      width:${size}px; height:${size}px;
      --d:${2 + Math.random()*5}s;
      --delay:${Math.random()*5}s;
    `;
    container.appendChild(s);
  }
}

// ══════════════════════════════════════
// CURSOR
// ══════════════════════════════════════
function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');
  let rx = 0, ry = 0, mx = 0, my = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
  });

  (function animRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`;
    requestAnimationFrame(animRing);
  })();
}

// ══════════════════════════════════════
// NAV — shrink on scroll
// ══════════════════════════════════════
function initNav() {
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 80
      ? 'rgba(13,6,24,0.98)'
      : 'linear-gradient(to bottom, rgba(13,6,24,0.95), transparent)';
  });
}

// ══════════════════════════════════════
// SCROLL REVEAL
// ══════════════════════════════════════
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.gusto-card, .vote-card, .carta-card, .section-intro').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

// ══════════════════════════════════════
// DATA — localStorage
// ══════════════════════════════════════
function loadData() {
  try {
    books   = JSON.parse(localStorage.getItem('sofi_books')   || '[]');
    moments = JSON.parse(localStorage.getItem('sofi_moments') || '[]');
  } catch(e) {
    books = []; moments = [];
  }
}

function saveData() {
  localStorage.setItem('sofi_books',   JSON.stringify(books));
  localStorage.setItem('sofi_moments', JSON.stringify(moments));
}

function renderAll() {
  renderTimeline();
  renderBooks();
  renderCartas();
}

// ══════════════════════════════════════
// ADMIN
// ══════════════════════════════════════
function openAdminLogin() {
  if (isAdmin) { logoutAdmin(); return; }
  openModal('adminModal');
  setTimeout(() => document.getElementById('adminPin').focus(), 100);
}

function checkAdmin() {
  const pin = document.getElementById('adminPin').value;
  if (pin === ADMIN_PIN) {
    isAdmin = true;
    closeModal('adminModal');
    document.getElementById('adminPin').value = '';
    document.getElementById('adminError').style.display = 'none';
    document.body.classList.add('admin-active');
    document.getElementById('timelineAdminBar').style.display = 'flex';
    document.querySelector('.admin-btn').textContent = '🔓';
    document.querySelector('.admin-btn').title = 'Cerrar edición';
    showToast('Modo edición activo 🔓');
  } else {
    document.getElementById('adminError').style.display = 'block';
    document.getElementById('adminPin').value = '';
  }
}

function logoutAdmin() {
  isAdmin = false;
  document.body.classList.remove('admin-active');
  document.getElementById('timelineAdminBar').style.display = 'none';
  document.querySelector('.admin-btn').textContent = '⚙';
  document.querySelector('.admin-btn').title = 'Modo edición';
  showToast('Sesión cerrada 🔒');
}

// ══════════════════════════════════════
// TOAST
// ══════════════════════════════════════
function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed; bottom:6rem; left:50%; transform:translateX(-50%);
    background:rgba(109,40,217,0.9); color:white; padding:0.75rem 1.5rem;
    font-family:'DM Mono',monospace; font-size:0.7rem; letter-spacing:0.15em;
    z-index:9999; backdrop-filter:blur(10px);
    border:1px solid rgba(167,139,250,0.3);
    animation: toastIn 0.3s ease forwards;
  `;
  const style = document.createElement('style');
  style.textContent = `@keyframes toastIn { from{opacity:0;transform:translate(-50%,10px)} to{opacity:1;transform:translate(-50%,0)} }`;
  document.head.appendChild(style);
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// ══════════════════════════════════════
// MODALS
// ══════════════════════════════════════
function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

// Close on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay') ||
      e.target.classList.contains('letter-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ══════════════════════════════════════
// TIMELINE
// ══════════════════════════════════════
function openAddMoment() {
  if (!isAdmin) return;
  momentPhotoData = null;
  document.getElementById('momentTitle').value = '';
  document.getElementById('momentDate').value = '';
  document.getElementById('momentDesc').value = '';
  document.getElementById('momentPhotoPreview').innerHTML = '<span style="font-size:2rem;">📸</span><span>Subir foto</span>';
  openModal('momentModal');
}

function previewMomentPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    momentPhotoData = e.target.result;
    document.getElementById('momentPhotoPreview').innerHTML =
      `<img src="${momentPhotoData}" style="max-height:120px;max-width:100%;">`;
  };
  reader.readAsDataURL(file);
}

function saveMoment() {
  if (!isAdmin) return;
  const title = document.getElementById('momentTitle').value.trim();
  const date  = document.getElementById('momentDate').value.trim();
  const desc  = document.getElementById('momentDesc').value.trim();
  if (!title) { showToast('Escribí un título 💜'); return; }

  moments.push({ id: Date.now(), title, date, desc, photo: momentPhotoData });
  saveData();
  renderTimeline();
  closeModal('momentModal');
  showToast('Momento guardado 💜');
}

function deleteMoment(id) {
  if (!isAdmin) return;
  if (!confirm('¿Eliminar este momento?')) return;
  moments = moments.filter(m => m.id !== id);
  saveData();
  renderTimeline();
}

function renderTimeline() {
  const container = document.getElementById('timelineContainer');
  const empty     = document.getElementById('timelineEmpty');

  // Keep the line element
  container.innerHTML = '<div class="timeline-line"></div>';

  if (!moments.length) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  moments.forEach((m, i) => {
    const item = document.createElement('div');
    item.className = 'timeline-item reveal';
    item.innerHTML = `
      <div class="timeline-item-dot"></div>
      ${m.photo ? `
        <div class="timeline-photo">
          <img src="${m.photo}" alt="${m.title}">
        </div>
      ` : ''}
      <div class="timeline-content" style="${!m.photo ? 'max-width:100%;' : ''}">
        <div class="tl-date">${m.date || ''}</div>
        <h3 class="tl-title">${m.title}</h3>
        <p class="tl-desc">${m.desc || ''}</p>
        <button class="tl-delete" onclick="deleteMoment(${m.id})">✕ Eliminar</button>
      </div>
    `;
    container.appendChild(item);
  });

  // Re-observe new elements
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ══════════════════════════════════════
// BOOKS — Open Library API
// ══════════════════════════════════════
function openBookModal() {
  bookToEdit = null;
  selectedBook = null;
  currentRating = 0;
  document.getElementById('bookSearchInput').value = '';
  document.getElementById('bookSearchResults').innerHTML = '';
  document.getElementById('bookSearchResults').classList.remove('active');
  document.getElementById('bookSelectedPreview').style.display = 'none';
  document.getElementById('bookForm').style.display = 'none';
  document.getElementById('bookPage').value = '';
  document.getElementById('bookComment').value = '';
  document.getElementById('bookStatus').value = 'done';
  updateStarsUI(0);
  document.querySelector('.modal-box.wide .modal-title').textContent = 'Agregar un libro';
  openModal('bookModal');
}

function editBook(id) {
  bookToEdit = books.find(b => b.id === id);
  if (!bookToEdit) return;

  selectedBook = { title: bookToEdit.title, author: bookToEdit.author, coverId: bookToEdit.coverId };
  currentRating = bookToEdit.rating || 0;

  document.getElementById('bookSearchInput').value = '';
  document.getElementById('bookSearchResults').innerHTML = '';
  document.getElementById('bookSearchResults').classList.remove('active');
  document.querySelector('.modal-box.wide .modal-title').textContent = '✎ Editar libro';

  // Show preview and form immediately for editing
  const preview = document.getElementById('bookSelectedPreview');
  document.getElementById('selectedTitle').textContent = bookToEdit.title;
  document.getElementById('selectedAuthor').textContent = bookToEdit.author;
  
  if (bookToEdit.coverId) {
    document.getElementById('selectedCover').src = `https://covers.openlibrary.org/b/id/${bookToEdit.coverId}-M.jpg`;
    document.getElementById('selectedCover').style.display = 'block';
  } else {
    document.getElementById('selectedCover').style.display = 'none';
  }
  preview.style.display = 'flex';

  // Fill form with current data
  document.getElementById('bookStatus').value = bookToEdit.status || 'done';
  document.getElementById('bookPage').value = bookToEdit.page || '';
  document.getElementById('bookComment').value = bookToEdit.comment || '';
  updateStarsUI(currentRating);
  document.getElementById('bookForm').style.display = 'block';

  openModal('bookModal');
}


async function searchBook() {
  const q = document.getElementById('bookSearchInput').value.trim();
  if (!q) return;

  const resultsEl = document.getElementById('bookSearchResults');
  resultsEl.innerHTML = '<div class="bsr-item" style="justify-content:center;opacity:0.6;">Buscando... ✦</div>';
  resultsEl.classList.add('active');

  try {
    const res  = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8&fields=key,title,author_name,cover_i,first_publish_year`);
    const data = await res.json();
    renderBookResults(data.docs || []);
  } catch(e) {
    resultsEl.innerHTML = '<div class="bsr-item" style="opacity:0.6;">Sin conexión — ingresá los datos manualmente</div>';
    // Show form anyway for manual entry
    showManualBookEntry(q);
  }
}

function renderBookResults(docs) {
  const el = document.getElementById('bookSearchResults');
  if (!docs.length) {
    el.innerHTML = '<div class="bsr-item" style="opacity:0.6;">Sin resultados. Probá otro título.</div>';
    return;
  }
  el.innerHTML = docs.map(d => {
    const cover = d.cover_i
      ? `<img src="https://covers.openlibrary.org/b/id/${d.cover_i}-S.jpg" alt="Portada">`
      : `<div class="bsr-noimg">📖</div>`;
    const author = d.author_name ? d.author_name[0] : 'Autor desconocido';
    const year   = d.first_publish_year ? ` · ${d.first_publish_year}` : '';
    return `
      <div class="bsr-item" onclick="selectBook('${escapeAttr(d.title)}', '${escapeAttr(author)}', ${d.cover_i || 0})">
        ${cover}
        <div class="bsr-info">
          <div class="bsr-title">${d.title}</div>
          <div class="bsr-author">${author}${year}</div>
        </div>
      </div>
    `;
  }).join('');
}

function escapeAttr(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function selectBook(title, author, coverId) {
  selectedBook = { title, author, coverId };

  const preview  = document.getElementById('bookSelectedPreview');
  const coverImg = document.getElementById('selectedCover');
  document.getElementById('selectedTitle').textContent  = title;
  document.getElementById('selectedAuthor').textContent = author;

  if (coverId) {
    coverImg.src = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
    coverImg.style.display = 'block';
  } else {
    coverImg.style.display = 'none';
  }
  preview.style.display = 'flex';

  document.getElementById('bookSearchResults').classList.remove('active');
  document.getElementById('bookForm').style.display = 'block';
}

function showManualBookEntry(title) {
  selectedBook = { title, author: '', coverId: 0 };
  document.getElementById('selectedTitle').textContent  = title;
  document.getElementById('selectedAuthor').textContent = 'Autor desconocido';
  document.getElementById('selectedCover').style.display = 'none';
  document.getElementById('bookSelectedPreview').style.display = 'flex';
  document.getElementById('bookForm').style.display = 'block';
}

function setRating(val) {
  currentRating = val;
  updateStarsUI(val);
}

function updateStarsUI(val) {
  document.querySelectorAll('.star-btn').forEach((s, i) => {
    s.classList.toggle('active', i < val);
  });
}

function saveBook() {
  if (!selectedBook) { showToast('Seleccioná un libro primero 💜'); return; }
  const status  = document.getElementById('bookStatus').value;
  const page    = document.getElementById('bookPage').value.trim();
  const comment = document.getElementById('bookComment').value.trim();

  if (bookToEdit) {
    // Editing mode
    bookToEdit.status = status;
    bookToEdit.page = page;
    bookToEdit.comment = comment;
    bookToEdit.rating = currentRating;
    showToast(`"${bookToEdit.title}" actualizado ✎ 📚`);
  } else {
    // Create mode
    books.push({
      id: Date.now(),
      title:   selectedBook.title,
      author:  selectedBook.author,
      coverId: selectedBook.coverId,
      status, page, comment,
      rating: currentRating,
      addedAt: new Date().toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })
    });
    showToast(`"${selectedBook.title}" guardado 📚`);
  }

  saveData();
  renderBooks();
  closeModal('bookModal');
}


function renderBooks() {
  const shelf  = document.getElementById('bookShelf');
  const done   = books.filter(b => b.status === 'done').length;
  const reading = books.filter(b => b.status === 'reading').length;
  const queued  = books.filter(b => b.status === 'queued').length;

  document.getElementById('statFinished').textContent = done;
  document.getElementById('statReading').textContent  = reading;
  document.getElementById('statQueued').textContent   = queued;

  if (!books.length) {
    shelf.innerHTML = '<div class="books-empty">Los libros de Sofi aparecerán aquí ✦ 📚</div>';
    return;
  }

  shelf.innerHTML = books.map(b => {
    const cover = b.coverId
      ? `<img src="https://covers.openlibrary.org/b/id/${b.coverId}-M.jpg" alt="${b.title}">`
      : `<div class="book-cover-placeholder">📖</div>`;
    const stars = b.rating ? '★'.repeat(b.rating) + '☆'.repeat(5 - b.rating) : '';
    const statusLabel = { done: '✓ Terminado', reading: '◉ Leyendo', queued: '○ En lista' }[b.status];
    const statusClass = { done: 'status-done', reading: 'status-reading', queued: 'status-queued' }[b.status];
    return `
      <div class="book-card" onclick="openBookDetail(${b.id})">
        <div class="book-cover-wrap">
          ${cover}
          <div class="book-status-badge ${statusClass}">${statusLabel}</div>
        </div>
        <div class="book-card-title">${b.title}</div>
        ${stars ? `<div class="book-card-stars">${stars}</div>` : ''}
      </div>
    `;
  }).join('');
}

function openBookDetail(id) {
  const b = books.find(x => x.id === id);
  if (!b) return;

  const cover = b.coverId
    ? `<div class="bd-cover"><img src="https://covers.openlibrary.org/b/id/${b.coverId}-L.jpg" alt="${b.title}"></div>`
    : `<div class="bd-cover"><div class="bd-cover-ph">📖</div></div>`;

  const stars = b.rating ? '★'.repeat(b.rating) + '☆'.repeat(5 - b.rating) : '';
  const statusLabel = { done: '✓ Terminado', reading: '◉ Leyendo ahora', queued: '○ En mi lista' }[b.status];
  const statusColor = { done: 'rgba(109,40,217,0.3)', reading: 'rgba(201,162,39,0.3)', queued: 'rgba(26,10,46,0.5)' }[b.status];

  const adminButtons = isAdmin ? `
    <div style="display:flex;gap:0.5rem;margin-top:1.5rem;">
      <button onclick="closeModalAndEdit(${b.id})" style="flex:1;background:rgba(168,85,247,0.2);border:1px solid rgba(168,85,247,0.4);color:#d8b4fe;padding:0.5rem;border-radius:4px;font-family:'DM Mono',monospace;font-size:0.7rem;cursor:pointer;transition:all 0.2s;">✎ Editar</button>
      <button onclick="deleteBook(${b.id})" style="flex:1;background:rgba(248,113,113,0.2);border:1px solid rgba(248,113,113,0.4);color:#f87171;padding:0.5rem;border-radius:4px;font-family:'DM Mono',monospace;font-size:0.7rem;cursor:pointer;transition:all 0.2s;">✕ Eliminar</button>
    </div>
  ` : '';

  document.getElementById('bookDetailContent').innerHTML = `
    ${cover}
    <div class="bd-info">
      <div class="bd-title">${b.title}</div>
      <div class="bd-author">${b.author}</div>
      ${stars ? `<div class="bd-rating">${stars}</div>` : ''}
      <div class="bd-status" style="background:${statusColor}">${statusLabel}</div>
      ${b.page ? `<div class="bd-page">📖 Página actual: ${b.page}</div>` : ''}
      ${b.comment ? `<div class="bd-comment">"${b.comment}"</div>` : ''}
      <div style="margin-top:1.5rem;font-family:'DM Mono',monospace;font-size:0.6rem;color:var(--lavender);opacity:0.5;letter-spacing:0.1em;">
        Agregado: ${b.addedAt}
      </div>
      ${adminButtons}
    </div>
  `;
  openModal('bookDetailModal');
}

function closeModalAndEdit(id) {
  closeModal('bookDetailModal');
  setTimeout(() => editBook(id), 100);
}


function deleteBook(id) {
  if (!isAdmin) return;
  const b = books.find(x => x.id === id);
  if (!b) return;
  if (!confirm(`¿Eliminar "${b.title}"?`)) return;
  books = books.filter(b => b.id !== id);
  saveData();
  renderBooks();
  closeModal('bookDetailModal');
  showToast('Libro eliminado 🗑️');
}

// ══════════════════════════════════════
// CARTAS
// ══════════════════════════════════════
const cartasData = [
  {
    id: 1,
    date: 'Para abrir ahora',
    title: 'La carta del primer día',
    preview: 'Lo que quiero que sepas desde el primer momento...',
    locked: false,
    saludo: 'Mi Osita,',
    body: `Quiero que sepas que esta página existe porque no soy muy bueno con las palabras, pero contigo, Sofi, he descubierto que vale la pena intentarlo.

Hay algo en ti que hace que todo sea diferente. Cuando te riés con tus amigos, cuando me cuentas de un libro que te gustó, cuando me miras con ese brillos en tus ojos, cuando estas cansadisima y aun así me dedicas tiempo — en todos esos momentos pienso lo afortunado que soy.

Esta es mi forma de decirte que te veo. Que me importás. Que me alegra muchísimo que hayamos ido a votar juntos ese día.

Con todo mi cariño,`,
    firma: 'Tu fan numero uno 💜'
  },
  {
    id: 2,
    date: 'Para tu cumpleaños',
    title: 'Carta de cumpleaños',
    preview: 'Guardada para el día más especial del año...',
    locked: true,
    saludo: '¡Feliz cumpleaños, Osita!',
    body: `Hoy es tu día, Sofi, y quiero que lo sientas completo.

Cada año que cumplís es un año más de todo lo que sos: tu curiosidad, tu arte, tu risa, tu forma de amar las cosas con tanta intensidad.

Muchas felicidades. Te merecés todo lo bueno.`,
    firma: 'Siempre tuyo 💜'
  },
  {
    id: 3,
    date: 'Para nuestro aniversario',
    title: 'Carta de aniversario',
    preview: 'Un año más de nuestra historia juntos...',
    locked: true,
    saludo: 'Osita,',
    body: `Un año más. Y cada uno mejor que el anterior.

Gracias por elegirme, Sofi, por confiar en mí, por dejarme ser parte de tu historia tan bonita.

Aquí seguimos, y ojalá sigamos así por mucho, mucho tiempo más.`,
    firma: 'Con todo mi amor 💜'
  },
  {
    id: 4,
    date: 'Para cuando estés triste',
    title: 'Para los días difíciles',
    preview: 'Ábrela cuando lo necesités...',
    locked: false,
    saludo: 'Oye, Osita,',
    body: `Si estás leyendo esto es porque estás pasando por un momento difícil. Y quiero que sepas que está bien. Los días grises existen para todos.

Pero también quiero que recuerdes todo lo que eres, Sofi para mi eres una persona que se emociona con la música, que ama a sus amigos, que trabaja duro, que lee, aprende y crece.

Eso no desaparece en los días malos. Solo descansa.

Yo estoy aquí. Siempre.`,
    firma: 'Te amo mucho 💜'
  },
  {
    id: 5,
    date: 'Una sorpresa',
    title: 'Lo que más me gusta de ti',
    preview: 'Una lista que hice pensando en ti...',
    locked: false,
    saludo: 'Osita,',
    body: `Aquí va una lista de cosas que me encantan de ti:

— La forma en que te emocionás cuando hablás de algo que te gusta
— Que trabajás en un lugar maravilloso con personas magnificas
— Que los gatitos te hacen feliz.
— Que eres de las personas que terminan los libros que empiezan
— Tu risa cuando jugamos algo juntos
— Tu forma de ser tan dedicada a tus amigos y conmigo
— Que me enseñaste a amar de verdad 
— Que me apoyás en mis cosas, aunque no las entiendas del todo
— Que me hacés querer ser mejor
— Que me sorprende cada día con algo nuevo que aprendiste o descubriste
— Que me hacés sentir que todo es posible
— Que me hacés sentir amado, siempre
— Que decidiste ir a votar ese día

Podría seguir, Sofi, pero creo que entiendes la idea.`,
    firma: 'Con mucho amor 💜'
  },
  {
    id: 6,
    date: 'Para el futuro',
    title: 'Una carta del futuro',
    preview: 'Lo que imagino para nosotros...',
    locked: true,
    saludo: 'Hola desde el pasado, Osita,',
    body: `Esta carta la escribí pensando en todo lo que queremos construir juntos.

Espero que cuando la leas ya hayamos vivido muchas aventuras más, muchos paseos, muchas noches de juegos de mesa, muchos libros compartidos, muchas canciones tarareadas juntos.

Espero que sigamos eligiéndonos, Sofi.`,
    firma: 'El que te ama 💜'
  }
];

function renderCartas() {
  const grid = document.getElementById('cartasGrid');
  grid.innerHTML = cartasData.map(c => `
    <div class="carta-card ${c.locked ? 'carta-locked' : ''}"
         onclick="${c.locked ? 'lockedLetter()' : `openLetter(${c.id})`}">
      <span class="carta-icon">${c.locked ? '🔒' : '✉️'}</span>
      <div class="carta-date">${c.date}</div>
      <div class="carta-title">${c.title}</div>
      <div class="carta-preview">${c.locked ? '🔒 Esta carta tiene su momento especial...' : c.preview}</div>
    </div>
  `).join('');
}

function openLetter(id) {
  const c = cartasData.find(x => x.id === id);
  if (!c || c.locked) return;
  document.getElementById('lDate').textContent   = c.date;
  document.getElementById('lSaludo').textContent = c.saludo;
  document.getElementById('lBody').innerHTML     = c.body.replace(/\n/g, '<br>');
  document.getElementById('lFirma').textContent  = c.firma;
  document.getElementById('letterModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function lockedLetter() {
  showToast('💜 Esta carta tiene su momento especial...');
}
