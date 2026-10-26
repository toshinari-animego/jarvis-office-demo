// BOLT v2: a silhouette-first, locally generated 3D model.
// Interprets the approved helmet/scarf concept; it is not a scanned 3D asset.
// Pure mesh generation; no texture downloads, APIs, new dependencies or billing.
function normalized(x,y,z){const a=Math.hypot(x,y,z)||1;return [x/a,y/a,z/a];}
function mesh(pos,idx){
 const norms=new Array(pos.length).fill(0);
 for(let i=0;i<idx.length;i+=3){
  const a=3*idx[i],b=3*idx[i+1],c=3*idx[i+2];
  const ux=pos[b]-pos[a],uy=pos[b+1]-pos[a+1],uz=pos[b+2]-pos[a+2];
  const vx=pos[c]-pos[a],vy=pos[c+1]-pos[a+1],vz=pos[c+2]-pos[a+2];
  const x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;
  for(const k of [a,b,c]){norms[k]+=x;norms[k+1]+=y;norms[k+2]+=z;}
 }
 for(let i=0;i<norms.length;i+=3){
  const [x,y,z]=normalized(norms[i],norms[i+1],norms[i+2]);
  norms[i]=x;norms[i+1]=y;norms[i+2]=z;
 }
 return {pos,norm:norms,indices:idx};
}
function loft(rings,sides=20){
 const v=[],tri=[];
 for(const r of rings){
  for(let i=0;i<=sides;i++){
   const a=i/sides*2*Math.PI;
   v.push((r[4]||0)+r[1]*Math.cos(a),r[0],(r[5]||0)+r[2]*Math.sin(a));
  }
 }
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<sides;i++){
  const a=j*(sides+1)+i,b=a+sides+1;
  tri.push(a,b,a+1,b,b+1,a+1);
 }
 // cap loops (degenerate fans are avoided by appending real center vertices).
 const y0=rings[0],y1=rings[rings.length-1];
 for(const [r,start,flip] of [[y0,0,true],[y1,(rings.length-1)*(sides+1),false]]){
  const center=v.length/3;v.push(r[4]||0,r[0],r[5]||0);
  for(let i=0;i<sides;i++)flip?tri.push(center,start+i+1,start+i):tri.push(center,start+i,start+i+1);
 }
 return mesh(v,tri);
}
function sheet(points,width=.14){
 const v=[],tri=[];
 for(const p of points){
  const [x,y,z,dx=0,dy=1]=p,len=Math.hypot(dx,dy)||1;
  v.push(x+dy/len*width/2,y-dx/len*width/2,z,
         x-dy/len*width/2,y+dx/len*width/2,z);
 }
 for(let i=0;i<points.length-1;i++){
  const a=i*2,b=a+2;
  tri.push(a,b,a+1,a+1,b,b+1,b,a,a+1,b+1,b,a+1);
 }
 return mesh(v,tri);
}
function helmetSurface(rows=15,cols=24,eye=false){
 // The visor follows the helmet's rounded three-dimensional nose/cheek contour.
 const v=[],idx=[];
 for(let j=0;j<=rows;j++){
  const q=j/rows,y=.105-q*.545,w=.568*(1-.20*q);
  for(let i=0;i<=cols;i++){
   const u=(i/cols*2-1),x=u*w;
   const z=.025+.618*Math.sqrt(Math.max(.05,1-(x/.74)**2-(y/.74)**2))+(eye?.045:.014);
   v.push(x,y,z);
  }
 }
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const a=j*(cols+1)+i,b=a+cols+1;idx.push(a,b,a+1,a+1,b,b+1);
 }
 return mesh(v,idx);
}
function earRing(){
 const v=[],tri=[],radial=24,tube=8;
 for(let i=0;i<=radial;i++){
  const a=i/radial*Math.PI*2;
  for(let j=0;j<=tube;j++){
   const b=j/tube*Math.PI*2,rr=.205+.038*Math.cos(b);
   v.push(.042*Math.sin(b),rr*Math.cos(a),rr*Math.sin(a));
  }
 }
 for(let i=0;i<radial;i++)for(let j=0;j<tube;j++){
  const a=i*(tube+1)+j,b=a+tube+1;tri.push(a,b,a+1,b,b+1,a+1);
 }
 return mesh(v,tri);
}
function eyeMesh(side){
 // Hand-designed, sharp angular slash tapered toward the nose.
 const points=side<0?[
  [-.495,-.160],[-.195,-.212],[-.075,-.343],[-.100,-.419],[-.262,-.304],[-.502,-.264]
 ]:[
  [.495,-.160],[.195,-.212],[.075,-.343],[.100,-.419],[.262,-.304],[.502,-.264]
 ];
 const vertices=[],tri=[];
 for(const [x,y] of points){
  const z=.025+.618*Math.sqrt(Math.max(.05,1-(x/.74)**2-(y/.74)**2))+.060;
  vertices.push(x,y,z);
 }
 for(let i=1;i<points.length-1;i++)tri.push(0,i,i+1);
 return mesh(vertices,tri);
}
function boltStripe(){
 const points=[[.08,.605,.38],[.025,.38,.599],[-.145,.115,.657],[.070,.155,.672],[-.075,-.165,.662],[-.008,-.165,.665]];
 const v=[],tri=[],w=[.040,.054,.044,.047,.063,.016];
 for(let i=0;i<points.length;i++){
  const [x,y,z]=points[i];
  v.push(x-w[i],y,z,x+w[i],y,z);
 }
 for(let i=0;i<points.length-1;i++){
  const a=i*2,b=a+2;tri.push(a,b,a+1,a+1,b,b+1);
 }
 return mesh(v,tri);
}
function rearScarf(right,trim=false){
 const d=right?1:-1;
 const pts=[
  [.05,0,-.12,1,0],
  [d*.26,.02,-.13,.95,.22],
  [d*.54,-.04,-.16,.9,-.25],
  [d*.84,-.13,-.20,.78,-.34],
  [d*1.16,-.31,-.26,.55,-.58]
 ];
 return sheet(pts,trim?.037:.18);
}
export const BOLT_V2_MESHES=Object.freeze({
 shell:loft([
  [-.54,.32,.29],[-.38,.57,.48],[-.04,.72,.61],[.27,.70,.58],[.52,.53,.48],[.66,.27,.27],[.69,.08,.08]
 ]),
 visor:helmetSurface(),
 eyeL:eyeMesh(-1),eyeR:eyeMesh(1),boltMark:boltStripe(),
 ear:earRing(),
 torso:loft([[.89,.30,.27],[1.01,.34,.31],[1.31,.46,.36],[1.60,.48,.37],[1.81,.35,.29]]),
 chest:loft([[1.18,.30,.29],[1.38,.36,.36],[1.52,.40,.34],[1.62,.31,.27]]),
 cuff:loft([[-.45,.14,.14],[-.37,.19,.18],[-.09,.20,.20],[.09,.17,.17]]),
 gauntlet:loft([[-.74,.12,.12],[-.64,.22,.20],[-.40,.19,.17],[-.26,.16,.16]]),
 shoulder:loft([[-.19,.19,.20],[.04,.285,.275],[.20,.205,.22]]),
 boot:loft([[-.18,.27,.34],[-.07,.25,.32],[.08,.22,.22],[.22,.18,.19]]),
 shin:loft([[-.37,.14,.18],[-.19,.195,.21],[.07,.19,.20],[.18,.155,.16]]),
 neck:loft([[1.72,.29,.29],[1.89,.31,.29],[2.0,.24,.24]]),
 scarfLeft:rearScarf(false),scarfRight:rearScarf(true),
 scarfTrimL:rearScarf(false,true),scarfTrimR:rearScarf(true,true)
});
export function drawBoltV2(ctx,root,p){
 const {render,ball,line,T,Z,Y,S}=ctx;
 const C={
  navy:'#132750',blue:'#254779',mid:'#34578c',
  seam:'#08192b',visor:'#080f21',gold:'#ffd34e',amber:'#ffec9b',
  cream:'#fff0ad',shiny:'#75adf6',dark:'#0c1731'
 };
 const curve=(name,mat,col,emit=0,stone=0)=>render('boltV2-'+name,mat,col,emit,stone);
 // Dynamic two-toned scarf tails; anchored behind neck with depth and secondary sway.
 for(const right of [false,true]){
  const key=right?'R':'L',base=T(root,0,1.92,-.25);
  const wind=(p.joints[right?'scarf-b':'scarf-a']||0)*Math.PI/180;
  const waving=Z(Y(base,(right?.35:-.28)),wind*.7);
  curve('scarf'+(right?'Right':'Left'),waving,right?C.gold:C.blue);
  curve('scarfTrim'+key,S(T(waving,0,-.025,.02),1,1,1),right?C.blue:C.gold,.1);
 }
 // Short articulated greaves, shaped gauntlets and shoulder armor.
 for(const side of [-1,1]){
  const angle=(p.joints[side<0?'leg-l':'leg-r']||0)*Math.PI/180;
  const knee=Z(T(root,side*.255,.93,0),angle*.60);
  curve('shin',T(knee,0,-.39,.05),C.navy);
  curve('boot',T(knee,0,-.62,.18),C.navy);
  ball(knee,0,-.69,.44,.30,.07,.13,C.gold,.10);
  ball(knee,0,-.09,.25,.18,.14,.11,C.mid);
  const move=(p.joints[side<0?'arm-l':'arm-r']||0)*Math.PI/180;
  const a=Z(T(root,side*.49,1.57,0),move*.82);
  curve('shoulder',T(a,0,-.13,0),C.mid);
  curve('gauntlet',T(a,side*.03,-.31,0),C.blue);
  curve('cuff',T(a,side*.04,-.63,.10),C.navy);
  ball(a,side*.04,-.75,.10,.17,.15,.17,C.dark);
  ball(a,side*.04,-.43,.205,.19,.045,.048,C.gold,.28);
  // Segmented knuckle shield and elbow/shoulder seams.
  for(let i=0;i<3;i++)ball(a,-.11+i*.11,-.76,.25,.053,.065,.04,C.mid);
  ball(a,side*.015,.075,.225,.20,.05,.068,C.navy);
  line(a,-.14,-.21,.232,.14,-.21,.232,C.gold,.024,.07);
 }
 // Tapered torso, waist and layered breastplate.
 curve('torso',root,C.navy);
 curve('chest',T(root,0,-.022,.095),C.blue);
 ball(root,0,1.30,.396,.20,.23,.05,C.navy);
 ball(root,0,1.36,.434,.075,.17,.037,C.gold,.40);
 line(root,-.36,1.53,.30,-.17,1.40,.39,C.mid,.025);
 line(root,.36,1.53,.30,.17,1.40,.39,C.mid,.025);
 line(root,-.27,1.06,.32,.27,1.06,.32,C.seam,.050);
 curve('neck',root,C.blue);
 ball(root,0,1.94,.26,.30,.105,.23,C.gold,.10);
 // Broad rounded helmet with a real curved face shield, no floating oval eyes.
 let head=Y(T(root,0,2.24,.02),Math.sin(p.seconds*.7)*.055);
 curve('shell',head,C.navy);
 // Surface overlap is deliberate for light-catching separations.
 curve('visor',head,C.visor);
 curve('eyeL',head,C.amber,1.10);
 curve('eyeR',head,C.amber,1.10);
 curve('boltMark',head,C.gold,.85);
 // Ear rotors: true toroidal geometry, with a recessed and glowing core.
 for(const side of [-1,1]){
  const ear=T(head,side*.69,.005,.006);
  curve('ear',ear,C.gold,.44);
  ball(ear,side*.03,.01,0,.063,.151,.151,C.seam);
  ball(ear,side*.09,.01,0,.032,.086,.086,C.mid);
  ball(ear,side*.12,.01,0,.014,.050,.050,C.gold,.7);
 }
 // Visor edge pinstripe and exposed sculptural chin guard.
 line(head,-.40,-.456,.378,.0,-.56,.34,C.mid,.021);
 line(head,.0,-.56,.34,.40,-.456,.378,C.mid,.021);
 // Compact 3D electricity only during the established teleportation phases.
 if(p.mode==='charge'||p.mode==='appear'){
  const power=0.30+0.15*Math.sin(p.seconds*16);
  for(const side of [-1,1]){
   line(root,side*.55,2.34,.67,side*(.90+power),2.64,.70,C.gold,.025,1);
   line(root,side*(.90+power),2.64,.70,side*1.05,2.36,.79,C.amber,.022,.6);
  }
 }
}
