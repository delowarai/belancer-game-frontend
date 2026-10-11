/** Procedural audio: no downloads, autoplay or external audio assets. */
export class RaceAudio {
 private context=new AudioContext();
 private master=this.context.createGain();
 private engine=this.context.createGain();
 private road=this.context.createGain();
 private filter=this.context.createBiquadFilter();
 private oscillators:OscillatorNode[]=[];
 private noise:AudioBuffer;
 private source:AudioBufferSourceNode;
 private effects=new Set<AudioScheduledSourceNode>();
 constructor(){
  const c=this.context;this.master.gain.value=0;const compressor=c.createDynamicsCompressor();compressor.threshold.value=-18;compressor.ratio.value=4;this.master.connect(compressor);compressor.connect(c.destination);
  this.filter.type='lowpass';this.filter.frequency.value=350;this.filter.Q.value=.6;this.engine.gain.value=0;this.engine.connect(this.filter);this.filter.connect(this.master);
  for(const [i,type] of ['triangle','sine','triangle'].entries()){const osc=c.createOscillator(),gain=c.createGain();osc.type=type as OscillatorType;gain.gain.value=[.48,.3,.12][i];osc.connect(gain);gain.connect(this.engine);osc.start();this.oscillators.push(osc)}
  this.noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const values=this.noise.getChannelData(0);let seed=17;for(let i=0;i<values.length;i++){seed=(seed*1664525+1013904223)>>>0;values[i]=(seed/0xffffffff)*2-1}
  this.source=c.createBufferSource();this.source.buffer=this.noise;this.source.loop=true;const roadFilter=c.createBiquadFilter();roadFilter.type='lowpass';roadFilter.frequency.value=650;this.road.gain.value=0;this.source.connect(roadFilter);roadFilter.connect(this.road);this.road.connect(this.master);this.source.start();
 }
 async resume(){await this.context.resume()}
 volume(enabled:boolean,volume:number){this.master.gain.setTargetAtTime(enabled?volume*.7:0,this.context.currentTime,.04);if(!enabled)this.stopEffects()}
 update(speed:number,accelerate:boolean,brake:boolean,running:boolean){
  const time=this.context.currentTime,ratio=Math.min(1,speed/55),gear=Math.max(0,Math.min(4,Math.floor(speed/11))),rpm=48+(speed-gear*11)*4+(accelerate?12:0);
  this.oscillators.forEach((osc,i)=>osc.frequency.setTargetAtTime(rpm*[1,2,3][i],time,.12));this.filter.frequency.setTargetAtTime(260+ratio*600,time,.18);
  this.engine.gain.setTargetAtTime(running?.12+ratio*.1:0,time,.08);this.road.gain.setTargetAtTime(running?ratio*(brake?.09:.028):0,time,.1);
 }
 private tone(frequency:number,delay:number,duration:number,level=.15){const c=this.context,osc=c.createOscillator(),gain=c.createGain(),time=c.currentTime+delay;osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(level,time+.012);gain.gain.exponentialRampToValueAtTime(.001,time+duration);osc.connect(gain);gain.connect(this.master);osc.start(time);osc.stop(time+duration);this.effects.add(osc);osc.onended=()=>{this.effects.delete(osc);gain.disconnect();osc.disconnect()}}
 countdown(go:boolean){this.tone(go?880:440,0,go?.35:.12)}
 result(won:boolean){(won?[523.25,659.25,783.99,1046.5]:[330,294,220]).forEach((note,i)=>this.tone(note,i*.14,won?.42:.28,.16))}
 collision(){const c=this.context,source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain(),time=c.currentTime;source.buffer=this.noise;filter.type='lowpass';filter.frequency.value=450;gain.gain.setValueAtTime(.3,time);gain.gain.exponentialRampToValueAtTime(.001,time+.28);source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start();source.stop(time+.3);this.effects.add(source);source.onended=()=>{this.effects.delete(source);source.disconnect();filter.disconnect();gain.disconnect()}}
 stopEffects(){for(const source of this.effects){try{source.stop()}catch{}}this.effects.clear()}
 silence(){this.update(0,false,false,false);this.stopEffects()}
 dispose(){this.silence();this.source.stop();this.oscillators.forEach(osc=>osc.stop());void this.context.close()}
}
