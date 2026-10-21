"""Manual source-derived cutouts, no model/API. Run with the original concept PNG path.
Masks are authored against the 1448x1086 original. No replacement illustration is generated.
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import sys, hashlib, json
source=Path(sys.argv[1]); im=Image.open(source).convert('RGBA')
assert im.size==(1448,1086), 'Use the original-resolution concept sheet'
out=Path(__file__).resolve().parents[1]/'assets/titan';out.mkdir(parents=True,exist_ok=True)
box=(731,68,996,311)
parts={
'head':[(813,112),(810,107),(819,99),(817,94),(829,94),(829,80),(840,83),(842,72),(856,77),(864,69),(878,78),(887,79),(896,92),(909,92),(914,107),(912,116),(921,127),(918,130),(919,141),(915,151),(909,157),(897,162),(881,165),(853,165),(837,160),(828,153),(822,145),(817,144),(811,139),(809,133),(812,125),(817,120)],
'arm-l':[(808,138),(798,137),(784,141),(772,147),(763,157),(758,168),(757,182),(751,192),(744,199),(738,210),(734,222),(737,239),(742,253),(750,265),(763,275),(780,280),(793,277),(802,270),(804,258),(801,250),(805,234),(808,222),(817,210),(824,189),(824,166),(817,148)],
'arm-r':[(923,139),(937,142),(950,147),(960,153),(969,168),(973,183),(980,191),(986,202),(992,218),(993,236),(987,255),(979,271),(965,279),(952,280),(941,275),(933,267),(932,253),(926,239),(923,222),(918,207),(912,185),(914,162)],
'leg-l':[(811,247),(848,250),(862,259),(862,274),(852,283),(851,295),(847,305),(839,309),(785,309),(784,302),(790,294),(795,282),(797,270),(802,254)],
'leg-r':[(879,253),(918,247),(925,259),(931,276),(932,286),(939,298),(942,306),(936,309),(879,309),(876,303),(876,290),(871,277),(870,262)],
 'torso':[(815,150),(828,158),(846,163),(891,165),(909,158),(922,150),(936,175),(932,195),(922,212),(929,231),(932,252),(921,265),(898,269),(875,278),(858,277),(836,267),(810,266),(799,256),(803,237),(802,218),(808,202),(807,179)]}
# Feather less than one source pixel. The source glow is trimmed rather than pasted as a rectangle.
cutouts={}
for name,poly in parts.items():
 mask=Image.new('L',im.size);ImageDraw.Draw(mask).polygon(poly,fill=255);mask=mask.filter(ImageFilter.GaussianBlur(.35))
 rgba=im.copy();rgba.putalpha(mask);rgba=rgba.crop(box)
 # Remove navy presentation-board pixels accidentally caught at the outer contour.
 px=rgba.load()
 for yy in range(rgba.height):
  for xx in range(rgba.width):
   r,g,b,a=px[xx,yy]
   if not a or (name=='head' and yy<60 and g<70 and b>g*1.08 and b>r*1.3) or yy>=240: px[xx,yy]=(0,0,0,0)
 rgba.save(out/(name+'.png'),optimize=True);cutouts[name]=rgba
composite=Image.new('RGBA',(box[2]-box[0],box[3]-box[1]))
for name in ['leg-l','leg-r','torso','arm-l','arm-r','head']:composite.alpha_composite(cutouts[name])
composite.save(out/'assembled.png',optimize=True)
manifest={'source_name':source.name,'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'source_dimensions':list(im.size),'crop':box,'part_dimensions':list(composite.size),'parts':list(parts),'processing':'Manual polygon masks; alpha edge feather 0.35px, navy-board fringe removed. No AI generation, no inpainting. Parts retain source pixels.','limits':'Single front view; shoulders/hips use overlapping source pixels. Independent elbow joints, side/back walk cycles and raster facial-expression changes are not implemented.'}
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
# Inspection board is not loaded at runtime.
board=Image.new('RGB',(composite.width*3,composite.height*2),'#132838')
for i,name in enumerate(['head','torso','arm-l','arm-r','leg-l','leg-r']):
 bg=Image.new('RGBA',composite.size,'#132838');bg.alpha_composite(cutouts[name]);board.paste(bg.convert('RGB'),((i%3)*composite.width,(i//3)*composite.height));ImageDraw.Draw(board).text(((i%3)*composite.width+8,(i//3)*composite.height+8),name,fill='white')
board.save(out.parents[1]/'docs/titan/source-part-board.jpg',quality=92)
print(json.dumps({'dimensions':composite.size,'png_bytes':sum(p.stat().st_size for p in out.glob('*.png')),'source_sha256':manifest['source_sha256']}))
