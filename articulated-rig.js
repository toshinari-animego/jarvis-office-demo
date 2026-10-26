// Articulated 2D preview from the approved character cutouts.
// Editable polygon clipping, not 3D or independently painted side/back frames.
// No network calls, timers, runtime external dependencies, or dynamic code.
const NS = 'http://www.w3.org/2000/svg';
const shapes = {
  bolt:{ size:[170,177], layers:[
    ['scarf-a','M76 66L107 85 91 104 65 106 40 97 46 77 55 65Z',106,88],
    ['scarf-b','M96 101L113 113 97 150 71 168 47 160 51 137 69 116Z',107,105],
    ['leg-l','M78 121L111 128 110 148 91 175 65 168 68 143Z',94,130],
    ['leg-r','M108 119L137 129 143 151 130 165 105 156 101 140Z',118,130],
    ['arm-r','M117 93L135 98 144 116 135 136 112 129 108 106Z',121,100],
    ['arm-l','M95 80L112 87 108 111 88 130 57 147 37 138 38 118 56 104 76 91Z',100,92]
  ]},
  titan:{size:[170,178], layers:[
    ['leg-l','M82 128L117 122 134 145 127 178 87 178 76 158Z',104,136],
    ['leg-r','M121 123L154 123 169 148 164 178 130 178 114 158Z',134,135],
    ['arm-r','M137 99L162 103 170 124 161 145 139 137 132 118Z',145,110],
    ['arm-l','M32 94L83 95 106 110 99 149 75 160 32 151 24 126Z',82,109]
  ]},
  scout:{size:[170,157], layers:[
    ['scarf-a','M99 79L112 89 99 113 70 141 20 141 10 129 23 109 59 95Z',110,91],
    ['scarf-b','M111 87L129 97 137 128 115 148 81 135 90 112Z',120,96],
    ['leg-l','M94 107L115 115 110 138 99 154 81 146 84 124Z',104,118],
    ['leg-r','M110 109L135 112 134 140 117 154 104 131Z',119,119],
    ['arm-r','M118 88L138 95 143 122 125 135 110 117Z',121,96],
    ['arm-l','M108 71L124 89 102 111 71 99 49 91 50 77 85 80Z',110,84]
  ]}
};
export const PART_NAMES = Object.freeze(['arm-l','arm-r','leg-l','leg-r','scarf-a','scarf-b']);
export function rigAngles(id, mode, progress, seconds, reduced=false, direction=1, carrying=false) {
  const result={ 'arm-l':0,'arm-r':0,'leg-l':0,'leg-r':0,'scarf-a':0,'scarf-b':0 };
  if(reduced) return result;
  const p=Math.max(0,Math.min(1,Number(progress)||0)), wave=Math.sin(Math.PI*p);
  const t=Number(seconds)||0, walk=mode==='walk', travel=walk||mode==='float';
  const cadence=id==='titan'?5.2:id==='bolt'?11:5.6;
  const step=travel?Math.sin(t*cadence):0;
  const float=id==='scout'?Math.sin(t*2.1):0, breath=Math.sin(t*2.2);
  result['arm-l']=breath*1.7+step*(id==='titan'?11:16);
  result['arm-r']=-breath*1.5-step*(id==='titan'?8:13);
  result['leg-l']=step*(id==='titan'?8:14);
  result['leg-r']=-step*(id==='titan'?8:14);
  if(mode==='work'){
    result['arm-r']+=Math.sin(t*9)*5;
    result['arm-l']+=Math.sin(t*9+1.2)*4;
  }
  if(mode==='scan'){ result['arm-l']-=12+Math.sin(t*3)*4; result['arm-r']+=6; }
  if(mode==='discover'){result['arm-l']-=21*wave;result['arm-r']+=15*wave;}
  if(mode==='rise'){result['arm-l']+=7*wave;result['arm-r']-=7*wave;}
  if(mode==='notice')result['arm-r']-=9*wave;
  if(mode==='offer'){result['arm-l']-=24*wave;result['arm-r']+=18*wave;}
  if(mode==='receive'){
    result['arm-l']-=id==='titan'?14:18;
    result['arm-r']+=id==='titan'?10:14;
  }
  if(mode==='proud'){result['arm-r']-=19*wave;result['arm-l']-=6*wave;}
  if(id==='bolt'){
    if(mode==='charge'){result['arm-l']+=11*p;result['arm-r']-=13*p;result['leg-l']+=8*wave;result['leg-r']-=7*wave;}
    if(mode==='appear'){result['arm-l']-=19*wave;result['arm-r']+=11*wave;}
    result['scarf-a']=Math.sin(t*4.4)*5+(travel?7:0);
    result['scarf-b']=-Math.sin(t*3.8+.9)*7+(travel?12:0);
  }
  if(id==='titan'){
    if(walk&&carrying){result['arm-l']-=6;result['arm-r']+=6;}
    if(mode==='receive'){result['arm-l']-=4;result['arm-r']+=5;}
    if(mode==='proud')result['arm-r']-=12*wave;
  }
  if(id==='scout'){
    result['leg-l']+=float*3; result['leg-r']-=float*3;
    result['scarf-a']=Math.sin(t*2.5)*8+(travel?12*direction:0);
    result['scarf-b']=-Math.sin(t*2.1+1.2)*10+(travel?16*direction:0);
    if(mode==='scan'||mode==='discover'){result['arm-l']-=12;result['arm-r']+=7;}
    if(mode==='float'){result['arm-l']-=6;result['arm-r']+=8;}
  }
  for(const key of PART_NAMES)result[key]=Math.max(-38,Math.min(38,result[key]));
  return result;
}
function make(tag,attrs={}) {
  const node=document.createElementNS(NS,tag);
  for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));
  return node;
}
export function createArticulatedRig(id,uri) {
  const config=shapes[id];
  if(!config||!/^data:image\/(?:webp|png);base64,/.test(uri))throw new Error('Unsupported character artwork');
  const [w,h]=config.size, prefix='office-rig-'+id;
  const root=make('svg',{viewBox:'0 0 '+w+' '+h,preserveAspectRatio:'xMidYMax meet','aria-hidden':'true',class:'approved-rig'});
  const defs=make('defs');root.append(defs);
  const cut=make('mask',{id:prefix+'-base',maskUnits:'userSpaceOnUse',maskContentUnits:'userSpaceOnUse',x:0,y:0,width:w,height:h});
  cut.append(make('rect',{width:w,height:h,fill:'white'}));
  const elements={};
  function addImage(container,clip) {
    const img=make('image',{x:0,y:0,width:w,height:h,preserveAspectRatio:'none',href:uri});
    if(clip)img.setAttribute('clip-path','url(#'+clip+')');
    container.append(img);
  }
  for(const [key,path,cx,cy] of config.layers) {
    const clip=make('clipPath',{id:prefix+'-'+key,clipPathUnits:'userSpaceOnUse'});
    clip.append(make('path',{d:path}));defs.append(clip);
    cut.append(make('path',{d:path,fill:'black'}));
    const group=make('g',{'data-part':key});
    addImage(group,prefix+'-'+key);
    elements[key]={group,cx,cy};
  }
  defs.append(cut);
  // Keep a faint uncut texture under TITAN's swinging fists to hide cutout seams.
  if(id==='titan'){
    const underlay=make('g',{opacity:'0.28'});addImage(underlay);root.append(underlay);
  }
  for(const key of ['scarf-a','scarf-b','leg-l','leg-r'])if(elements[key])root.append(elements[key].group);
  const body=make('g',{mask:'url(#'+prefix+'-base)'});
  addImage(body);root.append(body);
  for(const key of ['arm-r','arm-l'])if(elements[key])root.append(elements[key].group);
  return {element:root,elements,id};
}
export function poseArticulatedRig(rig,pose,seconds,reduced=false) {
  const a=rigAngles(rig.id,pose.mode,pose.progress,seconds,reduced,pose.direction,pose.file);
  for(const [name,item] of Object.entries(rig.elements)){
    const angle=a[name]||0;
    item.group.setAttribute('transform','rotate('+angle.toFixed(2)+' '+item.cx+' '+item.cy+')');
  }
}
