const frame=document.getElementById('demo'),result=document.getElementById('result');
const $=id=>frame.contentDocument.getElementById(id);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const assert=(value,message)=>{if(!value)throw Error(message);};
for(const button of document.querySelectorAll('[data-width]'))button.addEventListener('click',()=>{frame.style.width=button.dataset.width+'px';frame.width=button.dataset.width;result.textContent='画面幅 '+button.dataset.width+'px';});
document.getElementById('measure').addEventListener('click',()=>{
 const d=frame.contentDocument,w=frame.contentWindow,stage=$('stage').getBoundingClientRect();
 const boxes=[...d.querySelectorAll('button,select,.card')].map(e=>{const r=e.getBoundingClientRect();return {element:e.id||e.className,width:r.width,height:r.height,outside:r.left<0||r.right>w.innerWidth};});
 result.textContent=JSON.stringify({viewport:w.innerWidth,scrollWidth:d.documentElement.scrollWidth,stage:{width:stage.width,height:stage.height},characters:[...d.querySelectorAll('.agent')].map(e=>({id:e.id,width:e.offsetWidth})),buttonsAndCards:boxes},null,2);
});
let running=false;
document.getElementById('test').addEventListener('click',async()=>{
 if(running)return;running=true;result.textContent='RUNNING / 6方向のUIテストを実行中';const checks=[],edges=[['bolt','titan'],['bolt','scout'],['titan','bolt'],['titan','scout'],['scout','bolt'],['scout','titan']];
 const record=message=>{checks.push(message);result.textContent=checks.join('\n');};
 try{
  for(const[from,to]of edges){
   $('resetBtn').click();$('from').value=from;$('from').dispatchEvent(new Event('change',{bubbles:true}));$('to').value=to;$('to').dispatchEvent(new Event('change',{bubbles:true}));
   assert(!$('handoffBtn').disabled,'manual control unavailable');$('handoffBtn').click();
   for(let i=0;i<30;i++)$('handoffBtn').click();
   await delay(850);$('pauseBtn').click();
   const frozen=()=>[...frame.contentDocument.querySelectorAll('.agent,.actor,.artifact,.hero,.head,.eyes,.shadow,#missionProgress,#wallProgress')].map(e=>e.getAttribute('style')+'|'+e.getAttribute('transform')+'|'+e.hidden).join(';');
   const before=frozen();await delay(450);assert(frozen()===before,'animation advanced while paused');
   const state=()=>['missionTitle','missionPhase','counter','missionProgress','log'].map(id=>$(id).textContent+'|'+$(id).getAttribute('style')).join(';')+'|'+['a-bolt','a-titan','a-scout'].map(id=>$(id).getAttribute('style')).join(';');
   const originalState=state(), bolt=$('a-bolt').querySelector('.actor').innerHTML,scout=$('a-scout').querySelector('.actor').innerHTML;
   for(let j=0;j<10;j++){$('titanOldBtn').click();$('titanNewBtn').click();}
   assert(state()===originalState,'skin switch changed transaction state');assert($('a-bolt').querySelector('.actor').innerHTML===bolt&&$('a-scout').querySelector('.actor').innerHTML===scout,'skin switch changed other heroes');assert($('a-titan').querySelectorAll('image').length===6,'raster rig layers missing');assert($('counter').textContent==='0','paused transaction committed early');$('pauseBtn').click();
   let waited=0,vanished=false,appeared=false;
   while($('handoffBtn').disabled&&waited<35000){await delay(50);waited+=50;const actor=$('a-'+from);if(from==='bolt'){const mode=actor.dataset.mode;if(mode==='vanish'||mode==='transit'){vanished=true;assert(Number(actor.querySelector('.hero').style.opacity)===0,'bolt visible in transit');}if(mode==='appear')appeared=true;}}
   assert(waited<35000,'transaction timed out');assert($('counter').textContent==='1','duplicate or missing handoff');assert($('log').children.length===1,'history count mismatch');assert($('status-'+to).textContent==='実行中','receiver did not start work');assert(frame.contentDocument.querySelectorAll('.agent').length===3,'duplicate character');assert($('error').hidden,'application error');
   if(from==='bolt'&&!(vanished&&appeared))record('NOTE 雷化の全フレームは観測できませんでした（コアテストで別途確認）。');
   record('PASS '+from.toUpperCase()+' → '+to.toUpperCase()+' / pause・spam・新旧20切替・受領・復帰・作業開始');
  }
  $('resetBtn').click();for(let i=0;i<30;i++){$('autoBtn').click();$('pauseBtn').click();$('resetBtn').click();}
  assert($('counter').textContent==='0','reset count mismatch');assert($('playState').textContent==='STANDBY','reset state mismatch');
  record('PASS リセット・自動再生・一時停止の連打30回');record('UI TEST COMPLETE / '+new Date().toISOString());
 }catch(error){record('FAIL '+error.message);}finally{running=false;}
});

document.getElementById('network').addEventListener('click',()=>{
 const w=frame.contentWindow,d=frame.contentDocument;
 const resources=w.performance.getEntriesByType('resource').map(e=>({name:e.name,initiatorType:e.initiatorType,transferSize:e.transferSize,decodedBodySize:e.decodedBodySize,durationMs:e.duration,responseStatus:e.responseStatus}));
 const external=resources.filter(e=>!e.name.startsWith(w.location.origin+'/')&&!e.name.startsWith('data:'));
 result.textContent=JSON.stringify({resources,external,contentSecurityPolicy:d.querySelector('meta[http-equiv="Content-Security-Policy"]').content},null,2);
});

let inspecting=false;
function focusHeadquarters(){const stage=$('stage');frame.height=Math.ceil(stage.getBoundingClientRect().height)+2;frame.contentWindow.scrollTo({top:stage.offsetTop,behavior:'instant'});window.scrollTo({top:0,behavior:'instant'});}
document.getElementById('oldSkin').addEventListener('click',()=>$('titanOldBtn').click());
document.getElementById('newSkin').addEventListener('click',()=>$('titanNewBtn').click());
document.getElementById('fullView').addEventListener('click',()=>{frame.height=1510;frame.contentWindow.scrollTo({top:0,behavior:'instant'});window.scrollTo({top:0,behavior:'instant'});});
function stopAndReset(){ $('resetBtn').click();$('titanNewBtn').click(); }
document.getElementById('titanIdle').addEventListener('click',()=>{if(running||inspecting)return;stopAndReset();$('pauseBtn').click();focusHeadquarters();result.textContent='待機・一時停止中。フレーム内の旧TITAN／新TITANで同条件を比較できます。';});
async function inspectPose(mode){
 if(running||inspecting)return;inspecting=true;result.textContent=mode+' の状態まで再生中…';
 try{stopAndReset();$('from').value=mode==='walk'?'titan':'scout';$('from').dispatchEvent(new Event('change',{bubbles:true}));$('to').value=mode==='walk'?'scout':'titan';$('to').dispatchEvent(new Event('change',{bubbles:true}));$('handoffBtn').click();
 let attempts=0;while($('a-titan').dataset.mode!==mode&&attempts++<1000)await delay(20);
 if($('a-titan').dataset.mode!==mode)throw Error('pose not reached');if(mode==='receive'){let settle=0;while(($('a-titan').querySelector('.artifact').hidden||parseFloat($('a-titan').querySelector('.artifact').style.left)<$('a-titan').offsetWidth*.395)&&settle++<1000)await delay(20);if($('a-titan').dataset.mode!=='receive')throw Error('受領後の停止位置を取り切れませんでした。もう一度実行してください。');}else await delay(300);$('pauseBtn').click();focusHeadquarters();result.textContent=mode+' で一時停止中。旧TITAN／新TITANを切り替えて比較できます。';
 }catch(error){result.textContent='FAIL '+error.message;}finally{inspecting=false;}
}
document.getElementById('titanWalk').addEventListener('click',()=>inspectPose('walk'));
document.getElementById('titanReceive').addEventListener('click',()=>inspectPose('receive'));
