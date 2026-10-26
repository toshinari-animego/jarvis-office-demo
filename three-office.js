// JARVIS OFFICE WebGL 3D review mode (no downloads or paid APIs).
// Procedural 3D reinterpretation of approved concept art, not a scanned 3D asset.
import { rigAngles } from './articulated-rig.js';
const VS=[
'attribute vec3 p;attribute vec3 n;',
'uniform mat4 model;uniform mat4 proj;',
'varying vec3 N;varying vec3 P;',
'void main(){vec4 q=model*vec4(p,1.);P=q.xyz;N=normalize(mat3(model)*n);gl_Position=proj*q;}'
].join('\n');
const FS=[
'precision mediump float;',
'uniform vec3 base;uniform float glow;uniform float stone;',
'varying vec3 N;varying vec3 P;',
'void main(){vec3 norm=normalize(N);vec3 l=normalize(vec3(-.5,.8,.8));',
'float lit=.38+.7*max(dot(norm,l),0.);',
'float rim=pow(1.-max(dot(norm,vec3(0.,0.,1.)),0.),2.);',
'float speck=fract(sin(dot(floor(P*17.),vec3(12.9,78.2,35.1)))*43758.5);',
'vec3 rgb=base*(lit+.12*rim)*(1.-stone*.19+stone*speck*.27)+base*glow;',
'gl_FragColor=vec4(min(rgb,vec3(1.)),1.);}'
].join('\n');
const I=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function multiply(a,b){const r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r;}
function translation(x,y,z){const a=I();a[12]=x;a[13]=y;a[14]=z;return a;}
function scaling(x,y,z){const a=I();a[0]=x;a[5]=y;a[10]=z;return a;}
function rotationZ(t){const a=I(),c=Math.cos(t),s=Math.sin(t);a[0]=c;a[1]=s;a[4]=-s;a[5]=c;return a;}
function rotationY(t){const a=I(),c=Math.cos(t),s=Math.sin(t);a[0]=c;a[2]=-s;a[8]=s;a[10]=c;return a;}
const T=(m,x,y,z)=>multiply(m,translation(x,y,z));
const Z=(m,a)=>multiply(m,rotationZ(a));
const Y=(m,a)=>multiply(m,rotationY(a));
const S=(m,x,y,z)=>multiply(m,scaling(x,y,z));
const palette={bolt:'#14294e',blue:'#23467e',gold:'#ffca3c',light:'#fff4ae',
dark:'#152035',stone:'#9a8979',stoneLight:'#b29d8a',scar:'#703c3b',
leather:'#392c28',brown:'#402b27',skin:'#795654',black:'#1e1828',
purple:'#634485',violet:'#ac84f7',white:'#ffffff',hair:'#ded9f2'};
function rgb(hex){return [1,3,5].map(k=>parseInt(hex.slice(k,k+2),16)/255);}
function sphereGeom(){
 const pos=[],norm=[],indices=[],segments=16,rings=12;
 for(let j=0;j<=rings;j++){const v=j*Math.PI/rings;
 for(let i=0;i<=segments;i++){const u=i*2*Math.PI/segments,x=Math.sin(v)*Math.cos(u),y=Math.cos(v),z=Math.sin(v)*Math.sin(u);pos.push(x,y,z);norm.push(x,y,z);}}
 for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,a+1,b,b+1);}
 return {pos,norm,indices};
}
function tubeGeom(){
 const pos=[],norm=[],indices=[],seg=12;
 for(let j=0;j<2;j++)for(let i=0;i<=seg;i++){
  const a=i*2*Math.PI/seg,x=Math.cos(a),z=Math.sin(a);pos.push(x,2*j-1,z);norm.push(x,0,z);
 }
 for(let i=0;i<seg;i++){const b=i+seg+1;indices.push(i,b,i+1,b,b+1,i+1);}
 return {pos,norm,indices};
}
function createShader(gl,type,source){
 const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
 if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('WebGL shader error');
 return s;
}
function upload(gl,data){
 const buffer=(target,arr)=>{const b=gl.createBuffer();gl.bindBuffer(target,b);gl.bufferData(target,arr,gl.STATIC_DRAW);return b;};
 return {v:buffer(gl.ARRAY_BUFFER,new Float32Array(data.pos)),n:buffer(gl.ARRAY_BUFFER,new Float32Array(data.norm)),i:buffer(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(data.indices)),count:data.indices.length};
}
export function pose3D(id,pose,elapsed,reduced=false){
 const t=elapsed/1000,m=pose.mode||'idle',joints=rigAngles(id,m,pose.progress||0,t,reduced,pose.direction,pose.file);
 const walking=m==='walk'||m==='float';
 return {id,joints,seconds:t,mode:m,heading:!reduced&&walking?(pose.direction>0?.24:-.24):0,
  lift:id==='scout'?.28+(reduced?0:Math.sin(t*2.4)*.10):0,
  lean:!reduced&&id==='titan'&&m==='walk'?.07:0};
}
export function createThreeOffice(stage,onFailure=()=>{}){
 if(typeof document==='undefined'||!stage)return null;
 const canvas=document.createElement('canvas');canvas.className='office-3d-canvas';canvas.setAttribute('aria-hidden','true');
 let gl;
 try{gl=canvas.getContext('webgl',{alpha:true,depth:true,antialias:true,powerPreference:'low-power',premultipliedAlpha:false});}
 catch(e){return null;}
 if(!gl)return null;
 let unavailable=false,dead=false,projection=I();
 try{
  const program=gl.createProgram(),vs=createShader(gl,gl.VERTEX_SHADER,VS),fs=createShader(gl,gl.FRAGMENT_SHADER,FS);
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('3D shader link failed');
  gl.deleteShader(vs);gl.deleteShader(fs);gl.useProgram(program);
  const aP=gl.getAttribLocation(program,'p'),aN=gl.getAttribLocation(program,'n');
  const uM=gl.getUniformLocation(program,'model'),uP=gl.getUniformLocation(program,'proj'),uB=gl.getUniformLocation(program,'base'),uG=gl.getUniformLocation(program,'glow'),uS=gl.getUniformLocation(program,'stone');
  const mesh={sphere:upload(gl,sphereGeom()),tube:upload(gl,tubeGeom())};
  const render=(kind,m,color,glow=0,rock=0)=>{
   const g=mesh[kind];gl.bindBuffer(gl.ARRAY_BUFFER,g.v);gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,3,gl.FLOAT,false,0,0);
   gl.bindBuffer(gl.ARRAY_BUFFER,g.n);gl.enableVertexAttribArray(aN);gl.vertexAttribPointer(aN,3,gl.FLOAT,false,0,0);
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,g.i);
   gl.uniformMatrix4fv(uM,false,m);gl.uniformMatrix4fv(uP,false,projection);gl.uniform3fv(uB,rgb(color));gl.uniform1f(uG,glow);gl.uniform1f(uS,rock);
   gl.drawElements(gl.TRIANGLES,g.count,gl.UNSIGNED_SHORT,0);
  };
  const ball=(r,x,y,z,a,b,c,col,glow=0,rock=0)=>render('sphere',S(T(r,x,y,z),a,b,c),col,glow,rock);
  const rod=(r,x,y,z,a,b,c,col,glow=0,rock=0)=>render('tube',S(T(r,x,y,z),a,b,c),col,glow,rock);
  const line=(r,x1,y1,z1,x2,y2,z2,col,radius=.026,glow=0)=>{
   const dx=x2-x1,dy=y2-y1,dz=z2-z1,length=Math.hypot(dx,dy,dz);
   // Slender sphere markers preserve depth, avoid untextured 2D overlays.
   const mid=T(r,(x1+x2)/2,(y1+y2)/2,(z1+z2)/2);
   ball(Z(mid,-Math.atan2(dx,dy)),0,0,0,radius,length/2,radius,col,glow);
  };
  const makeLimbs=(root,id,p)=>{
   const huge=id==='titan',armX=huge?.86:.47,shoulder=huge?1.64:1.40;
   const left=huge?palette.stoneLight:id==='bolt'?palette.blue:palette.purple;
   const boot=huge?palette.leather:id==='bolt'?palette.bolt:palette.black;
   for(const side of [-1,1]){
    let a=T(root,side*armX,shoulder,0);
    a=Z(a,(p.joints[side<0?'arm-l':'arm-r']||0)*Math.PI/180*.84);
    ball(a,0,-.17,0,huge?.43:.23,huge?.51:.32,huge?.38:.20,left,0,huge?1:0);
    ball(a,side*.04,-(huge?.64:.51),.13,huge?.38:.19,huge?.30:.22,huge?.31:.18,huge?palette.stone:boot,0,huge?1:0);
    if(!huge)ball(a,side*.03,-.62,.31,.13,.11,.10,id==='bolt'?palette.gold:palette.violet,.45);
    let l=T(root,side*(huge?.43:.23),.88,0);
    l=Z(l,(p.joints[side<0?'leg-l':'leg-r']||0)*Math.PI/180*.75);
    ball(l,0,-.21,.03,huge?.32:.18,huge?.43:.34,huge?.33:.19,huge?palette.stoneLight:left,0,huge?1:0);
    ball(l,0,-.53,.23,huge?.36:.24,huge?.20:.16,huge?.38:.29,boot,0,huge?.5:0);
   }
  };
  function bolt(root,p){
   makeLimbs(root,'bolt',p);
   ball(root,0,1.32,0,.50,.59,.39,palette.bolt);
   ball(root,0,1.36,.36,.32,.41,.10,palette.blue);
   ball(root,0,1.34,.48,.13,.18,.05,palette.gold,.6);
   const head=Y(T(root,0,2.18,.03),Math.sin(p.seconds*.9)*.09);
   ball(head,0,0,0,.71,.71,.61,palette.bolt);
   ball(head,0,-.20,.47,.58,.35,.19,palette.dark);
   for(const side of [-1,1]){
    ball(head,side*.27,-.23,.64,.25,.11,.085,palette.gold,.95);
    ball(head,side*.68,-.10,.02,.19,.22,.21,palette.blue);
    ball(head,side*.70,-.10,.17,.10,.12,.07,palette.gold,.8);
   }
   line(head,.10,.54,.43,-.08,.19,.69,palette.gold,.053,.7);
   line(head,-.08,.19,.69,.13,.18,.70,palette.gold,.050,.7);
   line(head,.13,.18,.70,-.04,-.31,.55,palette.gold,.045,.7);
   for(let k=0;k<2;k++){
    let cloth=T(root,-.03,1.89,-.46);
    cloth=Z(cloth,(p.joints[k?'scarf-b':'scarf-a']||0)*Math.PI/180);
    ball(cloth,-.36-k*.16,-.05,-.14,.52,.11,.075,k?palette.gold:palette.blue);
    ball(cloth,-.83-k*.17,-.16,-.26,.38,.09,.052,k?palette.gold:palette.blue);
   }
   if(p.mode==='charge'||p.mode==='appear'){
    for(let k=0;k<4;k++)line(root,-.85+k*.35,1.6,.80,-.6+k*.48,2.2,.80,palette.gold,.024,.8);
   }
  }
  function titan(root,p){
   makeLimbs(root,'titan',p);
   ball(root,0,1.34,0,1.04,.92,.62,palette.stone,.0,1);
   ball(root,0,1.57,.34,.82,.57,.32,palette.stoneLight,0,1);
   for(const side of [-1,1])ball(root,side*.43,1.59,.49,.46,.46,.19,palette.stone,0,1);
   rod(root,0,.87,.36,.72,.08,.14,palette.leather);
   ball(root,0,.80,.36,.24,.10,.12,palette.leather);
   const head=Y(T(root,0,2.43,.12),Math.sin(p.seconds*.63)*.05);
   ball(head,0,0,0,.64,.58,.54,palette.stoneLight,0,1);
   ball(head,0,-.26,.34,.48,.25,.21,palette.stone,0,1);
   for(const side of [-1,1]){
    ball(head,side*.27,-.08,.51,.22,.13,.09,palette.leather);
    ball(head,side*.28,-.10,.59,.11,.085,.075,palette.brown);
    line(head,side*.08,.13,.52,side*.46,.04,.43,palette.leather,.078);
   }
   line(head,-.11,.42,.39,.19,.10,.49,palette.scar,.02);
   line(root,-.55,1.82,.53,-.17,1.51,.67,palette.scar,.026);
   line(root,.17,1.47,.72,.55,1.80,.43,palette.scar,.024);
  }
  function scout(root,p){
   const r=T(root,0,.18,0);
   // Rear cape is volumetric: individual cloth lobes move and show their depth.
   for(const side of [-1,1]){
    const cp=Z(T(r,side*.25,1.78,-.22),(p.joints[side<0?'scarf-a':'scarf-b']||0)*Math.PI/180);
    ball(cp,side*.37,-.48,-.33,.38,.64,.08,side<0?palette.purple:palette.hair);
    ball(cp,side*.55,-.89,-.47,.35,.34,.06,side<0?palette.violet:palette.white);
   }
   makeLimbs(r,'scout',p);
   ball(r,0,1.32,0,.42,.58,.34,palette.black);
   ball(r,0,1.39,.31,.27,.33,.08,palette.purple);
   ball(r,0,1.40,.43,.13,.13,.075,palette.violet,.8);
   const head=Y(T(r,0,2.18,.07),Math.sin(p.seconds*.77)*.10);
   ball(head,0,0,0,.65,.62,.54,palette.skin);
   ball(head,0,.43,-.10,.69,.32,.49,palette.hair);
   for(let i=0;i<5;i++){
    const h=Z(T(head,-.47+i*.23,.49,.37),-.39+i*.08);
    ball(h,0,.04,0,.14,.32,.15,i%2?palette.white:palette.hair);
   }
   ball(head,-.58,-.06,.13,.13,.35,.15,palette.hair);
   for(const side of [-1,1]){
    ball(head,side*.22,-.09,.52,.23,.15,.08,palette.black);
    ball(head,side*.22,-.10,.60,.17,.11,.078,palette.white,.98);
    ball(head,side*.60,-.13,.10,.10,.16,.16,palette.violet,.55);
   }
   if(['scan','work','discover'].includes(p.mode)){
    for(let k=0;k<6;k++){
     const a=k*Math.PI*2/6;
     ball(r,Math.cos(a)*.60,1.28+Math.sin(a)*.41,.67,.044,.044,.055,palette.violet,.65);
    }
   }
  }
  function resize(){
   const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);
   const dpr=Math.min(window.devicePixelRatio||1,1.25);
   const bw=Math.min(1450,Math.round(w*dpr)),bh=Math.min(1100,Math.round(h*dpr));
   if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh;}
   gl.viewport(0,0,bw,bh);
   const worldWidth=14*w/h;
   projection=I();projection[0]=2/worldWidth;projection[5]=2/14;projection[10]=-.033333;
   return worldWidth;
  }
  let lastPaint=-Infinity, lastWidth=0, lastHeight=0;
  const onLost=e=>{e.preventDefault();unavailable=true;onFailure('3D描画が失われました。2Dに切り替えます。');};
  const onRestored=()=>{unavailable=true;onFailure('3D復帰はページ再読み込み後に試してください。');};
  canvas.addEventListener('webglcontextlost',onLost,false);
  canvas.addEventListener('webglcontextrestored',onRestored,false);
  stage.append(canvas);
  return {canvas,isAvailable:()=>!unavailable,draw(snapshot,reduced=false){
   if(unavailable||dead||!snapshot)return;
   try{
    const currentWidth=stage.clientWidth,currentHeight=stage.clientHeight;
    const changed=currentWidth!==lastWidth||currentHeight!==lastHeight;
    // Keep a 30 FPS ceiling on mobile: preserve simulation time and all DOM controls.
    if(!changed&&snapshot.elapsed>=lastPaint&&snapshot.elapsed-lastPaint<33)return;
    lastPaint=snapshot.elapsed;lastWidth=currentWidth;lastHeight=currentHeight;
    const ww=resize();
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    for(const id of ['scout','bolt','titan']){
     const pose=snapshot.poses[id];
     if(!pose||!pose.visible)continue;
     const d=pose3D(id,pose,snapshot.elapsed,reduced);
     let root=T(I(),(pose.x/1000-.5)*ww,(.5-pose.y/700)*14+d.lift,0);
     root=Y(root,d.heading);
     root=Z(root,-d.lean);
     if(id==='bolt')bolt(root,d);else if(id==='titan')titan(root,d);else scout(root,d);
    }
   }catch(e){unavailable=true;onFailure('3D描画エラーのため2Dに戻しました。');}
  },dispose(){dead=true;canvas.remove();}};
 }catch(e){canvas.remove();onFailure('3Dの初期化に失敗したため2D表示を維持します。');return null;}
}
