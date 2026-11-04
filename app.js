import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, sendPasswordResetEmail, signOut,
  updateProfile, setPersistence, browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js';
import {
  getDatabase, ref, onValue, set, update, push, remove
} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const pad = n => String(n).padStart(2, '0');
const localDateKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
const parseDateKey = key => new Date(`${key}T00:00:00`);
const addDays = (date, days) => { const d = new Date(date); d.setDate(d.getDate()+days); return d; };
const formatDate = (date, options = {weekday:'long', day:'numeric', month:'long', year:'numeric'}) => new Intl.DateTimeFormat('en-IN', options).format(date);
const shortDate = key => formatDate(parseDateKey(key), {day:'numeric', month:'short'});
const todayKey = localDateKey();
const SUBJECTS = ['Algebra','Geometry','Science Part I','Science Part II','History','Political Science','Geography','English','Marathi','Hindi','Revision','Other'];

const mathAlgebra = [
  'Linear Equations in Two Variables','Quadratic Equations','Arithmetic Progression','Financial Planning','Probability','Statistics'
];
const mathGeometry = ['Similarity','Pythagoras Theorem','Circle','Geometric Constructions','Co-ordinate Geometry','Trigonometry','Mensuration'];
const science1 = ['Gravitation','Periodic Classification of Elements','Chemical Reactions and Equations','Effects of Electric Current','Heat','Refraction of Light','Lenses','Metallurgy','Carbon Compounds','Space Missions'];
const science2 = ['Heredity and Evolution','Life Processes in Living Organisms Part 1','Life Processes in Living Organisms Part 2','Environmental Management','Towards Green Energy','Animal Classification','Introduction to Microbiology','Cell Biology and Biotechnology','Social Health','Disaster Management'];
const history = ['Historiography: Development in the West','Historiography: Indian Tradition','Applied History','History of Indian Arts','Mass Media and History','Entertainment and History','Sports and History','Tourism and History','Heritage Management'];
const civics = ['Working of the Constitution','The Electoral Process','Political Parties','Social and Political Movements','Challenges Faced by Indian Democracy'];
const geography = ['Field Visit','Location and Extent','Physiography and Drainage','Climate','Natural Vegetation and Wildlife','Population','Human Settlements','Economy and Occupations','Tourism, Transport and Communication'];
const english = [
  '1.1 Where the Mind is Without Fear',"1.2 The Thief's Story",'1.3 On Wings of Courage',"1.4 All the World's a Stage",'1.5 Joan of Arc','1.6 The Alchemy of Nature','2.1 Animals','2.2 Three Questions','2.3 Connecting the Dots','2.4 The Pulley',"2.5 Let's March",'2.6 Science and Spirituality','3.1 Night of the Scorpion','3.2 The Night I Met Einstein','3.3 Stephen Hawking','3.4 The Will to Win','3.5 Unbeatable Super Mom – Mary Kom','3.6 The Concert','4.1 A Thing of Beauty is a Joy For Ever','4.2 The Luncheon','4.3 World Heritage','4.4 The Height of the Ridiculous','4.5 The Old Man and the Sea: Book Review','4.6 The Gift of the Magi'
];
const marathi = ['तू बुद्धी दे','संतवाणी','शाल','उपास','मोठे होत असलेल्या मुलांनो...','दोन दिवस','चुडीवाला','फूटप्रिन्टस','ऊर्जाशक्तीचा जागर','जाता अस्ताला','औक्षण','रंग साहित्याचे','जंगल डायरी','रंग मजेचे रंग उदयाचे','जगणं कॅक्टसचं','हिरवंगार झाडासारखं','बीज पेरले गेले','खरा नागरिक','स्वप्न करू साकार','व्युत्पत्ती कोश','पत्रलेखन','व्याकरण आणि भाषाभ्यास','अपठित गद्य आणि लेखन कौशल्य','मराठी संपूर्ण पुनरावृत्ती'];
const hindi = ['भारत महिमा','लक्ष्मी','वाह रे! हमदर्द','मन (पूरक पठन)','गोवा : जैसा मैंने देखा','गिरिधर नागर','खुला आकाश (पूरक पठन)','गजल','रीढ़ की हड्डी','ठेस (पूरक पठन)','कृषक गान','बरषहिं जलद','दो लघुकथाएँ','श्रम साधना','छापा','ईमानदारी की प्रतिमूर्ति','हम उस धरती की संतति हैं','महिला आश्रम','अपनी गंध नहीं बेचूँगा','जब तक जिंदा रहूँ, लिखता रहूँ','बूढ़ी काकी','समता की ओर','हिंदी व्याकरण और लेखन कौशल','हिंदी संपूर्ण पुनरावृत्ती'];

const TIME_BLOCKS = [
  {id:'math', time:'6:00–8:00 AM', short:'06:00–08:00', name:'Mathematics', duration:120},
  {id:'science', time:'9:00–11:00 AM', short:'09:00–11:00', name:'Science & Technology', duration:120},
  {id:'social', time:'11:20 AM–1:20 PM', short:'11:20–13:20', name:'Social Science', duration:120},
  {id:'english', time:'2:20–3:20 PM', short:'14:20–15:20', name:'English', duration:60},
  {id:'marathi', time:'3:20–4:20 PM', short:'15:20–16:20', name:'Marathi', duration:60},
  {id:'hindi', time:'4:20–5:20 PM', short:'16:20–17:20', name:'Hindi', duration:60},
  {id:'revision', time:'6:30–7:30 PM', short:'18:30–19:30', name:'Daily revision', duration:60}
];

function dayTopics(day) {
  let math;
  if (day <= 13) {
    const seq = [
      ['Algebra',mathAlgebra[0]],['Geometry',mathGeometry[0]],['Algebra',mathAlgebra[1]],['Geometry',mathGeometry[1]],['Algebra',mathAlgebra[2]],['Geometry',mathGeometry[2]],['Algebra',mathAlgebra[3]],['Geometry',mathGeometry[3]],['Algebra',mathAlgebra[4]],['Geometry',mathGeometry[4]],['Algebra',mathAlgebra[5]],['Geometry',mathGeometry[5]],['Geometry',mathGeometry[6]]
    ];
    const [branch, topic] = seq[day-1]; math = {subject:branch, topic, detail:`${branch} · Chapter ${branch==='Algebra' ? mathAlgebra.indexOf(topic)+1 : mathGeometry.indexOf(topic)+1}`};
  } else {
    const review = {
      14:['Algebra','Chapters 1–3 · concept and exercise revision'],15:['Geometry','Chapters 1–3 · theorems and examples'],16:['Algebra','Chapters 4–6 · concept and exercise revision'],17:['Geometry','Chapters 4–7 · constructions and applications'],18:['Algebra','Mixed problems · independent solving'],19:['Geometry','Proofs, constructions and applications'],20:['Algebra','Complete textbook exercise practice'],21:['Geometry','Complete textbook exercise practice'],22:['Algebra','Timed practice · formulas and weak areas'],23:['Geometry','Timed practice · proofs and weak areas'],24:['Algebra OR Geometry','Choose ONE weakest branch · chapter test and corrections'],25:['Algebra','Full timed mock paper'],26:['Geometry','Full timed mock paper'],27:['Algebra OR Geometry','Choose ONE branch · weak chapters and targeted practice'],28:['Algebra OR Geometry','Choose ONE branch · weak chapters and targeted practice'],29:['Algebra OR Geometry','Choose ONE lowest-scoring branch · retest'],30:['Algebra OR Geometry','Choose ONE branch · final formula and error-log revision']
    };
    math = {subject:review[day][0],topic:review[day][1],detail:review[day][1]};
  }

  let science;
  if (day <= 20) {
    const part = day % 2 === 1 ? 1 : 2;
    const chapter = Math.ceil(day/2);
    const list = part === 1 ? science1 : science2;
    science = {subject:`Science Part ${part}`,topic:list[chapter-1],detail:`Part ${part} · Chapter ${chapter}`};
  } else {
    const review = {
      21:[1,'Chapters 1–5 · revision and diagrams'],22:[2,'Chapters 1–5 · revision and diagrams'],23:[1,'Chapters 6–10 · revision and applications'],24:[2,'Chapters 6–10 · revision and applications'],25:[1,'Full timed mock paper'],26:[2,'Full timed mock paper'],27:[1,'Weak topics · definitions, numericals and equations'],28:[2,'Weak topics · processes and diagrams'],29:[1,'Board-style questions and error correction'],30:[2,'Board-style questions and final revision']
    };
    const [part, topic] = review[day]; science = {subject:`Science Part ${part}`,topic,detail:`Science & Technology Part ${part}`};
  }

  let social;
  if(day <= 9) social={subject:'History',topic:history[day-1],detail:`History · Chapter ${day}`};
  else if(day<=14) social={subject:'Political Science',topic:civics[day-10],detail:`Political Science · Chapter ${day-9}`};
  else if(day<=23) social={subject:'Geography',topic:geography[day-15],detail:`Geography · Chapter ${day-14}`};
  else {
    const review={24:['Political Science','Complete revision and answer practice'],25:['History','Chapter test and answer presentation'],26:['Political Science','Chapter test and concept revision'],27:['Geography','Chapter test, maps and graphs'],28:['History','Board-style questions and chronology'],29:['Geography','Maps, graphs and weak topics'],30:['Political Science','Final revision and board-style questions']};
    social={subject:review[day][0],topic:review[day][1],detail:review[day][1]};
  }

  const languageTopic=(items,day,subject)=>day<=24?items[day-1]:({25:'Grammar and comprehension practice',26:'Poetry / literature appreciation',27:'Prose and textbook question practice',28:'Writing skills and prescribed formats',29:'Timed examination practice',30:'Mistake correction and final revision'}[day]);
  return {
    math, science, social,
    english:{subject:'English',topic:languageTopic(english,day,'English'),detail:day<=24?'Kumarbharati · Unit '+day:'Board skills · English'},
    marathi:{subject:'Marathi',topic:languageTopic(marathi,day,'Marathi'),detail:day<=24?'Aksharbharati · Lesson / skill '+day:'लेखन, व्याकरण आणि पुनरावृत्ती'},
    hindi:{subject:'Hindi',topic:languageTopic(hindi,day,'Hindi'),detail:day<=24?'Lokbharati · पाठ / घटक '+day:'लेखन, व्याकरण और पुनरावृत्ति'},
    revision:{subject:'Revision',topic:'Spaced repetition + active recall',detail:'Review yesterday, older topics and your mistake notebook'}
  };
}

function getDayBlocks(day) {
  const topics=dayTopics(day);
  return TIME_BLOCKS.map(block=>({...block,...topics[block.id]}));
}

let app, auth, db, currentUser=null, userData={}, activePage='overview', currentDate=todayKey, selectedDay=1, hasInitialisedData=false;
let timer={total:50*60,remaining:50*60,running:false,interval:null,subject:'Independent study',topic:'Focused study session',startedAt:null,endsAt:null,saved:false,blockId:null,date:todayKey};
let currentAlarm=null, alarmAudio=null, alarmCheckInterval=null, rootUnsubscribe=null, lastRenderedPage='';

const iconPaths={
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h7"/>',
  chart:'<path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/>',
  note:'<path d="M5 3h11l4 4v14H5z"/><path d="M16 3v5h4M8 12h8M8 16h8"/>',
  alarm:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M5 3 2 6M19 3l3 3"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2z" transform="translate(-1 -1) scale(1.08)"/>',
  logout:'<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  play:'<path d="m7 4 13 8-13 8z"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3"/>',
  edit:'<path d="m4 16-.8 4.8L8 20l11-11-4-4zM13.5 6.5l4 4"/>',
  search:'<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>',
  sparkle:'<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>'
};
const svgIcon=(name)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name]||iconPaths.sparkle}</svg>`;
function decorateIcons(root=document){$$('[data-icon]',root).forEach(el=>{const name=el.dataset.icon;el.innerHTML=svgIcon(name);});}

function toast(message, type='success'){
  const region=$('#toast-region'); if(!region)return;
  const node=document.createElement('div');node.className='toast';node.innerHTML=`<i></i><span>${escapeHtml(message)}</span>`;region.append(node);
  setTimeout(()=>{node.style.opacity='0';node.style.transform='translateY(5px)';setTimeout(()=>node.remove(),220);},3200);
}
function setSync(online=true,label='Cloud synced'){
  const el=$('.sync-indicator');if(!el)return;el.classList.toggle('offline',!online);$('#sync-label').textContent=label;
}
function profile(){return userData.profile||{};}
function rootPath(path=''){return `users/${currentUser.uid}${path?'/'+path:''}`;}
async function writeData(path,value){if(!currentUser)throw new Error('Please sign in first.');setSync(true,'Saving…');try{await set(ref(db,rootPath(path)),value);setSync(true,'Cloud synced');return true;}catch(error){setSync(false,'Sync issue');toast(firebaseError(error),'error');throw error;}}
async function updateData(path,value){if(!currentUser)throw new Error('Please sign in first.');setSync(true,'Saving…');try{await update(ref(db,rootPath(path)),value);setSync(true,'Cloud synced');return true;}catch(error){setSync(false,'Sync issue');toast(firebaseError(error),'error');throw error;}}
async function removeData(path){if(!currentUser)throw new Error('Please sign in first.');try{await remove(ref(db,rootPath(path)));setSync(true,'Cloud synced');return true;}catch(error){setSync(false,'Sync issue');toast(firebaseError(error),'error');throw error;}}
function firebaseError(error){const map={
  'auth/invalid-credential':'Email or password is incorrect.','auth/email-already-in-use':'This email already has an account. Sign in instead.','auth/weak-password':'Use a password with at least 6 characters.','auth/invalid-email':'Enter a valid email address.','auth/network-request-failed':'Network problem. Check your internet connection.','auth/too-many-requests':'Too many attempts. Please try again later.','auth/operation-not-allowed':'Enable Email/Password in Firebase Authentication sign-in providers.','auth/user-not-found':'No account was found for this email.','auth/wrong-password':'The password is incorrect.','PERMISSION_DENIED':'Database permission denied. Check the Realtime Database rules in README.'
};return map[error?.code]||map[error?.message]||error?.message||'Something went wrong. Please try again.';}

function showAuthMode(signup=false){
  $('#auth-title').textContent=signup?'Create your account':'Sign in to continue';
  $('#auth-subtitle').textContent=signup?'Create a private workspace for your SSC plan and study records.':'Your plan, progress and study records stay synced to your account.';
  $('#name-field').classList.toggle('hidden',!signup);$('#auth-name').required=signup;
  $('#auth-password').autocomplete=signup?'new-password':'current-password';
  $('#auth-submit').innerHTML=signup?'Create account <span>↗</span>':'Sign in <span>↗</span>';
  $('#reset-password').classList.toggle('hidden',signup);
  $('#auth-switch').innerHTML=signup?'Already have an account? <button type="button" id="auth-mode-toggle">Sign in</button>':'New here? <button type="button" id="auth-mode-toggle">Create an account</button>';
  $('#auth-error').textContent='';
  $('#auth-mode-toggle').addEventListener('click',()=>showAuthMode(!signup));
}

async function initFirebase(){
  try{
    app=initializeApp(firebaseConfig);auth=getAuth(app);db=getDatabase(app);
    await setPersistence(auth,browserLocalPersistence);
    onAuthStateChanged(auth, async user=>{
      if(user){currentUser=user;hasInitialisedData=false;$('#auth-screen').classList.add('hidden');$('#app-shell').classList.remove('hidden');
        if(rootUnsubscribe)rootUnsubscribe();
        $('#page-content').innerHTML='<div class="panel empty-state"><div class="empty-icon">◌</div><strong>Opening your study workspace…</strong>Connecting your private study records.</div>';
        rootUnsubscribe=onValue(ref(db,rootPath()),snap=>{
          userData=snap.val()||{};
          if(!userData.profile){const display=user.displayName||user.email?.split('@')[0]||'Student';set(ref(db,rootPath('profile')),{name:display,email:user.email||'',planStart:todayKey,dailyTarget:10,createdAt:Date.now()}).catch(error=>toast(firebaseError(error),'error'));return;}
          afterDataLoaded();
        },error=>{setSync(false,'Database unavailable');toast(firebaseError(error),'error');});
        registerServiceWorker();
        startAlarmWatcher();
      }else{
        currentUser=null;userData={};hasInitialisedData=false;if(rootUnsubscribe){rootUnsubscribe();rootUnsubscribe=null;}stopAlarmWatcher();$('#app-shell').classList.add('hidden');$('#auth-screen').classList.remove('hidden');
      }
    });
  }catch(error){$('#auth-error').textContent='Firebase could not initialise: '+firebaseError(error);}
}

$('#auth-form').addEventListener('submit',async e=>{
  e.preventDefault();const signup=!$('#name-field').classList.contains('hidden');const email=$('#auth-email').value.trim();const password=$('#auth-password').value;const name=$('#auth-name').value.trim();
  const submit=$('#auth-submit');submit.disabled=true;submit.textContent=signup?'Creating account…':'Signing in…';$('#auth-error').textContent='';
  try{
    if(signup){const credential=await createUserWithEmailAndPassword(auth,email,password);if(name)await updateProfile(credential.user,{displayName:name});await set(ref(db,`users/${credential.user.uid}/profile`),{name:name||email.split('@')[0],email,planStart:todayKey,dailyTarget:10,createdAt:Date.now()});}
    else await signInWithEmailAndPassword(auth,email,password);
  }catch(error){$('#auth-error').textContent=firebaseError(error);}finally{submit.disabled=false;submit.innerHTML=signup?'Create account <span>↗</span>':'Sign in <span>↗</span>';}
});
$('#auth-mode-toggle').addEventListener('click',()=>showAuthMode(true));
$('#password-toggle').addEventListener('click',()=>{const input=$('#auth-password');const shown=input.type==='text';input.type=shown?'password':'text';$('#password-toggle').textContent=shown?'Show':'Hide';});
$('#reset-password').addEventListener('click',async()=>{const email=$('#auth-email').value.trim();if(!email){$('#auth-error').textContent='Enter your email address first.';return;}try{await sendPasswordResetEmail(auth,email);toast('Password reset email sent.');}catch(e){$('#auth-error').textContent=firebaseError(e);}});

function afterDataLoaded(){
  const p=profile();if(!p.planStart){updateData('profile',{planStart:todayKey,dailyTarget:10}).catch(()=>{});return;}
  if(!currentDate)currentDate=todayKey;
  if(!hasInitialisedData){selectedDay=planDayForDate(todayKey);hasInitialisedData=true;}
  $('#sidebar-user-name').textContent=p.name||currentUser.displayName||'Student';$('#sidebar-user-email').textContent=currentUser.email||'';$('#sidebar-avatar').textContent=(p.name||currentUser.email||'S').slice(0,1).toUpperCase();
  updatePlanSidebar();
  const headerDate=$('#topbar-date');if(headerDate)headerDate.textContent=formatDate(new Date());
  renderPage();
  updateNotificationDot();
}
function planDayForDate(key){const start=parseDateKey(profile().planStart||todayKey);const date=parseDateKey(key);const diff=Math.floor((date-start)/86400000)+1;return Math.min(30,Math.max(1,diff));}
function dayDate(day){return localDateKey(addDays(parseDateKey(profile().planStart||todayKey),day-1));}
function updatePlanSidebar(){const day=planDayForDate(todayKey);$('#sidebar-day-label').textContent=`DAY ${pad(day)} / 30`;$('#sidebar-progress-fill').style.width=`${Math.round(day/30*100)}%`;}

function renderPage(){
  const content=$('#page-content');if(!content||!currentUser)return;
  const pages={overview:renderOverview,schedule:renderSchedule,studylog:renderStudyLog,performance:renderPerformance,notes:renderNotes,alarms:renderAlarms,settings:renderSettings};
  const titles={overview:'OVERVIEW',schedule:'30-DAY SCHEDULE',studylog:'STUDY RECORDS',performance:'PERFORMANCE',notes:'QUICK NOTES',alarms:'ALARMS & REMINDERS',settings:'SETTINGS'};
  $('#breadcrumb-page').textContent=titles[activePage]||'OVERVIEW';
  $$('.nav-item[data-page]').forEach(item=>item.classList.toggle('active',item.dataset.page===activePage));
  content.innerHTML=(pages[activePage]||renderOverview)();decorateIcons(content);lastRenderedPage=activePage;
}

function pageHeading(kicker,title,subtitle,actions=''){
  return `<div class="page-heading"><div><div class="section-kicker">${escapeHtml(kicker)}</div><h1>${title}</h1><p>${subtitle}</p></div>${actions?`<div class="heading-actions">${actions}</div>`:''}</div>`;
}
function statCard(label,value,foot,ico,tone){return `<article class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon ${tone}">${ico}</span></div><div class="stat-value">${value}</div><div class="stat-foot">${foot}</div></article>`;}
function doneCount(date=todayKey){const blocks=userData.dailyLogs?.[date]?.blocks||{};return Object.values(blocks).filter(v=>v?.status==='done').length;}
function doneBlock(date,id){return userData.dailyLogs?.[date]?.blocks?.[id]?.status==='done';}
function getSessions(){return Object.entries(userData.studySessions||{}).map(([id,v])=>({id,...v})).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));}
function totalMinutes(sessions=getSessions()){return sessions.reduce((sum,s)=>sum+Number(s.minutes||0),0);}
function formatDuration(minutes){const h=Math.floor(minutes/60),m=Math.round(minutes%60);return h?`${h}h ${m}m`:`${m}m`;}
function getStreak(){let streak=0;let d=new Date();const sessionDates=new Set(getSessions().map(s=>s.date));for(let i=0;i<365;i++){const key=localDateKey(d);const has=doneCount(key)>0||sessionDates.has(key);if(!has){if(i===0){d=addDays(d,-1);continue;}break;}streak++;d=addDays(d,-1);}return streak;}
function weekSummary(){const days=[],minutesByDate=new Map();getSessions().forEach(s=>minutesByDate.set(s.date,(minutesByDate.get(s.date)||0)+Number(s.minutes||0)));for(let i=6;i>=0;i--){const d=addDays(new Date(),-i),key=localDateKey(d);days.push({key,label:new Intl.DateTimeFormat('en-IN',{weekday:'short'}).format(d),minutes:minutesByDate.get(key)||0});}return days;}
function blockStatusButton(date,block){const done=doneBlock(date,block.id);return done?`<button class="tiny-action done-action" data-action="toggle-block" data-date="${date}" data-block="${block.id}">✓ Done</button>`:`<div class="row-actions"><button class="tiny-action" data-action="start-block" data-date="${date}" data-block="${block.id}">Start</button><button class="tiny-action" data-action="toggle-block" data-date="${date}" data-block="${block.id}">Mark done</button></div>`;}
function renderTodaySchedule(date=todayKey){const day=planDayForDate(date);const blocks=getDayBlocks(day);return `<div class="today-list">${blocks.map(b=>`<div class="schedule-row"><div class="schedule-time">${b.time}</div><div class="timeline-dot ${doneBlock(date,b.id)?'done':'pending'}"></div><div><div class="row-subject">${escapeHtml(b.name)} <span style="font-weight:500;color:#9aa7a1">· ${escapeHtml(b.subject)}</span></div><div class="row-topic">${escapeHtml(b.topic)}</div></div>${blockStatusButton(date,b)}</div>`).join('')}</div>`;}
function renderWeekChart(){const days=weekSummary(),max=Math.max(60,...days.map(d=>d.minutes));return `${days.map(d=>`<div class="week-col"><div class="week-hours">${d.minutes?`${(d.minutes/60).toFixed(1)}h`:'–'}</div><div class="week-bar-wrap"><div class="week-bar ${d.key===todayKey?'today':''}" style="height:${Math.max(3,d.minutes/max*100)}%"></div></div><div class="week-label">${d.label}</div></div>`).join('')}`;}
function renderOverview(){
  const day=planDayForDate(todayKey),done=doneCount(),blocks=7,mins=totalMinutes(),target=profile().dailyTarget||10;
  const progress=Math.round(done/blocks*100),weekTotal=weekSummary().reduce((s,d)=>s+d.minutes,0);
  return `${`<div class="dashboard-hero"><div class="hero-copy"><div class="eyebrow"><span class="eyebrow-dot"></span> DAY ${pad(day)} OF YOUR 30-DAY PLAN</div><h2>Good ${new Date().getHours()<12?'morning':new Date().getHours()<17?'afternoon':'evening'}, ${escapeHtml((profile().name||'scholar').split(' ')[0])}.<br><em>Let's make today count.</em></h2><p>Your focus plan is ready. Work through one block at a time and keep your progress intentional.</p><div class="hero-actions"><button class="btn btn-primary" data-action="start-general">${svgIcon('play')} Start a focus session</button><button class="btn btn-outline" data-action="go-schedule">View full schedule ↗</button></div></div><div class="hero-ring"><svg viewBox="0 0 120 120" width="120" height="120"><circle class="ring-track" cx="60" cy="60" r="50"/><circle class="ring-value" cx="60" cy="60" r="50" stroke-dasharray="314" stroke-dashoffset="${314-(314*progress/100)}"/></svg><div class="ring-copy"><strong>${progress}%</strong><span>DAY DONE</span></div></div></div>`}
    <div class="stat-grid">${statCard('TODAY’S BLOCKS',`${done}<small style="font-size:13px;color:#9aa9a3"> / 7</small>`,'Completed study blocks','✓','tone-teal')}${statCard('RECORDED STUDY',formatDuration(mins),'All-time logged focus','◷','tone-gold')}${statCard('CURRENT STREAK',`${getStreak()} <small style="font-size:13px;color:#9aa9a3">days</small>`,'Consecutive active days','✦','tone-blue')}${statCard('THIS WEEK',formatDuration(weekTotal),'Based on saved study records','↗','tone-coral')}</div>
    <div class="dashboard-grid"><section class="panel"><div class="panel-head"><div><h3 class="panel-title">Today’s study flow</h3><div class="panel-subtitle">Your fixed 10-hour structure · ${formatDate(parseDateKey(todayKey),{day:'numeric',month:'long'})}</div></div><button class="panel-link" data-action="go-schedule">Full plan ↗</button></div>${renderTodaySchedule()}</section><div><section class="panel"><div class="panel-head"><div><h3 class="panel-title">Your focus rhythm</h3><div class="panel-subtitle">Study minutes recorded over the last 7 days</div></div></div><div class="week-chart">${renderWeekChart()}</div><div class="chart-legend"><span>LAST 7 DAYS</span><strong>${formatDuration(weekTotal)} total</strong></div></section><section class="goal-card"><div class="goal-head"><span>DAILY COMPLETION</span><strong>${done}/7 blocks</strong></div><div class="goal-track"><span style="width:${progress}%"></span></div><div class="goal-foot">Mark each block complete after you finish its work. Your record syncs to Firebase.</div></section><section class="panel" style="margin-top:16px"><div class="panel-head"><div><h3 class="panel-title">Learn for understanding</h3><div class="panel-subtitle">A repeatable method for every chapter.</div></div><span class="stat-icon tone-gold">✦</span></div><div class="learning-mini"><div><b>01</b><span>Preview</span></div><div><b>02</b><span>Understand</span></div><div><b>03</b><span>Question</span></div><div><b>04</b><span>Recall</span></div><div><b>05</b><span>Apply</span></div><div><b>06</b><span>Write</span></div></div><button class="panel-link" style="padding:12px 0 0" data-action="learning-guide">Open the guided learning method ↗</button></section></div></div>`;
}

function renderSchedule(){
  const day=Math.min(30,Math.max(1,selectedDay||planDayForDate(todayKey))),date=dayDate(day),blocks=getDayBlocks(day),done=doneCount(date),progress=Math.round(done/7*100);
  const chips=Array.from({length:30},(_,i)=>{const n=i+1,d=dayDate(n),complete=doneCount(d)===7;return `<button class="day-chip ${n===day?'active':''} ${complete?'complete':''}" data-action="select-day" data-day="${n}"><span>DAY</span><strong>${pad(n)}</strong><small>${complete?'✓':new Intl.DateTimeFormat('en-IN',{month:'short'}).format(parseDateKey(d))}</small></button>`;}).join('');
  return `${pageHeading('YOUR ROADMAP','30-day study schedule','A clear daily rotation: one Mathematics branch, one Science part and one Social Science subject per two-hour block.',`<button class="btn btn-outline" data-action="export-plan">${svgIcon('download')} Export plan</button>`)}<div class="day-strip">${chips}</div><div class="schedule-detail"><section class="panel"><div class="day-summary"><div><div class="section-kicker">DAY ${pad(day)} / 30</div><h3>${formatDate(parseDateKey(date))}</h3><p>Seven planned blocks · 10 focused study hours</p></div><div class="day-counter">${done}/7</div></div><div>${blocks.map(b=>`<div class="day-block"><div class="day-block-time">${b.time}<br><small>${b.duration/60} ${b.duration===60?'hour':'hours'}</small></div><div class="day-block-line" style="background:${doneBlock(date,b.id)?'#7aa68b':'#c8dcd2'}"></div><div class="day-block-main"><strong>${escapeHtml(b.name)} <span style="color:#91a49c;font-weight:500">· ${escapeHtml(b.subject)}</span></strong><p>${escapeHtml(b.topic)}</p></div><div>${doneBlock(date,b.id)?`<button class="tiny-action done-action" data-action="toggle-block" data-date="${date}" data-block="${b.id}">✓ Done</button>`:`<button class="tiny-action" data-action="start-block" data-date="${date}" data-block="${b.id}">Start focus</button><button class="tiny-action" style="margin-top:5px" data-action="toggle-block" data-date="${date}" data-block="${b.id}">Mark done</button>`}</div></div>`).join('')}</div></section><aside class="day-side-card"><div class="eyebrow"><span class="eyebrow-dot"></span> DAILY INTENTION</div><h3>One block at a time.</h3><p>Do not rush to tick boxes. Complete the concept, practise questions, test your recall, then record the work honestly.</p><div class="side-metric"><span>Blocks completed</span><strong>${done} / 7</strong></div><div class="side-metric"><span>Daily completion</span><strong>${progress}%</strong></div><div class="side-metric"><span>Study target</span><strong>10 hours</strong></div><button class="btn" data-action="start-general">${svgIcon('play')} Start a focus timer</button></aside></div>`;
}

function renderStudyLog(){
  const sessions=getSessions();const total=totalMinutes(sessions);const rows=sessions.slice(0,100).map(s=>`<tr><td>${escapeHtml(shortDate(s.date||todayKey))}</td><td>${escapeHtml(s.subject||'—')}</td><td>${escapeHtml(s.topic||'Study session')}</td><td>${Number(s.minutes||0)} min</td><td><span class="confidence">${'★'.repeat(Math.max(0,Math.min(5,Number(s.quality||0))))}${'☆'.repeat(5-Math.max(0,Math.min(5,Number(s.quality||0))))}</span></td><td>${s.score===null||s.score===undefined||s.score===''?'—':`${Number(s.score)}%`}</td><td>${escapeHtml(s.notes||'—')}</td></tr>`).join('');
  return `${pageHeading('YOUR LEARNING HISTORY','Study records','Every saved session becomes evidence of your effort. Record real work, not estimated progress.',`<button class="btn btn-outline" data-action="export-csv">${svgIcon('download')} Export CSV</button><button class="btn btn-primary" data-action="add-session">${svgIcon('plus')} Add record</button>`)}<div class="stat-grid">${statCard('TOTAL STUDY TIME',formatDuration(total),'Across all saved sessions','◷','tone-teal')}${statCard('SESSIONS LOGGED',sessions.length,'Independent study records','▤','tone-gold')}${statCard('AVERAGE SESSION',sessions.length?formatDuration(Math.round(total/sessions.length)):'0m','Average recorded duration','↗','tone-blue')}${statCard('TODAY’S RECORDS',sessions.filter(s=>s.date===todayKey).length,'Sessions saved today','✓','tone-coral')}</div><section class="panel"><div class="panel-head"><div><h3 class="panel-title">Recent study activity</h3><div class="panel-subtitle">Most recent 100 saved sessions</div></div><div class="toolbar"><select class="select-control" id="log-filter"><option value="all">All subjects</option>${SUBJECTS.map(s=>`<option>${escapeHtml(s)}</option>`).join('')}</select></div></div><div class="log-table-wrap"><table class="log-table"><thead><tr><th>DATE</th><th>SUBJECT</th><th>TOPIC</th><th>DURATION</th><th>CONFIDENCE</th><th>TEST SCORE</th><th>NOTES</th></tr></thead><tbody id="log-table-body">${rows||'<tr><td colspan="7"><div class="empty-state"><strong>No study records yet</strong>Start a focus timer or add your first session to build your personal learning history.</div></td></tr>'}</tbody></table></div></section>`;
}

function renderPerformance(){
  const sessions=getSessions(),total=totalMinutes(sessions),week=weekSummary(),weekTotal=week.reduce((s,d)=>s+d.minutes,0);const subjects=SUBJECTS.filter(s=>s!=='Other'&&s!=='Revision');
  const rows=subjects.map(s=>({name:s,minutes:sessions.filter(x=>x.subject===s).reduce((a,x)=>a+Number(x.minutes||0),0)}));const max=Math.max(1,...rows.map(r=>r.minutes));
  const minutesByDate=new Map();sessions.forEach(s=>minutesByDate.set(s.date,(minutesByDate.get(s.date)||0)+Number(s.minutes||0)));const activity=Array.from({length:28},(_,i)=>{const date=addDays(new Date(),-(27-i)),key=localDateKey(date),mins=minutesByDate.get(key)||0;const level=mins===0?0:mins<30?1:mins<60?2:mins<120?3:4;return `<div class="heat-cell" data-level="${level}" title="${shortDate(key)} · ${formatDuration(mins)}"></div>`;}).join('');
  const totalDone=Object.values(userData.dailyLogs||{}).reduce((sum,log)=>sum+Object.values(log.blocks||{}).filter(v=>v?.status==='done').length,0);const scored=sessions.filter(s=>s.score!==null&&s.score!==undefined&&s.score!==''&&Number.isFinite(Number(s.score)));const avgScore=scored.length?Math.round(scored.reduce((a,s)=>a+Number(s.score),0)/scored.length):null;const rated=sessions.filter(s=>Number(s.quality)>0);const avgConfidence=rated.length?(rated.reduce((a,s)=>a+Number(s.quality),0)/rated.length).toFixed(1):'—';
  return `${pageHeading('MEASURE WHAT MATTERS','Your performance','Use the data to identify consistency, celebrate progress and choose the next topic to improve.',`<button class="btn btn-outline" data-action="export-json">${svgIcon('download')} Export progress</button>`)}<div class="performance-grid"><article class="performance-card"><div class="section-kicker">TOTAL FOCUSED TIME</div><div class="metric-large">${formatDuration(total)}</div><div class="metric-caption">Time from study sessions saved in your account.</div></article><article class="performance-card"><div class="section-kicker">THIS WEEK</div><div class="metric-large">${formatDuration(weekTotal)}</div><div class="metric-caption">${week.filter(x=>x.minutes>0).length} active study days in the last 7 days.</div></article><article class="performance-card"><div class="section-kicker">COMPLETED PLAN BLOCKS</div><div class="metric-large">${totalDone}</div><div class="metric-caption">Blocks you marked complete across the programme.</div></article><article class="performance-card"><div class="section-kicker">CURRENT STREAK</div><div class="metric-large">${getStreak()} days</div><div class="metric-caption">A day counts when you save a session or complete a block.</div></article><article class="performance-card"><div class="section-kicker">AVERAGE TEST SCORE</div><div class="metric-large">${avgScore===null?'—':`${avgScore}%`}</div><div class="metric-caption">${scored.length} scored study / test records.</div></article><article class="performance-card"><div class="section-kicker">SELF-RATED CONFIDENCE</div><div class="metric-large">${avgConfidence}${avgConfidence==='—'?'':' / 5'}</div><div class="metric-caption">Your own understanding rating after a session.</div></article><article class="performance-card wide"><div class="panel-head"><div><h3 class="panel-title">Subject-wise study time</h3><div class="panel-subtitle">Calculated from your saved study sessions — not estimated time.</div></div></div><div class="subject-bars">${rows.map(r=>`<div class="subject-bar-row"><span>${escapeHtml(r.name)}</span><div class="subject-track"><span style="width:${r.minutes/max*100}%"></span></div><strong>${r.minutes?formatDuration(r.minutes):'—'}</strong></div>`).join('')}</div></article><article class="performance-card wide"><div class="panel-head"><div><h3 class="panel-title">28-day consistency map</h3><div class="panel-subtitle">Each square represents one day of recorded study time.</div></div></div><div class="heatmap">${activity}</div><div class="chart-legend"><span>LESS ACTIVITY</span><span>MORE ACTIVITY&nbsp; ▪ ▪ ▪ ▪</span></div></article></div>`;
}

function renderNotes(){const notes=Object.entries(userData.notes||{}).map(([id,n])=>({id,...n})).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));return `${pageHeading('YOUR THINKING SPACE','Quick notes','Capture formulas, doubts, important definitions and questions to revisit.',`<button class="btn btn-primary" data-action="add-note">${svgIcon('plus')} New note</button>`)}${notes.length?`<div class="note-grid">${notes.map(n=>`<article class="note-card"><div class="section-kicker">${escapeHtml(n.tag||'STUDY NOTE')}</div><h3>${escapeHtml(n.title||'Untitled note')}</h3><p>${escapeHtml(n.body||'')}</p><div class="note-card-foot"><span>${n.updatedAt?formatDate(new Date(n.updatedAt),{day:'numeric',month:'short',year:'numeric'}):'Recently added'}</span><button data-action="delete-note" data-id="${n.id}">Delete</button></div></article>`).join('')}</div>`:`<div class="panel empty-state"><div class="empty-icon">✎</div><strong>Your thinking space is clear.</strong>Add a note whenever you discover a useful formula, a difficult concept or a question you want to solve later.</div>`}`;}

function renderAlarms(){const alarms=Object.entries(userData.alarms||{}).map(([id,a])=>({id,...a})).sort((a,b)=>(a.datetime||'').localeCompare(b.datetime||''));return `${pageHeading('STAY ON TRACK','Alarms & reminders','Create study reminders, revision prompts and break alarms. Notifications work while the dashboard is open.',`<button class="btn btn-primary" data-action="add-alarm">${svgIcon('plus')} Create alarm</button>`)}<div class="panel" style="margin-bottom:17px"><div class="panel-head"><div><h3 class="panel-title">Your reminders</h3><div class="panel-subtitle">Stored in your Firebase account and checked while this page is open.</div></div><button class="btn btn-outline" data-action="enable-notifications">Enable notifications</button></div>${alarms.length?`<div class="alarm-grid">${alarms.map(a=>{const d=new Date(a.datetime);return `<div class="alarm-card-row"><div class="alarm-time-icon">◷</div><div class="alarm-info"><strong>${escapeHtml(a.title||'Study reminder')}</strong><span>${a.repeatDaily?'Every day · ':''}${formatDate(d,{weekday:'short',day:'numeric',month:'short'})} · ${new Intl.DateTimeFormat('en-IN',{hour:'2-digit',minute:'2-digit'}).format(d)}</span><span>${escapeHtml(a.note||'')}</span></div><span class="alarm-state ${a.active?'':'off'}">${a.active?'ACTIVE':'OFF'}</span><div class="alarm-actions-small"><button class="tiny-action" data-action="toggle-alarm" data-id="${a.id}">${a.active?'Pause':'Enable'}</button><button class="tiny-action" data-action="delete-alarm" data-id="${a.id}">×</button></div></div>`;}).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">◷</div><strong>No reminders scheduled</strong>Create an alarm for your study blocks, revision or breaks.</div>`}</div><div class="content-card" style="padding:17px 19px;background:#f8f7f1;border-color:#ede9dc;box-shadow:none"><div class="section-kicker">IMPORTANT BROWSER LIMITATION</div><p style="font-size:10px;color:#7f8d85;line-height:1.7;margin:8px 0 0">For dependable alarms, keep this website open in a browser tab and allow notifications. A normal web page cannot guarantee that a timer will execute after the browser or phone has fully closed. True closed-app scheduled alarms require a server-side push setup (such as Firebase Cloud Messaging with a trusted sending service).</p></div>`;}

function renderSettings(){const p=profile();return `${pageHeading('PERSONALISE YOUR WORKSPACE','Settings','Manage your plan start date, profile and account preferences. Your study schedule stays based on the 10-hour structure.',`<button class="btn btn-outline" data-action="export-json">${svgIcon('download')} Backup my data</button>`)}<div class="settings-grid"><section class="panel"><div class="panel-head"><div><h3 class="panel-title">Study programme settings</h3><div class="panel-subtitle">Your 30-day plan uses this date to calculate each day.</div></div></div><form id="settings-form" class="settings-form"><label class="field-wrap"><span>Display name</span><input name="name" value="${escapeHtml(p.name||'')}" maxlength="50" placeholder="Your name"></label><label class="field-wrap"><span>Plan start date</span><input name="planStart" type="date" value="${escapeHtml(p.planStart||todayKey)}" required></label><label class="field-wrap"><span>Daily focused study target</span><input value="10 hours" disabled></label><label class="field-wrap"><span>Board / class</span><input value="Maharashtra SSC · Class 10" disabled></label><div class="full"><button type="submit" class="btn btn-primary">Save settings ↗</button></div></form></section><aside class="setting-info"><div class="eyebrow"><span class="eyebrow-dot"></span> CONNECTED WORKSPACE</div><h3>Your data, in sync.</h3><p>Your account stores your daily block completion, study sessions, notes, alarms and profile in Firebase Realtime Database under your private user ID.</p><div class="side-metric"><span>Signed-in email</span><strong style="max-width:145px;overflow:hidden;text-overflow:ellipsis">${escapeHtml(currentUser?.email||'')}</strong></div><div class="side-metric"><span>Programme length</span><strong>30 days</strong></div><div class="side-metric"><span>Daily study time</span><strong>10 hours</strong></div><div style="margin-top:15px;font-size:9px;color:#a9beb5">Firebase path</div><code>users/${escapeHtml(currentUser.uid)}/</code></aside></div><section class="panel" style="margin-top:17px"><div class="panel-head"><div><h3 class="panel-title">Account & data</h3><div class="panel-subtitle">Download a personal JSON backup before changing devices.</div></div></div><div class="toolbar"><button class="btn btn-outline" data-action="export-json">${svgIcon('download')} Download full backup</button><button class="btn btn-outline" data-action="sign-out">Sign out</button></div></section>`;}

function showModal(title,subtitle,body,footer=''){const root=$('#modal-root');root.innerHTML=`<div class="modal-backdrop" data-action="backdrop-close"><section class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><div class="modal-head"><div><div class="section-kicker">YUKTI WORKSPACE</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(subtitle||'')}</p></div><button class="modal-close" data-action="close-modal" aria-label="Close">×</button></div><div class="modal-body">${body}</div>${footer?`<div class="modal-foot">${footer}</div>`:''}</section></div>`;}
function closeModal(){if(timer.running)pauseTimer();$('#modal-root').innerHTML='';}
function openFocusModal(subject='Independent study',topic='Focused study session',blockId=null,date=todayKey){timer={total:50*60,remaining:50*60,running:false,interval:null,subject,topic,startedAt:null,endsAt:null,saved:false,blockId,date};showModal('Deep work timer','A distraction-light session. Your completed focus is saved to your study records.',`<div class="timer-modal"><div class="timer-subject">${escapeHtml(subject)}</div><div class="timer-display" id="timer-display">50:00</div><div class="timer-caption" id="timer-caption">Choose a session length and begin.</div><div class="timer-track"><span id="timer-progress"></span></div><div class="timer-presets">${[25,50,90,120].map(m=>`<button data-action="timer-preset" data-minutes="${m}" class="${m===50?'active':''}">${m} min</button>`).join('')}</div><div class="timer-controls"><button class="btn btn-secondary" data-action="timer-reset">Reset</button><button class="btn btn-primary" id="timer-main-action" data-action="timer-start">${svgIcon('play')} Start focus</button><button class="btn btn-outline" data-action="timer-finish">Finish & save</button></div><div style="font-size:9px;color:#a2ada7;margin-top:18px">${escapeHtml(topic)}</div></div>`);}
function updateTimerDisplay(){const display=$('#timer-display');if(!display)return;display.textContent=`${pad(Math.floor(timer.remaining/60))}:${pad(timer.remaining%60)}`;$('#timer-progress').style.width=`${(1-timer.remaining/timer.total)*100}%`;$('#timer-caption').textContent=timer.running?'Stay with one task. You are doing well.':timer.remaining===0?'Session complete. Save your work.':'Ready when you are.';const btn=$('#timer-main-action');if(btn)btn.innerHTML=timer.running?'Ⅱ Pause':'▶ Start focus';}
function startTimer(){if(timer.running)return;timer.running=true;if(!timer.startedAt)timer.startedAt=Date.now();timer.endsAt=Date.now()+timer.remaining*1000;timer.interval=setInterval(()=>{timer.remaining=Math.max(0,Math.ceil((timer.endsAt-Date.now())/1000));updateTimerDisplay();if(timer.remaining<=0){pauseTimer();timerComplete();}},500);updateTimerDisplay();}
function pauseTimer(){timer.running=false;if(timer.interval)clearInterval(timer.interval);timer.interval=null;updateTimerDisplay();}
function resetTimer(){pauseTimer();timer.remaining=timer.total;timer.startedAt=null;timer.endsAt=null;timer.saved=false;updateTimerDisplay();}
function setTimerPreset(minutes){pauseTimer();timer.total=minutes*60;timer.remaining=timer.total;timer.startedAt=null;timer.endsAt=null;timer.saved=false;$$('.timer-presets button').forEach(b=>b.classList.toggle('active',Number(b.dataset.minutes)===minutes));updateTimerDisplay();}
async function timerComplete(){playChime();sendBrowserNotification('YUKTI · Focus complete',`You completed a ${Math.round(timer.total/60)} minute focus session.`);await saveTimerSession();timer.saved=true;toast('Focus session completed and saved.');}
async function saveTimerSession(){if(timer.saved)return;const elapsed=Math.max(1,Math.round((timer.total-timer.remaining)/60));if(elapsed<=0)return;await saveSession({date:timer.date,subject:timer.subject,topic:timer.topic,minutes:elapsed,quality:0,notes:'Saved from focus timer.',startedAt:timer.startedAt||Date.now()});timer.saved=true;}

function openLearningGuide(subject='Any subject',topic='Today’s chapter'){
  showModal('The YUKTI learning method',`Apply this six-stage method to ${subject}: ${topic}.`, `<div class="learning-guide-list">
    <div><b>01</b><section><strong>Preview the chapter</strong><p>Scan headings, diagrams, examples and key terms. Ask: what is this chapter trying to explain?</p></section></div>
    <div><b>02</b><section><strong>Understand deeply</strong><p>Read one small concept at a time. Connect it to something you already know. Do not memorise sentences you cannot explain.</p></section></div>
    <div><b>03</b><section><strong>Ask better questions</strong><p>Ask: What is it? Why does it happen? How does it work? Where is it used? What would change if one condition changed?</p></section></div>
    <div><b>04</b><section><strong>Recall without looking</strong><p>Close the book. Explain the idea in your own words, draw it from memory or write the formula / sequence without checking.</p></section></div>
    <div><b>05</b><section><strong>Apply the knowledge</strong><p>Solve a new problem, answer a textbook question, interpret a map, compare two ideas or give a real-life example.</p></section></div>
    <div><b>06</b><section><strong>Write and test</strong><p>Write a board-style answer. Check keywords, steps, units, diagrams and presentation. Record mistakes and retest later.</p></section></div>
  </div><div class="learning-prompt"><strong>Feynman check</strong><p>“Could I explain this topic simply to a student who has never studied it?” If not, identify the exact sentence or step you cannot explain and learn that part again.</p></div>`, `<button class="btn btn-primary" data-action="close-modal">I’ll use this method</button>`);
}

function openSessionModal(){showModal('Add study record','Log a session you completed away from the focus timer.',`<form id="session-form" class="form-grid"><label class="field-wrap"><span>Date</span><input type="date" name="date" value="${todayKey}" required></label><label class="field-wrap"><span>Subject</span><select name="subject">${SUBJECTS.map(s=>`<option>${escapeHtml(s)}</option>`).join('')}</select></label><label class="field-wrap full"><span>Topic / chapter</span><input name="topic" placeholder="e.g. Quadratic equations · Exercise 2.1" required></label><label class="field-wrap"><span>Duration (minutes)</span><input type="number" name="minutes" min="1" max="600" value="60" required></label><label class="field-wrap"><span>Confidence after study</span><select name="quality"><option value="1">1 · Needs work</option><option value="2">2 · Basic</option><option value="3" selected>3 · Understand</option><option value="4">4 · Strong</option><option value="5">5 · Can solve independently</option></select></label><label class="field-wrap"><span>Chapter / test score (%) · optional</span><input name="score" type="number" min="0" max="100" placeholder="e.g. 78"></label><label class="field-wrap full"><span>What did you learn? / Mistakes to revisit</span><textarea name="notes" placeholder="Write a short reflection…"></textarea></label></form>`,`<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-session">Save record ↗</button>`);}
async function saveSession(data){const payload={...data,createdAt:Date.now()};await push(ref(db,rootPath('studySessions')),payload);}

function openNoteModal(){showModal('Create a quick note','Keep your useful ideas and doubts in one place.',`<form id="note-form" class="form-grid"><label class="field-wrap full"><span>Title</span><input name="title" required maxlength="80" placeholder="e.g. Refraction — important laws"></label><label class="field-wrap"><span>Category</span><select name="tag"><option>FORMULA</option><option>IMPORTANT DEFINITION</option><option>DOUBT TO SOLVE</option><option>EXAM STRATEGY</option><option>QUICK NOTE</option></select></label><label class="field-wrap full"><span>Note</span><textarea name="body" required placeholder="Write your note…"></textarea></label></form>`,`<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-note">Save note ↗</button>`);}
function openAlarmModal(){const d=new Date(Date.now()+10*60000);const val=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;showModal('Create a study alarm','Set a reminder for a chapter, study block or revision session.',`<form id="alarm-form" class="form-grid"><label class="field-wrap full"><span>Reminder title</span><input name="title" required maxlength="70" placeholder="e.g. Start Science Part I"></label><label class="field-wrap full"><span>Date and time</span><input name="datetime" type="datetime-local" value="${val}" required></label><label class="field-wrap full"><span>Reminder note (optional)</span><input name="note" maxlength="120" placeholder="Bring textbook and notebook"></label><label class="field-wrap full" style="flex-direction:row;align-items:center;gap:9px"><input type="checkbox" name="repeatDaily" style="width:auto;accent-color:#2d7772"><span>Repeat every day at this time</span></label></form>`,`<button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-alarm">Save alarm ↗</button>`);}

async function toggleBlock(date,blockId){const block=getDayBlocks(planDayForDate(date)).find(b=>b.id===blockId);if(!block)return;const existing=doneBlock(date,blockId);await writeData(`dailyLogs/${date}/blocks/${blockId}`,existing?{status:'pending',updatedAt:Date.now()}:{status:'done',completedAt:Date.now(),subject:block.subject,topic:block.topic});toast(existing?'Block marked as pending.':'Block marked complete.');}

function exportFile(filename,content,type='application/json'){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportJSON(){const backup={exportedAt:new Date().toISOString(),project:'YUKTI SSC Focus',profile:userData.profile||{},dailyLogs:userData.dailyLogs||{},studySessions:userData.studySessions||{},notes:userData.notes||{},alarms:userData.alarms||{}};exportFile(`yukti-study-backup-${todayKey}.json`,JSON.stringify(backup,null,2));toast('Your progress backup is ready.');}
function exportCSV(){const sessions=getSessions();const header=['Date','Subject','Topic','Minutes','Confidence','Notes','Created At'];const lines=[header,...sessions.map(s=>[s.date,s.subject,s.topic,s.minutes,s.quality,s.notes,s.createdAt].map(v=>`"${String(v??'').replace(/"/g,'""')}"`))].map(row=>row.map(v=>String(v).startsWith('"')?v:`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');exportFile(`yukti-study-records-${todayKey}.csv`,lines,'text/csv');toast('CSV study records exported.');}
function exportPlan(){const rows=[];for(let d=1;d<=30;d++){const date=dayDate(d);getDayBlocks(d).forEach(b=>rows.push({day:d,date,time:b.time,subject:b.subject,topic:b.topic,durationMinutes:b.duration}));}exportFile('yukti-30-day-study-plan.json',JSON.stringify(rows,null,2));toast('30-day plan exported.');}

function updateNotificationDot(){const dot=$('#notification-dot');if(dot)dot.classList.toggle('show',!('Notification'in window)||Notification.permission!=='granted');}
async function enableNotifications(){if(!('Notification'in window)){toast('This browser does not support desktop notifications.','error');return;}try{const permission=await Notification.requestPermission();updateNotificationDot();toast(permission==='granted'?'Notifications enabled.':'Notification permission was not granted.');}catch(e){toast('Could not request notification permission.');}}
function registerServiceWorker(){if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});}
async function sendBrowserNotification(title,body){
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  const options={body,icon:'./icon.svg',badge:'./icon.svg',tag:'yukti-'+Date.now()};
  try{
    if('serviceWorker' in navigator){const registration=await navigator.serviceWorker.ready;await registration.showNotification(title,options);}
    else new Notification(title,options);
  }catch(error){try{new Notification(title,options);}catch(e){/* Some mobile browsers only support service-worker notifications. */}}
}
function startAlarmWatcher(){stopAlarmWatcher();checkAlarms();alarmCheckInterval=setInterval(checkAlarms,5000);}
function stopAlarmWatcher(){if(alarmCheckInterval)clearInterval(alarmCheckInterval);alarmCheckInterval=null;stopAlarmTone();}
function alarmDue(a,now){if(!a.active)return false;if(a.snoozedUntil){return now.getTime()>=Number(a.snoozedUntil);}if(a.repeatDaily){const parts=(a.datetime||'').split('T');const scheduledDate=parts[0],time=parts[1];if(!time||localDateKey(now)<scheduledDate)return false;const today=localDateKey(now);if(a.lastFiredDate===today)return false;return now>=new Date(`${today}T${time}:00`);}return !a.lastFiredAt&&now.getTime()>=new Date(a.datetime).getTime();}
async function checkAlarms(){if(!currentUser||currentAlarm)return;const alarms=userData.alarms||{};const now=new Date();for(const [id,a] of Object.entries(alarms)){if(alarmDue(a,now)){currentAlarm={id,...a};try{if(a.repeatDaily)await updateData(`alarms/${id}`,{lastFiredDate:localDateKey(now),snoozedUntil:null});else await updateData(`alarms/${id}`,{active:false,lastFiredAt:Date.now(),snoozedUntil:null});}catch(e){currentAlarm=null;return;}showAlarm(currentAlarm);break;}}}
function showAlarm(alarm){$('#alarm-title').textContent=alarm.title||'It is time to focus';$('#alarm-message').textContent=alarm.note||'Your scheduled study reminder is ready.';$('#alarm-clock').textContent=new Intl.DateTimeFormat('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date());$('#alarm-overlay').classList.remove('hidden');startAlarmTone();sendBrowserNotification(alarm.title||'YUKTI reminder',alarm.note||'Your study reminder is ready.');}
function dismissAlarm(){if(currentAlarm?.id){}stopAlarmTone();$('#alarm-overlay').classList.add('hidden');currentAlarm=null;}
async function snoozeAlarm(){const alarm=currentAlarm;if(!alarm)return;const id=alarm.id;dismissAlarm();await updateData(`alarms/${id}`,{snoozedUntil:Date.now()+5*60000,active:true,lastFiredAt:null});toast('Alarm snoozed for 5 minutes.');}
function startAlarmTone(){try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;alarmAudio=new Ctx();let count=0;const play=()=>{if(!alarmAudio||$('#alarm-overlay').classList.contains('hidden'))return;const osc=alarmAudio.createOscillator(),gain=alarmAudio.createGain();osc.type='sine';osc.frequency.value=count%2?740:580;gain.gain.setValueAtTime(.0001,alarmAudio.currentTime);gain.gain.exponentialRampToValueAtTime(.13,alarmAudio.currentTime+.04);gain.gain.exponentialRampToValueAtTime(.0001,alarmAudio.currentTime+.38);osc.connect(gain);gain.connect(alarmAudio.destination);osc.start();osc.stop(alarmAudio.currentTime+.4);count++;};play();alarmAudio._interval=setInterval(play,850);}catch(e){}}
function stopAlarmTone(){if(alarmAudio){clearInterval(alarmAudio._interval);alarmAudio.close().catch(()=>{});alarmAudio=null;}}
function playChime(){try{const Ctx=window.AudioContext||window.webkitAudioContext;const ctx=new Ctx();[660,880].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=freq;g.gain.setValueAtTime(.0001,ctx.currentTime+i*.16);g.gain.exponentialRampToValueAtTime(.08,ctx.currentTime+i*.16+.03);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+i*.16+.28);o.connect(g);g.connect(ctx.destination);o.start(ctx.currentTime+i*.16);o.stop(ctx.currentTime+i*.16+.3);});setTimeout(()=>ctx.close(),1000);}catch(e){}}

// Global click actions — kept delegated so freshly rendered pages remain interactive.
document.addEventListener('click',async e=>{
  const actionEl=e.target.closest('[data-action]');if(!actionEl)return;const action=actionEl.dataset.action;
  try{
    if(action==='go-schedule'){activePage='schedule';selectedDay=planDayForDate(todayKey);renderPage();}
    if(action==='select-day'){selectedDay=Number(actionEl.dataset.day);renderPage();}
    if(action==='toggle-block')await toggleBlock(actionEl.dataset.date,actionEl.dataset.block);
    if(action==='start-block'){const date=actionEl.dataset.date,block=getDayBlocks(planDayForDate(date)).find(b=>b.id===actionEl.dataset.block);if(block)openFocusModal(block.subject,block.topic,block.id,date);}
    if(action==='start-general')openFocusModal('Independent study','Choose the topic you want to focus on.',null,todayKey);
    if(action==='learning-guide'){const day=planDayForDate(todayKey),b=getDayBlocks(day).find(x=>x.id==='math');openLearningGuide(b?.subject||'Any subject',b?.topic||'Today’s chapter');}
    if(action==='timer-preset')setTimerPreset(Number(actionEl.dataset.minutes));
    if(action==='timer-start'){if(timer.running)pauseTimer();else startTimer();}
    if(action==='timer-reset')resetTimer();
    if(action==='timer-finish'){pauseTimer();const hadTime=timer.remaining!==timer.total;if(hadTime&&!timer.saved)await saveTimerSession();const wasSaved=timer.saved;closeModal();toast(wasSaved?'Your session has been saved.':'Timer closed; no study time was recorded.');}
    if(action==='close-modal')closeModal();
    if(action==='backdrop-close'&&e.target===actionEl)closeModal();
    if(action==='add-session')openSessionModal();
    if(action==='save-session'){const form=$('#session-form');if(!form.reportValidity())return;const fd=new FormData(form);await saveSession({date:fd.get('date'),subject:fd.get('subject'),topic:fd.get('topic').trim(),minutes:Number(fd.get('minutes')),quality:Number(fd.get('quality')),score:fd.get('score')===''?null:Number(fd.get('score')),notes:fd.get('notes')});closeModal();toast('Study record saved to your account.');}
    if(action==='add-note')openNoteModal();
    if(action==='save-note'){const form=$('#note-form');if(!form.reportValidity())return;const fd=new FormData(form);await push(ref(db,rootPath('notes')),{title:fd.get('title').trim(),tag:fd.get('tag'),body:fd.get('body').trim(),createdAt:Date.now(),updatedAt:Date.now()});closeModal();toast('Note saved.');}
    if(action==='delete-note'){if(confirm('Delete this note?')){await removeData(`notes/${actionEl.dataset.id}`);toast('Note deleted.');}}
    if(action==='add-alarm')openAlarmModal();
    if(action==='save-alarm'){const form=$('#alarm-form');if(!form.reportValidity())return;const fd=new FormData(form),dt=fd.get('datetime');if(new Date(dt).getTime()<=Date.now()){toast('Choose a future time for the alarm.');return;}await push(ref(db,rootPath('alarms')),{title:fd.get('title').trim(),datetime:dt,note:fd.get('note').trim(),repeatDaily:fd.get('repeatDaily')==='on',active:true,createdAt:Date.now()});closeModal();toast('Alarm saved. Keep this dashboard open for the reminder.');}
    if(action==='toggle-alarm'){const a=userData.alarms?.[actionEl.dataset.id];if(a)await updateData(`alarms/${actionEl.dataset.id}`,{active:!a.active});toast(a?.active?'Alarm paused.':'Alarm enabled.');}
    if(action==='delete-alarm'){if(confirm('Delete this alarm?')){await removeData(`alarms/${actionEl.dataset.id}`);toast('Alarm deleted.');}}
    if(action==='enable-notifications')await enableNotifications();
    if(action==='export-json')exportJSON();
    if(action==='export-csv')exportCSV();
    if(action==='export-plan')exportPlan();
    if(action==='sign-out')await signOut(auth);
  }catch(error){console.error(error);toast(firebaseError(error),'error');}
});

$('#alarm-dismiss').addEventListener('click',dismissAlarm);$('#alarm-snooze').addEventListener('click',snoozeAlarm);
$('#enable-notifications').addEventListener('click',enableNotifications);$('#quick-focus').addEventListener('click',()=>openFocusModal('Independent study','Quick focus session',null,todayKey));
$('#sign-out').addEventListener('click',()=>signOut(auth));
$('#menu-toggle').addEventListener('click',()=>{$('#sidebar').classList.add('open');$('#mobile-scrim').classList.add('show');});$('#sidebar-close').addEventListener('click',closeMobileMenu);$('#mobile-scrim').addEventListener('click',closeMobileMenu);function closeMobileMenu(){$('#sidebar').classList.remove('open');$('#mobile-scrim').classList.remove('show');}
$$('.nav-item[data-page]').forEach(item=>item.addEventListener('click',()=>{activePage=item.dataset.page;renderPage();closeMobileMenu();}));

document.addEventListener('submit',async e=>{if(e.target.id==='settings-form'){e.preventDefault();const fd=new FormData(e.target);const name=String(fd.get('name')||'').trim()||'Student',planStart=fd.get('planStart');if(!planStart){toast('Choose your programme start date.');return;}try{await updateData('profile',{name,planStart,dailyTarget:10});if(currentUser.displayName!==name)await updateProfile(currentUser,{displayName:name}).catch(()=>{});selectedDay=planDayForDate(todayKey);toast('Your programme settings are updated.');}catch(err){toast(firebaseError(err),'error');}}});
document.addEventListener('change',e=>{if(e.target.id==='log-filter'){const filter=e.target.value;const body=$('#log-table-body');if(!body)return;const sessions=getSessions().filter(s=>filter==='all'||s.subject===filter);body.innerHTML=sessions.slice(0,100).map(s=>`<tr><td>${escapeHtml(shortDate(s.date||todayKey))}</td><td>${escapeHtml(s.subject||'—')}</td><td>${escapeHtml(s.topic||'Study session')}</td><td>${Number(s.minutes||0)} min</td><td><span class="confidence">${'★'.repeat(Math.max(0,Math.min(5,Number(s.quality||0))))}${'☆'.repeat(5-Math.max(0,Math.min(5,Number(s.quality||0))))}</span></td><td>${s.score===null||s.score===undefined||s.score===''?'—':`${Number(s.score)}%`}</td><td>${escapeHtml(s.notes||'—')}</td></tr>`).join('')||'<tr><td colspan="7"><div class="empty-state">No records for this subject yet.</div></td></tr>';}});

document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeMobileMenu();if(!$('#alarm-overlay').classList.contains('hidden'))dismissAlarm();}});

showAuthMode(false);
initFirebase();
