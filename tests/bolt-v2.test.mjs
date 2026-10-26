import test from 'node:test';
import assert from 'node:assert/strict';
import {BOLT_V2_MESHES,drawBoltV2} from '../bolt-v2.js';
import {rigAngles} from '../articulated-rig.js';

test('BOLT v2 has independent curved helmet, angular eyes, plates, ear rings and fabric geometry',()=>{
 const required=['shell','visor','eyeL','eyeR','boltMark','ear','torso','chest','cuff',
 'gauntlet','shoulder','boot','shin','neck','scarfLeft','scarfRight','scarfTrimL','scarfTrimR'];
 assert.deepEqual(Object.keys(BOLT_V2_MESHES).sort(),required.sort());
 let triangles=0;
 for(const [name,shape] of Object.entries(BOLT_V2_MESHES)){
   assert.equal(shape.pos.length%3,0,name);
   assert.equal(shape.norm.length,shape.pos.length,name);
   assert.equal(shape.indices.length%3,0,name);
   assert.ok(shape.indices.length>0,name);
   assert.ok(shape.indices.every(i=>Number.isInteger(i)&&i>=0&&i<shape.pos.length/3),name);
   assert.ok([...shape.pos,...shape.norm].every(Number.isFinite),name);
   triangles+=shape.indices.length/3;
 }
 assert.ok(triangles>=2200, 'higher-poly modeled shape than the original primitive sketch');
});
test('approved BOLT palette has mostly navy bodywork and targeted glowing gold highlights',()=>{
 const painted=[];
 const m={};
 const ctx={
  T:(p,x,y,z)=>({p,move:[x,y,z]}),
  S:(p,x,y,z)=>({p,scale:[x,y,z]}),
  Y:(p,a)=>({p,yaw:a}),
  Z:(p,a)=>({p,roll:a}),
  render:(kind,mat,color,glow)=>painted.push({kind,color,glow}),
  ball:(...a)=>painted.push({kind:'sphere',color:a[7],glow:a[8]}),
  line:(...a)=>painted.push({kind:'trim',color:a[7],glow:a[9]})
 };
 const pose={mode:'idle',seconds:1.5,joints:rigAngles('bolt','idle',0,1.5)};
 drawBoltV2(ctx,m,pose);
 assert.ok(painted.length>=35);
 assert.ok(painted.some(o=>o.kind==='boltV2-visor'));
 assert.ok(painted.some(o=>o.kind==='boltV2-eyeL'&&o.glow>=1));
 assert.ok(painted.some(o=>o.kind==='boltV2-eyeR'&&o.glow>=1));
 assert.ok(painted.some(o=>o.kind==='boltV2-ear'));
 assert.ok(painted.some(o=>o.kind==='boltV2-scarfLeft'));
 assert.ok(painted.some(o=>o.kind==='boltV2-scarfTrimR'));
 const navy=painted.filter(o=>['#132750','#254779','#34578c','#0c1731','#08192b','#080f21'].includes(o.color)).length;
 const gold=painted.filter(o=>['#ffd34e','#ffec9b','#fff0ad'].includes(o.color)).length;
 assert.ok(navy>gold/2, 'main armor remains primarily blue/navy');
 const originalCount=painted.length;painted.length=0;
 drawBoltV2(ctx,m,{...pose,mode:'charge',joints:rigAngles('bolt','charge',.5,2.5),seconds:2.5});
 assert.ok(painted.length>originalCount,'teleport effect draws additional energy');
});
