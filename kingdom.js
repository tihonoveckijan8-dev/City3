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
// WHY: rival truces and border incidents are versioned with the kingdom save, independently of city progress.
data.truces=data.truces&&typeof data.truces==='object'?data.truces:{ashford:0,silver:0};
data.invasion=data.invasion&&typeof data.invasion.target==='string'?data.invasion:null;
// WHY: field detachments are saved separately from the reserve so marching never corrupts old troop counts.
data.fieldArmies=Array.isArray(data.fieldArmies)?data.fieldArmies:[];
data.nextFieldArmyId=Number.isFinite(data.nextFieldArmyId)?data.nextFieldArmyId:1;
data.truces.ashford=Number.isFinite(data.truces.ashford)?Math.max(0,data.truces.ashford):0;
data.truces.silver=Number.isFinite(data.truces.silver)?Math.max(0,data.truces.silver):0;
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

// WHY: border wars only begin after the player owns a frontier province; early city-building stays peaceful.
const rivalInfo={ashford:{name:'Эшфорд',key:'ashford',icon:'🦅'},silver:{name:'Серебряный Берег',key:'silver',icon:'⚓'}};

function fieldPower(army){return Object.entries(army.troops||{}).reduce((sum,[type,count])=>sum+count*(unitTypes[type]?.power||1),0)}
function deployFieldArmy(){
 const p=byId[data.selected];if(!p||!isOwned(p.id)||data.army<5)return;
 const troops={infantry:0,spearmen:0,archers:0,cavalry:0};let left=5;
 for(const type of ['spearmen','infantry','archers','cavalry']){const take=Math.min(data.troops[type],left);troops[type]=take;data.troops[type]-=take;left-=take}
 if(left)return;
 data.army-=5;
 data.fieldArmies.push({id:data.nextFieldArmyId++,location:p.id,target:null,troops,morale:data.morale});
 warNote('Отряд из трёх воинов сформирован в провинции «'+p.name+'».');
 save();render();
}
function orderFieldArmy(id,target){
 const army=data.fieldArmies.find(a=>a.id===id),p=byId[target];
 if(!army||!p||!army.location||!byId[army.location]?.links.includes(target)||(!isKnown(target)&&!p.rival))return;
 army.target=target;
 warNote('Отряду №'+army.id+' приказано выступить: '+byId[army.location].name+' → '+p.name+'.');
 save();render();
}
function resolveFieldArrival(army,target){
 const p=byId[target];if(!p)return;
 if(p.rival&&!isOwned(target)){
  const key=p.rival==='Эшфорд'?'ashford':'silver';
  const attack=fieldPower(army)*(1.05+(army.morale||70)/250)+data.generals.reduce((n,g)=>n+g.command*.35,0);
  const defense=3+(data.enemyForces[key]||10)*.3+(p.id==='coast'?2:0);
  if(attack>=defense){
   data.owned.push(target);data.discovered.push(target);data.claimed++;data.treasury+=12;data.influence+=3;
   data.enemyForces[key]=Math.max(3,(data.enemyForces[key]||10)-3);
   warNote('Отряд №'+army.id+' победил защитников и занял «'+p.name+'». Провинция перешла под власть Эльдории.');
  }else{
   data.enemyForces[key]=Math.min(40,(data.enemyForces[key]||10)+2);
   warNote('Отряд №'+army.id+' потерпел поражение у «'+p.name+'» и отступил. Остатки вернулись в резерв.');
   Object.entries(army.troops).forEach(([type,count])=>{const survivors=Math.max(0,Math.floor(count*.45));data.troops[type]+=survivors;data.army+=survivors});
   data.fieldArmies=data.fieldArmies.filter(a=>a.id!==army.id);return;
  }
 }
 army.location=target;army.target=null;
}
function advanceFieldArmies(){
 data.fieldArmies.slice().forEach(army=>{
  if(!army.target)return;
  const from=byId[army.location],to=byId[army.target];
  if(!from||!to||!from.links.includes(to.id)){army.target=null;return}
  army.location=to.id;
  warNote('Отряд №'+army.id+' прибыл в провинцию «'+to.name+'».');
  resolveFieldArrival(army,to.id);
 });
}
function disbandFieldArmy(id){
 const army=data.fieldArmies.find(a=>a.id===id);if(!army)return;
 Object.entries(army.troops).forEach(([type,count])=>{data.troops[type]+=count;data.army+=count});
 data.fieldArmies=data.fieldArmies.filter(a=>a.id!==id);
 warNote('Отряд №'+id+' распущен; воины вернулись в резерв.');
 save();render();
}
function borderTargets(){
 return data.owned.map(id=>byId[id]).filter(q=>q&&q.links.some(link=>byId[link]?.rival&&!isOwned(link)));
}
function terrainBonus(p){
 const kind=(p?.kind||'').toLowerCase();
 if(/гор|холм|лес|чащ/.test(kind))return .24;
 if(/реч|брод/.test(kind))return .3;
 if(/луг|пол/.test(kind))return .06;
 return .12;
}
function prepareInvasion(){
 if(data.invasion)return;
 const targets=borderTargets();
 if(!targets.length||data.months%3!==0)return;
 const eligible=targets.filter(p=>{
  const rival=p.links.map(id=>byId[id]).find(q=>q?.rival&&!isOwned(q.id));
  if(!rival)return false;
  const key=rival.rival==='Эшфорд'?'ashford':'silver';
  return (data.truces[key]||0)<=0;
 });
 if(!eligible.length||Math.random()>.55)return;
 const target=eligible[Math.floor(Math.random()*eligible.length)];
 const enemy=target.links.map(id=>byId[id]).find(q=>q?.rival&&!isOwned(q.id));
 const key=enemy.rival==='Эшфорд'?'ashford':'silver';
 const power=Math.max(7,Math.round(5+(data.enemyForces[key]||10)*.55));
 data.invasion={target:target.id,rival:key,power,months:1,ready:false,enemyPlan:['charge','volley','brace'][Math.floor(Math.random()*3)]};
 warNote('Разведчики заметили войско державы '+rivalInfo[key].name+' у границ провинции «'+target.name+'». Через месяц начнётся вторжение.');
}
function resolveInvasion(tactic='balanced'){
 const event=data.invasion;if(!event)return;
 const p=byId[event.target],r=rivalInfo[event.rival];
 if(!p||!isOwned(p.id)){data.invasion=null;return}
 const typed=Object.entries(data.troops).reduce((sum,[type,count])=>sum+count*(unitTypes[type]?.power||1),0);
 const generals=data.generals.reduce((sum,g)=>sum+g.command,0);
 const garrison=data.garrisons[p.id]||0;
 const plan=event.enemyPlan||'charge';
 const terrain=terrainBonus(p);
 const counters={shieldwall:plan==='charge'?.3:plan==='volley'?.02:.12,volley:plan==='brace'?.22:plan==='charge'?.12:.04,flank:plan==='volley'?.28:plan==='brace'?.08:.16,balanced:.08};
 const cavalry=data.troops.cavalry||0,archers=data.troops.archers||0,spearmen=data.troops.spearmen||0;
 const composition=tactic==='flank'?Math.min(.18,cavalry*.035):tactic==='volley'?Math.min(.18,archers*.03):tactic==='shieldwall'?Math.min(.18,spearmen*.03):0;
 const tacticBonus=counters[tactic]||0;
 const defense=typed*(.65+data.morale/200)+generals+garrison*1.15+Math.round((typed+garrison)*terrain)+typed*(tacticBonus+composition);
 warNote('Тактика обороны: '+({shieldwall:'щитовая стена',volley:'залп лучников',flank:'кавалерийский фланг',balanced:'смешанный строй'}[tactic]||'смешанный строй')+'. Противник: '+({charge:'лобовая атака',volley:'обстрел',brace:'укреплённая позиция'}[plan]||'неизвестный план')+'.');
 if(defense>=event.power){
  const losses=Math.min(data.army,Math.max(1,Math.floor(event.power*.12)));
  data.army-=losses;let left=losses;
  for(const type of ['infantry','spearmen','archers','cavalry']){const take=Math.min(data.troops[type],left);data.troops[type]-=take;left-=take;}
  data.enemyForces[event.rival]=Math.max(3,(data.enemyForces[event.rival]||10)-4);
  data.treasury+=12;data.morale=Math.min(100,data.morale+8);
  warNote('Оборона «'+p.name+'» успешна! Войско '+r.name+' отброшено. Потери: '+losses+'. Награда: 12 золотых.');
 }else{
  const losses=Math.min(data.army,Math.max(2,Math.ceil(event.power*.22)));
  data.army-=losses;let left=losses;
  for(const type of ['infantry','spearmen','archers','cavalry']){const take=Math.min(data.troops[type],left);data.troops[type]-=take;left-=take;}
  const gLoss=Math.min(data.garrisons[p.id]||0,Math.ceil(event.power*.08));
  data.garrisons[p.id]=Math.max(0,(data.garrisons[p.id]||0)-gLoss);
  data.morale=Math.max(10,data.morale-15);
  if(p.id!=='eldoria'&&data.owned.length>1){data.owned=data.owned.filter(id=>id!==p.id);delete data.garrisons[p.id];data.claimed=Math.max(0,data.claimed-1);warNote('Провинция «'+p.name+'» захвачена державой '+r.name+'. Армия отступила; потери: '+losses+'.')}
  else warNote('Войско '+r.name+' прорвало оборону «'+p.name+'». Потери: '+losses+' воинов; столица удержалась.');
 }
 data.invasion=null;
}
function defendBorder(tactic='balanced'){if(!data.invasion)return;resolveInvasion(tactic);save();render()}
function negotiateTruce(){
 const e=data.invasion;if(!e)return;
 const cost=20+Math.ceil(e.power*.8),influence=6;
 if(data.treasury<cost||data.influence<influence)return;
 data.treasury-=cost;data.influence-=influence;data.truces[e.rival]=4;
 data.enemyForces[e.rival]=Math.max(4,(data.enemyForces[e.rival]||10)-2);
 warNote('Заключено перемирие с державой '+rivalInfo[e.rival].name+' на 4 месяца. Цена мира: '+cost+' золотых и '+influence+' влияния.');
 data.invasion=null;save();render();
}
function render(){
 const p=byId[data.selected]||byId.eldoria;
 const map=provinces.map(q=>{
  const owned=isOwned(q.id),known=isKnown(q.id),selected=q.id===p.id;
  const stationed=data.fieldArmies.filter(a=>a.location===q.id);
  return '<button type="button" class="province '+(owned?'owned':known?'known':'fog')+(selected?' selected':'')+(stationed.length?' has-field-army':'')+'" style="--gx:'+q.x+';--gy:'+q.y+'" data-province="'+q.id+'" aria-label="'+(known?q.name:'Неизведанная земля')+'"><span class="province-icon">'+(known?q.icon:'?')+'</span><span class="province-name">'+(owned?q.name:known?q.name:'Туман войны')+'</span>'+(stationed.length?'<span class="field-army-pin">⚔ '+stationed.length+'</span>':'')+(owned?'<i>ВЛАДЕНИЕ</i>':known?'<i>ОТКРЫТО</i>':'<i>НЕИЗВЕДАНО</i>')+'</button>';
 }).join('');
 const links=neighbors(p).map(q=>'<span class="neighbor-tag">'+(isKnown(q.id)?q.icon+' '+q.name:'? Неизведанная земля')+'</span>').join('');
 let action='';
 if(isOwned(p.id))action='<div class="province-status">✓ Провинция входит в королевство. Приносит <b>+'+p.gold+' золота</b> и <b>+'+p.influence+' влияния</b> каждый месяц.</div>';
 if(isOwned(p.id)){
 const stationed=data.fieldArmies.filter(a=>a.location===p.id);
 const armyRows=stationed.map(a=>'<div class="field-army-row"><span>⚔️ Отряд №'+a.id+' · '+Object.values(a.troops).reduce((n,v)=>n+v,0)+' воинов · сила '+Math.round(fieldPower(a))+(a.target?' · марш к '+byId[a.target].name:' · ожидает приказа')+'</span><div class="field-army-orders">'+neighbors(p).filter(q=>isKnown(q.id)||q.rival).map(q=>'<button type="button" data-field-move="'+a.id+'" data-field-target="'+q.id+'">→ '+q.name+'</button>').join('')+'<button type="button" data-field-disband="'+a.id+'">Распустить</button></div></div>').join('');
 action+='<div class="field-command"><b>Полевые отряды</b><button type="button" data-field-deploy '+(data.army<5?'disabled':'')+'>Выделить отряд · 5 воинов</button>'+(armyRows||'<small>В этой провинции нет полевых отрядов.</small>')+'</div>';
 }
 else if(!isKnown(p.id))action='<button class="kingdom-action" data-action="scout" '+(canScout(p)?'':'disabled')+'>Разведать земли · 8 🪙 · 5 влияния</button><small class="kingdom-hint">Для разведки нужна соседняя ваша провинция, 8 золотых и 5 влияния.</small>';
 else action='<button class="kingdom-action" data-action="claim" '+(canClaim(p)?'':'disabled')+'>Присоединить · '+p.cost+' 🪙 · 3 влияния</button><small class="kingdom-hint">После присоединения земля начнёт приносить доход короне.</small>';
 root.innerHTML='<div class="kingdom-summary"><div><small>ЗЕМЛИ КОРОНЫ</small><b>'+data.owned.length+' / '+provinces.length+'</b></div><div><small>КОРОЛЕВСКАЯ КАЗНА</small><b>'+data.treasury+' 🪙</b></div><div><small>ВЛИЯНИЕ</small><b>'+data.influence+' ✦</b></div><div><small>РАСШИРЕНИЕ</small><b>'+data.claimed+' провинций</b></div></div><div class="kingdom-layout"><div class="kingdom-map-wrap"><div class="kingdom-map" aria-label="Карта провинций">'+map+'</div><div class="kingdom-legend"><span><i class="legend-owned"></i> Ваши земли</span><span><i class="legend-known"></i> Разведано</span><span><i class="legend-fog"></i> Туман войны</span></div></div><aside class="province-detail"><small class="detail-kicker">ПРОВИНЦИЯ · '+(isOwned(p.id)?'ПОД ВАШЕЙ ВЛАСТЬЮ':isKnown(p.id)?'РАЗВЕДАНА':'НЕИЗВЕДАНА')+'</small><div class="detail-emblem">'+(isKnown(p.id)?p.icon:'❔')+'</div><h3>'+(isKnown(p.id)?p.name:'Неизведанная земля')+'</h3><p>'+(isKnown(p.id)?p.desc:'Отправьте разведчиков, чтобы узнать, что скрывает эта часть королевства.')+'</p>'+(isKnown(p.id)?'<div class="province-facts"><span>Местность<b>'+p.kind+'</b></span><span>Особенность<b>'+p.resource+'</b></span>'+(p.rival?'<span>Претензии соседей<b>'+p.rival+'</b></span>':'')+'</div>':'')+'<div class="province-neighbors"><small>СОСЕДНИЕ ЗЕМЛИ</small><div>'+links+'</div></div>'+action+'</aside></div><div class="kingdom-footer"><span>Каждый прожитый месяц приносит доход со всех присоединённых провинций.</span><button type="button" data-action="reset" title="Сбросить только карту королевства">Сбросить карту</button></div>';
 const troopCards=Object.entries(unitTypes).map(([type,u])=>'<div class="troop-card"><span>'+u.icon+' '+u.name+'</span><b>'+data.troops[type]+'</b><button type="button" data-recruit="'+type+'" '+(data.army>=30||data.treasury<u.cost||data.influence<u.influence?'disabled':'')+'>Нанять · '+u.cost+' 🪙</button></div>').join('');
 const generalCards=data.generals.map(g=>'<div class="general-card"><b>♜ '+g.name+'</b><span>Командование +'+g.command+' · Верность '+g.loyalty+'%</span></div>').join('');
 const garrisonCards=data.owned.filter(id=>id!=='eldoria').map(id=>'<div class="garrison-row"><span>'+byId[id].icon+' '+byId[id].name+' <b>'+ (data.garrisons[id]||0)+'</b></span><button type="button" data-garrison="'+id+'" '+(data.army<=0?'disabled':'')+'>Разместить</button><button type="button" data-recall="'+id+'" '+(!data.garrisons[id]?'disabled':'')+'>Отозвать</button></div>').join('');
 const military='<section class="army-command"><div class="army-heading"><div><small>КОРОЛЕВСКОЕ ВОЙСКО</small><h3>Армия Эльдории</h3><p>Собирай дружину, укрепляй боевой дух и веди осады чужих крепостей.</p></div><div class="army-crest">⚔️</div></div><div class="army-metrics"><span>Воинов<b>'+data.army+' / 30</b></span><span>Боевой дух<b>'+data.morale+'%</b></span><span>Сила войска<b>'+Math.floor(data.army*(.65+data.morale/200))+'</b></span></div><div class="troop-roster">'+troopCards+'</div><div class="general-roster"><div class="subhead"><b>Полководцы</b><button type="button" data-general="hire" '+(data.generals.length>=3||data.treasury<35||data.influence<10?'disabled':'')+'>Нанять генерала · 35 🪙 · 10 влияния</button></div>'+(generalCards||'<small>У короны пока нет назначенных полководцев.</small>')+'</div><div class="garrison-roster"><div class="subhead"><b>Гарнизоны провинций</b><small>Размещённые воины не участвуют в походах</small></div>'+(garrisonCards||'<small>Сначала присоедините новые земли.</small>')+'</div>'+(data.siege?'<div class="siege-active"><b>⚔️ Идёт осада: '+byId[data.siege.target].name+'</b><span>До штурма: '+data.siege.months+' мес. · В походе '+data.siege.startedWith+' воинов</span></div>':'<div class="siege-targets"><small>ЦЕЛИ ДЛЯ ВОЕННОГО ПОХОДА</small>'+provinces.filter(q=>q.rival&&!isOwned(q.id)).map(q=>'<div class="siege-target"><span>'+q.icon+' '+q.name+' <small>Держава: '+q.rival+'</small></span><button type="button" data-siege="'+q.id+'" '+(!isKnown(q.id)||data.army<5||data.treasury<20||data.influence<8?'disabled':'')+'>Начать осаду</button></div>').join('')+'</div>')+(data.warLog.length?'<div class="war-chronicle">'+data.warLog.map(x=>'<p>'+x+'</p>').join('')+'</div>':'')+'</section>';
 root.insertAdjacentHTML('beforeend',military);
 const invasionPanel=data.invasion?'<section class="invasion-panel"><div class="invasion-title"><span>🚨 '+(data.invasion.ready?'ПОЛЕВОЕ СРАЖЕНИЕ':'ПОГРАНИЧНАЯ ТРЕВОГА')+'</span><b>'+rivalInfo[data.invasion.rival].name+'</b></div><h3>'+(data.invasion.ready?'Битва за ':'Вторжение у провинции «')+byId[data.invasion.target].name+(data.invasion.ready?'':'»')+'</h3><p>Вражеская армия: '+data.invasion.power+' силы. '+(data.invasion.ready?'Противник готовит '+({charge:'лобовую атаку',volley:'обстрел',brace:'укреплённую позицию'}[data.invasion.enemyPlan]||'неизвестный манёвр')+'. Выбери построение войск.':'До столкновения остался месяц. '+byId[data.invasion.target].kind+' дают защитникам бонус местности '+Math.round(terrainBonus(byId[data.invasion.target])*100)+'%.')+'</p><div class="invasion-actions">'+(data.invasion.ready?'<button type="button" data-tactic="shieldwall">🛡️ Щитовая стена</button><button type="button" data-tactic="volley">🏹 Залп лучников</button><button type="button" data-tactic="flank">🐎 Кавалерийский фланг</button><button type="button" data-tactic="balanced">⚔️ Смешанный строй</button>':'<span class="battle-countdown">Подготовь гарнизон и армию — до битвы 1 месяц</span>')+'<button type="button" data-invasion="truce" '+(data.treasury<20+Math.ceil(data.invasion.power*.8)||data.influence<6?'disabled':'')+'>Просить перемирие · '+(20+Math.ceil(data.invasion.power*.8))+' 🪙</button></div></section>':'<section class="frontier-panel"><div><small>СОСТОЯНИЕ ГРАНИЦ</small><b>'+(borderTargets().length?'Приграничье под наблюдением':'Границы спокойны')+'</b></div><div class="frontier-rivals">'+Object.entries(rivalInfo).map(([key,r])=>'<span>'+r.icon+' '+r.name+' <b>'+((data.truces[key]||0)>0?'Перемирие · '+data.truces[key]+' мес.':'Сила '+(data.enemyForces[key]||0))+'</b></span>').join('')+'</div><small>Вражеские державы наращивают войска каждый месяц. Возможны вторжения в соседние с их землями провинции.</small></section>';
 root.insertAdjacentHTML('beforeend',invasionPanel);
 root.querySelectorAll('[data-tactic]').forEach(btn=>btn.addEventListener('click',()=>defendBorder(btn.dataset.tactic)));
 root.querySelector('[data-invasion="truce"]')?.addEventListener('click',negotiateTruce);
 root.querySelectorAll('[data-recruit]').forEach(btn=>btn.addEventListener('click',()=>recruit(btn.dataset.recruit)));
 root.querySelector('[data-general="hire"]')?.addEventListener('click',hireGeneral);
 root.querySelectorAll('[data-garrison]').forEach(btn=>btn.addEventListener('click',()=>garrison(btn.dataset.garrison)));
 root.querySelectorAll('[data-recall]').forEach(btn=>btn.addEventListener('click',()=>recallGarrison(btn.dataset.recall)));
 root.querySelectorAll('[data-siege]').forEach(btn=>btn.addEventListener('click',()=>startSiege(btn.dataset.siege)));
root.querySelector('[data-field-deploy]')?.addEventListener('click',deployFieldArmy);
 root.querySelectorAll('[data-field-move]').forEach(btn=>btn.addEventListener('click',()=>orderFieldArmy(Number(btn.dataset.fieldMove),btn.dataset.fieldTarget)));
 root.querySelectorAll('[data-field-disband]').forEach(btn=>btn.addEventListener('click',()=>disbandFieldArmy(Number(btn.dataset.fieldDisband))));
 root.querySelectorAll('[data-province]').forEach(btn=>btn.addEventListener('click',()=>select(btn.dataset.province)));
 root.querySelector('[data-action="scout"]')?.addEventListener('click',()=>scout(p.id));
 root.querySelector('[data-action="claim"]')?.addEventListener('click',()=>claim(p.id));
 root.querySelector('[data-action="reset"]')?.addEventListener('click',()=>{if(confirm('Сбросить только исследование и владения королевства? Город и его сохранение не изменятся.')){data=initial();save();render()}});
}
document.getElementById('nextMonth')?.addEventListener('click',()=>{
 if(data.invasion?.ready){warNote('Сражение ожидает приказа полководца. Выбери тактику обороны.');save();render();return}
 data.months++;
 // WHY: rival forces and truces advance with the kingdom month, while invasions are announced before battle.
 Object.keys(data.truces).forEach(key=>data.truces[key]=Math.max(0,(data.truces[key]||0)-1));
 Object.keys(data.enemyForces).forEach(key=>data.enemyForces[key]=Math.min(40,(data.enemyForces[key]||0)+1));
 if(data.invasion&&!data.invasion.ready){data.invasion.months--;if(data.invasion.months<=0){data.invasion.ready=true;warNote('Войска противника подошли к рубежу. Выбери тактику и начни сражение.')}}else if(!data.invasion)prepareInvasion();
 resolveSiegeMonth();
 advanceFieldArmies();
 const income=data.owned.reduce((sum,id)=>sum+(byId[id]?.gold||0),0);
 const influence=data.owned.reduce((sum,id)=>sum+(byId[id]?.influence||0),0);
 data.treasury+=income;data.influence+=influence;save();render();
});
render();
})();