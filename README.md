# TimeMatching System

A small HTML, CSS and JavaScript website for finding a shared hour. Firebase handles Email/Password accounts and Firestore stores group data. No framework, build step or native app.

## The annoyance
Our group of 4–5 engineering friends solves DSA questions shared on WhatsApp and usually discusses them around 7pm. That time does not always work for everyone. This project replaces repeated messages about who is free. This example comes from my own experience; independent tester feedback is still pending.

## My constraint: Two's company (PRN ends in 8)
One person can create a group, but matching needs at least two members and everyone's submitted availability. Each person signs in separately and saves their own slots. No result is presented as a group match before that.

## The part I like
If everyone has a common hour, the creator can select it and share a Zoom, Discord or Google Meet link. Otherwise, the top three suggestions show how many can attend and who would need to adjust. Suggestions do not automatically change anyone's schedule. A refresh loads changes from other accounts.

## Two unfamiliar testers
Still to be done with two real people before submission. Give each person the deployed link without explaining the interface. Record where each gets stuck, their actual comments, and the change made. Do not replace this section with invented feedback.

## AI use and a mistake fixed
AI assisted with the initial implementation, simplification and technical checks. I still need to personally review, understand and customise the code before claiming ownership of those decisions in the interview. One mistake caught during development was treating the meeting link like public group metadata. It is now stored separately and only group members can read it; the rules also prevent people from editing another member's availability.

## Scope and what is missing
- One dated meeting per group, one-hour slots from 8am–10pm, all in IST. Create a new group for another day.
- Changes appear after pressing Refresh group; no background notifications, reminders, calendar integration, APK or Expo app.
- Anyone with the invite and an account can join. Names are display names, not verified identities. Only the creator sets the meeting link.
- The page hides a saved meeting if its time no longer fits everyone after refresh. Matching is checked in the client, not enforced as a database transaction, so this is a small trusted-group project.
- No leave/delete/account-recovery screen or group history. Keep invite links to reopen meetings. Refreshing replaces unsaved checkbox edits.
- Firebase setup, public GitHub upload, live deployment, browser/phone checks and the two human tests remain to be done in my own accounts. Automated checks do not replace those tests.

## Setup and local run
1. Create a Firebase project and register a web app. Copy the four public web configuration values into `firebase.js`. These values identify the app; database access is controlled by the rules. Never add service-account credentials or private keys.
2. Enable **Authentication → Email/Password**. Create **Cloud Firestore** in production mode and paste `firestore.rules` into the Rules tab, then publish. Use a fresh database for this project.
3. Open `index.html` using VS Code's **Live Server**, or run `python -m http.server 5500` in this folder and visit `http://localhost:5500`. Opening it directly with `file://` will not work with JavaScript modules. Add `localhost` to Firebase Authentication's authorised domains if needed.
4. Create two accounts in separate browser profiles (or a normal and private window). Create a group, share its link, join from the second account, save both schedules, and refresh. Test both a common hour and a case with no common hour.

There are no environment variables or npm packages in this version. Configuration is the public `firebaseConfig` object in `firebase.js`. The Firebase SDK loads from Google's CDN, so internet access is required.

## GitHub, Vercel and phone
Put these six files at the root of a public GitHub repository. Commit genuine changes as you make them; do not fabricate earlier development history. Import that repository into Vercel, select **Other**, leave the build command empty and use the root (`.`) as the output directory. Add the deployed hostname to Firebase Authentication's authorised domains. Open the HTTPS URL on a phone: the CSS changes to one column on smaller screens. This is a responsive website and does not require Expo Go.

Before submitting, replace the pending tester section with real observations and changes, and provide the live URL, public repository URL and a dedicated reviewer account through the club's submission form. Do not commit reviewer passwords.

## Reading the code
`index.html` contains forms and sections. `style.css` controls layout and phone sizing. `firebase.js` connects the SDK. `script.js` handles buttons, saves/loads documents and counts matching slots. `firestore.rules` protects database access. The main calculation is `findMatches`: for each hour, count members who selected it; a full match has a count equal to the group size.

Automated development checks passed using the page's DOM handlers and five authenticated Firebase emulator accounts, including matching, cross-account link sharing and rejected unauthorised database access. These were DOM tests, not visual browser or mobile tests. Test tools are not included in this small project folder.

References: [Firebase web setup](https://firebase.google.com/docs/web/setup), [Firestore rules](https://firebase.google.com/docs/firestore/security/get-started), [Vercel static builds](https://vercel.com/docs/builds/configure-a-build).
