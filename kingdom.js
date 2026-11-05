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
const initial=()=>({owned:['eldoria'],discovered:['eldoria','oldroad','silverford','ironpeak','riverlands','southmeadow'],selected:'eldoria',treasury:55,influence:24,months:0,claimed:0});
let data;
try{data=JSON.parse(localStorage.getItem(KEY)||'null')}catch{data=null}
data=data&&Array.isArray(data.owned)&&Array.isArray(data.discovered)?data:initial();
data.treasury=Number.isFinite(data.treasury)?data.treasury:55;
data.influence=Number.isFinite(data.influence)?data.influence:24;
data.months=Number.isFinite(data.months)?data.months:0;
data.claimed=Number.isFinite(data.claimed)?data.claimed:Math.max(0,data.owned.length-1);
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
 root.querySelectorAll('[data-province]').forEach(btn=>btn.addEventListener('click',()=>select(btn.dataset.province)));
 root.querySelector('[data-action="scout"]')?.addEventListener('click',()=>scout(p.id));
 root.querySelector('[data-action="claim"]')?.addEventListener('click',()=>claim(p.id));
 root.querySelector('[data-action="reset"]')?.addEventListener('click',()=>{if(confirm('Сбросить только исследование и владения королевства? Город и его сохранение не изменятся.')){data=initial();save();render()}});
}
document.getElementById('nextMonth')?.addEventListener('click',()=>{
 data.months++;
 const income=data.owned.reduce((sum,id)=>sum+(byId[id]?.gold||0),0);
 const influence=data.owned.reduce((sum,id)=>sum+(byId[id]?.influence||0),0);
 data.treasury+=income;data.influence+=influence;save();render();
});
render();
})();