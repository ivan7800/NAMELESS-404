/** NAMELESS 404 Premium v0.25 — original, deterministic multi-part antagonist.
 * All measurements are in world units. The model is presentation-only:
 * never changes AI, physics, collision or the saved game state.
 * One geometry contract drives WebGL2, Three.js and the Canvas2D billboard.
 */
export type CopyistTint=readonly [number,number,number];
export interface CopyistPart {
 readonly id:string;readonly x:number;readonly y:number;readonly z:number;
 readonly width:number;readonly height:number;readonly depth:number;
 readonly color:CopyistTint;readonly glow:boolean;
}
const COPYIST_INK:CopyistTint=[.042,.055,.071];
const COPYIST_CLOTH:CopyistTint=[.076,.09,.10];
const COPYIST_EDGE:CopyistTint=[.17,.20,.21];
const COPYIST_PAPER:CopyistTint=[.69,.70,.60];
const COPYIST_BONE:CopyistTint=[.48,.52,.45];
const COPYIST_RUST:CopyistTint=[.33,.13,.17];
const COPYIST_VOID:CopyistTint=[.018,.028,.035];
const COPYIST_STITCH:CopyistTint=[.29,.34,.32];
const COPYIST_PALE:CopyistTint=[.78,.77,.66];

export function buildCopyistModel(time:number,threat=0):CopyistPart[]{
 const parts:CopyistPart[]=[];
 const t=Math.max(0,Number.isFinite(time)?time:0);
 const danger=Math.max(0,Math.min(100,Number.isFinite(threat)?threat:0))/100;
 const step=Math.sin(t*.0053)*(0.08+danger*.045);
 const breath=Math.sin(t*.00135)*.012;
 const tilt=Math.sin(t*.00093)*.025;
 const put=(id:string,x:number,y:number,z:number,w:number,h:number,d:number,color:CopyistTint,glow=false)=>{
   parts.push({id,x,y,z,width:w,height:h,depth:d,color,glow});
 };
 // Layered, asymmetrical coat. Converging skirt panels break the box silhouette.
 put('spine',tilt,1.10,0,.32,1.13,.27,COPYIST_INK);
 for(let j=0;j<7;j++){
   const k=j-3;
   const sw=Math.sin(t*.0019+j*.7)*(.022+.009*danger);
   put(`skirt-${j}`,k*.087+sw,.52+Math.abs(k)*.025,.08+Math.abs(k)*.011,.085,.75-Math.abs(k)*.04,.19,COPYIST_CLOTH);
   put(`hem-${j}`,k*.090+sw,.16+Math.abs(k)*.028,.10,.075,.14,.16,j%3?COPYIST_INK:COPYIST_EDGE);
 }
 put('sternum',0,1.22,.01,.39,.52,.31,COPYIST_CLOTH);
 put('collar-left',-.14,1.52,-.085,.17,.17,.20,COPYIST_EDGE);
 put('collar-right',.13,1.52,-.08,.15,.13,.17,COPYIST_INK);
 for(let j=0;j<4;j++)put(`coat-fold-${j}`,-.20+j*.12,1.12-j*.07,-.167,.014,.42-j*.035,.015,j%2?COPYIST_EDGE:COPYIST_VOID);
 // Two unnaturally long arms, animated out of phase, with five fingers each.
 for(const side of [-1,1]){
   const id=side<0?'left':'right';
   const offset=side<0?step:-step*.61;
   put(`${id}-shoulder`,side*.265,1.42,-.015,.24,.23,.26,COPYIST_INK);
   put(`${id}-upperarm`,side*(.31+Math.abs(offset)*.19),1.09+offset,.01,.13,.55,.15,COPYIST_CLOTH);
   put(`${id}-elbow`,side*.34,.80+offset*.72,.02,.145,.18,.145,COPYIST_EDGE);
   put(`${id}-forearm`,side*(.355+Math.abs(offset)*.31),.59+offset*.55,-.07,.108,.47,.14,COPYIST_INK);
   put(`${id}-hand`,side*.38,.34+offset*.53,-.125,.14,.16,.12,COPYIST_BONE);
   for(let finger=0;finger<5;finger++){
     const fx=side*.38+(finger-2)*.026;
     put(`${id}-finger-${finger}`,fx,.205+offset*.5+(finger%2)*.013,-.16,.020,.14+(finger%3)*.024,.024,COPYIST_BONE);
   }
 }
 // Legs never march synchronously. The floating step gives a marionette cadence.
 for(const side of [-1,1]){
   const swing=side===-1?step:-step*.79;
   const id=side===-1?'left':'right';
   put(`${id}-thigh`,side*.115,.52+swing*.18,.0,.16,.52,.19,COPYIST_INK);
   put(`${id}-shin`,side*.125,.21+swing*.32,swing*.70,.13,.38,.15,COPYIST_VOID);
   put(`${id}-shoe`,side*.13,.065,swing*.84-.052,.17,.105,.26,COPYIST_INK);
 }
 // Paper-mask with offset plates and rigid face; black openings, no realistic gore.
 put('neck',-.016,1.62,-.017,.16,.17,.18,COPYIST_BONE);
 put('head-rear',-.023,1.82+breath,-.005,.32,.42,.26,COPYIST_INK);
 put('mask-left',-.087,1.836+breath,-.151,.215,.34,.025,COPYIST_PAPER);
 put('mask-right',.098,1.807+breath,-.157,.163,.36,.025,COPYIST_PALE);
 put('mask-top',.008,2.014+breath,-.155,.25,.032,.031,COPYIST_PAPER);
 put('face-split',.010,1.805+breath,-.180,.016,.345,.018,COPYIST_STITCH);
 put('eye-left',-.105,1.857+breath,-.174,.074,.026,.017,COPYIST_VOID);
 put('eye-right',.101,1.829+breath,-.180,.052,.027,.018,COPYIST_VOID);
 put('mouth-thread',-.008,1.714+breath,-.182,.168,.013,.014,COPYIST_RUST);
 put('cheek-crack-a',.133,1.778+breath,-.178,.012,.113,.016,COPYIST_STITCH);
 put('cheek-crack-b',-.155,1.742+breath,-.170,.016,.073,.014,COPYIST_STITCH);
 // Strips of copied handwriting hang behind the silhouette, each with its own phase.
 for(let j=0;j<9;j++){
   const sway=Math.sin(t*.0013+j*.57)*(.017+danger*.010);
   const q=j-4;
   const y=.53+(j%3)*.12;
   put(`paper-strip-${j}`,q*.074+sway,y,.184+(j%2)*.014,.046,.34+(j%4)*.08,.018,j%3?COPYIST_BONE:COPYIST_STITCH);
   put(`ink-mark-${j}`,q*.074+sway,y+.07,.198+(j%2)*.014,.025,.014,.009,COPYIST_VOID);
 }
 // Uncanny thin hair framing and obscuring the mask.
 for(let j=0;j<8;j++){
   const a=j<4?-1:1;
   const k=j%4;
   const drift=Math.sin(t*.0017+j)*.012;
   put(`hair-${j}`,a*(.18+k*.027)+drift,1.68-k*.065,-.04,.038,.52+k*.13,.047,j%3?COPYIST_INK:COPYIST_EDGE);
 }
 return parts;
}
