import test from 'node:test';
import assert from 'node:assert/strict';
import { Simulation, EDGES, IDS, HOME } from '../simulation.js';
import fs from 'node:fs';
const finish = sim => { for (let i=0; sim.current && i<2000; i++) sim.tick(20); assert.equal(sim.current,null); };
const advanceTo = (sim,name,portion=0) => { const phases=sim.current.phases;const idx=phases.findIndex(p=>p.name===name); assert.ok(idx>=0);sim.tick(phases.slice(0,idx).reduce((n,p)=>n+p.duration,0)+phases[idx].duration*portion); };
for (const [from,to] of EDGES) test(`${from} → ${to}: ownership, receiving, return and work restart`,()=>{
 const sim=new Simulation();assert.ok(sim.request(from,to));let contact=false,received=false;
 for(let i=0;sim.current&&i<3000;i++){
  const s=sim.snapshot();assert.equal(Object.values(s.poses).filter(p=>p.file).length,s.owner?1:0);
  assert.ok(IDS.every(id=>Number.isFinite(s.poses[id].x)&&Number.isFinite(s.poses[id].y)));
  if(s.phase==='offer'){contact=true;assert.equal(s.poses[from].mode,'offer');assert.equal(s.poses[to].mode,'receive');}
  if(s.phase==='received'){received=true;assert.equal(s.owner,to);assert.equal(s.count,1);}
  if(s.phase==='start'){assert.equal(s.poses[to].mode,'work');assert.deepEqual([s.poses[to].x,s.poses[to].y],HOME[to]);assert.deepEqual([s.poses[from].x,s.poses[from].y],HOME[from]);}
  sim.tick(17);
 }
 assert.ok(contact&&received);assert.equal(sim.count,1);assert.equal(sim.history.length,1);assert.equal(sim.snapshot().poses[to].status,'実行中');
});
for(const to of ['titan','scout'])test(`BOLT → ${to}: no slide; vanish and direct reappearance in front`,()=>{
 const sim=new Simulation({clearance:170});sim.request('bolt',to);advanceTo(sim,'vanish',.2);
 let s=sim.snapshot();assert.equal(s.poses.bolt.visible,false);assert.deepEqual([s.poses.bolt.x,s.poses.bolt.y],HOME.bolt);
 sim.tick(sim.current.phases[sim.phaseIndex].duration*.8+70);assert.equal(sim.snapshot().phase,'transit');assert.equal(sim.snapshot().poses.bolt.visible,false);
 sim.tick(70);s=sim.snapshot();assert.equal(s.phase,'appear');assert.equal(s.poses.bolt.visible,true);
 assert.equal(Math.abs(s.poses.bolt.x-s.poses[to].x),170);assert.equal(Math.abs(s.poses.bolt.y-s.poses[to].y),2);
});
for(const phase of ['work','charge','vanish','transit','appear','offer','returnVanish','receiverReturn','start'])test(`pause freezes every property in ${phase}`,()=>{
 const sim=new Simulation();sim.request('bolt','titan');advanceTo(sim,phase,.6);sim.setPaused(true);const before=structuredClone(sim.snapshot());sim.tick(60000);assert.deepEqual(sim.snapshot(),before);sim.setPaused(false);sim.tick(10);assert.notEqual(sim.snapshot().elapsed,before.elapsed);
});
test('spam, invalid input, reset during vanished state and restart',()=>{
 const sim=new Simulation();assert.equal(sim.request('bolt','bolt'),false);assert.equal(sim.request('unknown','scout'),false);sim.request('bolt','titan');advanceTo(sim,'vanish',.5);
 for(let i=0;i<1000;i++)assert.equal(sim.request('scout','titan'),false);assert.equal(sim.current.from,'bolt');
 sim.reset();assert.equal(sim.count,0);assert.equal(sim.history.length,0);assert.equal(sim.paused,false);assert.equal(sim.auto,false);assert.equal(sim.snapshot().owner,null);
 for(const id of IDS){assert.equal(sim.snapshot().poses[id].visible,true);assert.deepEqual([sim.snapshot().poses[id].x,sim.snapshot().poses[id].y],HOME[id]);}
 assert.ok(sim.request('scout','bolt'));finish(sim);assert.equal(sim.count,1);
});
test('automatic deck covers all six directions without fixed sequence',()=>{
 const sequences=[];
 for(const random of [()=>.1,()=>.8]){const sim=new Simulation({random});sim.setAuto(true);const sequence=[];for(let i=0;i<6;i++){sequence.push([sim.current.from,sim.current.to].join(':'));sim.tick(sim.current.phases.reduce((v,p)=>v+p.duration,0));if(!sim.current)sim.next();}assert.equal(new Set(sequence).size,6);sequences.push(sequence);}
 assert.notDeepEqual(sequences[0],sequences[1]);
});
test('30 simulated minutes: bounded history, count consistent, no duplicates',()=>{
 const sim=new Simulation({random:()=>.37});sim.setAuto(true);let last=0,completed=0;
 for(let i=0;i<108000;i++){sim.tick(1000/60);const s=sim.snapshot();assert.ok(s.count>=last&&s.count<=last+1);assert.ok(s.history.length<=12);assert.ok(Object.values(s.poses).filter(p=>p.file).length<=1);last=s.count;if(s.phase==='start')completed++;}
 assert.ok(sim.count>90);assert.ok(completed>0);
});
test('auto can stop after current transaction; paused idle auto does not progress',()=>{
 const sim=new Simulation();sim.setPaused(true);sim.setAuto(true);sim.tick(20000);assert.equal(sim.current,null);sim.setPaused(false);sim.tick(1);assert.ok(sim.current);sim.setAuto(false);finish(sim);assert.equal(sim.auto,false);sim.tick(50000);assert.equal(sim.count,1);
});
test('reduced motion keeps all six functional transactions',()=>{for(const [from,to]of EDGES){const sim=new Simulation({reduced:true});sim.request(from,to);assert.ok(sim.current.phases.every(p=>p.duration<=400));finish(sim);assert.equal(sim.count,1);}});
test('production client has no external API, analytics, secret or dynamic code calls',()=>{
 const files=['index.html','styles.css','app.js','simulation.js','sprites.js'];
 for(const name of files){const source=fs.readFileSync(name,'utf8');assert.doesNotMatch(source,/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|eval)\s*\(/,name);assert.doesNotMatch(source,/\b(?:sk-proj-|sk_live_|sk_test_|ghp_|github_pat_)[A-Za-z0-9_]{12,}/,name);assert.doesNotMatch(source,/https?:\/\/(?!www\.w3\.org)/,name);}
 assert.match(fs.readFileSync('index.html','utf8'),/connect-src 'none'/);
});
test('orientation/viewport changes preserve spacing during a transaction',()=>{const sim=new Simulation();sim.request('bolt','titan');advanceTo(sim,'appear',.2);sim.setClearance(180);let s=sim.snapshot();assert.equal(Math.abs(s.poses.bolt.x-s.poses.titan.x),180);sim.setClearance(95);s=sim.snapshot();assert.equal(Math.abs(s.poses.bolt.x-s.poses.titan.x),95);finish(sim);assert.equal(sim.count,1);});
