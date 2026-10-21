import { Simulation, IDS } from './simulation.js';
import { sprite } from './sprites.js';
const $ = id => document.getElementById(id);
const stage = $('stage'), motion = matchMedia('(prefers-reduced-motion: reduce)');
const sim = new Simulation({ reduced: motion.matches });
const nodes = Object.fromEntries(IDS.map(id => {
  const el = $('a-'+id); el.querySelector('.actor').innerHTML = sprite(id);
  if (id !== 'scout') el.querySelector('.artifact').innerHTML = $('a-scout').querySelector('.artifact').innerHTML;
  const parts = Object.fromEntries(['hero','head','torso','arm-l','arm-r','leg-l','leg-r','eyes','pupils','mouth','scan','energy'].map(name => [name, el.querySelector('.'+name)]));
  return [id,{el, actor:el.querySelector('.actor'), bubble:el.querySelector('.speech'), speech:el.querySelector('.speech span'), file:el.querySelector('.artifact'), shadow:el.querySelector('.shadow'), status:$('status-'+id), dot:$('dot-'+id),...parts}];
}));
let width = stage.clientWidth, charWidth = nodes.bolt.el.offsetWidth, last = 0, previousRevision = -1, logged = '', selectionHint = '';
function size() { width = stage.clientWidth; charWidth = nodes.bolt.el.offsetWidth; sim.setClearance((nodes.bolt.el.offsetWidth * .98 / width) * 1000); }
new ResizeObserver(size).observe(stage); size();
motion.addEventListener('change', () => { sim.reduced = motion.matches; });
function transform(node, angle, cx, cy, x=0, y=0) { if (node) node.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)} ${cx} ${cy})`); }
function drawHero(pose, time, snapshot) {
  const n = nodes[pose.id], id = pose.id, mode = pose.mode, p = pose.progress, t = time / 1000, reduced = sim.reduced;
  n.el.style.left = `${pose.x / 10}%`; n.el.style.top = `${pose.y / 7}%`;
  n.el.style.zIndex = Math.round(pose.y);
  n.el.dataset.mode = mode;
  let dy = id === 'scout' && !reduced ? -5 + Math.sin(t*2.15)*3 : 0;
  let rotate = id === 'scout' && !reduced ? Math.sin(t*.85)*2 : 0, scaleX=1, scaleY=1, head=0, arms=0, legs=0;
  if (!reduced) {
    if (mode === 'work') { dy += Math.sin(t*(id==='titan'?4:7))*1.2; head=Math.sin(t*2)*2; arms=Math.sin(t*10)*7; }
    if (mode === 'scan') { head=Math.sin(t*1.3)*7; rotate+=Math.sin(t*.7)*2; }
    if (mode === 'discover') { dy-=Math.sin(p*Math.PI)*8; rotate+=Math.sin(p*Math.PI)*-7; arms=-20*Math.sin(p*Math.PI); }
    if (mode === 'notice') { head=-7*Math.sin(p*Math.PI/2); dy-=p*2; }
    if (mode === 'rise') { dy+=Math.sin(p*Math.PI)*5; scaleY=1-Math.sin(p*Math.PI)*.07; arms=9*Math.sin(p*Math.PI); rotate=Math.sin(p*Math.PI)*-4; }
    if (mode === 'walk') { const step=t*9; dy+=Math.abs(Math.sin(step))*3; rotate=Math.sin(step)*4; arms=Math.sin(step)*12; legs=Math.sin(step)*17; }
    if (mode === 'float') { rotate+=pose.direction*(Math.sin(p*Math.PI)*8); dy-=Math.sin(p*Math.PI)*5; arms=-5; }
    if (mode === 'charge') { scaleX=1+Math.sin(p*Math.PI/2)*.12; scaleY=1-Math.sin(p*Math.PI/2)*.18; dy+=p*5; rotate=pose.direction*-5*p; }
    if (mode === 'appear') { scaleX=.85+.15*smoothOut(p); scaleY=1.13-.13*smoothOut(p); dy-=Math.sin(p*Math.PI)*4; }
    if (mode === 'offer') { rotate=pose.direction*4*Math.sin(p*Math.PI); arms=35*Math.sin(p*Math.PI); }
    if (mode === 'receive') { dy+=Math.sin(p*Math.PI)*2; arms=22; head=-3; }
    if (mode === 'proud') { rotate=id==='bolt'?-7*Math.sin(p*Math.PI):2; dy-=Math.sin(p*Math.PI)*3; arms=id==='bolt'?-23:5; }
  }
  n.actor.style.transform=`translateY(${dy.toFixed(2)}px) rotate(${rotate.toFixed(2)}deg) scale(${scaleX.toFixed(3)},${scaleY.toFixed(3)})`;
  const visible = pose.visible ? (mode==='appear' ? Math.max(.15,p) : 1) : 0;
  n.hero.style.opacity = visible;
  n.file.hidden = !pose.file || !pose.visible;
  // The deliverable stays attached to a hand; only ownership changes at contact.
  const defaultLeft = id === 'titan' ? .4 : pose.direction < 0 ? .15 : .63;
  const fileWidth = id === 'titan' ? .26 : .24;
  let fileLeft = defaultLeft * charWidth;
  if (snapshot.phase === 'offer' && pose.file) {
    const a = snapshot.poses[snapshot.from], b = snapshot.poses[snapshot.to];
    const midpoint = (a.x + b.x) / 2;
    const meetingLeft = charWidth / 2 + (midpoint - pose.x) / 1000 * width - fileWidth * charWidth / 2;
    const reach = snapshot.owner === snapshot.from ? smoothOut(Math.min(1, p / .55)) : 1 - smoothOut(Math.max(0, (p - .55) / .45));
    fileLeft += (meetingLeft - fileLeft) * reach;
  }
  n.file.style.left = fileLeft.toFixed(2) + 'px';
  n.file.style.transform=`translateY(${dy.toFixed(2)}px) rotate(${(rotate/2).toFixed(2)}deg)`;
  n.shadow.style.opacity = id==='scout' ? '.28' : pose.visible ? '.43' : '.14';
  n.shadow.style.transform=`scale(${id==='scout' ? .9+(dy+5)*.012 : 1},1)`;
  transform(n.head,head,70,85,0,mode==='notice'&&!reduced?-p*3:0);
  transform(n['arm-l'], mode==='receive' ? -arms : arms,38,94);
  transform(n['arm-r'], mode==='receive' ? arms : -arms,102,94);
  transform(n['leg-l'],legs,54,132);transform(n['leg-r'],-legs,88,132);
  if(n.pupils) transform(n.pupils,0,70,60, reduced?0:Math.sin(t*1.2)*2.2, reduced?0:Math.cos(t)*1.2);
  const blink = !reduced && (t+IDS.indexOf(id)*1.2)%4.7 > 4.56;
  n.eyes.setAttribute('transform', blink ? 'translate(0 60) scale(1 .12) translate(0 -60)' : pose.face==='happy' && id==='bolt' ? 'translate(0 -1)' : '');
  n.mouth.setAttribute('d',pose.face==='happy'?'M62 81q9 10 17-1':id==='scout'?'M64 83q7 5 13-1':id==='titan'?'M63 79q8 6 15 0':'M63 84q8 4 15-1');
  n.scan.style.opacity=id==='scout' && ['work','scan','discover'].includes(mode) && !reduced ? .24+(Math.sin(t*2)+1)*.1 : 0;
  const energy = ['vanish','appear'].includes(mode) ? (reduced ? .24 : mode==='vanish' ? 1-p*.4 : 1-p) : mode==='charge' ? p*.35 : 0;
  n.energy.style.opacity = energy;
  n.bubble.hidden = !pose.speech || !pose.visible;
  const half=Math.min(width<=690?135:186,185)/2, screenX=pose.x/1000*width;
  const shift=Math.max(half+8-screenX,Math.min(0,width-half-8-screenX));
  // Stack both speech balloons during handover so neither person's reaction is lost.
  const receiver = snapshot.to === id && ['offer','received','proud'].includes(snapshot.phase);
  n.bubble.style.left=`calc(50% + ${shift.toFixed(1)}px)`;
  n.bubble.style.bottom=receiver?'170%':'105%';
}
function smoothOut(p){return 1-Math.pow(1-p,3)}
function updateUI(s) {
  for(const id of IDS) { nodes[id].speech.textContent=s.poses[id].speech; nodes[id].status.textContent=s.paused?'一時停止 · '+s.poses[id].status:s.poses[id].status; nodes[id].dot.classList.toggle('active',s.poses[id].status!=='待機'&&!s.paused); }
  $('playState').textContent=s.paused?'PAUSED':s.auto?'AUTO PLAY':s.busy?'MANUAL HANDOFF':'STANDBY';
  $('counter').textContent=s.count; $('missionNumber').textContent=String(s.count+1).padStart(2,'0');
  $('missionPhase').textContent=s.paused?'一時停止中':s.label;
  $('missionTitle').replaceChildren();
  if(s.busy){const text=document.createTextNode(`${s.from.toUpperCase()} → ${s.to.toUpperCase()} `),detail=document.createElement('span');detail.textContent=s.title;$('missionTitle').append(text,detail);}else $('missionTitle').textContent=s.count?'引き継ぎ完了 · 次の仕事を実行中':'ミッション待機中';
  $('autoBtn').setAttribute('aria-pressed',String(s.auto));
  $('autoBtn').innerHTML=`<span>${s.auto?'■':'▶'}</span> ${s.auto?'自動再生中':'自動再生'}`;
  $('pauseBtn').innerHTML=s.paused?'<span>▶</span> 再開':'<span>Ⅱ</span> 一時停止';
  const same=$('from').value===$('to').value;
  $('handoffBtn').disabled=s.busy||s.paused||same;
  $('controlHint').textContent=selectionHint||(s.paused?'一時停止中です。「再開」で続きから進みます。':s.auto?'自動再生中。手動操作は「自動再生中」で自動を止め、現在の引き継ぎが終わると使えます。':s.busy?'引き継ぎを実行中。完了まで次の操作を待っています。':same?'送り手と受け手は別の担当者を選んでください。':'手動操作ができます。送り手と受け手を選んで「引き継ぐ」を押してください。');
  const key=s.history.map(v=>v.at+v.from+v.to).join('|');
  if(key!==logged){logged=key;$('log').replaceChildren();s.history.forEach((item,i)=>{const li=document.createElement('li'),icon=document.createElement('span'),body=document.createElement('div'),b=document.createElement('b'),small=document.createElement('small'),time=document.createElement('time');icon.className='log-icon';icon.textContent='↗';b.textContent=`${item.from.toUpperCase()} → ${item.to.toUpperCase()}`;small.textContent=item.title+' · 受領／作業開始';body.append(b,small);time.textContent=`#${String(s.count-i).padStart(2,'0')}`;li.append(icon,body,time);$('log').append(li);});}
  if(!s.history.length&&!$('log').children.length){const li=document.createElement('li');li.className='empty-log';li.textContent='まだ引き継ぎはありません。成果物を受け取り、作業を始めると記録されます。';$('log').append(li);}
}
function render(force=false) {const s=sim.snapshot(); for(const pose of Object.values(s.poses))drawHero(pose,s.elapsed,s);$('missionProgress').style.width=`${s.missionProgress*100}%`;$('wallProgress').setAttribute('width',String(s.missionProgress*177));if(force||s.revision!==previousRevision){updateUI(s);previousRevision=s.revision;} }
function action(fn){selectionHint='';last=0;fn();render(true);}
$('autoBtn').addEventListener('click',()=>action(()=>{sim.setAuto(!sim.auto);if(sim.auto&&sim.paused){sim.setPaused(false);if(!sim.current)sim.next();}}));
$('pauseBtn').addEventListener('click',()=>action(()=>sim.setPaused(!sim.paused)));
$('resetBtn').addEventListener('click',()=>action(()=>{sim.reset();logged='';$('log').replaceChildren();}));
$('handoffBtn').addEventListener('click',()=>action(()=>{if(sim.request($('from').value,$('to').value))sim.setAuto(false);}));
for(const id of ['from','to'])$(id).addEventListener('change',()=>{selectionHint='';render(true);});
function fail(error){sim.setPaused(true);$('error').hidden=false;$('error').textContent='表示を停止しました。リセットまたはページ再読み込みで再開してください。';console.error(error);render(true);}
window.addEventListener('error',e=>fail(e.error||e.message));window.addEventListener('unhandledrejection',e=>fail(e.reason));
function frame(now){try{if(last&&!document.hidden&&!sim.paused){sim.tick(Math.max(0,now-last));render();}last=now;requestAnimationFrame(frame);}catch(error){fail(error);}}
document.addEventListener('visibilitychange',()=>{last=0;});
sim.setAuto(true);render(true);requestAnimationFrame(frame);
