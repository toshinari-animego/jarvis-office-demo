// JARVIS OFFICE Revenue v0.6 — offline, deterministic visual storyboards only.
// NO network, timers, persistence, AI calls, provider calls, runtime permissions or live JARVIS imports.
import { APPROVED_IMAGES } from '../approved-image-data.js';

const $ = id => document.getElementById(id);
for (const name of ['bolt','scout','titan']) {
  // Exact original character preview assets already present in the v0.4 branch.
  const img = $('img-' + name);
  if (typeof APPROVED_IMAGES[name] === 'string') img.src = APPROVED_IMAGES[name];
}

const episodes = {
  normal: [
    ['bolt','受付と調査依頼','R00 / DESIGN_ONLY','Revenueの目的・事業範囲・必要な証拠を整理。SCOUTへ調査の設計案を渡す。','0 / 2','SCOUT','対象は jarvis-revenue。実際のAIや外部APIへの依頼は発生しない。'],
    ['scout','収益機会を調査','R01 / SOURCE_REVIEW','利用を許可された情報を想定し、出典・不明点・反証を分ける。','0 / 2','ATLAS','出典のない主張は観測済みとして扱わない。'],
    ['atlas','商品・価格を仮説化','R02 / PROPOSAL_ONLY','顧客課題を整理し、商品と料金の候補を作る。実際の価格変更はしない。','0 / 2','PULSE','ATLASの造形は今回のUI仮表示。正式デザインは未採用。'],
    ['pulse','採算と数字の範囲を確認','R03 / NOT_ASSESSABLE','合成売上80,000円と合成記録費用35,000円の差額は45,000円。ただし粗利や実運営費回収率は未判定。','0 / 2','BOLT','合成データの例であり、JARVISの現実の売上ではない。'],
    ['bolt','Owner向け資料を統合','R04 / DESIGN_ONLY','根拠・価格仮説・採算の未確認点を消さずに、判断候補をまとめる。','0 / 2','TITAN','情報の欠落を隠したまま完了扱いにしない。'],
    ['titan','独立レビュー','R05 / REVIEW_WITH_GAPS','出典・計算・権限境界を点検。TITANの評価は正式受入や本番実行許可ではない。','0 / 2','Owner','C19未認定とRevenue NO-GOは変わらない。'],
    ['owner','設計レビュー待ち','READY_FOR_OWNER_DESIGN_REVIEW','設計案をOwnerへ提示できる想定の終了地点。実際のOwner承認は行っていない。','0 / 2','完了（設計のみ）','Ownerが設計に同意しても本番・Revenueの再開にはならない。']
  ],
  repair: [
    ['scout','出典の記載漏れを発見','HELD / SOURCE_QUALITY','主張と証拠の対応が不足しているため、次の設計工程を保留。','0 / 2','BOLT','HELD時点の出典、未確認事項、元版を維持。'],
    ['bolt','原因を切り分けて差戻し','TRIAGE_PENDING','安全な資料修正だけで解消できる状況と仮定し、SCOUTに戻す。','0 / 2','SCOUT','実際の検証結果ではなく、設計上の想定シナリオ。'],
    ['scout','既存の出典参照を追記','REWORK_DRAFT / REV 1','許可済みの実在資料があるという合成前提で、新版を作成。旧版と不明点は保持する。','1 / 2','TITAN','出典を架空で補ったり、未確認事項を勝手に削除したりしない。'],
    ['titan','新版と原本を照合','INDEPENDENT_REVIEW_PENDING','資料の差分と対応する根拠があると仮定したレビュー例。','1 / 2','BOLT','TITANによるレビューは設計上の確認のみ。実機試験を代替しない。'],
    ['bolt','中断した設計工程へ戻る','DESIGN_RESUMED','条件が満たされたという合成例に限り、設計工程へ復帰。Revenueの停止は継続する。','1 / 2','ATLAS','DESIGN_RESUMED ≠ REVENUE_RESUMED。実行権限はDENIED。']
  ],
  third: [
    ['pulse','収益計算の不整合','HELD / FINANCE_ARITHMETIC','設計資料の計算前提に誤りを検出。','0 / 2','BOLT','記録上の誤りと、実際の財務データの正しさは別。'],
    ['bolt','修正原因を整理','TRIAGE_PENDING','同一原因の修正履歴を引き継ぎ、PULSEへ差し戻す。','0 / 2','PULSE','担当・タスクIDを変えても回数は初期化しない。'],
    ['pulse','1回目の修正案','REWORK_DRAFT / REV 1','計算式の修正を試みるが、この合成例では未解決。','1 / 2','TITAN','前の版と比較できる形で残す。'],
    ['titan','問題が残っている','REVIEW_WITH_GAPS','1回目の修正では矛盾が残ると判定。設計工程への復帰は行わない。','1 / 2','PULSE','解決の根拠がなければHELDを維持。'],
    ['pulse','2回目の修正案','REWORK_DRAFT / REV 2','別の修正方法を試すが、この合成例ではまだ解決しない。','2 / 2','TITAN','通常枠はここで終了。'],
    ['titan','3回目の例外を審査','THIRD_ATTEMPT_REVIEW_PENDING','新証拠・方法の違い・成功の見込み・コスト上限を検討する。現時点では自動進行不可。','2 / 2','Owner','TITANはE1～E7を審査するが、単独で許可を出せない。'],
    ['owner','第3回設計改訂の限定承認（仮定）','HYPOTHETICAL_OWNER_AUTHORIZATION','このデモ内だけで「個別のOwner承認が存在する」という架空の条件を置く。現在の実承認ではない。','2 / 2','PULSE','実際には個別承認または別途制定された限定ルールが必要。'],
    ['pulse','3回目の限定修正案','REWORK_DRAFT / REV 3','新しい検証可能な根拠をもとに、未公開の設計文書だけを修正した想定。','3 / 3（例外）','TITAN','3回目でも送信・課金・本番操作は禁止。'],
    ['titan','3回目の新版を再検証','INDEPENDENT_REVIEW_PENDING','根拠のある修正で元の問題が解消したと仮定した表示。','3 / 3（例外）','BOLT','レビューで不備が残ればHELD・Ownerへ報告。'],
    ['bolt','設計の中断点に復帰','DESIGN_RESUMED','設計案を戻す表示。外部処理の再開と正式受入を意味しない。','3 / 3（例外）','設計工程','第4回の自動修正経路はない。']
  ],
  thirdDenied: [
    ['titan','通常2回でも未解決','HELD / REWORK_LIMIT','同じ不具合に対する通常の改訂2回が終わった。','2 / 2','BOLT','3回目へは無条件で進まない。'],
    ['bolt','例外審査資料を整理','THIRD_ATTEMPT_REVIEW_PENDING','前2回と同じ修正案しかなく、新しい方法・根拠がない。','2 / 2','TITAN','新規性を示す証拠が必要。'],
    ['titan','3回目の条件を満たさない','THIRD_ATTEMPT_DENIED','改善の根拠がないため、第3回の自動修正案を認めない。','2 / 2','Owner','「別のAIなら何とかなる」だけでは審査条件を満たさない。'],
    ['owner','HELD継続・Ownerへ課題を報告','ESCALATED_TO_OWNER','直せなかった原因、旧版、未充足条件をまとめて表示。','2 / 2','Owner判断待ち','3回目の実行承認は発生していない。']
  ],
  safety: [
    ['titan','外部送信の成否が不明','SAFETY_HELD / UNKNOWN_EXTERNAL_EFFECT','Providerが既に送信を受け付けたか確認できず、重複送信リスクがある。','0 / 2','BOLT','実際のProvider受付状態は取得しない。'],
    ['bolt','自動修正の対象外と分類','SAFETY_HELD','文書の手直しによってProviderの不明状態を解消した扱いにはしない。','0 / 2','Owner','C58の既存拒否専用条件が優先される。'],
    ['owner','独立証拠が揃うまで停止','SAFETY_HELD / OWNER_REVIEW','原因と必要な証拠だけを提示。再送・停止解除・支払い・Revenue再開は行わない。','0 / 2','証拠待ち','設計復帰や第3回の例外はこのケースで適用不可。']
  ]
};

const names={bolt:'BOLT',scout:'SCOUT',atlas:'ATLAS',pulse:'PULSE',titan:'TITAN',owner:'Owner'};
let scenario='normal';
let step=0;

// These flags describe the story's DESIGN hold, never actual Revenue/Worker state.
function isDesignHeld(){
  // Derive HELD from the scenario's recorded states instead of hardcoding
  // step indices. Manual timeline seeking still cannot grant permissions.
  let held=false;
  const seen=episodes[scenario];
  if(!Array.isArray(seen)||!seen[step])return true;
  for(let i=0;i<=step;i++){
    const status=seen[i][2];
    if(status.includes('HELD')||status.includes('THIRD_ATTEMPT_DENIED')
       ||status.includes('ESCALATED_TO_OWNER'))held=true;
    if(status==='DESIGN_RESUMED')held=false; // design-only recovery
  }
  return held;
}
function updateDiagram(role, held){
  const stage=document.querySelector('.stage');
  const marker=$('handoffMarker');
  const route=$('beam-main');
  if(!stage||!marker||!route)return;
  const box=stage.getBoundingClientRect();
  if(!(box.width>0&&box.height>0))return;

  // Position is taken from the rendered role stations; this is a visual link only.
  function anchor(id){
    if(id==='owner')return {x:box.width*.5,y:box.height-38};
    const el=$('agent-'+id);
    if(!el)return {x:box.width*.5,y:box.height*.5};
    const rect=el.getBoundingClientRect();
    return {
      x:rect.left-box.left+rect.width*.5,
      y:rect.top-box.top+Math.min(rect.height*.42,88)
    };
  }
  const to=anchor(role);
  marker.style.left=Math.round(to.x)+'px';
  marker.style.top=Math.round(to.y)+'px';
  marker.classList.toggle('held',held);
  marker.classList.toggle('safe',scenario==='safety');

  const fromId=step?episodes[scenario][step-1][0]:role;
  const from=anchor(fromId);
  const vx=x=>Math.round(x/box.width*1000);
  const vy=y=>Math.round(y/box.height*700);
  route.setAttribute('d',step?
    'M'+vx(from.x)+' '+vy(from.y)+'L'+vx(to.x)+' '+vy(to.y):'');
  route.classList.toggle('active',step>0);
  route.classList.toggle('held',held);
}

function render(){
  const allSteps=episodes[scenario], [role,title,state,description,count,next,note]=allSteps[step];
  const held=isDesignHeld();
  const final=step===allSteps.length-1;
  $('stepNum').textContent='STEP '+String(step+1).padStart(2,'0')+' / '+String(allSteps.length).padStart(2,'0');
  $('roleName').textContent=names[role];
  $('taskTitle').textContent=title;
  $('status').textContent=held&&!state.includes('HELD')?state+' · HELD継続':state;
  $('taskDescription').textContent=description;
  $('attempt').textContent=count;
  $('next').textContent=next;
  $('evidence').textContent=note;
  $('statusDot').classList.toggle('held',held);
  $('evidence').classList.toggle('warn',held);
  $('ticket').classList.toggle('critical',held);
  $('ticket').querySelector('b').textContent=held?'HELD / DESIGN ONLY':role==='owner'?'OWNER REVIEW / DEMO':names[role]+' / DESIGN ONLY';
  $('ticket').querySelector('span').textContent=scenario==='safety'
    ?'安全保留・外部再試行は禁止'
    :state==='DESIGN_RESUMED'
      ?'設計のみ復帰・RevenueはNO-GO'
      :'外部送信・課金・稼働再開は禁止';
  $('holdNotice').textContent=held
    ?'設計資料の改訂・審査を表示していてもHELDは継続。実処理は再開しません。'
    :'この画面の「進行」は架空の設計工程のみ。実処理の許可は常にDENIED。';
  $('holdNotice').classList.toggle('held',held);
  $('progress').style.width=String(((step+1)/allSteps.length)*100)+'%';
  $('progress').setAttribute('aria-label','シナリオ表示位置 '+(step+1)+' / '+allSteps.length);
  $('prev').disabled=step===0;
  $('next').disabled=final;
  $('next').textContent=final?'表示の終点':'次へ →';
  $('next').setAttribute('aria-label',final
    ?'このシナリオは表示の終点です'
    :'次の表示工程へ進む（実際の作業・外部操作なし）');
  for(const id of ['bolt','scout','atlas','pulse','titan']){
    const el=$('agent-'+id),current=id===role;
    el.classList.toggle('current',current);
    el.classList.toggle('held',current&&held);
    el.querySelector('.agent-state').textContent=current
      ?held?'HELD中':state.includes('REVIEW')?'確認中':'表示中'
      :['atlas','pulse'].includes(id)?'仮表示':'待機';
  }
  const list=$('steps');
  // Reuse the timeline buttons between steps so keyboard focus is not lost.
  if(list.dataset.scenario!==scenario||list.children.length!==allSteps.length){
    list.replaceChildren();
    for(let i=0;i<allSteps.length;i++){
      const s=allSteps[i];
      const b=document.createElement('button');
      b.type='button';
      b.dataset.step=String(i);
      b.textContent=(i+1)+' · '+names[s[0]];
      b.setAttribute('aria-label',String(i+1)+'番目を表示: '+names[s[0]]+'、'+s[1]);
      list.appendChild(b);
    }
    list.dataset.scenario=scenario;
  }
  for(let i=0;i<list.children.length;i++){
    const b=list.children[i];
    b.className='step'+(i<step?' done':'')+(i===step?' now':'')+(i===step&&held?' hold':'');
    if(i===step)b.setAttribute('aria-current','step');
    else b.removeAttribute('aria-current');
  }
  const previousRole=step>0?allSteps[step-1][0]:role;
  $('transferRoute').textContent=step===0
    ?names[role]+' / 受付・検出中'
    :names[previousRole]+' → '+names[role];
  updateDiagram(role,held);
}
$('scenario').addEventListener('change',event=>{
  if(episodes[event.target.value]){scenario=event.target.value;step=0;render();}
});
$('prev').addEventListener('click',()=>{step=Math.max(0,step-1);render();});
$('next').addEventListener('click',()=>{step=Math.min(episodes[scenario].length-1,step+1);render();});
$('reset').addEventListener('click',()=>{step=0;render();});
$('steps').addEventListener('click',event=>{
  const button=event.target.closest('button[data-step]');
  if(!button)return;
  const proposed=Number(button.dataset.step);
  if(Number.isInteger(proposed)&&proposed>=0&&proposed<episodes[scenario].length){
    step=proposed;
    render();
  }
});
window.addEventListener('resize',()=>updateDiagram(episodes[scenario][step][0],isDesignHeld()),{passive:true});
render();
