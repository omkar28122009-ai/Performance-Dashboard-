# YUKTI — Maharashtra SSC Class 10 Focus Dashboard

A responsive study-planning dashboard built with HTML, CSS, JavaScript modules and Firebase Authentication + Realtime Database.

## Included features

- Firebase email/password sign-in, registration and password reset.
- Private per-user study data stored under `users/{uid}` in Realtime Database.
- Fixed daily allocation that matches your requested plan:
  - Mathematics: 2 hours — Algebra **or** Geometry.
  - Science: 2 hours — Part I **or** Part II.
  - Social Science: 2 hours — History **or** Political Science **or** Geography.
  - English: 1 hour daily.
  - Marathi: 1 hour daily.
  - Hindi: 1 hour daily.
  - Daily revision: 1 hour.
  - Total focused study: exactly 10 hours.
- 30-day syllabus rotation with day selector and daily block completion tracking.
- Focus timer with 25 / 50 / 90 / 120 minute presets.
- Manual study records with subject, topic, duration, confidence and reflection.
- Performance metrics, weekly focus bars, subject totals and a 28-day activity map.
- Quick notes for formulas, doubts, definitions and exam strategies.
- Study alarms, snooze, repeating daily reminders, browser notifications and sound while the page is open.
- JSON backup, CSV study-record export and 30-day plan export.
- Responsive layouts for desktop and mobile, installable PWA shell and offline app-shell caching.

## 1. Enable Firebase Authentication

1. Open the Firebase Console for project `yukti-247`.
2. Open **Build → Authentication → Sign-in method**.
3. Enable **Email/Password**.
4. Save the changes.

## 2. Configure Realtime Database rules

1. Open **Build → Realtime Database → Rules**.
2. Replace the rules with the content of `database.rules.json`.
3. Publish the rules.

The rules restrict each account to its own `users/{uid}` data. Do not replace them with public read/write rules.

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

## 3. Run the website

This is a browser ES-module project. Do **not** open `index.html` directly as a `file://` page. Serve the folder through HTTPS or a local web server.

### Quick local test

Open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`. Firebase Authentication and Database still require an internet connection.

### Deploy with Firebase Hosting

Install Firebase CLI and sign in:

```bash
npm install -g firebase-tools
firebase login
```

The provided `firebase.json` and `.firebaserc` are already configured for project `yukti-247`. From this project folder, deploy the static site with:

```bash
firebase deploy --only hosting
```

You can also deploy the static folder through GitHub Pages or another HTTPS static host. Add the deployed domain under **Firebase Console → Authentication → Settings → Authorized domains** if Firebase requests it.

## 4. First use

1. Open the deployed site.
2. Create an account using email and password.
3. The dashboard creates a private profile and starts the 30-day plan from the current local date.
4. In **Settings**, change the programme start date if you want Day 1 to begin on another date.
5. Use **30-day schedule** to inspect each day, start a focus timer, or mark a block complete.
6. Use **Study records** to add work completed outside the focus timer.
7. Use **Performance** to review only the data you have actually recorded.
8. Use **Alarms & reminders** to add reminders and allow notifications when your browser asks.

## Alarm limitation — please read

The built-in alarm checker runs in the open website tab. Browser notifications and the sound alarm can work while the dashboard is open and the browser permits its scripts to run. A normal static website cannot guarantee execution at a scheduled time after the browser or phone has been fully closed, force-stopped or suspended by the operating system.

Reliable closed-app/background delivery requires a trusted server-side schedule and Firebase Cloud Messaging (FCM), typically using Cloud Functions or another scheduled backend. Never put Firebase Admin credentials or server credentials in browser JavaScript. The current build does **not** claim to provide guaranteed closed-app alarms.

## Data structure

```text
users/
  {uid}/
    profile/
    dailyLogs/{YYYY-MM-DD}/blocks/{math|science|social|english|marathi|hindi|revision}
    studySessions/{pushId}
    notes/{pushId}
    alarms/{pushId}
```

All user data is scoped to the authenticated UID by Realtime Database rules.

## Syllabus notes

The 30-day schedule follows the chapter / lesson sequence supplied for this study plan. Textbook chapter titles and language lesson sequences can differ by medium, course and edition. Verify the prescribed English, Marathi and Hindi textbooks and the current Maharashtra Board syllabus with your school / Balbharati edition before relying on a lesson title. The dashboard lets you record work and revise the plan; it does not represent an official board timetable or guarantee marks.

Official textbook portal: <https://ebooks.ebalbharati.in/>

## Firebase configuration

The provided web configuration is in `firebase-config.js`. Firebase web API keys identify the Firebase project and are expected to appear in browser apps; access control comes from Authentication and correctly published Realtime Database Security Rules. Do not add service-account JSON, private keys or Admin SDK credentials to this folder.
