import test from 'node:test';
import assert from 'node:assert/strict';
import {PART_NAMES, rigAngles, createArticulatedRig, poseArticulatedRig} from '../articulated-rig.js';

const IDS=['bolt','titan','scout'];
const fields=['arm-l','arm-r','leg-l','leg-r','scarf-a','scarf-b'];
test('six independent fields are always provided',()=>{
  assert.deepEqual(PART_NAMES,fields);
  for(const id of IDS)for(const mode of ['work','walk','float','charge','offer','receive','return','proud','scan','discover','appear']){
    const x=rigAngles(id,mode,.45,12,false,-1,true);
    assert.deepEqual(Object.keys(x),fields);
    assert.ok(fields.every(k=>Number.isFinite(x[k])&&Math.abs(x[k])<=38));
  }
});
test('same simulation time produces same joint and cape pose (pause/resume safe)',()=>{
  for(const id of IDS){
    const before=rigAngles(id,'walk',.42,42,false,1,true);
    assert.deepEqual(rigAngles(id,'walk',.42,42,false,1,true),before);
    assert.notDeepEqual(rigAngles(id,'walk',.43,42.5,false,1,true),before);
  }
});
test('reduced-motion setting freezes every independent layer',()=>{
  for(const id of IDS)for(const mode of ['work','walk','float','offer','receive','appear','scan']){
    const x=rigAngles(id,mode,.73,19,true);
    assert.ok(fields.every(k=>x[k]===0));
  }
});
test('character-specific secondary movement is retained',()=>{
  const bolt=rigAngles('bolt','charge',.5,1.2);
  const scout=rigAngles('scout','float',.5,1.2);
  const titan=rigAngles('titan','walk',.5,1.2);
  assert.notEqual(bolt['arm-l'],bolt['arm-r']);
  assert.notEqual(scout['scarf-a'],scout['scarf-b']);
  assert.notEqual(titan['leg-l'],titan['leg-r']);
  assert.equal(titan['scarf-a'],0);
  assert.notDeepEqual(bolt,scout);
});
test('a simple SVG DOM stub receives masked, individually posed local image layers',()=>{
  const prev=globalThis.document;
  const nodes=[];
  globalThis.document={createElementNS(ns,tag){
    assert.equal(ns,'http://www.w3.org/2000/svg');
    const node={tag,attrs:{},children:[],setAttribute(k,v){this.attrs[k]=String(v)},append(child){this.children.push(child)},getAttribute(k){return this.attrs[k]}};
    nodes.push(node);
    return node;
  }};
  try{
    for(const id of IDS){
      nodes.length=0;
      const source='data:image/webp;base64,AAAA';
      const rig=createArticulatedRig(id,source);
      assert.equal(rig.element.tag,'svg');
      assert.equal(rig.element.attrs.class,'approved-rig');
      assert.equal(Object.keys(rig.elements).length,id==='titan'?4:6);
      const imgs=nodes.filter(n=>n.tag==='image');
      assert.equal(imgs.length,id==='titan'?6:7);
      assert.ok(imgs.every(n=>n.attrs.href===source));
      const before=rig.elements['arm-l'].group.attrs.transform;
      poseArticulatedRig(rig,{mode:'receive',progress:.5,direction:1,file:false},4.5,false);
      assert.notEqual(rig.elements['arm-l'].group.attrs.transform,before);
      poseArticulatedRig(rig,{mode:'receive',progress:.5,direction:1,file:false},4.5,true);
      assert.ok(rig.elements['arm-l'].group.attrs.transform.startsWith('rotate(0.00'));
      assert.ok(nodes.some(n=>n.tag==='mask'));
      assert.ok(nodes.filter(n=>n.tag==='clipPath').length>=4);
    }
    assert.throws(()=>createArticulatedRig('bolt','https://external.example/test.png'),/Unsupported/);
  }finally{
    if(prev===undefined)delete globalThis.document;else globalThis.document=prev;
  }
});
