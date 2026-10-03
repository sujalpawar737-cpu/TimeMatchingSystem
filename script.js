import { auth, db, configured } from './firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

const $ = id => document.getElementById(id);
const hours = Array.from({ length: 14 }, (_, i) => String(i + 8).padStart(2, '0') + ':00');
let user = null;
let roomId = '';
let room = null;
let members = [];

function timeLabel(time) {
  const hour = Number(time.slice(0, 2));
  const label = h => `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`;
  return `${label(hour)} – ${label(hour + 1)}`;
}

function dateLabel(date) {
  return new Date(date + 'T12:00:00+05:30').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

function message(text, error = false) {
  $('message').textContent = text;
  $('message').classList.toggle('error', error);
}

function showPanel(id) {
  for (const panel of ['auth-panel', 'home-panel', 'join-panel', 'room-panel']) $(panel).hidden = panel !== id;
}

// A shared wrapper keeps network errors and loading behaviour in one place.
async function run(task) {
  document.querySelectorAll('button').forEach(button => button.disabled = true);
  message('Please wait…');
  try {
    await task();
  } catch (error) {
    const errors = {
      'auth/invalid-credential': 'Email or password is incorrect.',
      'auth/email-already-in-use': 'This email already has an account. Sign in instead.',
      'auth/weak-password': 'Choose a stronger password.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'permission-denied': 'Access denied. Check your membership and the Firebase rules.',
      'unavailable': 'Connection unavailable. Check your internet and try again.'
    };
    message(errors[error.code] || error.message || 'Something went wrong. Please try again.', true);
  } finally {
    document.querySelectorAll('button').forEach(button => button.disabled = false);
  }
}

function makeElement(tag, text, className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  element.className = className;
  return element;
}

for (const time of hours) {
  const label = makeElement('label', '', 'slot');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = 'time';
  checkbox.value = time;
  label.append(checkbox, document.createTextNode(timeLabel(time)));
  $('slots').append(label);
}

// Each slot is one hour. Count the members who selected that same slot.
function findMatches(people) {
  return hours.map(time => {
    const missing = people.filter(person => !person.times.includes(time));
    return { time, count: people.length - missing.length, missing };
  }).sort((a, b) => b.count - a.count || a.time.localeCompare(b.time));
}

function validMeetingLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      ['zoom.us', 'discord.gg', 'discord.com', 'meet.google.com'].some(host => url.hostname === host || (host === 'zoom.us' && url.hostname.endsWith('.zoom.us')));
  } catch {
    return false;
  }
}

function inviteUrl() {
  const url = new URL(location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('room', roomId);
  return url.href;
}

async function openRoom(id) {
  if (!/^[A-Za-z0-9]{20}$/.test(id)) throw new Error('Please enter a valid group link or 20-character group code.');
  const snapshot = await getDoc(doc(db, 'rooms', id));
  if (!snapshot.exists()) throw new Error('This group was not found. Check the invite link.');
  roomId = id;
  room = snapshot.data();
  $('meeting-url').value = '';
  history.replaceState(null, '', '?room=' + roomId);
  const mine = await getDoc(doc(db, 'rooms', roomId, 'members', user.uid));
  if (!mine.exists()) {
    $('join-title').textContent = room.title;
    $('join-date').textContent = dateLabel(room.date) + ' · One-hour slots · IST';
    $('member-name').value = user.email.split('@')[0];
    showPanel('join-panel');
    message('Add your name to join. Anyone with this invite can join the group.');
    return;
  }
  await refreshRoom();
  showPanel('room-panel');
  message('Group loaded. Select your free hours below.');
}

async function refreshRoom() {
  const snapshot = await getDocs(collection(db, 'rooms', roomId, 'members'));
  members = snapshot.docs.map(member => ({ id: member.id, ...member.data() }));
  const mine = members.find(member => member.id === user.uid);
  $('room-title').textContent = room.title;
  $('room-date').textContent = dateLabel(room.date) + ' · One-hour slots · IST';
  $('share-link').value = inviteUrl();
  document.querySelectorAll('#slots input').forEach(input => input.checked = mine.times.includes(input.value));
  $('saved-status').textContent = mine.submitted ? 'Your availability is saved. You can change it and save again.' : 'Not saved yet. Select slots, or save an empty selection if you are unavailable.';
  $('member-count').textContent = `${members.length} ${members.length === 1 ? 'person' : 'people'} in this group`;
  $('members').replaceChildren();
  for (const member of members) {
    const item = makeElement('li', '');
    item.append(makeElement('span', member.name + (member.id === user.uid ? ' (you)' : '')),
      makeElement('span', member.submitted ? `${member.times.length} slots saved` : 'Not submitted', member.submitted ? 'badge' : 'badge pending'));
    $('members').append(item);
  }
  $('meeting').hidden = true;
  $('meeting-form').hidden = true;
  $('matches').replaceChildren();
  $('meeting-time').replaceChildren();
  const waiting = members.filter(member => !member.submitted);
  if (members.length < 2 || waiting.length) {
    $('result-title').textContent = members.length < 2 ? 'Invite at least one friend' : 'Waiting for availability';
    $('result-note').textContent = members.length < 2 ? 'Matching starts when two or more people join and everyone submits.' : 'Still needed: ' + waiting.map(member => member.name).join(', ');
    return;
  }
  const ranked = findMatches(members);
  const common = ranked.filter(slot => slot.count === members.length);
  $('result-title').textContent = common.length ? 'Your common hours' : 'No common hour yet';
  $('result-note').textContent = common.length ? 'Everyone has marked these slots as available.' : 'These are suggestions, not confirmed times. Ask the listed friends if they can adjust, then update availability.';
  const shown = common.length ? common : ranked.filter(slot => slot.count > 0).slice(0, 3);
  if (!shown.length) $('result-note').textContent = 'No one selected any slots. Add availability and save again.';
  for (const slot of shown) {
    const card = makeElement('div', '', common.length ? 'match' : 'match suggestion');
    card.append(makeElement('strong', timeLabel(slot.time)), makeElement('p', `${slot.count}/${members.length} available`));
    if (!common.length) card.append(makeElement('p', 'Ask to adjust: ' + slot.missing.map(member => member.name).join(', ')));
    $('matches').append(card);
  }
  if (!common.length) return;
  if (room.ownerId === user.uid) {
    $('meeting-form').hidden = false;
    for (const slot of common) {
      const option = makeElement('option', timeLabel(slot.time));
      option.value = slot.time;
      $('meeting-time').append(option);
    }
  }
  const meeting = await getDoc(doc(db, 'rooms', roomId, 'meeting', 'details'));
  if (meeting.exists()) {
    const saved = meeting.data();
    if (common.some(slot => slot.time === saved.time) && validMeetingLink(saved.link)) {
      $('chosen-time').textContent = dateLabel(room.date) + ' · ' + timeLabel(saved.time) + ' IST';
      $('call-link').href = saved.link;
      $('meeting').hidden = false;
      $('meeting-time').value = saved.time;
      $('meeting-url').value = saved.link;
    }
  }
}

$('auth-form').addEventListener('submit', event => {
  event.preventDefault();
  const create = event.submitter.id === 'register';
  run(async () => {
    const action = create ? createUserWithEmailAndPassword : signInWithEmailAndPassword;
    await action(auth, $('email').value.trim(), $('password').value);
    $('password').value = '';
  });
});

$('logout').addEventListener('click', () => run(() => signOut(auth)));

$('create-form').addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
    const title = $('title').value.trim();
    const name = $('host-name').value.trim();
    if (!title || !name) throw new Error('Please enter a group title and your name.');
    const created = await addDoc(collection(db, 'rooms'), { title, date: $('date').value, ownerId: user.uid, createdAt: serverTimestamp() });
    await setDoc(doc(db, 'rooms', created.id, 'members', user.uid), { name, times: [], submitted: false });
    await openRoom(created.id);
    message('Group created. Copy the invite link and share it with your friends.');
  });
});

$('open-form').addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
    const value = $('invite').value.trim();
    const id = value.includes('://') ? new URL(value).searchParams.get('room') : value;
    await openRoom(id || '');
  });
});

$('join-form').addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
    const name = $('member-name').value.trim();
    if (!name) throw new Error('Please enter your name.');
    await setDoc(doc(db, 'rooms', roomId, 'members', user.uid), { name, times: [], submitted: false });
    await openRoom(roomId);
    message('You joined the group. Now save your availability.');
  });
});

$('availability-form').addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
    const times = Array.from(document.querySelectorAll('#slots input:checked'), input => input.value);
    await updateDoc(doc(db, 'rooms', roomId, 'members', user.uid), { times, submitted: true });
    await refreshRoom();
    message('Availability saved. Your friends can see it by refreshing their group.');
  });
});

$('meeting-form').addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
    const time = $('meeting-time').value;
    let link = $('meeting-url').value.trim();
    if (!validMeetingLink(link)) throw new Error('Use an HTTPS Zoom, Discord or Google Meet link.');
    link = new URL(link).href;
    // Read current schedules again before saving; another person may have edited theirs.
    await refreshRoom();
    if (members.length < 2 || members.some(member => !member.submitted || !member.times.includes(time))) throw new Error('This time no longer fits everyone. Check the updated results.');
    await setDoc(doc(db, 'rooms', roomId, 'meeting', 'details'), { time, link });
    await refreshRoom();
    message('Meeting saved. Everyone in the group can refresh to see the link.');
  });
});

$('refresh').addEventListener('click', () => run(async () => { await refreshRoom(); message('Group refreshed with the latest saved availability.'); }));
$('copy-link').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('share-link').value); message('Invite link copied.'); }
  catch { $('share-link').select(); message('Select and copy the invite link above.'); }
});
document.querySelectorAll('.back').forEach(button => button.addEventListener('click', () => {
  roomId = '';
  room = null;
  history.replaceState(null, '', location.pathname);
  showPanel('home-panel');
  message('Keep your invite link to reopen the group.');
}));

const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
$('date').value = today;
$('date').min = today;
if (configured) {
  onAuthStateChanged(auth, currentUser => {
    user = currentUser;
    $('account').hidden = !user;
    if (!user) { showPanel('auth-panel'); message('Sign in or create an account to continue.'); return; }
    $('user-email').textContent = user.email;
    $('host-name').value = user.email.split('@')[0];
    showPanel('home-panel');
    const invited = new URLSearchParams(location.search).get('room');
    if (invited) run(() => openRoom(invited));
    else message('Create a group or open a friend’s invite.');
  });
} else {
  message('Firebase is not connected yet. Add your web app configuration in firebase.js to enable accounts and shared data.', true);
  document.querySelectorAll('button').forEach(button => button.disabled = true);
}
