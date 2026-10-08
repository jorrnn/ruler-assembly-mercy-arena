# RULER ASSEMBLY Mercy Arena

A modern grey church website inspired by the supplied reference: bold typography, editorial blocks, story timeline, impact statistics, ministry cards, events, sermon feature, prayer request and visit forms.

## Run the website

1. Install Node.js.
2. Open PowerShell in this folder.
3. Run:

```powershell
npm install
npm start
```

4. Open `http://localhost:3000` in your browser.

## Main files

- `frontend/index.html` — page structure/content
- `frontend/style.css` — all design and responsive layout
- `frontend/app.js` — menus, modals, animations, API calls and actions
- `backend/server.js` — simple Express backend/API
- `package.json` — project configuration

## Working actions

- Mobile hamburger menu
- Smooth navigation
- Plan a Visit form → `POST /api/plan-visit`
- Prayer Request form → `POST /api/prayer-request`
- Events load from backend → `GET /api/events`
- Modal windows and Escape-to-close
- Scroll reveal animations
- Back-to-top button
- Responsive layout for phone/tablet/desktop

## Important

The demo backend stores submitted requests only in memory. If the server restarts, those demo submissions disappear. For a real church deployment, connect the forms to a database/email service.

## Customizing

Replace the sample Unsplash image URLs in `style.css` with your church's own images. Change service times, address, phone number, social links and event data in `backend/server.js` and `index.html`.

## Admin Dashboard

Start the server with `npm start`, then visit `http://localhost:3000/admin`.

Demo credentials:
- Username: `admin`
- Password: `admin123`

Visitor submissions are stored in `backend/data/submissions.json` so they remain after restarting the server.

For production, set environment variables before starting the server:
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

PowerShell example:
`$env:ADMIN_USERNAME="churchadmin"`
`$env:ADMIN_PASSWORD="Use-a-strong-password-here"`
`npm start`
