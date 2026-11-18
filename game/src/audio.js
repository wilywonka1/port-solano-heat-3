// WebAudio synth: no assets. All sounds made from oscillators / filtered noise.
export function createAudio(){
 let ctx=null,master=null,eng=null,engGain=null,sir=null,sirGain=null,rainNode=null,rainGain=null;
 function init(){if(ctx)return;try{ctx=new(window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=0.35;master.connect(ctx.destination);
  eng=ctx.createOscillator();eng.type="sawtooth";eng.frequency.value=60;engGain=ctx.createGain();engGain.gain.value=0;const f=ctx.createBiquadFilter();f.type="lowpass";f.frequency.value=400;eng.connect(f);f.connect(engGain);engGain.connect(master);eng.start();
  sir=ctx.createOscillator();sir.type="triangle";sir.frequency.value=700;sirGain=ctx.createGain();sirGain.gain.value=0;sir.connect(sirGain);sirGain.connect(master);sir.start();
 }catch(e){}}
 function tone(fr,dur,type="sine",vol=0.2,slide=0){if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=fr;if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,fr+slide),ctx.currentTime+dur);g.gain.setValueAtTime(vol,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);o.connect(g);g.connect(master);o.start();o.stop(ctx.currentTime+dur)}
 function noise(dur,vol=0.3,fr=1000){if(!ctx)return;const len=ctx.sampleRate*dur,b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const s=ctx.createBufferSource();s.buffer=b;const f=ctx.createBiquadFilter();f.type="bandpass";f.frequency.value=fr;const g=ctx.createGain();g.gain.value=vol;g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);s.connect(f);f.connect(g);g.connect(master);s.start()}
 return{init,
  shoot(){noise(0.12,0.5,1800);tone(120,0.1,"square",0.2,-60)},
  punch(){noise(0.08,0.3,500)},
  cash(){tone(880,0.09,"sine",0.2);setTimeout(()=>tone(1320,0.14,"sine",0.2),70)},
  jingle(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,0.18,"triangle",0.22),i*90))},
  fanfare(){[392,523,659,784,1046,1318].forEach((f,i)=>setTimeout(()=>tone(f,0.28,"triangle",0.24),i*110))},
  denied(){tone(180,0.2,"square",0.2,-40)},
  pickup(){tone(660,0.1,"sine",0.2);setTimeout(()=>tone(990,0.12,"sine",0.2),60)},
  boost(on){if(on)tone(200,0.4,"sawtooth",0.12,500)},
  setEngine(rpm,on){if(!ctx||!eng)return;eng.frequency.value=55+rpm*110;engGain.gain.value=on?0.05+rpm*0.05:0},
  setSiren(on){if(!ctx||!sir)return;sirGain.gain.value=on?0.035:0;if(on)sir.frequency.value=650+Math.sin(performance.now()/180)*250},
  setRain(on){if(!ctx)return;if(on&&!rainNode){const len=ctx.sampleRate*2,b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;rainNode=ctx.createBufferSource();rainNode.buffer=b;rainNode.loop=true;const f=ctx.createBiquadFilter();f.type="highpass";f.frequency.value=1200;rainGain=ctx.createGain();rainGain.gain.value=0.06;rainNode.connect(f);f.connect(rainGain);rainGain.connect(master);rainNode.start()}if(!on&&rainNode){try{rainNode.stop()}catch(e){}rainNode=null}}
 };
}
