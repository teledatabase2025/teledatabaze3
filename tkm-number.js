(function(){
const D=window.TKM_DATA;
const owner=document.body.dataset.owner;
const me=D.contacts[owner];
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function ts(x){const m=x.date.match(/(\d+)\.\s*(\d+)\.\s*(\d+)/); return new Date(+m[3],+m[2]-1,+m[1],...x.time.split(':').map(Number)).getTime();}
function contactInfoHref(key){const c=D.contacts[key]; const back=encodeURIComponent(me.number.replace(/\s/g,'')+'.html'); const bn=encodeURIComponent(me.number); return c.main ? `${c.infoFile}?back=${back}&backNumber=${bn}` : `cislo-info.html?number=${encodeURIComponent(c.number)}&back=${back}&backNumber=${bn}`;}
function numLink(key){const c=D.contacts[key]; return `<a class="phone-link" href="${contactInfoHref(key)}">${esc(c.number)}</a>`;}
const myMessages=D.messages.filter(x=>x.from===owner||x.to===owner).sort((a,b)=>ts(a)-ts(b));
const myCalls=D.calls.filter(x=>x.from===owner||x.to===owner).sort((a,b)=>ts(a)-ts(b));

const conversations=new Map();
myMessages.forEach(x=>{
  const other=x.from===owner?x.to:x.from;
  if(!conversations.has(other)) conversations.set(other,[]);
  conversations.get(other).push(x);
});
const conversationRows=[...conversations.entries()].map(([other,messages])=>{
  messages.sort((a,b)=>ts(a)-ts(b));
  return {other,messages,first:messages[0],last:messages[messages.length-1]};
}).sort((a,b)=>ts(a.first)-ts(b.first));

document.getElementById('mainNumber').textContent=me.number;
document.getElementById('mainNumber').href=me.infoFile;
document.getElementById('periodStat').textContent='od '+D.periodStart;
document.getElementById('callCount').textContent=myCalls.length;
document.getElementById('smsCount').textContent=conversationRows.length;
document.getElementById('callsTitle').textContent='Záznamy hovorů od '+D.periodStart;
document.getElementById('smsTitle').textContent='Přehled SMS konverzací od '+D.periodStart;

const callBody=document.getElementById('callsBody');
callBody.innerHTML=myCalls.map(x=>{const incoming=x.to===owner; const other=incoming?x.from:x.to; let type,cls;if(x.status==='missed'){type=incoming?'Zmeškaný':'Neuskutečněný';cls='missed';}else{type=incoming?'Příchozí':'Odchozí';cls=incoming?'incoming':'outgoing';} return `<tr><td>${esc(x.date)}</td><td>${esc(x.time)}</td><td>${numLink(other)}</td><td>${esc(x.recordId)}</td><td><span class="badge ${cls}">${type}</span></td><td>${esc(x.duration)}</td><td><button class="action play-call" type="button">Přehrát</button></td></tr>`}).join('');

const smsBody=document.getElementById('smsBody');
smsBody.innerHTML=conversationRows.map(c=>{
  const href=`sms-detail.html?owner=${encodeURIComponent(owner)}&other=${encodeURIComponent(c.other)}`;
  return `<tr><td>${numLink(c.other)}</td><td>${esc(c.first.date)}</td><td>${esc(c.last.date)}</td><td>${c.messages.length}</td><td><a class="action" href="${href}">Záznam konverzace</a></td></tr>`;
}).join('');

const modal=document.getElementById('callModal');
document.querySelectorAll('.play-call').forEach(b=>b.addEventListener('click',()=>modal.classList.add('open')));
modal.addEventListener('click',e=>{if(e.target===modal||e.target.classList.contains('modal-close'))modal.classList.remove('open')});
})();
