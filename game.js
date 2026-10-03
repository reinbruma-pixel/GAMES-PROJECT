const BIOMES=[
 {n:'Sunny Meadow',bg:'linear-gradient(#8fd8ff,#c8f2a8 60%,#7fcf6a)',gr:'#58b04a',ho:'#5a3b24',ac:'#ffcf3a',tx:'#1e4a1e',dec:'🌼🌳☁️🦋🌷',candy:'🍬'},
 {n:'Sandy Beach',bg:'linear-gradient(#7fe0ff,#bff0ff 40%,#f6e3a9 41%,#f2d489)',gr:'#e7c46a',ho:'#8a6a2c',ac:'#ff6f91',tx:'#0d4a63',dec:'🌴🐚🦀⛱️🌊',candy:'🍦'},
 {n:'Dusty Desert',bg:'linear-gradient(#ffcf9a,#f5a766 55%,#d9824a)',gr:'#cf7a43',ho:'#4a2411',ac:'#fff1a8',tx:'#5a2306',dec:'🌵☀️🦂🏜️🌵',candy:'🍫'},
 {n:'Autumn Forest',bg:'linear-gradient(#ffd9a0,#e9a45a 60%,#a45a2a)',gr:'#8a4b22',ho:'#2e170a',ac:'#ffe06a',tx:'#4a210a',dec:'🍂🍁🌰🦔🍄',candy:'🍪'},
 {n:'Snowy Peaks',bg:'linear-gradient(#bfe6ff,#eaf7ff 60%,#ffffff)',gr:'#cfe4f2',ho:'#6b8aa6',ac:'#5b8def',tx:'#1b3a5c',dec:'❄️⛄🏔️🌨️🎿',candy:'🧁'},
 {n:'Jungle Hollow',bg:'linear-gradient(#5fcf8a,#2e9c5a 60%,#1e6b3c)',gr:'#1f7a3d',ho:'#12301c',ac:'#ffe066',tx:'#f0ffe8',dec:'🌴🦜🐒🌺🍃',candy:'🍌'},
 {n:'Push Pop Land',bg:'linear-gradient(#ffc2e4,#ffe0f2 55%,#ffb3d9)',gr:'#ff8fc6',ho:'#8f2a60',ac:'#7be0ff',tx:'#7a1e55',dec:'🍭🍬🍡🎀🧁',candy:'🍭',cn:'a push pop'},
 {n:'Lava Caves',bg:'linear-gradient(#5a1f2a,#a8321f 60%,#ff7a2e)',gr:'#4a2a2a',ho:'#150808',ac:'#ffd23f',tx:'#ffeedd',dec:'🔥🌋💎🪨🔥',candy:'🍯'},
 {n:'Coral Deep',bg:'linear-gradient(#4fc3f7,#1a78c2 60%,#0d3b78)',gr:'#e58a7a',ho:'#2a1020',ac:'#fff27a',tx:'#e8f8ff',dec:'🐠🪸🐙🫧🐚',candy:'🍧'},
 {n:'Cosmic Kennel',bg:'linear-gradient(#1b1442,#3a2478 60%,#6a3fa8)',gr:'#4a3a8a',ho:'#0a0620',ac:'#ff9ae0',tx:'#f0e8ff',dec:'⭐🪐🌙🛸✨',candy:'🌟'}
];
const $=id=>document.getElementById(id);
/* ---- sound effects (synthesized, no audio files) ---- */
let AC=null,muted=false;
try{muted=localStorage.getItem('whackmute')==='1'}catch(e){}
function ac(){
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
  if(AC&&AC.state==='suspended')AC.resume();
  return AC;
}
function tone(f,d,type,vol,t0,f2){
  if(muted)return;const a=ac();if(!a)return;
  const t=a.currentTime+(t0||0),o=a.createOscillator(),g=a.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(f,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(vol||.12,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02);
}
const SFX={
  pop:()=>tone(520,.1,'sine',.07,0,780),
  hit:()=>{tone(180,.14,'square',.13,0,60);tone(900,.09,'triangle',.1,.03,500)},
  hit2:()=>tone(300,.08,'square',.09,0,200),
  combo:n=>tone(500+Math.min(n,12)*60,.16,'triangle',.12,.1),
  cat:()=>{tone(750,.4,'sawtooth',.08,0,280);tone(740,.4,'sine',.08,.04,270)},
  ready:()=>tone(440,.18,'triangle',.12),
  go:()=>{tone(660,.1,'triangle',.12);tone(990,.3,'triangle',.12,.1)},
  tick:()=>tone(1000,.05,'square',.05),
  win:()=>[523,659,784,1047,1319].forEach((f,i)=>tone(f,.28,'triangle',.13,i*.1)),
  candy:()=>[1568,2093,2637,3136].forEach((f,i)=>tone(f,.18,'sine',.08,i*.07)),
  lvup:()=>[392,523,659,784,1047,1319].forEach((f,i)=>tone(f,.22,'square',.07,i*.08)),
  lose:()=>[400,330,260,180].forEach((f,i)=>tone(f,.3,'sine',.13,i*.18)),
  click:()=>tone(660,.06,'triangle',.08)
};
const MV=['f','f','f','d','d','f','d','r','r','t'];
const emo=b=>[...b.dec.match(/\p{Extended_Pictographic}\uFE0F?/gu)];
function theme(l){
  const b=biomeOf(l),r=document.documentElement.style;
  r.setProperty('--bg',b.bg);r.setProperty('--gr',b.gr);r.setProperty('--ho',b.ho);r.setProperty('--ac',b.ac);r.setProperty('--tx',b.tx);
  const p=$('posters');p.innerHTML='';const e=emo(b);
  [[2,12],[84,52],[3,64],[86,8]].forEach((c,i)=>{const s=document.createElement('span');s.textContent=e[i%e.length];
    s.style.left=c[0]+'%';s.style.top=c[1]+'%';s.style.animationDelay=(-i*1.7)+'s';p.appendChild(s)});
  return b;
}
let S={lvl:1,exp:0,plvl:1,candy:0,best:1};
try{Object.assign(S,JSON.parse(localStorage.getItem('whackpup')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('whackpup',JSON.stringify(S))}catch(e){}};
const need=p=>60+p*25;
const biomeOf=l=>BIOMES[Math.floor((l-1)/10)];

function hud(){
  $('pl').textContent='Pup Lv '+S.plvl;
  $('xb').style.width=Math.min(100,S.exp/need(S.plvl)*100)+'%';
  $('cd').textContent='🍬 '+S.candy;
}
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id))}

function buildMenu(){
  $('mnote').textContent=S.best>100?'You cleared all 100 levels. Replay any of them.':'Next up: level '+S.best+' in '+biomeOf(S.best).n+'.';
  $('playBtn').textContent=S.best>100?'Replay level 100':'Play level '+S.best;
  const p=$('pick');p.innerHTML='';
  BIOMES.forEach((b,bi)=>{
    const h=document.createElement('h2');h.textContent=b.n+' '+emo(b)[0];p.appendChild(h);
    const g=document.createElement('div');g.className='lvgrid';
    for(let i=1;i<=10;i++){
      const l=bi*10+i,btn=document.createElement('button');
      btn.className='lv'+(l<S.best?' done':'')+(l===S.best?' cur':'');
      btn.textContent=l;btn.disabled=l>S.best;
      btn.onclick=()=>start(l);g.appendChild(btn);
    }
    p.appendChild(g);
  });
}

let G=null;
const holes=[];
function start(l){
  clearGame();
  const b=theme(l),mv=MV[Math.floor((l-1)/10)],em=emo(b);
  $('mq').textContent=b.n;
  const d=$('decor');d.innerHTML='';d.className='decor '+mv;
  for(let i=0;i<16;i++){const s=document.createElement('span');
    s.textContent=em[i%em.length];s.style.left=(Math.random()*92)+'%';
    s.style.top=mv==='d'?'-10%':mv==='r'?'100%':(Math.random()*88)+'%';
    s.style.fontSize=(18+Math.random()*28)+'px';
    s.style.animationDuration=(4+Math.random()*6)+'s';s.style.animationDelay=(-Math.random()*8)+'s';d.appendChild(s)}
  const f=$('field');f.innerHTML='';holes.length=0;
  for(let i=0;i<9;i++){
    const h=document.createElement('button');h.className='hole';h.setAttribute('aria-label','hole '+(i+1));
    h.innerHTML='<span class="dog"></span>';
    const o={el:h,dog:h.firstChild,on:false,hp:0,decoy:false,t:0};
    h.addEventListener('pointerdown',e=>{e.preventDefault();hit(o,e)});
    f.appendChild(h);holes.push(o);
  }
  const goal=5+Math.floor(l*0.45),time=20;
  G={l,goal,score:0,time,max:time,stay:Math.max(450,1400-l*9.5),gap:Math.max(330,950-l*6),
     multi:1+(l>=40)+(l>=75),decoy:l>=10?Math.min(.25,.08+(l-10)*.002):0,over:false};
  $('gl').textContent='Level '+l;$('gb').textContent=b.n;$('gt').textContent=time+'s';
  $('pg').style.width='0';$('tmb').style.width='100%';
  show('play');G.combo=0;
  const bn=$('ban');bn.textContent='Ready…';bn.className='ban on';SFX.ready();
  G.st=setTimeout(()=>{bn.textContent='GO!';bn.className='ban on go';SFX.go();
    G.spawn=setInterval(spawn,G.gap);G.clock=setInterval(tick,100);spawn();
    setTimeout(()=>{bn.className='ban'},600)},900);
}
function clearGame(){
  if(!G)return;clearTimeout(G.st);clearInterval(G.spawn);clearInterval(G.clock);
  holes.forEach(o=>clearTimeout(o.t));G.over=true;
}
function spawn(){
  if(!G||G.over)return;
  for(let k=0;k<G.multi;k++){
    const free=holes.filter(o=>!o.on);if(!free.length)return;
    const o=free[Math.floor(Math.random()*free.length)],l=G.l,r=Math.random();
    o.decoy=r<G.decoy;o.hp=1;let stay=G.stay;
    if(o.decoy)o.dog.textContent='🐱';
    else if(l>=30&&r>.7){o.dog.textContent='🐕‍🦺';o.hp=2}
    else if(l>=60&&r>.78){o.dog.textContent='🦮';stay*=.7}
    else o.dog.textContent=Math.random()<.7?'🐶':'🐩';
    o.on=true;o.dog.className='dog up';SFX.pop();
    o.t=setTimeout(()=>{if(o.on&&!o.decoy)G.combo=0;down(o)},stay*(.8+Math.random()*.4));
  }
}
function down(o){o.on=false;o.dog.className='dog dive'}
function mallet(o){const m=document.createElement('span');m.className='mal';m.textContent='🔨';
  m.style.left=(o.el.offsetLeft+o.el.offsetWidth/2-24)+'px';m.style.top=(o.el.offsetTop-6)+'px';
  $('field').appendChild(m);setTimeout(()=>m.remove(),320)}
function sparks(o,n,ch){const em=ch?[ch]:['⭐','✨',biomeOf(G.l).candy];
  for(let i=0;i<n;i++){const s=document.createElement('span'),a=Math.random()*6.28,d=40+Math.random()*40;
    s.className='sp';s.textContent=em[i%em.length];
    s.style.left=(o.el.offsetLeft+o.el.offsetWidth/2-10)+'px';s.style.top=(o.el.offsetTop+o.el.offsetHeight*.35)+'px';
    s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',(Math.sin(a)*d-20)+'px');
    $('field').appendChild(s);setTimeout(()=>s.remove(),600)}}
function fx(o,txt){
  const s=document.createElement('span');s.className='fx';s.textContent=txt;
  s.style.left=(o.el.offsetLeft+o.el.offsetWidth/2-14)+'px';s.style.top=(o.el.offsetTop+o.el.offsetHeight*.2)+'px';
  $('field').appendChild(s);setTimeout(()=>s.remove(),700);
}
function hit(o){
  if(!G||G.over||!o.on)return;
  if(o.decoy){
    SFX.cat();mallet(o);G.combo=0;clearTimeout(o.t);down(o);G.time=Math.max(0,G.time-3);fx(o,'-3s');sparks(o,5,'💢');
    $('game').classList.remove('shake');void $('game').offsetWidth;$('game').classList.add('shake');return;
  }
  mallet(o);o.hp--;
  if(o.hp>0){fx(o,'💥');sparks(o,2);SFX.hit2();return}
  clearTimeout(o.t);o.on=false;o.dog.className='dog bonk';G.combo++;
  fx(o,G.combo>=3?'x'+G.combo+'!':'+1');sparks(o,7);SFX.hit();if(G.combo>=3)SFX.combo(G.combo);
  G.score++;$('pg').style.width=(G.score/G.goal*100)+'%';
  if(G.score>=G.goal)win();
}
function tick(){
  if(!G||G.over)return;
  G.time=Math.max(0,G.time-.1);
  $('gt').textContent=Math.ceil(G.time)+'s';$('tmb').style.width=(G.time/G.max*100)+'%';
  $('tmb').parentNode.classList.toggle('low',G.time<6);
  const sec=Math.ceil(G.time);if(G.time<6&&sec!==G.ls){G.ls=sec;SFX.tick()}
  if(G.time<=0)lose();
}
function lose(){SFX.lose();
  const l=G.l;clearGame();
  modal(`<div class="big">😴</div><h2>The pups got away</h2><p>You bonked ${G.score} of ${G.goal}. Try level ${l} again.</p>
   <button class="btn" onclick="closeM();start(${l})">Retry</button><br><button class="btn alt" onclick="closeM();toMenu()">Menu</button>`);
}
function win(){
  const l=G.l;clearGame();
  const gain=20+l*3;
  S.candy++;if(l===S.best)S.best=l+1;
  S.exp+=gain;let ups=0;
  while(S.exp>=need(S.plvl)){S.exp-=need(S.plvl);S.plvl++;ups++}
  save();burst(1);SFX.win();setTimeout(SFX.candy,500);
  const b=biomeOf(l),final=l===100;
  modal(`<div class="big">${final?'🏆':b.candy}</div>
   <h2>${final?'You cleared all 100 levels!':'Level '+l+' cleared!'}</h2>
   <p>${final?'Candy Champion of every biome. Take a mountain of treats.':'Reward: '+(b.cn||'a candy')+' '+b.candy}</p>
   <p><b>+${gain} EXP</b></p><div class="bar xp"><i id="mx" style="width:0"></i></div>
   <div class="lvup" id="lu"></div>
   ${final?'':`<button class="btn" onclick="closeM();start(${l+1})">Next level</button><br>`}
   <button class="btn alt" onclick="closeM();toMenu()">Menu</button>`);
  if(final)for(let i=1;i<=5;i++)setTimeout(()=>burst(1.4),i*500);
  setTimeout(()=>{$('mx').style.width=Math.min(100,S.exp/need(S.plvl)*100)+'%';hud();
    if(ups){$('lu').textContent='Level up! You are Pup Lv '+S.plvl+' 🎉';SFX.lvup();setTimeout(()=>burst(1.2),400)}},350);
  hud();
}
function modal(h){$('card').innerHTML=h;$('modal').classList.add('on')}
function closeM(){$('modal').classList.remove('on')}
function toMenu(){clearGame();theme(Math.min(S.best,100));buildMenu();hud();show('menu')}
$('playBtn').onclick=()=>start(Math.min(S.best,100));
$('quit').onclick=toMenu;

/* confetti */
const cv=$('cf'),cx=cv.getContext('2d');let P=[],raf=0;
function size(){cv.width=innerWidth*devicePixelRatio;cv.height=innerHeight*devicePixelRatio}
addEventListener('resize',size);size();
function burst(k){
  const cols=['#ff5d8f','#ffd23f','#5b8def','#47d18c','#ff9a3c','#b86bff'],n=Math.round(110*k),dpr=devicePixelRatio;
  for(const sx of [.25,.75])for(let i=0;i<n/2;i++){
    const a=-Math.PI/2+(Math.random()-.5)*1.8,v=(9+Math.random()*12)*dpr;
    P.push({x:cv.width*sx,y:cv.height*.55,vx:Math.cos(a)*v,vy:Math.sin(a)*v,w:(6+Math.random()*7)*dpr,h:(4+Math.random()*6)*dpr,
      r:Math.random()*6,vr:(Math.random()-.5)*.4,c:cols[i%cols.length],life:1})}
  if(!raf)loop();
}
function loop(){
  cx.clearRect(0,0,cv.width,cv.height);
  P=P.filter(p=>p.life>0&&p.y<cv.height+40);
  for(const p of P){
    p.vy+=.35*devicePixelRatio;p.vx*=.99;p.vy*=.992;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.life-=.007;
    cx.save();cx.globalAlpha=Math.max(0,p.life);cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.fillRect(-p.w/2,-p.h/2,p.w,p.h);cx.restore();
  }
  raf=P.length?requestAnimationFrame(loop):0;
}

const mb=$('mute');
const mset=()=>{mb.textContent=muted?'🔇':'🔊';mb.setAttribute('aria-label',muted?'Unmute sound':'Mute sound')};
mb.onclick=()=>{muted=!muted;try{localStorage.setItem('whackmute',muted?'1':'0')}catch(e){};mset();if(!muted){ac();SFX.click()}};
mset();
addEventListener('pointerdown',()=>{ac()},{once:true});
document.addEventListener('click',e=>{if(e.target.closest('.btn,.lv'))SFX.click()});
theme(Math.min(S.best,100));buildMenu();hud();
