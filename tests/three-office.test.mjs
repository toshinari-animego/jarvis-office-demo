import test from 'node:test';
import assert from 'node:assert/strict';
import { Simulation, IDS } from '../simulation.js';
import { pose3D, createThreeOffice } from '../three-office.js';

test('3D pose remains deterministic on pause and never mutates simulation',()=>{
 const sim=new Simulation({random:()=>.5});
 const snapshot=sim.snapshot();
 for(const id of IDS){
  const pose=pose3D(id,snapshot.poses[id],snapshot.elapsed,false);
  assert.equal(pose.id,id);
  assert.ok(Number.isFinite(pose.lift)&&Number.isFinite(pose.heading));
  assert.deepEqual(pose.joints,pose3D(id,snapshot.poses[id],snapshot.elapsed,false).joints);
  assert.equal(Object.keys(pose.joints).length,6);
 }
 assert.equal(sim.count,0);
});
test('reduced motion disables nonessential 3D heading and joint animation',()=>{
 const sim=new Simulation({reduced:true,random:()=>0.2});
 sim.request('scout','titan');
 for(const id of IDS){
  const pose=pose3D(id,sim.snapshot().poses[id],sim.elapsed,true);
  assert.equal(pose.heading,0);
  assert.ok(Object.values(pose.joints).every(v=>v===0));
 }
});
function fakeGL(){
 let drawCalls=0,matrixCalls=0;
 const gl={
  VERTEX_SHADER:35633,FRAGMENT_SHADER:35632,COMPILE_STATUS:35713,LINK_STATUS:35714,
  ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,STATIC_DRAW:35044,
  FLOAT:5126,TRIANGLES:4,UNSIGNED_SHORT:5123,
  DEPTH_TEST:2929,LEQUAL:515,CULL_FACE:2884,COLOR_BUFFER_BIT:16384,DEPTH_BUFFER_BIT:256,
  createShader:()=>({}),shaderSource(){},compileShader(){},getShaderParameter:()=>true,deleteShader(){},
  createProgram:()=>({}),attachShader(){},linkProgram(){},getProgramParameter:()=>true,deleteProgram(){},useProgram(){},
  getAttribLocation:()=>0,getUniformLocation:()=>({}),createBuffer:()=>({}),bindBuffer(){},bufferData(){},
  enableVertexAttribArray(){},vertexAttribPointer(){},uniform3fv(){},uniform1f(){},
  uniformMatrix4fv(_x,_y,m){matrixCalls++;assert.equal(m.length,16);assert.ok([...m].every(Number.isFinite));},
  drawElements(){drawCalls++;},viewport(){},enable(){},depthFunc(){},disable(){},clearColor(){},clear(){}
 };
 return {gl,stats:()=>({drawCalls,matrixCalls})};
}
test('actual indexed 3D mesh draw calls and all 6 business handoff routes work',()=>{
 const oldDocument=globalThis.document,oldWindow=globalThis.window;
 const ctx=fakeGL();
 let canvas,callbacks={};
 globalThis.document={createElement(tag){
  assert.equal(tag,'canvas');
  canvas={className:'',attrs:{},width:0,height:0,setAttribute(k,v){this.attrs[k]=v},
   getContext(type){assert.equal(type,'webgl');return ctx.gl;},
   addEventListener(k,fn){callbacks[k]=fn;},removeEventListener(){},remove(){}};
  return canvas;
 }};
 globalThis.window={devicePixelRatio:2};
 const stage={clientWidth:375,clientHeight:500,append(node){assert.equal(node,canvas);}};
 try{
  const renderer=createThreeOffice(stage,()=>{});
  assert.ok(renderer);
  const sim=new Simulation({random:()=>0.2,clearance:70});
  const pairs=IDS.flatMap(from=>IDS.filter(to=>to!==from).map(to=>[from,to]));
  for(const [from,to] of pairs){
   sim.reset();assert.ok(sim.request(from,to));
   renderer.draw(sim.snapshot());
   sim.tick(5000);renderer.draw(sim.snapshot());
   assert.ok(ctx.stats().drawCalls>0);
  }
  assert.ok(ctx.stats().drawCalls>100);
  assert.ok(ctx.stats().matrixCalls>100);
  const afterSix=ctx.stats().drawCalls;
  // Rewinding to zero after a long run must repaint; otherwise the old 3D frame persists.
  sim.reset();renderer.draw(sim.snapshot());
  assert.ok(ctx.stats().drawCalls>afterSix);
  const afterReset=ctx.stats().drawCalls;
  renderer.draw(sim.snapshot());
  assert.equal(ctx.stats().drawCalls,afterReset,'unchanged time is throttled');
  assert.ok(canvas.width<=1450&&canvas.height<=1100);
  let prevented=false;callbacks.webglcontextlost({preventDefault(){prevented=true}});
  assert.ok(prevented);assert.equal(renderer.isAvailable(),false);
  renderer.dispose();
 }finally{
  if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;
  if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
 }
});
test('if WebGL is absent, leave the original 2D office untouched',()=>{
 const previous=globalThis.document;
 globalThis.document={createElement(){return {className:'',setAttribute(){},getContext(){return null;}}}};
 const stage={append(){throw new Error('must not modify 2D scene')}};
 try{assert.equal(createThreeOffice(stage),null);}
 finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
});
