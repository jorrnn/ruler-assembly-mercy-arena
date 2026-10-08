const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'submissions.json');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Ruler world';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Rulers123';
let adminToken = null;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ messages: [], prayerRequests: [], visits: [] }, null, 2));
}

function readSubmissions() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { messages: [], prayerRequests: [], visits: [] };
  }
}

function saveSubmissions(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const events = [
  { id: 1, title: 'Sunday Celebration Service', date: 'Every Sunday', time: '8:00 AM & 10:30 AM', category: 'Worship', location: 'Mercy Arena Main Auditorium' },
  { id: 2, title: 'Night of Mercy & Miracles', date: 'Friday, 7:00 PM', time: '7:00 PM', category: 'Prayer', location: 'Mercy Arena' },
  { id: 3, title: 'Youth Impact Gathering', date: 'Saturday, 4:00 PM', time: '4:00 PM', category: 'Youth', location: 'Mercy Arena Youth Hall' }
];

const ministries = [
  { title: 'Children', text: 'Helping children discover faith, friendship and purpose in a safe environment.' },
  { title: 'Youth', text: 'Building a generation that knows Christ, serves boldly and leads with purpose.' },
  { title: 'Worship', text: 'Creating room for people to encounter God through music, prayer and praise.' },
  { title: 'Outreach', text: 'Taking practical love and the message of hope into our communities.' }
];

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!adminToken || token !== adminToken) {
    return res.status(401).json({ success: false, message: 'Please log in as an administrator.' });
  }
  next();
}

app.get('/api/events', (req, res) => res.json(events));
app.get('/api/ministries', (req, res) => res.json(ministries));

app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ success: false, message: 'Please fill in your name, email and message.' });
  const data = readSubmissions();
  data.messages.push({ id: crypto.randomUUID(), name, email, subject: subject || 'General enquiry', message, createdAt: new Date().toISOString() });
  saveSubmissions(data);
  res.json({ success: true, message: `Thank you, ${name}. Your message has been received.` });
});

app.post('/api/prayer-request', (req, res) => {
  const { name, email, request, privateRequest } = req.body;
  if (!name || !request) return res.status(400).json({ success: false, message: 'Please provide your name and prayer request.' });
  const data = readSubmissions();
  data.prayerRequests.push({ id: crypto.randomUUID(), name, email: email || '', request, privateRequest: privateRequest === true || privateRequest === 'true' || privateRequest === 'on', createdAt: new Date().toISOString() });
  saveSubmissions(data);
  res.json({ success: true, message: 'Your prayer request has been received. Our prayer team will stand with you.' });
});

app.post('/api/plan-visit', (req, res) => {
  const { name, phone, date, service, guests } = req.body;
  if (!name || !phone || !date || !service) return res.status(400).json({ success: false, message: 'Please complete the required visit details.' });
  const data = readSubmissions();
  data.visits.push({ id: crypto.randomUUID(), name, phone, date, service, guests: guests || 1, createdAt: new Date().toISOString() });
  saveSubmissions(data);
  res.json({ success: true, message: `We are looking forward to welcoming you, ${name}!` });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Incorrect username or password.' });
  }
  adminToken = crypto.randomBytes(32).toString('hex');
  res.json({ success: true, token: adminToken, message: 'Login successful.' });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  adminToken = null;
  res.json({ success: true });
});

app.get('/api/admin/submissions', requireAdmin, (req, res) => {
  const data = readSubmissions();
  res.json({
    success: true,
    stats: {
      messages: data.messages.length,
      prayerRequests: data.prayerRequests.length,
      visits: data.visits.length,
      total: data.messages.length + data.prayerRequests.length + data.visits.length
    },
    ...data
  });
});

app.delete('/api/admin/submissions/:type/:id', requireAdmin, (req, res) => {
  const allowed = ['messages', 'prayerRequests', 'visits'];
  const { type, id } = req.params;
  if (!allowed.includes(type)) return res.status(400).json({ success: false, message: 'Invalid submission type.' });
  const data = readSubmissions();
  const before = data[type].length;
  data[type] = data[type].filter(item => item.id !== id);
  if (data[type].length === before) return res.status(404).json({ success: false, message: 'Submission not found.' });
  saveSubmissions(data);
  res.json({ success: true, message: 'Submission deleted.' });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'admin.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RULER ASSEMBLY Mercy Arena is running at http://localhost:${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`Demo admin login: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`);
});
