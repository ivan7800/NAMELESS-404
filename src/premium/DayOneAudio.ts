import {KIBA_LAMPS,nearestKibaLamps} from './KibaLighting.js';
/** Premium procedural score for Kiba. No sample downloads, no Web Audio before gesture. */
export interface SoundState {
 day:number;mode:string;won:boolean;room:string;chase:boolean;hidden:boolean;
 rx:number;ry:number;dir:number;entityX:number;entityY:number;threat:number;crouched?:boolean;flags?:{kibaFinaleStage?:number};
}
interface Voice {node:OscillatorNode;gain:GainNode;filter:BiquadFilterNode}
export class DayOneSoundscape {
 private ctx:AudioContext|null=null;
 private bus:GainNode|null=null;
 private voices:Voice[]=[];
 private pan:StereoPannerNode|null=null;
 private noise:AudioBufferSourceNode|null=null;
 private noiseGain:GainNode|null=null;
 private active=false;
 private lastCue=0;
 start(ctx:AudioContext):void {
  if(this.active)return;
  this.ctx=ctx;
  this.bus=ctx.createGain();this.bus.gain.value=0;
  this.pan=typeof ctx.createStereoPanner==='function'?ctx.createStereoPanner():null;
  if(this.pan){this.bus.connect(this.pan);this.pan.connect(ctx.destination);}else this.bus.connect(ctx.destination);
  for(const [wave,freq] of [['sine',38],['triangle',53.4],['sine',91.7]] as const){
   const node=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
   node.type=wave;node.frequency.value=freq;gain.gain.value=.1;
   filter.type='lowpass';filter.frequency.value=240;
   node.connect(gain);gain.connect(filter);filter.connect(this.bus);node.start();
   this.voices.push({node,gain,filter});
  }
  // Stable seed, audible as distant ventilation rather than a loud synthetic sting.
  const buffer=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),data=buffer.getChannelData(0);
  let seed=4042006;for(let i=0;i<data.length;i++){
   seed=(Math.imul(seed,1664525)+1013904223)>>>0;
   data[i]=(seed/2147483648-1)*.18;
  }
  this.noise=ctx.createBufferSource();this.noise.buffer=buffer;this.noise.loop=true;
  const noiseFilter=ctx.createBiquadFilter();noiseFilter.type='lowpass';noiseFilter.frequency.value=290;
  this.noiseGain=ctx.createGain();this.noiseGain.gain.value=.12;
  this.noise.connect(noiseFilter);noiseFilter.connect(this.noiseGain);this.noiseGain.connect(this.bus);this.noise.start();
  this.active=true;
 }
 update(s:SoundState,now:number):void {
  if(!this.active||!this.ctx||!this.bus)return;
  const t=this.ctx.currentTime, playing=s.day===1&&s.mode==='real'&&!s.won;
  const near=Math.hypot(s.rx-s.entityX,s.ry-s.entityY);
  const terror=s.chase?Math.max(0,1-near/10):0;
  const finale=(s.flags?.kibaFinaleStage===1||s.flags?.kibaFinaleStage===2)?1:0;
  const room=s.room==='SOTANO TECNICO'?1.38:s.room==='ALA ESTE'?1.16:s.room==='ALA DE ARCHIVOS'?.8:.9;
  // Overall gain <= 0.018, quieter than notification effects.
  this.bus.gain.setTargetAtTime(playing?(s.hidden?.003:s.crouched?.0045:.008+terror*.006+finale*.0025)*room:0,t,.28);
  // El zumbido eléctrico responde a la cercanía de luminarias reales del mapa.
  const nearest=nearestKibaLamps(s.rx,s.ry,s.day===1?KIBA_LAMPS:[]);
  // El mapa no se reconstruye desde Web Audio: la lista autoral permanece fija.
  const lamp=nearest[0];
  const electric=lamp?Math.max(0,1-Math.hypot(s.rx-lamp.x,s.ry-lamp.z)/5):0;
  const baseline=s.room==='SOTANO TECNICO'?34:s.room==='ALA ESTE'?41:38;
  this.voices.forEach((v,i)=>{
   v.node.frequency.setTargetAtTime((i===0?baseline:i===1?baseline*1.406:baseline*2.413)+(terror*3.1)+(Math.sin(now*.00027+i)*.7)+(finale*(i===1?-1.35:1.9)),t,.35);
   v.filter.frequency.setTargetAtTime(playing?170+(s.threat*1.75)+i*50+electric*25:110,t,.35);
   v.gain.gain.setTargetAtTime(i===0?.32:i===1?.10+electric*.025:.052,t,.4);
  });
  this.noiseGain?.gain.setTargetAtTime(playing?(s.room==='ALA DE ARCHIVOS'?.23+finale*.04:.12+finale*.04):0,t,.35);
  const ang=s.dir*Math.PI/2;
  const toRight=(s.entityX-s.rx)*Math.cos(ang)+(s.entityY-s.ry)*Math.sin(ang);
  this.pan?.pan.setTargetAtTime(s.chase?Math.max(-.7,Math.min(.7,toRight/Math.max(1,near))):Math.sin(now*.00024)*.12,t,.3);
 }
 /** Authored cues: brief, deliberately quiet, never autoplayed. */
 cue(kind:string,s:SoundState):boolean {
  if(!this.active||!this.ctx||s.day!==1)return false;
  const profiles:Record<string,[number,number,OscillatorType,number]>={
   paper:[290,.28,'triangle',.006],glass:[610,.45,'sine',.005],light:[115,.23,'triangle',.004],
   breath:[66,.74,'sine',.009],tape:[71,.6,'sawtooth',.006],
   heartbeat:[52,.24,'sine',.008],hide:[86,.3,'sine',.005],
   gate:[130,.8,'sawtooth',.006],vent:[320,.55,'square',.005],decoy:[580,.42,'triangle',.009],stepMetal:[140,.085,'square',.004],stepQuiet:[47,.040,'sine',.001],sneak:[84,.09,'sine',.003],finaleStart:[81,1.3,'triangle',.005],finaleCrossing:[108,1.1,'sine',.006],finaleEscape:[260,1.8,'triangle',.007],finaleFail:[51,.9,'sine',.004]
  };
  const profile=profiles[kind];if(!profile)return false;
  const [freq,duration,wave,volume]=profile;
  const node=this.ctx.createOscillator(),gain=this.ctx.createGain(),t=this.ctx.currentTime;
  node.type=wave;node.frequency.value=freq;gain.gain.value=0;
  gain.gain.setTargetAtTime(volume,t,.02);
  gain.gain.setTargetAtTime(0,t+duration*.42,.11);
  node.connect(gain);gain.connect(this.bus??this.ctx.destination);
  node.start();node.stop(t+duration);
  // Disconnect after node ends, without keeping the soundscape alive on shutdown.
  node.onended=()=>{node.disconnect();gain.disconnect();};
  this.lastCue=t;
  return true;
 }
 stop():void {
  if(!this.active)return;
  for(const v of this.voices){try{v.node.stop();}catch{}v.node.disconnect();v.gain.disconnect();v.filter.disconnect();}
  try{this.noise?.stop();}catch{}
  this.noise?.disconnect();this.noiseGain?.disconnect();this.bus?.disconnect();this.pan?.disconnect();
  this.voices=[];this.noise=null;this.noiseGain=null;this.bus=null;this.pan=null;this.ctx=null;this.active=false;
 }
 isRunning():boolean{return this.active;}
}
