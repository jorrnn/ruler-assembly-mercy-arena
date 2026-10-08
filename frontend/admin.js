const tokenKey = 'rulerAssemblyAdminToken';
const $ = s => document.querySelector(s);
const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const formatDate = value => value ? new Date(value).toLocaleString() : '';

function showDashboard(){ $('#loginView').classList.add('hidden'); $('#dashboardView').classList.remove('hidden'); loadDashboard(); }
function showLogin(){ $('#dashboardView').classList.add('hidden'); $('#loginView').classList.remove('hidden'); }

async function login(username,password){
  const response = await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
  const data = await response.json();
  if(!response.ok) throw new Error(data.message || 'Login failed.');
  localStorage.setItem(tokenKey,data.token); showDashboard();
}

$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const msg=$('#loginMessage');msg.textContent='Signing in...';try{await login($('#username').value,$('#password').value);msg.textContent='';}catch(err){msg.textContent=err.message;}});

async function api(url,options={}){
  const token=localStorage.getItem(tokenKey);
  const response=await fetch(url,{...options,headers:{...(options.headers||{}),Authorization:`Bearer ${token}`}});
  if(response.status===401){localStorage.removeItem(tokenKey);showLogin();throw new Error('Your admin session has expired.');}
  const data=await response.json(); if(!response.ok) throw new Error(data.message||'Request failed.'); return data;
}

function tableHTML(headers,rows){
  if(!rows.length)return '<div class="empty">No information has been submitted yet.</div>';
  return `<table class="data-table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
}

function render(data){
  $('#totalCount').textContent=data.stats.total;$('#visitCount').textContent=data.stats.visits;$('#prayerCount').textContent=data.stats.prayerRequests;$('#messageCount').textContent=data.stats.messages;
  $('#visitBadge').textContent=data.visits.length;$('#prayerBadge').textContent=data.prayerRequests.length;$('#messageBadge').textContent=data.messages.length;
  $('#visitsTable').innerHTML=tableHTML(['Name','Phone','Date','Service','Guests','Received','Action'],data.visits.map(x=>`<tr><td><b>${escapeHTML(x.name)}</b></td><td>${escapeHTML(x.phone)}</td><td>${escapeHTML(x.date)}</td><td>${escapeHTML(x.service)}</td><td>${escapeHTML(x.guests)}</td><td>${formatDate(x.createdAt)}</td><td><button class="delete" data-type="visits" data-id="${x.id}">Delete</button></td></tr>`));
  $('#prayersTable').innerHTML=tableHTML(['Name','Email','Prayer Request','Privacy','Received','Action'],data.prayerRequests.map(x=>`<tr><td><b>${escapeHTML(x.name)}</b></td><td>${escapeHTML(x.email||'—')}</td><td>${escapeHTML(x.request)}</td><td>${x.privateRequest?'<span class="private">PRIVATE</span>':'Public'}</td><td>${formatDate(x.createdAt)}</td><td><button class="delete" data-type="prayerRequests" data-id="${x.id}">Delete</button></td></tr>`));
  $('#messagesTable').innerHTML=tableHTML(['Name','Email','Subject','Message','Received','Action'],data.messages.map(x=>`<tr><td><b>${escapeHTML(x.name)}</b></td><td>${escapeHTML(x.email)}</td><td>${escapeHTML(x.subject)}</td><td>${escapeHTML(x.message)}</td><td>${formatDate(x.createdAt)}</td><td><button class="delete" data-type="messages" data-id="${x.id}">Delete</button></td></tr>`));
}

async function loadDashboard(){try{const data=await api('/api/admin/submissions');render(data);$('#dashboardMessage').textContent='';}catch(err){if(localStorage.getItem(tokenKey))$('#dashboardMessage').textContent=err.message;}}

document.addEventListener('click',async e=>{const btn=e.target.closest('.delete');if(!btn)return;if(!confirm('Delete this submission? This cannot be undone.'))return;try{await api(`/api/admin/submissions/${btn.dataset.type}/${btn.dataset.id}`,{method:'DELETE'});await loadDashboard();}catch(err){alert(err.message);}});
$('#refreshBtn').addEventListener('click',loadDashboard);
$('#logoutBtn').addEventListener('click',async()=>{try{await api('/api/admin/logout',{method:'POST'});}catch{}localStorage.removeItem(tokenKey);showLogin();});

if(localStorage.getItem(tokenKey))showDashboard();
