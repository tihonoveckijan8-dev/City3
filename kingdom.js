(() => {
'use strict';
// WHY: the realm map has its own versioned save so it can grow without changing the city simulation schema.
const KEY='eldoria.kingdom.map.v1';
const provinces=[
 {id:'northreach',name:'Северный Предел',icon:'🏔️',kind:'Горный край',desc:'Холодные перевалы и залежи железной руды.',x:3,y:0,links:['frostpass','ironpeak'],cost:22,gold:5,influence:1,resource:'Камень'},
 {id:'frostpass',name:'Ледяной Перевал',icon:'❄️',kind:'Горный проход',desc:'Стратегический путь через северные горы.',x:5,y:0,links:['northreach','ironpeak','eastmarch'],cost:25,gold:4,influence:2,resource:'Камень'},
 {id:'westwood',name:'Западный Лес',icon:'🌲',kind:'Древний лес',desc:'Богатые древесиной чащи и охотничьи тропы.',x:0,y:1,links:['highforest','silverford'],cost:18,gold:3,influence:1,resource:'Древесина'},
 {id:'silverford',name:'Серебряный Брод',icon:'🌊',kind:'Речная долина',desc:'Переправа через реку и удобное место для торговли.',x:2,y:1,links:['westwood','oldroad','ironpeak','riverlands'],cost:20,gold:5,influence:2,resource:'Золото'},
 {id:'ironpeak',name:'Железный Пик',icon:'⛏️',kind:'Рудные горы',desc:'Каменоломни и богатые жилы железа.',x:4,y:1,links:['northreach','frostpass','silverford','eastmarch','eldoria'],cost:24,gold:4,influence:2,resource:'Камень'},
 {id:'eastmarch',name:'Восточная Марка',icon:'🦅',kind:'Пограничье',desc:'Открытые земли на пути к владениям Эшфорда.',x:6,y:1,links:['frostpass','ironpeak','ashvale'],cost:26,gold:4,influence:2,resource:'Золото'},
 {id:'highforest',name:'Высокий Бор',icon:'🌳',kind:'Старый лес',desc:'Высокие сосны, редкие травы и скрытые тропы.',x:0,y:2,links:['westwood','oldroad','greenfields'],cost:19,gold:3,influence:1,resource:'Древесина'},
 {id:'oldroad',name:'Старый Тракт',icon:'🛤️',kind:'Торговый путь',desc:'Заброшенная дорога, которую можно вернуть к жизни.',x:1,y:2,links:['highforest','silverford','eldoria','greenfields'],cost:17,gold:6,influence:2,resource:'Золото'},
 {id:'eldoria',name:'Эльдория',icon:'🏰',kind:'Королевское сердце',desc:'Столица растущего королевства. Отсюда начинается расширение.',x:3,y:2,links:['oldroad','silverford','ironpeak','riverlands','southmeadow'],cost:0,gold:0,influence:0,resource:'Столица',capital:true},
 {id:'ashvale',name:'Пепельная Долина',icon:'🦅',kind:'Спорная земля',desc:'Пограничная долина, на которую претендуют соседи.',x:5,y:2,links:['eastmarch','eastwood','southmeadow'],cost:30,gold:3,influence:2,resource:'Золото',rival:'Эшфорд'},
 {id:'eastwood',name:'Восточная Чаща',icon:'🌲',kind:'Лесной край',desc:'Лесные угодья у восточной границы.',x:6,y:2,links:['ashvale','coast'],cost:21,gold:3,influence:1,resource:'Древесина'},
 {id:'greenfields',name:'Зелёные Поля',icon:'🌾',kind:'Плодородные земли',desc:'Плодородные почвы для будущих ферм и поселений.',x:1,y:3,links:['highforest','oldroad','deepwood','riverlands'],cost:18,gold:4,influence:1,resource:'Провизия'},
 {id:'riverlands',name:'Речные Земли',icon:'🏞️',kind:'Речная провинция',desc:'Водные пути, рыбацкие деревни и место для новых мостов.',x:3,y:3,links:['silverford','eldoria','greenfields','southmeadow','coast'],cost:23,gold:5,influence:2,resource:'Провизия'},
 {id:'southmeadow',name:'Южный Луг',icon:'🐎',kind:'Пастбища',desc:'Просторные луга для скота и конных отрядов.',x:4,y:3,links:['eldoria','ashvale','riverlands','sunhills'],cost:20,gold:4,influence:1,resource:'Провизия'},
 {id:'coast',name:'Туманный Берег',icon:'⚓',kind:'Прибрежье',desc:'Выход к морским торговым путям Серебряного Берега.',x:6,y:3,links:['eastwood','riverlands'],cost:29,gold:7,influence:2,resource:'Золото',rival:'Серебряный Берег'},
 {id:'deepwood',name:'Глубокий Лес',icon:'🌲',kind:'Дикий лес',desc:'Глухие леса, где ещё встречаются старые руины.',x:2,y:4,links:['greenfields','sunhills'],cost:23,gold:4,influence:1,resource:'Древесина'},
 {id:'sunhills',name:'Солнечные Холмы',icon:'☀️',kind:'Холмы',desc:'Мягкий климат и камень для больших строек.',x:4,y:4,links:['deepwood','southmeadow'],cost:24,gold:4,influence:1,resource:'Камень'}
];
const byId=Object.fromEntries(provinces.map(p=>[p.id,p]));
const initial=()=>({owned:['eldoria'],discovered:['eldoria','oldroad','silverford','ironpeak','riverlands','southmeadow'],selected:'eldoria',treasury:55,influence:24,months:0,claimed:0,army:0,morale:80,siege:null,warLog:[]});
let data;
try{data=JSON.parse(localStorage.getItem(KEY)||'null')}catch{data=null}
data=data&&Array.isArray(data.owned)&&Array.isArray(data.discovered)?data:initial();
data.treasury=Number.isFinite(data.treasury)?data.treasury:55;
data.influence=Number.isFinite(data.influence)?data.influence:24;
data.months=Number.isFinite(data.months)?data.months:0;
data.claimed=Number.isFinite(data.claimed)?data.claimed:Math.max(0,data.owned.length-1);
// WHY: military state migrates independently to preserve existing kingdom saves.
data.army=Number.isFinite(data.army)?Math.max(0,data.army):0;
data.morale=Number.isFinite(data.morale)?Math.max(0,Math.min(100,data.morale)):80;
data.siege=data.siege&&typeof data.siege.target==='string'?data.siege:null;
data.warLog=Array.isArray(data.warLog)?data.warLog:[];
// WHY: typed units, commanders and garrisons extend old saves without resetting existing armies.
const unitTypes={infantry:{name:'Мечники',icon:'⚔️',cost:10,influence:2,power:1},spearmen:{name:'Копейщики',icon:'🛡️',cost:9,influence:2,power:1.15},archers:{name:'Лучники',icon:'🏹',cost:12,influence:2,power:1.3},cavalry:{name:'Кавалерия',icon:'🐎',cost:20,influence:4,power:2.2}};
data.troops=data.troops&&typeof data.troops==='object'?data.troops:{infantry:data.army||0,spearmen:0,archers:0,cavalry:0};
Object.keys(unitTypes).forEach(k=>data.troops[k]=Number.isFinite(data.troops[k])?Math.max(0,data.troops[k]):0);
data.generals=Array.isArray(data.generals)?data.generals:[];
data.garrisons=data.garrisons&&typeof data.garrisons==='object'?data.garrisons:{};
data.enemyForces=data.enemyForces&&typeof data.enemyForces==='object'?data.enemyForces:{ashford:14,silver:10};
data.army=Object.values(data.troops).reduce((a,b)=>a+b,0);
const root=document.getElementById('kingdomApp');
if(!root)return;
function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}}
function isOwned(id){return data.owned.includes(id)}
function isKnown(id){return data.discovered.includes(id)}
function canScout(p){return !isKnown(p.id)&&p.links.some(isOwned)&&data.influence>=5&&data.treasury>=8}
function canClaim(p){return isKnown(p.id)&&!isOwned(p.id)&&data.influence>=3&&data.treasury>=p.cost}
function neighbors(p){return provinces.filter(q=>p.links.includes(q.id))}
function select(id){data.selected=id;save();render()}
function scout(id){const p=byId[id];if(!p||!canScout(p))return;data.influence-=5;data.treasury-=8;data.discovered.push(id);data.selected=id;save();render()}
function claim(id){const p=byId[id];if(!p||!canClaim(p))return;data.treasury-=p.cost;data.influence-=3;data.owned.push(id);data.claimed++;data.selected=id;save();render()}
function warNote(message){data.warLog.unshift(message);data.warLog=data.warLog.slice(0,4)}
function recruit(type='infantry'){const u=unitTypes[type];if(!u||data.army>=30||data.treasury<u.cost||data.influence<u.influence)return;data.treasury-=u.cost;data.influence-=u.influence;data.troops[type]++;data.army++;data.morale=Math.min(100,data.morale+1);warNote(u.name+': новый воин принёс присягу короне.');save();render()}
function hireGeneral(){if(data.generals.length>=3||data.treasury<35||data.influence<10)return;const names=['Эдрик Железный','Лиора Соколиный Взор','Бранн Каменный Щит'];const name=names.find(n=>!data.generals.some(g=>g.name===n))||'Королевский воевода';const general={name,command:2+data.generals.length,loyalty:85};data.generals.push(general);data.treasury-=35;data.influence-=10;warNote('На службу принят полководец '+name+'.');save();render()}
function garrison(id){if(!isOwned(id)||data.army<=0)return;const key=id;data.garrisons[key]=(data.garrisons[key]||0)+1;data.army--;const troop=Object.keys(unitTypes).find(k=>data.troops[k]>0);if(troop)data.troops[troop]--;warNote('В гарнизон провинции «'+byId[id].name+'» направлен воин.');save();render()}
function recallGarrison(id){if(!data.garrisons[id])return;data.garrisons[id]--;data.army++;data.troops.infantry++;warNote('Воин возвращён из гарнизона «'+byId[id].name+'».');save();render()}
function startSiege(id){const p=byId[id];if(!p||!p.rival||isOwned(id)||!isKnown(id)||data.siege||data.army<5||data.treasury<20||data.influence<8)return;data.treasury-=20;data.influence-=8;data.siege={target:id,months:3,startedWith:data.army};data.morale=Math.max(0,data.morale-3);warNote('Армия Эльдории выступила к провинции «'+p.name+'». Началась осада державы '+p.rival+'.');save();render()}
function resolveSiegeMonth(){if(!data.siege)return;data.siege.months--;data.morale=Math.max(0,data.morale-2);const p=byId[data.siege.target];if(data.siege.months>0){warNote('Осада «'+p.name+'»: до решающего штурма осталось '+data.siege.months+' мес.');return}const typedPower=Object.entries(data.troops).reduce((sum,[type,count])=>sum+count*(unitTypes[type]?.power||1),0);const generalBonus=data.generals.reduce((sum,g)=>sum+g.command,0);const force=typedPower*(.65+data.morale/200)+generalBonus,defense=(p.id==='coast'?11:8)+(data.enemyForces[p.rival==='Эшфорд'?'ashford':'silver']||0)*.25;if(force>=defense){const losses=Math.min(data.army,Math.max(1,Math.floor(data.army*.2)));data.army-=losses;let left=losses;for(const type of ['infantry','spearmen','archers','cavalry']){const take=Math.min(data.troops[type],left);data.troops[type]-=take;left-=take;}data.owned.push(p.id);data.claimed++;data.treasury+=18;data.influence+=5;data.morale=Math.min(100,data.morale+14);warNote('Победа! «'+p.name+'» присоединена. Потери: '+losses+' воинов. Казна получила 18 золотых.')}else{const losses=Math.min(data.army,Math.max(2,Math.ceil(data.army*.45)));data.army-=losses;let left=losses;for(const type of ['infantry','spearmen','archers','cavalry']){const take=Math.min(data.troops[type],left);data.troops[type]-=take;left-=take;}data.morale=Math.max(15,data.morale-18);warNote('Штурм «'+p.name+'» отбит. Потери: '+losses+' воинов. Армия отступила.')}data.siege=null}
function render(){
 const p=byId[data.selected]||byId.eldoria;
 const map=provinces.map(q=>{
  const owned=isOwned(q.id),known=isKnown(q.id),selected=q.id===p.id;
  return '<button type="button" class="province '+(owned?'owned':known?'known':'fog')+(selected?' selected':'')+'" style="--gx:'+q.x+';--gy:'+q.y+'" data-province="'+q.id+'" aria-label="'+(known?q.name:'Неизведанная земля')+'"><span class="province-icon">'+(known?q.icon:'?')+'</span><span class="province-name">'+(owned?q.name:known?q.name:'Туман войны')+'</span>'+(owned?'<i>ВЛАДЕНИЕ</i>':known?'<i>ОТКРЫТО</i>':'<i>НЕИЗВЕДАНО</i>')+'</button>';
 }).join('');
 const links=neighbors(p).map(q=>'<span class="neighbor-tag">'+(isKnown(q.id)?q.icon+' '+q.name:'? Неизведанная земля')+'</span>').join('');
 let action='';
 if(isOwned(p.id))action='<div class="province-status">✓ Провинция входит в королевство. Приносит <b>+'+p.gold+' золота</b> и <b>+'+p.influence+' влияния</b> каждый месяц.</div>';
 else if(!isKnown(p.id))action='<button class="kingdom-action" data-action="scout" '+(canScout(p)?'':'disabled')+'>Разведать земли · 8 🪙 · 5 влияния</button><small class="kingdom-hint">Для разведки нужна соседняя ваша провинция, 8 золотых и 5 влияния.</small>';
 else action='<button class="kingdom-action" data-action="claim" '+(canClaim(p)?'':'disabled')+'>Присоединить · '+p.cost+' 🪙 · 3 влияния</button><small class="kingdom-hint">После присоединения земля начнёт приносить доход короне.</small>';
 root.innerHTML='<div class="kingdom-summary"><div><small>ЗЕМЛИ КОРОНЫ</small><b>'+data.owned.length+' / '+provinces.length+'</b></div><div><small>КОРОЛЕВСКАЯ КАЗНА</small><b>'+data.treasury+' 🪙</b></div><div><small>ВЛИЯНИЕ</small><b>'+data.influence+' ✦</b></div><div><small>РАСШИРЕНИЕ</small><b>'+data.claimed+' провинций</b></div></div><div class="kingdom-layout"><div class="kingdom-map-wrap"><div class="kingdom-map" aria-label="Карта провинций">'+map+'</div><div class="kingdom-legend"><span><i class="legend-owned"></i> Ваши земли</span><span><i class="legend-known"></i> Разведано</span><span><i class="legend-fog"></i> Туман войны</span></div></div><aside class="province-detail"><small class="detail-kicker">ПРОВИНЦИЯ · '+(isOwned(p.id)?'ПОД ВАШЕЙ ВЛАСТЬЮ':isKnown(p.id)?'РАЗВЕДАНА':'НЕИЗВЕДАНА')+'</small><div class="detail-emblem">'+(isKnown(p.id)?p.icon:'❔')+'</div><h3>'+(isKnown(p.id)?p.name:'Неизведанная земля')+'</h3><p>'+(isKnown(p.id)?p.desc:'Отправьте разведчиков, чтобы узнать, что скрывает эта часть королевства.')+'</p>'+(isKnown(p.id)?'<div class="province-facts"><span>Местность<b>'+p.kind+'</b></span><span>Особенность<b>'+p.resource+'</b></span>'+(p.rival?'<span>Претензии соседей<b>'+p.rival+'</b></span>':'')+'</div>':'')+'<div class="province-neighbors"><small>СОСЕДНИЕ ЗЕМЛИ</small><div>'+links+'</div></div>'+action+'</aside></div><div class="kingdom-footer"><span>Каждый прожитый месяц приносит доход со всех присоединённых провинций.</span><button type="button" data-action="reset" title="Сбросить только карту королевства">Сбросить карту</button></div>';
 const troopCards=Object.entries(unitTypes).map(([type,u])=>'<div class="troop-card"><span>'+u.icon+' '+u.name+'</span><b>'+data.troops[type]+'</b><button type="button" data-recruit="'+type+'" '+(data.army>=30||data.treasury<u.cost||data.influence<u.influence?'disabled':'')+'>Нанять · '+u.cost+' 🪙</button></div>').join('');
 const generalCards=data.generals.map(g=>'<div class="general-card"><b>♜ '+g.name+'</b><span>Командование +'+g.command+' · Верность '+g.loyalty+'%</span></div>').join('');
 const garrisonCards=data.owned.filter(id=>id!=='eldoria').map(id=>'<div class="garrison-row"><span>'+byId[id].icon+' '+byId[id].name+' <b>'+ (data.garrisons[id]||0)+'</b></span><button type="button" data-garrison="'+id+'" '+(data.army<=0?'disabled':'')+'>Разместить</button><button type="button" data-recall="'+id+'" '+(!data.garrisons[id]?'disabled':'')+'>Отозвать</button></div>').join('');
 const military='<section class="army-command"><div class="army-heading"><div><small>КОРОЛЕВСКОЕ ВОЙСКО</small><h3>Армия Эльдории</h3><p>Собирай дружину, укрепляй боевой дух и веди осады чужих крепостей.</p></div><div class="army-crest">⚔️</div></div><div class="army-metrics"><span>Воинов<b>'+data.army+' / 30</b></span><span>Боевой дух<b>'+data.morale+'%</b></span><span>Сила войска<b>'+Math.floor(data.army*(.65+data.morale/200))+'</b></span></div><div class="army-actions"><button type="button" data-army="recruit" '+(data.army>=30||data.treasury<10||data.influence<2?'disabled':'')+'>Нанять воина · 10 🪙 · 2 влияния</button></div>'+(data.siege?'<div class="siege-active"><b>⚔️ Идёт осада: '+byId[data.siege.target].name+'</b><span>До штурма: '+data.siege.months+' мес. · В походе '+data.siege.startedWith+' воинов</span></div>':'<div class="siege-targets"><small>ЦЕЛИ ДЛЯ ВОЕННОГО ПОХОДА</small>'+provinces.filter(q=>q.rival&&!isOwned(q.id)).map(q=>'<div class="siege-target"><span>'+q.icon+' '+q.name+' <small>Держава: '+q.rival+'</small></span><button type="button" data-siege="'+q.id+'" '+(!isKnown(q.id)||data.army<5||data.treasury<20||data.influence<8?'disabled':'')+'>Начать осаду</button></div>').join('')+'</div>')+(data.warLog.length?'<div class="war-chronicle">'+data.warLog.map(x=>'<p>'+x+'</p>').join('')+'</div>':'')+'</section>';
 root.insertAdjacentHTML('beforeend',military);
 root.querySelectorAll('[data-recruit]').forEach(btn=>btn.addEventListener('click',()=>recruit(btn.dataset.recruit)));
 root.querySelector('[data-general="hire"]')?.addEventListener('click',hireGeneral);
 root.querySelectorAll('[data-garrison]').forEach(btn=>btn.addEventListener('click',()=>garrison(btn.dataset.garrison)));
 root.querySelectorAll('[data-recall]').forEach(btn=>btn.addEventListener('click',()=>recallGarrison(btn.dataset.recall)));
 root.querySelectorAll('[data-siege]').forEach(btn=>btn.addEventListener('click',()=>startSiege(btn.dataset.siege)));
root.querySelectorAll('[data-province]').forEach(btn=>btn.addEventListener('click',()=>select(btn.dataset.province)));
 root.querySelector('[data-action="scout"]')?.addEventListener('click',()=>scout(p.id));
 root.querySelector('[data-action="claim"]')?.addEventListener('click',()=>claim(p.id));
 root.querySelector('[data-action="reset"]')?.addEventListener('click',()=>{if(confirm('Сбросить только исследование и владения королевства? Город и его сохранение не изменятся.')){data=initial();save();render()}});
}
document.getElementById('nextMonth')?.addEventListener('click',()=>{
 data.months++;
 resolveSiegeMonth();
 const income=data.owned.reduce((sum,id)=>sum+(byId[id]?.gold||0),0);
 const influence=data.owned.reduce((sum,id)=>sum+(byId[id]?.influence||0),0);
 data.treasury+=income;data.influence+=influence;save();render();
});
render();
})();