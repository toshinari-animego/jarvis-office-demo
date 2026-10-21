"""Crop real browser captures from the shared screenshot directory; no scene is reconstructed."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,sys
src=Path(sys.argv[1]);out=Path(__file__).resolve().parents[1]/'docs/titan';font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',18)
def data(name):
 m=json.loads((src/('titan-'+name+'.json')).read_text());im=Image.open(src/('titan-'+name+'.jpg')).convert('RGB');v=m['viewport'];size=(int(v['width']),int(v['height']))
 if im.size!=size:im=im.resize(size,Image.Resampling.LANCZOS)
 return im,m
def box(m,r,pad=0,bottom=0):
 f=m['frame'];return tuple(round(v)for v in(f['left']+1+r['left']-pad,f['top']+1+r['top']-pad,f['left']+1+r['right']+pad,f['top']+1+r['bottom']+pad+bottom))
def stage(name):
 im,m=data(name);return im.crop(box(m,m['stage']))
meta={}
for skin in ['new','old']:
 for mode in ['idle','walk','receive']:
  im,m=data(skin+'-'+mode);a=next(a for a in m['agents']if a['id']=='a-titan');assert a['skin']==skin and a['mode']==('idle' if mode=='idle' else mode),(skin,mode,a);meta[skin+'-'+mode]=m
new=stage('new-idle');old=stage('old-idle');new.save(out/'office-new.jpg',quality=93)
stage('mobile-375').save(out/'mobile-375.jpg',quality=94)
board=Image.new('RGB',(800,750),'#0b1827');d=ImageDraw.Draw(board)
for row,mode in enumerate(['idle','walk','receive']):
 for col,skin in enumerate(['old','new']):
  im,m=data(skin+'-'+mode);r=next(a['rect']for a in m['agents']if a['id']=='a-titan');f=m['frame'];cx=f['left']+1+(r['left']+r['right'])/2;cy=f['top']+1+(r['top']+r['bottom'])/2
  crop=im.crop((round(cx-100),round(cy-72),round(cx+100),round(cy+78))).resize((380,213),Image.Resampling.LANCZOS)
  x=col*400+10;y=row*250;d.text((x,y+8),skin.upper()+' TITAN / '+mode.upper(),font=font,fill='#bee8d2' if skin=='new' else '#c3d2e1');board.paste(crop,(x,y+33))
board.save(out/'old-new-comparison.jpg',quality=93)
comparison=Image.new('RGB',(new.width,new.height+old.height+90),'#0b1827');d=ImageDraw.Draw(comparison);d.text((16,12),'OLD TITAN / SAME OFFICE',font=font,fill='#c6d2e0');comparison.paste(old,(0,40));y=old.height+50;d.text((16,y),'NEW TITAN / SAME OFFICE',font=font,fill='#bee8d2');comparison.paste(new,(0,y+34));comparison.save(out/'office-old-new.jpg',quality=91)
im,m=data('new-idle');crew=Image.new('RGB',(600,280),'#0b1827');d=ImageDraw.Draw(crew)
for i,id in enumerate(['a-bolt','a-titan','a-scout']):
 r=next(a['rect']for a in m['agents']if a['id']==id);crop=im.crop(box(m,r,9,25));crop=crop.resize((round(crop.width*1.5),round(crop.height*1.5)),Image.Resampling.LANCZOS);x=i*200+(200-crop.width)//2;crew.paste(crop,(x,30));d.text((i*200+20,8),id[2:].upper()+(' / NEW'if id=='a-titan'else''),font=font,fill='#bee8d2')
crew.save(out/'crew-comparison.jpg',quality=94)
meta['mobile-375']=data('mobile-375')[1];(out/'capture-metadata.json').write_text(json.dumps(meta,indent=2)+'\n')
print('Browser comparisons saved')
