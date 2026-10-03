# TimeMatching System

A small web app to find a common hour for a study group or project team. Members use separate accounts to save availability, compare options and open a shared meeting link. It uses HTML, CSS, JavaScript, Firebase Authentication and Firestore, with a layout for phones and laptops.

Live website: https://timematching.vercel.app

Repository: https://github.com/sujalpawar737-cpu/TimeMatchingSystem

## The annoyance
My group of 4–5 friends shares DSA questions on WhatsApp and usually meets around 7pm. When someone cannot attend, we exchange messages to find another slot. I wanted everyone to enter their availability and see the options together.
It can also help classmates schedule project discussions or friends find a time to plan a trip.

## My constraint: Two's company (PRN ends in 8)
One person can create a group, but matching starts only after at least two accounts join and every member submits availability. Each person saves their own slots. This made shared groups the main feature instead of a personal timetable.

## The part I like
When no hour fits everyone, the app shows the closest options, how many members are free and who would need to adjust. I chose this because it gives the group something useful to discuss. For a common hour, the creator can add a Zoom, Discord or Google Meet link that members can open.

## What I learnt from two testers
Two friends who had not used the app before found joining inconvenient: they copied an invite from WhatsApp into the join field. Returning to Home meant entering it again because their group was not listed there.
I updated this README to explain how to reopen groups. The interface still needs a My Groups section and easier sharing; these are my next improvements.

## AI use and a mistake fixed
AI helped with the initial code, styling, Firebase integration and checking the matching logic. I supplied the DSA use case and chose plain JavaScript with fewer features to keep the flow easier to understand.
The initial assisted design kept the meeting link in invitation-readable group details. It was moved to a separate Firestore document that only group members can read.

## Current scope and next improvements
This version focuses on one date and one-hour slots from 8am–10pm IST.

- Group data and meeting links stay in Firestore. Keep the invite to reopen a group; sharing is manual and saved-group history is not implemented.
- Save selections before pressing Refresh group to see updates. Refresh replaces unsaved edits. Notifications are a future improvement.
- Invite holders with accounts can join. Leave/delete and account-recovery screens are not implemented. Matching runs in the page; database rules protect access and editing but do not enforce a common time. Refresh hides a saved meeting that no longer fits everyone.

## Run locally
Enable Firebase Email/Password authentication, create the default Firestore database and publish `firestore.rules`. Add the public web configuration to `firebase.js`: `apiKey`, `authDomain`, `projectId`, `appId`.

In VS Code, install Live Server, right-click `index.html` and select Open with Live Server. Internet is required for Firebase's CDN SDK. No environment variables or npm installation are needed. Never commit passwords or private service-account keys.
