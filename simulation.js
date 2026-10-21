// Pure, deterministic simulation. No timers, DOM, storage, network or production data.
export const IDS = ['bolt', 'titan', 'scout'];
export const HOME = { bolt: [780, 407], titan: [500, 600], scout: [220, 407] };
export const EDGES = IDS.flatMap(from => IDS.filter(to => to !== from).map(to => [from, to]));
const mix = (a, b, t) => a + (b - a) * t;
export const smooth = t => t * t * (3 - 2 * t);
const point = (a, b, t) => a.map((v, i) => mix(v, b[i], smooth(t)));
const labels = { work: '成果物を作成中', complete: '成果物が完成', notice: '引き継ぎを確認', rise: '受け取り準備', approach: '受け取り位置へ', charge: '届ける準備', vanish: '雷へ変化', transit: '転送中', appear: '相手の目の前へ出現', travel: '成果物を運搬中', offer: '成果物を受け渡し中', received: '受け取り確認', proud: '引き継ぎ成功', returnCharge: '帰還準備', returnVanish: '雷へ変化', returnTransit: '帰還転送中', returnAppear: 'デスクへ再出現', returnTravel: 'デスクへ帰還', receiverReturn: '受信者がデスクへ復帰', start: '次の仕事を開始' };
export class Simulation {
  constructor({ random = Math.random, clearance = 100, reduced = false } = {}) {
    this.random = random; this.clearance = clearance; this.reduced = reduced; this.reset();
  }
  reset() {
    this.elapsed = 0; this.paused = false; this.auto = false; this.current = null; this.phaseIndex = 0; this.phaseTime = 0;
    this.count = 0; this.history = []; this.deck = []; this.lastEdge = ''; this.revision = (this.revision || 0) + 1;
    this.event = '基地の準備ができました'; this.completedPair = null;
  }
  setClearance(value) {
    if (!Number.isFinite(value) || value <= 0) return;
    this.clearance = value;
    if (this.current) {
      const c = this.current, side = HOME[c.from][0] < HOME[c.to][0] ? -1 : 1;
      c.destination[0] = c.receiver[0] + side * value;
    }
  }
  setPaused(value) { this.paused = !!value; }
  setAuto(value) { this.auto = !!value; if (this.auto && !this.current && !this.paused) this.next(); }
  next() {
    if (!this.deck.length) {
      this.deck = EDGES.map(edge => [...edge]);
      for (let i = this.deck.length - 1; i > 0; i--) { const j = Math.floor(this.random() * (i + 1)); [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]; }
      if (this.deck.at(-1).join(':') === this.lastEdge) this.deck.reverse();
    }
    const [from, to] = this.deck.pop(); this.lastEdge = `${from}:${to}`; this.request(from, to);
  }
  request(from, to) {
    if (this.current || this.paused || !IDS.includes(from) || !IDS.includes(to) || from === to) return false;
    const side = HOME[from][0] < HOME[to][0] ? -1 : 1;
    const receiver = [...HOME[to]];
    if (to !== 'bolt') { receiver[0] += side * 18; receiver[1] += 24; }
    const destination = [receiver[0] + side * this.clearance, receiver[1] + 2];
    const phases = [];
    const add = (name, ms) => phases.push({ name, duration: this.reduced ? Math.min(ms, 400) : ms });
    add('work', 1900); add('complete', 500); add('notice', 600); add('rise', to === 'titan' ? 750 : 400);
    add('approach', to === 'titan' ? 850 : 500); add('charge', from === 'bolt' ? 650 : 600);
    if (from === 'bolt') { add('vanish', 220); add('transit', 140); add('appear', 380); }
    else add('travel', from === 'titan' ? 2350 : 1550);
    add('offer', 1100); add('received', 550); add('proud', 550);
    if (from === 'bolt') { add('returnCharge', 450); add('returnVanish', 220); add('returnTransit', 140); add('returnAppear', 380); }
    else add('returnTravel', from === 'titan' ? 2200 : 1450);
    add('receiverReturn', to === 'titan' ? 900 : 650); add('start', 1400);
    this.current = { from, to, receiver, destination, phases, committed: false, title: { scout: '調査レポート', bolt: '連携プラン', titan: '集計データ' }[from] };
    this.phaseIndex = 0; this.phaseTime = 0; this.completedPair = null; this.revision++; return true;
  }
  tick(ms) {
    if (this.paused || !Number.isFinite(ms) || ms <= 0) return;
    this.elapsed += ms;
    let remaining = ms, safety = 0;
    while (remaining > 0 && safety++ < 1000) {
      if (!this.current) { if (this.auto) this.next(); else break; }
      const c = this.current, phase = c.phases[this.phaseIndex], used = Math.min(remaining, phase.duration - this.phaseTime);
      this.phaseTime += used; remaining -= used;
      if (phase.name === 'offer' && this.phaseTime >= phase.duration * .55 && !c.committed) { c.committed = true; this.count++; this.revision++; }
      if (this.phaseTime >= phase.duration) {
        this.phaseTime = 0; this.phaseIndex++; this.revision++;
        if (this.phaseIndex >= c.phases.length) {
          this.completedPair = [c.from, c.to]; this.event = `${c.from.toUpperCase()} → ${c.to.toUpperCase()}：${c.title}を引き継ぎ、作業開始`;
          this.history.unshift({ from: c.from, to: c.to, title: c.title, at: this.elapsed }); this.history = this.history.slice(0, 12);
          this.current = null;
        }
      }
    }
  }
  snapshot() {
    const c = this.current, poses = Object.fromEntries(IDS.map(id => [id, { id, x: HOME[id][0], y: HOME[id][1], mode: id === 'scout' ? 'scan' : 'idle', status: '待機', speech: '', file: false, face: 'calm', visible: true, progress: 0, direction: 1 }]));
    if (!c) {
      if (this.completedPair) { const receiver = poses[this.completedPair[1]]; receiver.mode = 'work'; receiver.status = '実行中'; receiver.speech = '次の仕事、進めてるよ。'; }
      return { poses, phase: 'idle', label: '次のミッションを待機', progress: 0, missionProgress: 0, count: this.count, paused: this.paused, auto: this.auto, busy: false, owner: null, history: this.history, elapsed: this.elapsed, event: this.event, revision: this.revision };
    }
    const phase = c.phases[this.phaseIndex], name = phase.name, p = this.phaseTime / phase.duration;
    const a = poses[c.from], b = poses[c.to], index = n => c.phases.findIndex(v => v.name === n), after = n => this.phaseIndex >= index(n);
    const moving = c.from === 'bolt' ? 'vanish' : 'travel';
    a.mode = 'idle'; a.status = '準備中'; b.status = '待機';
    a.direction = c.destination[0] >= HOME[c.from][0] ? 1 : -1; b.direction = -a.direction;
    if (after('approach')) [b.x, b.y] = c.receiver;
    if (after(moving)) [a.x, a.y] = c.destination;
    const returnEnd = c.from === 'bolt' ? 'returnAppear' : 'returnTravel';
    if (after(returnEnd) && name !== returnEnd) [a.x, a.y] = HOME[c.from];
    if (after('receiverReturn') && name !== 'receiverReturn') [b.x, b.y] = HOME[c.to];
    if (after('complete') && !c.committed) a.file = true;
    if (c.committed && !after('start')) b.file = true;
    if (name === 'work') { a.mode = 'work'; a.status = '実行中'; a.speech = { bolt: '連携プラン、組み立て中！', titan: 'じっくり、しっかり集計。', scout: '何か、見つかりそう…' }[c.from]; }
    else if (name === 'complete') { a.mode = 'discover'; a.status = '完了'; a.face = 'happy'; a.speech = `${c.title}、できた！`; }
    else {
      a.status = c.committed ? '完了・帰還中' : '引き継ぎ中'; b.status = c.committed ? '受領・復帰中' : '受け取り準備';
      a.speech = `${c.to.toUpperCase()}に届ける！`; b.face = 'alert';
      if (name === 'notice') { a.mode = 'hold'; b.mode = 'notice'; b.speech = '呼んだ？ 受け取るよ！'; }
      if (name === 'rise') { b.mode = 'rise'; b.speech = c.to === 'titan' ? 'よいしょ。任せて。' : '準備できたよ！'; }
      if (name === 'approach') { [b.x, b.y] = point(HOME[c.to], c.receiver, p); b.mode = c.to === 'titan' ? 'walk' : c.to === 'scout' ? 'float' : 'idle'; a.mode = 'hold'; }
      if (name === 'charge') { a.mode = c.from === 'bolt' ? 'charge' : c.from === 'titan' ? 'rise' : 'scan'; b.mode = 'ready'; }
      if (name === 'travel') { [a.x, a.y] = point(HOME[c.from], c.destination, p); a.mode = c.from === 'titan' ? 'walk' : 'float'; b.mode = 'ready'; }
      if (['vanish','transit','appear'].includes(name)) {
        a.mode = name; a.status = '雷化・転送中'; a.visible = name === 'appear';
        if (name !== 'appear') [a.x, a.y] = HOME[c.from];
        if (name === 'transit') a.speech = '';
        b.mode = 'ready';
      }
      if (name === 'offer') { a.mode = 'offer'; b.mode = 'receive'; a.speech = 'はい、どうぞ！'; b.speech = c.committed ? '受け取った！' : '両手で、しっかり。'; b.face = 'happy'; }
      if (['received','proud'].includes(name)) { a.mode = 'proud'; b.mode = 'receive'; a.face = 'happy'; b.face = 'happy'; a.speech = c.from === 'bolt' ? '速さも、仕事のうちっ！' : 'あとは、よろしく！'; b.speech = '受け取った。ありがとう！'; }
      if (name === 'returnCharge') { a.mode = 'charge'; a.speech = '基地内転送、もう一度！'; }
      if (['returnVanish','returnTransit','returnAppear'].includes(name)) { a.mode = name.replace('return','').toLowerCase(); a.visible = name === 'returnAppear'; if (name === 'returnAppear') [a.x, a.y] = HOME[c.from]; a.speech = ''; }
      if (name === 'returnTravel') { [a.x, a.y] = point(c.destination, HOME[c.from], p); a.mode = c.from === 'titan' ? 'walk' : 'float'; a.direction *= -1; a.speech = 'デスクに戻ろう。'; }
      if (name === 'receiverReturn') { [b.x, b.y] = point(c.receiver, HOME[c.to], p); b.mode = c.to === 'titan' ? 'walk' : c.to === 'scout' ? 'float' : 'idle'; a.status = '完了'; a.speech = ''; b.speech = '続きは、デスクで。'; }
      if (name === 'start') { a.status = '完了'; a.speech = ''; b.status = '実行中'; b.mode = 'work'; b.speech = { bolt: '次の連携、開始！', titan: '受け取った。処理開始！', scout: '新しい発見、探してくる！' }[c.to]; }
    }
    a.progress = p; b.progress = p;
    const elapsed = c.phases.slice(0, this.phaseIndex).reduce((sum, v) => sum + v.duration, 0) + this.phaseTime;
    const total = c.phases.reduce((sum, v) => sum + v.duration, 0);
    return { poses, phase: name, label: labels[name], from: c.from, to: c.to, title: c.title, progress: p, missionProgress: elapsed / total, count: this.count, paused: this.paused, auto: this.auto, busy: true, owner: a.file ? c.from : b.file ? c.to : null, history: this.history, elapsed: this.elapsed, event: this.event, revision: this.revision };
  }
}
