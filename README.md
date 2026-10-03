# TimeMatching System

HTML, CSS and JavaScript scheduling app with Firebase Authentication and Firestore.

Live website: https://timematching.vercel.app

Repository: https://github.com/sujalpawar737-cpu/TimeMatchingSystem

## The annoyance
My group of 4–5 engineering friends solves DSA questions shared on WhatsApp and usually discusses them around 7pm. When someone cannot attend, repeated messages are needed to find another time. This comes from my own experience.

## PRN 8: Two's company
Matching requires at least two accounts in a group and everyone's submitted availability. Each member saves their own slots. One person can prepare a group but cannot produce a group match alone.

## The great part
When no hour fits everyone, the app ranks alternatives and names the people who would need to adjust. It does not assume their agreement. When everyone has a common hour, the creator can select it and share a meeting link.

## Two unfamiliar testers
- Tester 1: ADD_REAL_OBSERVATION_AND_CHANGE
- Tester 2: ADD_REAL_OBSERVATION_AND_CHANGE

These entries must describe actual use without interface instructions. Replace them before submitting, and record the result after any change.

## AI use and a correction
AI assisted with implementation, simplification and automated checks. I supplied the DSA use case and chose the features and simpler stack. A correction during development moved the meeting link out of invitation-readable room metadata into a separate document restricted to group members.

## Known limitations and what is missing
- **No saved-group list:** returning to Home removes the current group from the page and address bar. Group data and a saved meeting link remain in Firestore, but Home does not list groups I created or joined. I must keep the invite link or group code to reopen one; losing it means there is no recovery option in the interface.
- **Manual invitations:** I must copy the invite link and send it through WhatsApp or another service. The app has no direct share button, contact list, email invitations or automatic notifications.
- **Manual refresh:** members press Refresh group to load other people's changes. Refresh also replaces any checkbox edits that have not been saved.
- **Limited scheduling:** one dated meeting per group and fixed one-hour slots from 8am–10pm IST. A new group is needed for another date. There is no calendar integration or native app.
- **Basic group controls:** invite holders with accounts can join. There are no leave/delete controls or account-recovery screen. Only the creator sets the meeting link.
- **Meeting validity:** the page hides a saved meeting if its time no longer fits everyone's submitted availability after refresh. This calculation is checked by the page; database rules protect access and editing but do not independently enforce everyone's availability.

The next improvements would be a My Groups section for reopening previous groups and a share button for sending invitations more easily. These are planned improvements, not implemented features.

## Run locally
Enable Firebase Email/Password authentication, create the default Firestore database and publish `firestore.rules`. Put the public web configuration in `firebase.js`: `apiKey`, `authDomain`, `projectId`, `appId`.

Open this folder in VS Code, install Live Server, right-click `index.html` and select Open with Live Server. Internet is required. There are no environment variables or npm dependencies in this version. Never commit account passwords or private service-account credentials.
