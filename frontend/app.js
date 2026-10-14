const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const nav = $('#mainNav');
$('#menuBtn').addEventListener('click', () => nav.classList.toggle('mobile-open'));
$$('#mainNav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('mobile-open')));

function openModal(id){ const modal = document.getElementById(id); if(!modal)return; modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }
function closeModal(modal){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
$$('[data-open-modal]').forEach(btn => btn.addEventListener('click', () => openModal(btn.dataset.openModal)));
$$('.close-modal').forEach(btn => btn.addEventListener('click', () => closeModal(btn.closest('.modal'))));
$$('.modal').forEach(m => m.addEventListener('click', e => { if(e.target === m) closeModal(m); }));
document.addEventListener('keydown', e => { if(e.key === 'Escape') $$('.modal.open').forEach(closeModal); });

$$('[data-scroll]').forEach(btn => btn.addEventListener('click', () => document.querySelector(btn.dataset.scroll)?.scrollIntoView({behavior:'smooth'})));

const toast = $('#toast');
function showToast(message){ toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3500); }

async function sendForm(form, endpoint){
  const message = $('.form-message', form);
  const button = $('button[type="submit"]', form);
  const original = button.textContent;
  button.disabled = true; button.textContent = 'Sending...';
  try{
    const body = Object.fromEntries(new FormData(form).entries());
    const response = await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data = await response.json();
    message.textContent = data.message;
    if(data.success){ form.reset(); showToast(data.message); setTimeout(() => closeModal(form.closest('.modal')), 900); }
  }catch(err){ message.textContent = 'Could not connect to the server. Please make sure the backend is running.'; }
  finally{ button.disabled = false; button.textContent = original; }
}
$('#visitForm').addEventListener('submit', e => { e.preventDefault(); sendForm(e.target,'/api/plan-visit'); });
$('#prayerForm').addEventListener('submit', e => { e.preventDefault(); sendForm(e.target,'/api/prayer-request'); });

async function loadEvents(){
  const list = $('#eventsList');
  try{
    const events = await fetch('/api/events').then(r => r.json());
    list.innerHTML = events.map(e => `<article class="event"><div class="event-date">${e.date}</div><div><h3>${e.title}</h3><p>${e.time}</p></div></article>`).join('');
  }catch (error) {
    console.error('Error loading events:', error);

    list.innerHTML = `
        <div class="loading">
            Our events are temporarily unavailable.
            Please check back soon.
        </div>
    `;
}
}
loadEvents();

// $('#playSermon').addEventListener('click', () => showToast('Sermon player ready — connect this button to your YouTube or video URL.'));
// $('#watchBtn').addEventListener('click', () => showToast('Add your sermon video link in app.js to make this button open the video.'));

const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('visible'); }), {threshold:.12});
$$('.reveal').forEach(el => observer.observe(el));

const backTop = $('#backTop');
window.addEventListener('scroll', () => backTop.classList.toggle('show', window.scrollY > 600));
backTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
