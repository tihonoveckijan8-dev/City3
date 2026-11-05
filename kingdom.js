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
const initial=()=>({owned:['eldoria'],discovered:['eldoria','oldroad','silverford','ironpeak','riverlands','southmeadow'],selected:'eldoria',treasury:55,influence:24,months:0,claimed:0,army:0,morale:80,siege:null,capitalSiege:null,defeatedRivals:[],vassalStates:{},dynasty:{ruler:'Альдрен I',rulerAge:34,spouse:null,marriedTo:null,marriageMonths:0,heir:null,heirYearProgress:0,yearProgress:0,successions:0,legitimacy:72},warLog:[]});
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
// WHY: phased sieges add logistics without invalidating saves created by the older three-month siege.
if(data.siege){data.siege.phase=['encirclement','bombardment','assault'].includes(data.siege.phase)?data.siege.phase:(data.siege.months>=3?'encirclement':data.siege.months===2?'bombardment':'assault');data.siege.supply=Number.isFinite(data.siege.supply)?Math.max(0,Math.min(100,data.siege.supply)):100;data.siege.reinforcements=Number.isFinite(data.siege.reinforcements)?data.siege.reinforcements:0;}
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
// WHY: hostile detachments persist independently so frontier pressure survives reloads.
data.enemyArmies=Array.isArray(data.enemyArmies)?data.enemyArmies:[];
data.nextEnemyArmyId=Number.isFinite(data.nextEnemyArmyId)?data.nextEnemyArmyId:1;
// WHY: capital campaigns persist independently and migrate older kingdom saves safely.
data.defeatedRivals=Array.isArray(data.defeatedRivals)?data.defeatedRivals:[];
// WHY: vassal records are stored separately so the legacy defeatedRivals string array remains compatible.
data.vassalStates=data.vassalStates&&typeof data.vassalStates==='object'?data.vassalStates:{};
data.defeatedRivals.forEach(key=>{if(['ashford','silver'].includes(key)&&!data.vassalStates[key])data.vassalStates[key]={policy:'balanced',loyalty:70,unrest:10,rebellion:false,months:0}});
Object.entries(data.vassalStates).forEach(([key,v])=>{if(!['ashford','silver'].includes(key)||!v||typeof v!=='object'){delete data.vassalStates[key];return}v.policy=['high','autonomy'].includes(v.policy)?v.policy:'balanced';v.loyalty=Number.isFinite(v.loyalty)?Math.max(0,Math.min(100,v.loyalty)):70;v.unrest=Number.isFinite(v.unrest)?Math.max(0,Math.min(100,v.unrest)):10;v.rebellion=!!v.rebellion;v.months=Number.isFinite(v.months)?Math.max(0,v.months):0});
// WHY: court politics are migrated independently so existing kingdom saves keep every province, army and dynasty record.
data.court=data.court&&typeof data.court==='object'?data.court:{};
const courtDefaults={stability:68,plotRisk:12,plot:null,council:{marshal:'Сэр Эдрик Железный',treasurer:'Леди Мирена',chancellor:'Архивариус Тарен',spymaster:'Шепчущий Ворон'},months:0};
Object.entries(courtDefaults).forEach(([key,value])=>{if(data.court[key]===undefined)data.court[key]=value});
data.court.stability=Number.isFinite(data.court.stability)?Math.max(0,Math.min(100,data.court.stability)):68;
data.court.plotRisk=Number.isFinite(data.court.plotRisk)?Math.max(0,Math.min(100,data.court.plotRisk)):12;
data.court.months=Number.isFinite(data.court.months)?Math.max(0,data.court.months):0;
data.court.plot=data.court.plot&&typeof data.court.plot==='object'?data.court.plot:null;
data.court.council=data.court.council&&typeof data.court.council==='object'?data.court.council:{...courtDefaults.council};
Object.entries(courtDefaults.council).forEach(([key,value])=>{if(typeof data.court.council[key]!=='string')data.court.council[key]=value});
// WHY: the royal house has its own migration so dynasty features never reset territorial or military progress.
data.dynasty=data.dynasty&&typeof data.dynasty==='object'?data.dynasty:{};
const royalDefaults={ruler:'Альдрен I',rulerAge:34,spouse:null,marriedTo:null,marriageMonths:0,heir:null,heirYearProgress:0,yearProgress:0,successions:0,legitimacy:72};
Object.entries(royalDefaults).forEach(([key,value])=>{if(data.dynasty[key]===undefined)data.dynasty[key]=value});
data.dynasty.ruler=typeof data.dynasty.ruler==='string'?data.dynasty.ruler:royalDefaults.ruler;data.dynasty.rulerAge=Number.isFinite(data.dynasty.rulerAge)?Math.max(16,data.dynasty.rulerAge):34;data.dynasty.spouse=typeof data.dynasty.spouse==='string'?data.dynasty.spouse:null;data.dynasty.marriedTo=['ashford','silver'].includes(data.dynasty.marriedTo)?data.dynasty.marriedTo:null;data.dynasty.marriageMonths=Number.isFinite(data.dynasty.marriageMonths)?Math.max(0,data.dynasty.marriageMonths):0;data.dynasty.heir=data.dynasty.heir&&typeof data.dynasty.heir.name==='string'?{name:data.dynasty.heir.name,age:Math.max(0,Number(data.dynasty.heir.age)||0)}:null;data.dynasty.heirYearProgress=Number.isFinite(data.dynasty.heirYearProgress)?Math.max(0,data.dynasty.heirYearProgress):0;data.dynasty.yearProgress=Number.isFinite(data.dynasty.yearProgress)?Math.max(0,data.dynasty.yearProgress):0;data.dynasty.successions=Number.isFinite(data.dynasty.successions)?Math.max(0,data.dynasty.successions):0;data.dynasty.legitimacy=Number.isFinite(data.dynasty.legitimacy)?Math.max(0,Math.min(100,data.dynasty.legitimacy)):72;
data.capitalSiege=data.capitalSiege&&['ashford','silver'].includes(data.capitalSiege.rival)?data.capitalSiege:null;
if(data.capitalSiege){data.capitalSiege.months=Number.isFinite(data.capitalSiege.months)?Math.max(1,data.capitalSiege.months):2;data.capitalSiege.supply=Number.isFinite(data.capitalSiege.supply)?Math.max(0,Math.min(100,data.capitalSiege.supply)):100;data.capitalSiege.phase=['encirclement','bombardment','assault'].includes(data.capitalSiege.phase)?data.capitalSiege.phase:'encirclement'}
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
function siegeBlockade(siege){const p=byId[siege.target];return p?p.links.filter(id=>isOwned(id)).length:0}
function startSiege(id){const p=byId[id];if(!p||!p.rival||isOwned(id)||!isKnown(id)||data.siege||data.capitalSiege||data.army<5||data.treasury<20||data.influence<8)return;data.treasury-=20;data.influence-=8;data.siege={target:id,months:3,startedWith:data.army,phase:'encirclement',supply:100,reinforcements:0};data.morale=Math.max(0,data.morale-3);warNote('Армия Эльдории выступила к провинции «'+p.name+'». Началось окружение: перекрываются дороги и подвоз припасов.');save();render()}
// WHY: reinforcements are recruited into the active expedition only through an explicit, paid order.
function reinforceSiege(){const s=data.siege;if(!s||s.phase==='assault'||data.army>27||data.treasury<18||data.influence<3)return;data.treasury-=18;data.influence-=3;data.troops.infantry+=2;data.army+=2;s.startedWith+=2;s.reinforcements+=2;warNote('К осадному лагерю прибыли два мечника из королевского резерва.');save();render()}
function resolveSiegeMonth(){if(!data.siege)return;const s=data.siege,p=byId[s.target];if(!p){data.siege=null;return}const blockade=siegeBlockade(s);s.supply=Math.max(0,s.supply-(blockade>=2?8:blockade===1?14:22));s.months--;data.morale=Math.max(0,data.morale-(s.supply<35?4:2));if(s.months>0){s.phase=s.months===2?'bombardment':'assault';const phaseName={bombardment:'обстрел укреплений',assault:'подготовка решающего штурма'}[s.phase];warNote('Осада «'+p.name+'»: '+phaseName+'. Снабжение лагеря: '+s.supply+'%. До штурма '+s.months+' мес.');return}const typedPower=Object.entries(data.troops).reduce((sum,[type,count])=>sum+count*(unitTypes[type]?.power||1),0);const generalBonus=data.generals.reduce((sum,g)=>sum+g.command,0);const supplyFactor=s.supply<20?.62:s.supply<45?.78:1;const blockadeBonus=Math.min(3,blockade)*1.4;const force=(typedPower*(.65+data.morale/200)+generalBonus)*supplyFactor+blockadeBonus,defense=(p.id==='coast'?11:8)+(data.enemyForces[p.rival==='Эшфорд'?'ashford':'silver']||0)*.25;if(force>=defense){const losses=Math.min(data.army,Math.max(1,Math.floor(data.army*.2)));data.army-=losses;let left=losses;for(const type of ['infantry','spearmen','archers','cavalry']){const take=Math.min(data.troops[type],left);data.troops[type]-=take;left-=take;}data.owned.push(p.id);data.claimed++;data.treasury+=18;data.influence+=5;data.morale=Math.min(100,data.morale+14);warNote('Победа! «'+p.name+'» присоединена. Потери: '+losses+' воинов. '+(blockade>=2?'Полное окружение помогло сломить оборону. ':'')+'Казна получила 18 золотых.')}else{const losses=Math.min(data.army,Math.max(2,Math.ceil(data.army*(s.supply<20?.55:.45))));data.army-=losses;let left=losses;for(const type of ['infantry','spearmen','archers','cavalry']){const take=Math.min(data.troops[type],left);data.troops[type]-=take;left-=take;}data.morale=Math.max(15,data.morale-18);warNote('Штурм «'+p.name+'» отбит. Потери: '+losses+' воинов. '+(s.supply<20?'Армию подвело истощённое снабжение. ':'')+'Войско отступило.')}data.siege=null}

// WHY: border wars only begin after the player owns a frontier province; early city-building stays peaceful.
const rivalInfo={ashford:{name:'Эшфорд',key:'ashford',icon:'🦅',capital:'Чёрная Цитадель',fortress:17},silver:{name:'Серебряный Берег',key:'silver',icon:'⚓',capital:'Морской Трон',fortress:19}};
function rivalHasFoothold(key){return data.owned.some(id=>byId[id]?.rival===rivalInfo[key]?.name)}
function setVassalPolicy(key,policy){const v=data.vassalStates[key];if(!v||!['balanced','high','autonomy'].includes(policy))return;v.policy=policy;v.unrest=Math.max(0,v.unrest-5);warNote('Установлена политика управления вассалом «'+rivalInfo[key].name+'»: '+({balanced:'умеренная дань',high:'повышенная дань',autonomy:'широкая автономия'}[policy])+'.');save();render()}
function suppressVassalRebellion(key){const v=data.vassalStates[key];if(!v||!v.rebellion||data.treasury<25||data.influence<8)return;data.treasury-=25;data.influence-=8;v.rebellion=false;v.loyalty=Math.max(40,v.loyalty);v.unrest=Math.max(10,v.unrest-35);data.morale=Math.max(0,data.morale-4);warNote('Мятеж в державе '+rivalInfo[key].name+' подавлен. Казна потратила 25 золотых и 8 влияния.');save();render()}
// WHY: appointments trade a small treasury cost for reliable council bonuses and prevent a single court faction from dominating.
const councilCandidates={marshal:['Сэр Эдрик Железный','Лиора Соколиный Взор','Бранн Каменный Щит'],treasurer:['Леди Мирена','Граф Освин','Купец Валериан'],chancellor:['Архивариус Тарен','Магистр Элиан','Лорд Кассиан'],spymaster:['Шепчущий Ворон','Мира Тихая','Серый Лис']};
const councilTitles={marshal:'Маршал',treasurer:'Казначей',chancellor:'Канцлер',spymaster:'Мастер шпионов'};
function appointCouncillor(role){const c=data.court;if(!councilCandidates[role]||data.treasury<5||data.influence<2)return;const list=councilCandidates[role],current=list.indexOf(c.council[role]),next=list[(current+1+list.length)%list.length];c.council[role]=next;data.treasury-=5;data.influence-=2;c.stability=Math.min(100,c.stability+7);c.plotRisk=Math.max(0,c.plotRisk-4);warNote(councilTitles[role]+': назначен советник '+next+'. Двор принял новое решение.');save();render()}
function holdRoyalFeast(){const c=data.court;if(data.treasury<12)return;data.treasury-=12;c.stability=Math.min(100,c.stability+12);c.plotRisk=Math.max(0,c.plotRisk-15);Object.values(data.vassalStates).forEach(v=>{if(!v.rebellion)v.loyalty=Math.min(100,v.loyalty+2)});warNote('Королевский пир объединил знать. Стабильность двора выросла, напряжение уменьшилось.');save();render()}
function investigateCourt(){const c=data.court;if(!c.plot)return;const success=c.stability>=35||data.influence>=8;if(data.influence>=8)data.influence-=8;if(success){c.plot=null;c.plotRisk=Math.max(5,c.plotRisk-35);c.stability=Math.min(100,c.stability+8);warNote('Заговор раскрыт. Заговорщики лишены влияния, порядок при дворе восстановлен.')}else{c.plotRisk=Math.min(100,c.plotRisk+8);warNote('Расследование заговора провалилось. Интриги усилились; укрепи совет и стабильность двора.')}save();render()}
function arrangeRoyalMarriage(key){const d=data.dynasty,v=data.vassalStates[key];if(!v||v.rebellion||!data.defeatedRivals.includes(key)||d.spouse||data.treasury<30||data.influence<10)return;const spouse=key==='ashford'?'Леди Элеонора из дома Эшфорда':'Лорд Марек из дома Серебряного Берега';data.treasury-=30;data.influence-=10;d.spouse=spouse;d.marriedTo=key;d.marriageMonths=0;d.legitimacy=Math.min(100,d.legitimacy+12);v.loyalty=Math.min(100,v.loyalty+18);v.unrest=Math.max(0,v.unrest-18);warNote('Династический брак заключён: '+d.ruler+' и '+spouse+'. Союз укрепил верность дома '+rivalInfo[key].name+'.');save();render()}
function proclaimHeir(){const d=data.dynasty;if(!d.heir||d.heir.age<16)return;const old=d.ruler;d.ruler=d.heir.name;d.rulerAge=d.heir.age;d.heir=null;d.spouse=null;d.marriedTo=null;d.marriageMonths=0;d.heirYearProgress=0;d.successions++;d.legitimacy=Math.max(45,d.legitimacy-8);warNote('КОРОНАЦИЯ! '+old+' передал корону '+d.ruler+'. Началось новое правление династии.');save();render()}
function startCapitalSiege(key){const rival=rivalInfo[key];if(!rival||data.defeatedRivals.includes(key)||!rivalHasFoothold(key)||data.capitalSiege||data.siege||data.invasion||data.army<8||data.treasury<35||data.influence<12)return;data.treasury-=35;data.influence-=12;data.capitalSiege={rival:key,months:2,phase:'encirclement',supply:100,startedWith:data.army};data.morale=Math.max(0,data.morale-5);warNote('Начат поход на столицу державы '+rival.name+'. Впереди осада '+rival.capital+'.');save();render()}
function resolveCapitalSiegeMonth(){const s=data.capitalSiege;if(!s)return;const rival=rivalInfo[s.rival];if(!rival){data.capitalSiege=null;return}s.supply=Math.max(0,s.supply-25);s.months--;data.morale=Math.max(0,data.morale-(s.supply<30?5:3));if(s.months>0){s.phase='bombardment';warNote('Осада столицы «'+rival.capital+'»: артиллерия разрушает укрепления. Снабжение: '+s.supply+'%.');return}s.phase='assault';const typed=Object.entries(data.troops).reduce((sum,[type,count])=>sum+count*(unitTypes[type]?.power||1),0),command=data.generals.reduce((sum,g)=>sum+g.command,0),supply=s.supply<20?.6:s.supply<45?.8:1,defense=rival.fortress+(data.enemyForces[s.rival]||0)*.35,attack=(typed*(.65+data.morale/200)+command)*supply;if(attack>=defense){const losses=Math.min(data.army,Math.max(2,Math.floor(data.army*.25)));data.army-=losses;let left=losses;for(const type of ['infantry','spearmen','archers','cavalry']){const take=Math.min(data.troops[type],left);data.troops[type]-=take;left-=take;}data.defeatedRivals.push(s.rival);data.vassalStates[s.rival]={policy:'balanced',loyalty:72,unrest:8,rebellion:false,months:0};data.enemyForces[s.rival]=0;data.truces[s.rival]=0;data.enemyArmies=data.enemyArmies.filter(a=>a.rival!==s.rival);data.morale=Math.min(100,data.morale+18);data.treasury+=45;data.influence+=15;warNote('СТОЛИЦА ПАЛА! '+rival.capital+' захвачена. Держава '+rival.name+' капитулировала и больше не угрожает границам. Потери: '+losses+'. Награда: 45 золотых и 15 влияния.')}else{const losses=Math.min(data.army,Math.max(3,Math.ceil(data.army*.4)));data.army-=losses;let left=losses;for(const type of ['infantry','spearmen','archers','cavalry']){const take=Math.min(data.troops[type],left);data.troops[type]-=take;left-=take;}data.morale=Math.max(10,data.morale-20);warNote('Штурм столицы «'+rival.capital+'» провалился. Потери: '+losses+' воинов. Армия отступила для восстановления.')}data.capitalSiege=null}

function fieldPower(army){return Object.entries(army.troops||{}).reduce((sum,[type,count])=>sum+count*(unitTypes[type]?.power||1),0)}
function deployFieldArmy(){
 const p=byId[data.selected];if(!p||!isOwned(p.id)||data.army<5)return;
 const troops={infantry:0,spearmen:0,archers:0,cavalry:0};let left=5;
 for(const type of ['spearmen','infantry','archers','cavalry']){const take=Math.min(data.troops[type],left);troops[type]=take;data.troops[type]-=take;left-=take}
 if(left)return;
 data.army-=5;
 data.fieldArmies.push({id:data.nextFieldArmyId++,location:p.id,target:null,troops,morale:data.morale});
 warNote('Отряд из пяти воинов сформирован в провинции «'+p.name+'».');
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
 const enemy=data.enemyArmies.find(a=>a.location===target);
 if(enemy&&!fieldEncounter(army,enemy,target))return;
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

function fieldEncounter(playerArmy,enemyArmy,provinceId){
 const playerPower=fieldPower(playerArmy)*(0.9+(playerArmy.morale||70)/300);
 const enemyPower=enemyArmy.power||7;
 if(playerPower>=enemyPower){
  let casualtyTaken=false;
  for(const type of ['infantry','spearmen','archers','cavalry'])if(playerArmy.troops[type]>0&&!casualtyTaken){playerArmy.troops[type]--;casualtyTaken=true}
  if(!Object.values(playerArmy.troops).some(n=>n>0))data.fieldArmies=data.fieldArmies.filter(a=>a.id!==playerArmy.id);
  data.enemyArmies=data.enemyArmies.filter(a=>a.id!==enemyArmy.id);
  warNote('Перехват у «'+byId[provinceId].name+'»: отряд №'+playerArmy.id+' разбил войско '+rivalInfo[enemyArmy.rival].name+'.');
  data.enemyForces[enemyArmy.rival]=Math.max(3,(data.enemyForces[enemyArmy.rival]||10)-3);
  data.treasury+=5;data.morale=Math.min(100,data.morale+3);
  return data.fieldArmies.some(a=>a.id===playerArmy.id);
 }
 const survivors={};
 Object.entries(playerArmy.troops).forEach(([type,count])=>{survivors[type]=Math.floor(count*.35);data.troops[type]+=survivors[type];data.army+=survivors[type]});
 data.fieldArmies=data.fieldArmies.filter(a=>a.id!==playerArmy.id);
 enemyArmy.power=Math.max(2,enemyPower-Math.max(1,Math.floor(playerPower*.2)));
 warNote('Перехват у «'+byId[provinceId].name+'» не удался. Отряд №'+playerArmy.id+' разбит; остатки вернулись в резерв.');
 return false;
}
function routeBetween(start,goal){
 const queue=[start],previous={[start]:null};
 while(queue.length){
  const current=queue.shift();if(current===goal)break;
  (byId[current]?.links||[]).forEach(next=>{if(previous[next]===undefined){previous[next]=current;queue.push(next)}});
 }
 if(previous[goal]===undefined)return [];
 const path=[];let at=goal;
 while(at!==start){path.unshift(at);at=previous[at]}
 return path;
}
function spawnEnemyArmy(){
 if(data.invasion||data.enemyArmies.length>=2||data.months%3!==0)return;
 const candidates=provinces.filter(p=>p.rival&&!isOwned(p.id)&&!data.defeatedRivals.includes(p.rival==='Эшфорд'?'ashford':'silver')&&p.links.some(isOwned));
 const available=candidates.filter(p=>{
  const key=p.rival==='Эшфорд'?'ashford':'silver';
  return !data.defeatedRivals.includes(key)&&(data.truces[key]||0)<=0&&!data.enemyArmies.some(a=>a.rival===key);
 });
 if(!available.length)return;
 const p=available[Math.floor(Math.random()*available.length)];
 const key=p.rival==='Эшфорд'?'ashford':'silver';
 const power=Math.max(6,Math.round(4+(data.enemyForces[key]||10)*.42));
 const army={id:data.nextEnemyArmyId++,rival:key,location:p.id,power,target:null,plan:['charge','volley','brace'][Math.floor(Math.random()*3)]};
 data.enemyArmies.push(army);
 warNote('Разведка обнаружила полевой отряд державы '+rivalInfo[key].name+' у провинции «'+p.name+'». Сила врага: '+power+'.');
}
function enemyTarget(army){
 const candidates=data.owned.filter(id=>provinces.some(p=>p.id===id&&p.links.includes(army.location)));
 if(candidates.length)return candidates[0];
 return data.owned.map(id=>({id,path:routeBetween(army.location,id)})).filter(x=>x.path.length).sort((a,b)=>a.path.length-b.path.length)[0]?.id||null;
}
function advanceEnemyArmies(){
 if(data.invasion)return;
 data.enemyArmies.slice().forEach(enemy=>{
  if(!data.enemyArmies.some(a=>a.id===enemy.id))return;
  if(!enemy.target||!isOwned(enemy.target))enemy.target=enemyTarget(enemy);
  if(!enemy.target)return;
  const route=routeBetween(enemy.location,enemy.target);if(!route.length)return;
  const next=route[0],interceptor=data.fieldArmies.find(a=>a.location===next);
  if(interceptor){
   const survived=fieldEncounter(interceptor,enemy,next);
   if(!survived&&data.enemyArmies.some(a=>a.id===enemy.id))warNote('Вражеское войско продолжает марш после победы над перехватчиками.');
   if(!data.enemyArmies.some(a=>a.id===enemy.id))return;
  }
  enemy.location=next;
  if(isOwned(next)){
   data.invasion={target:next,rival:enemy.rival,power:enemy.power,months:0,ready:true,enemyPlan:enemy.plan,enemyArmyId:enemy.id};
   warNote('Войско '+rivalInfo[enemy.rival].name+' достигло «'+byId[next].name+'». Реши судьбу провинции в полевом сражении!');
  }else warNote('Вражеский отряд '+rivalInfo[enemy.rival].name+' продвинулся к «'+byId[next].name+'».');
 });
}
function borderTargets(){
 return data.owned.map(id=>byId[id]).filter(q=>q&&q.links.some(link=>byId[link]?.rival&&!data.defeatedRivals.includes(byId[link].rival==='Эшфорд'?'ashford':'silver')&&!isOwned(link)));
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
  return !data.defeatedRivals.includes(key)&&(data.truces[key]||0)<=0;
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
 if(!p||!isOwned(p.id)){if(event.enemyArmyId)data.enemyArmies=data.enemyArmies.filter(a=>a.id!==event.enemyArmyId);data.invasion=null;return}
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
 if(event.enemyArmyId)data.enemyArmies=data.enemyArmies.filter(a=>a.id!==event.enemyArmyId);
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
 if(e.enemyArmyId)data.enemyArmies=data.enemyArmies.filter(a=>a.id!==e.enemyArmyId);
 data.invasion=null;save();render();
}
function render(){
 const p=byId[data.selected]||byId.eldoria;
 const map=provinces.map(q=>{
  const owned=isOwned(q.id),known=isKnown(q.id),selected=q.id===p.id;
  const stationed=data.fieldArmies.filter(a=>a.location===q.id);
  const hostile=data.enemyArmies.filter(a=>a.location===q.id);
  return '<button type="button" class="province '+(owned?'owned':known?'known':'fog')+(selected?' selected':'')+(stationed.length?' has-field-army':'')+'" style="--gx:'+q.x+';--gy:'+q.y+'" data-province="'+q.id+'" aria-label="'+(known?q.name:'Неизведанная земля')+'"><span class="province-icon">'+(known?q.icon:'?')+'</span><span class="province-name">'+(owned?q.name:known?q.name:'Туман войны')+'</span>'+(stationed.length?'<span class="field-army-pin">⚔ '+stationed.length+'</span>':'')+(hostile.length?'<span class="enemy-army-pin">☠ '+hostile.length+'</span>':'')+(owned?'<i>ВЛАДЕНИЕ</i>':known?'<i>ОТКРЫТО</i>':'<i>НЕИЗВЕДАНО</i>')+'</button>';
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
 const capitalPanel='<section class="capital-campaign"><div class="capital-heading"><small>СТОЛИЦЫ СОСЕДНИХ ДЕРЖАВ</small><b>Последний рубеж войны</b></div>'+(data.capitalSiege?'<div class="capital-active"><b>🏰 Осада: '+rivalInfo[data.capitalSiege.rival].capital+'</b><span>Держава: '+rivalInfo[data.capitalSiege.rival].name+' · Фаза: '+({encirclement:'Окружение',bombardment:'Обстрел',assault:'Штурм'}[data.capitalSiege.phase]||'Окружение')+' · До штурма: '+data.capitalSiege.months+' мес.</span><span>Снабжение осадного лагеря: '+data.capitalSiege.supply+'%</span><div class="capital-supply"><i style="width:'+data.capitalSiege.supply+'%"></i></div></div>':Object.entries(rivalInfo).map(([key,r])=>'<div class="capital-row"><span>'+r.icon+' <b>'+r.name+'</b><small>Столица: '+r.capital+' · Крепость '+r.fortress+'</small></span>'+(data.defeatedRivals.includes(key)?'<strong class="capital-defeated">СТОЛИЦА ЗАХВАЧЕНА</strong>':rivalHasFoothold(key)?'<button type="button" data-capital-siege="'+key+'" '+(data.army<8||data.treasury<35||data.influence<12||data.siege?'disabled':'')+'>Начать осаду · 35 🪙 · 12 влияния</button>':'<small class="capital-locked">Сначала захватите приграничную провинцию</small>')+'</div>').join(''))+'</section>';
  root.insertAdjacentHTML('beforeend',capitalPanel);
  const vassalEntries=Object.entries(data.vassalStates).filter(([key])=>data.defeatedRivals.includes(key));
  const vassalPanel='<section class="vassal-council"><div class="vassal-heading"><div><small>КОРОЛЕВСКАЯ ИМПЕРИЯ</small><h3>'+ (vassalEntries.length===2?'Империя Эльдории':'Покорённые державы') +'</h3><p>Управляй данью и верностью вассалов. Жёсткая власть приносит больше золота, но приближает мятеж.</p></div><b class="vassal-count">'+vassalEntries.length+' / 2</b></div>'+(vassalEntries.length?vassalEntries.map(([key,v])=>{const r=rivalInfo[key],tribute=v.policy==='high'?9:v.policy==='autonomy'?2:5;return '<article class="vassal-card"><div class="vassal-card-head"><span>'+r.icon+' <b>'+r.name+'</b><small>'+r.capital+' · '+(v.rebellion?'ВОССТАНИЕ': 'ВАССАЛЬНОЕ ГОСУДАРСТВО')+'</small></span><strong>'+v.loyalty+'%<small>лояльность</small></strong></div><div class="vassal-bars"><span><i style="width:'+v.loyalty+'%"></i></span><small>Неспокойствие: '+v.unrest+'%</small></div><div class="vassal-policy"><button type="button" data-vassal-policy="balanced" data-vassal="'+key+'" class="'+(v.policy==='balanced'?'active':'')+'">Умеренная дань · 5 🪙</button><button type="button" data-vassal-policy="high" data-vassal="'+key+'" class="'+(v.policy==='high'?'active':'')+'">Высокая дань · 9 🪙</button><button type="button" data-vassal-policy="autonomy" data-vassal="'+key+'" class="'+(v.policy==='autonomy'?'active':'')+'">Автономия · 2 🪙</button></div><div class="vassal-foot"><span>Дань в месяц: <b>'+(v.rebellion?'приостановлена':tribute+' 🪙')+'</b></span>'+(v.rebellion?'<button type="button" data-vassal-suppress="'+key+'" '+(data.treasury<25||data.influence<8?'disabled':'')+'>Подавить восстание · 25 🪙 · 8 влияния</button>':'<small>'+(v.loyalty<30?'Опасность мятежа':v.loyalty<55?'Верность нестабильна':'Порядок в державе')+'</small>')+'</div></article>'}).join(''):'<p class="vassal-empty">Пока нет покорённых держав. Захвати столицу соседа, чтобы получить вассала.</p>')+'<div class="empire-progress"><span>Путь к империи</span><b>'+vassalEntries.length+' из 2 держав под короной</b><i><em style="width:'+(vassalEntries.length*50)+'%"></em></i></div></section>';
  root.insertAdjacentHTML('beforeend',vassalPanel);
  root.querySelectorAll('[data-vassal-policy]').forEach(btn=>btn.addEventListener('click',()=>setVassalPolicy(btn.dataset.vassal,btn.dataset.vassalPolicy)));
  root.querySelectorAll('[data-vassal-suppress]').forEach(btn=>btn.addEventListener('click',()=>suppressVassalRebellion(btn.dataset.vassal)));
  const dynasty=data.dynasty,marriageOptions=vassalEntries.filter(([key,v])=>!dynasty.spouse&&!v.rebellion).map(([key])=>'<button type="button" data-royal-marriage="'+key+'" '+(data.treasury<30||data.influence<10?'disabled':'')+'>Брак с домом '+rivalInfo[key].name+' · 30 🪙 · 10 влияния</button>').join('');
  const dynastyPanel='<section class="dynasty-court"><div class="dynasty-top"><div><small>КОРОЛЕВСКИЙ ДОМ</small><h3>Династия Эльдории</h3><p>Кровные союзы укрепляют вассальные дома. Взрослый наследник может принять корону.</p></div><div class="dynasty-seal">♛</div></div><div class="dynasty-line"><article class="royal-person ruler-person"><small>МОНАРХ · '+(dynasty.successions+1)+'-Е ПРАВЛЕНИЕ</small><b>'+dynasty.ruler+'</b><span>'+dynasty.rulerAge+' лет · легитимность '+dynasty.legitimacy+'%</span></article><div class="dynasty-link">✦</div><article class="royal-person '+(dynasty.heir?'heir-person':'empty-heir')+'"><small>НАСЛЕДНИК ПРЕСТОЛА</small><b>'+(dynasty.heir?dynasty.heir.name:'Пока не рождён')+'</b><span>'+(dynasty.heir?dynasty.heir.age+' лет · '+(dynasty.heir.age>=16?'готов к коронации':'до совершеннолетия '+(16-dynasty.heir.age)+' лет'):(dynasty.spouse?'Ожидается появление наследника':'Заключи династический брак'))+'</span></article></div>'+(dynasty.spouse?'<div class="royal-marriage">💍 '+dynasty.spouse+'<small>Союз с домом '+rivalInfo[dynasty.marriedTo]?.name+' · '+dynasty.marriageMonths+' мес.</small></div>':(marriageOptions?'<div class="royal-marriage-options"><b>Заключить королевский брак</b>'+marriageOptions+'</div>':'<div class="royal-marriage"><small>Для династического брака сначала покори одну из соседних держав.</small></div>'))+(dynasty.heir&&dynasty.heir.age>=16?'<button type="button" class="succession-button" data-proclaim-heir>Передать корону наследнику</button>':'')+'<div class="dynasty-foot"><span>Легитимность династии</span><b>'+dynasty.legitimacy+'%</b><i><em style="width:'+dynasty.legitimacy+'%"></em></i><small>Каждый год наследник взрослеет. С 16 лет он может принять престол.</small></div></section>';
  root.insertAdjacentHTML('beforeend',dynastyPanel);
  const court=data.court,councilRows=Object.entries(councilTitles).map(([role,label])=>'<div class="court-councillor"><span><small>'+label.toUpperCase()+'</small><b>'+court.council[role]+'</b></span><button type="button" data-council="'+role+'" '+(data.treasury<5||data.influence<2?'disabled':'')+'>Сменить · 5 🪙 · 2 влияния</button></div>').join('');
  const courtPanel='<section class="court-politics"><div class="court-heading"><div><small>ВНУТРЕННЯЯ ПОЛИТИКА</small><h3>Королевский совет</h3><p>Назначай доверенных людей, удерживай знать в равновесии и следи за придворными фракциями.</p></div><div class="court-seal">⚜</div></div><div class="court-stats"><span>Стабильность двора<b>'+court.stability+'%</b></span><span>Риск интриг<b>'+court.plotRisk+'%</b></span></div><div class="court-meter"><i><em style="width:'+court.stability+'%"></em></i><i class="risk"><em style="width:'+court.plotRisk+'%"></em></i></div><div class="court-council-list">'+councilRows+'</div><div class="court-actions"><button type="button" data-court-feast '+(data.treasury<12?'disabled':'')+'>Устроить королевский пир · 12 🪙</button>'+(court.plot?'<button type="button" data-court-investigate>Раскрыть заговор · 8 влияния</button>':'<small>При дворе пока нет раскрытых заговоров.</small>')+'</div>'+(court.plot?'<div class="court-plot"><b>⚠ '+court.plot.title+'</b><span>'+court.plot.description+'</span><small>Обнаружено '+court.plot.months+' мес. назад. Расследуй, пока заговорщики не укрепились.</small></div>':'<div class="court-status">'+(court.plotRisk>=60?'В воздухе сгущаются интриги. Совет нуждается во внимании.':court.stability>=70?'Двор сохраняет спокойствие и доверяет короне.':'Двору требуется внимание монарха.')+'</div>')+'</section>';
  root.insertAdjacentHTML('beforeend',courtPanel);
  root.querySelectorAll('[data-council]').forEach(btn=>btn.addEventListener('click',()=>appointCouncillor(btn.dataset.council)));
  root.querySelector('[data-court-feast]')?.addEventListener('click',holdRoyalFeast);
  root.querySelector('[data-court-investigate]')?.addEventListener('click',investigateCourt);
  root.querySelectorAll('[data-royal-marriage]').forEach(btn=>btn.addEventListener('click',()=>arrangeRoyalMarriage(btn.dataset.royalMarriage)));
  root.querySelector('[data-proclaim-heir]')?.addEventListener('click',proclaimHeir);
  root.querySelectorAll('[data-capital-siege]').forEach(btn=>btn.addEventListener('click',()=>startCapitalSiege(btn.dataset.capitalSiege)));
  const military='<section class="army-command"><div class="army-heading"><div><small>КОРОЛЕВСКОЕ ВОЙСКО</small><h3>Армия Эльдории</h3><p>Собирай дружину, укрепляй боевой дух и веди осады чужих крепостей.</p></div><div class="army-crest">⚔️</div></div><div class="army-metrics"><span>Воинов<b>'+data.army+' / 30</b></span><span>Боевой дух<b>'+data.morale+'%</b></span><span>Сила войска<b>'+Math.floor(data.army*(.65+data.morale/200))+'</b></span></div><div class="troop-roster">'+troopCards+'</div><div class="general-roster"><div class="subhead"><b>Полководцы</b><button type="button" data-general="hire" '+(data.generals.length>=3||data.treasury<35||data.influence<10?'disabled':'')+'>Нанять генерала · 35 🪙 · 10 влияния</button></div>'+(generalCards||'<small>У короны пока нет назначенных полководцев.</small>')+'</div><div class="garrison-roster"><div class="subhead"><b>Гарнизоны провинций</b><small>Размещённые воины не участвуют в походах</small></div>'+(garrisonCards||'<small>Сначала присоедините новые земли.</small>')+'</div>'+(data.siege?'<div class="siege-active"><b>⚔️ Осада: '+byId[data.siege.target].name+'</b><span>Фаза: '+({encirclement:'Окружение',bombardment:'Обстрел укреплений',assault:'Решающий штурм'}[data.siege.phase]||'Окружение')+' · До развязки: '+data.siege.months+' мес.</span><span>Снабжение лагеря: '+data.siege.supply+'% · Соседних владений в кольце: '+siegeBlockade(data.siege)+' · Подкрепления: '+(data.siege.reinforcements||0)+'</span><div class="siege-supply"><i style="width:'+data.siege.supply+'%"></i></div><button type="button" data-siege-reinforce '+(data.siege.phase==='assault'||data.army>27||data.treasury<18||data.influence<3?'disabled':'')+'>Призвать 2 мечников · 18 🪙 · 3 влияния</button></div>':'<div class="siege-targets"><small>ЦЕЛИ ДЛЯ ВОЕННОГО ПОХОДА</small>'+provinces.filter(q=>q.rival&&!isOwned(q.id)).map(q=>'<div class="siege-target"><span>'+q.icon+' '+q.name+' <small>Держава: '+q.rival+'</small></span><button type="button" data-siege="'+q.id+'" '+(!isKnown(q.id)||data.army<5||data.treasury<20||data.influence<8?'disabled':'')+'>Начать осаду</button></div>').join('')+'</div>')+(data.warLog.length?'<div class="war-chronicle">'+data.warLog.map(x=>'<p>'+x+'</p>').join('')+'</div>':'')+'</section>';
 root.insertAdjacentHTML('beforeend',military);
 const enemyArmyPanel='<section class="enemy-armies"><div class="enemy-armies-head"><div><small>ВОЙСКА СОСЕДНИХ ДЕРЖАВ</small><b>Разведка передвижений</b></div><span>'+data.enemyArmies.length+' / 2</span></div>'+(data.enemyArmies.length?data.enemyArmies.map(a=>'<div class="enemy-army-row"><span>☠ '+rivalInfo[a.rival].name+' · '+byId[a.location].name+'</span><b>Сила '+a.power+'</b><small>'+(a.target?'Цель: '+byId[a.target].name:'Ищет путь к границе')+' · '+({charge:'штурм',volley:'обстрел',brace:'строй'}[a.plan]||'манёвр')+'</small></div>').join(''):'<small>Пока вражеские отряды не замечены. Они появляются у открытых границ раз в несколько месяцев.</small>')+'</section>';
 root.insertAdjacentHTML('beforeend',enemyArmyPanel);

 const invasionPanel=data.invasion?'<section class="invasion-panel"><div class="invasion-title"><span>🚨 '+(data.invasion.ready?'ПОЛЕВОЕ СРАЖЕНИЕ':'ПОГРАНИЧНАЯ ТРЕВОГА')+'</span><b>'+rivalInfo[data.invasion.rival].name+'</b></div><h3>'+(data.invasion.ready?'Битва за ':'Вторжение у провинции «')+byId[data.invasion.target].name+(data.invasion.ready?'':'»')+'</h3><p>Вражеская армия: '+data.invasion.power+' силы. '+(data.invasion.ready?'Противник готовит '+({charge:'лобовую атаку',volley:'обстрел',brace:'укреплённую позицию'}[data.invasion.enemyPlan]||'неизвестный манёвр')+'. Выбери построение войск.':'До столкновения остался месяц. '+byId[data.invasion.target].kind+' дают защитникам бонус местности '+Math.round(terrainBonus(byId[data.invasion.target])*100)+'%.')+'</p><div class="invasion-actions">'+(data.invasion.ready?'<button type="button" data-tactic="shieldwall">🛡️ Щитовая стена</button><button type="button" data-tactic="volley">🏹 Залп лучников</button><button type="button" data-tactic="flank">🐎 Кавалерийский фланг</button><button type="button" data-tactic="balanced">⚔️ Смешанный строй</button>':'<span class="battle-countdown">Подготовь гарнизон и армию — до битвы 1 месяц</span>')+'<button type="button" data-invasion="truce" '+(data.treasury<20+Math.ceil(data.invasion.power*.8)||data.influence<6?'disabled':'')+'>Просить перемирие · '+(20+Math.ceil(data.invasion.power*.8))+' 🪙</button></div></section>':'<section class="frontier-panel"><div><small>СОСТОЯНИЕ ГРАНИЦ</small><b>'+(borderTargets().length?'Приграничье под наблюдением':'Границы спокойны')+'</b></div><div class="frontier-rivals">'+Object.entries(rivalInfo).map(([key,r])=>'<span>'+r.icon+' '+r.name+' <b>'+((data.truces[key]||0)>0?'Перемирие · '+data.truces[key]+' мес.':'Сила '+(data.enemyForces[key]||0))+'</b></span>').join('')+'</div><small>Вражеские державы наращивают войска каждый месяц. Возможны вторжения в соседние с их землями провинции.</small></section>';
 root.insertAdjacentHTML('beforeend',invasionPanel);
 root.querySelectorAll('[data-tactic]').forEach(btn=>btn.addEventListener('click',()=>defendBorder(btn.dataset.tactic)));
 root.querySelector('[data-invasion="truce"]')?.addEventListener('click',negotiateTruce);
 root.querySelectorAll('[data-recruit]').forEach(btn=>btn.addEventListener('click',()=>recruit(btn.dataset.recruit)));
 root.querySelector('[data-general="hire"]')?.addEventListener('click',hireGeneral);
 root.querySelectorAll('[data-garrison]').forEach(btn=>btn.addEventListener('click',()=>garrison(btn.dataset.garrison)));
 root.querySelectorAll('[data-recall]').forEach(btn=>btn.addEventListener('click',()=>recallGarrison(btn.dataset.recall)));
 root.querySelectorAll('[data-siege]').forEach(btn=>btn.addEventListener('click',()=>startSiege(btn.dataset.siege)));
 root.querySelector('[data-siege-reinforce]')?.addEventListener('click',reinforceSiege);
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
 // WHY: court pressure advances with kingdom time; a warning appears before a plot can destabilize the realm.
 const court=data.court;court.months++;const councilCount=Object.keys(court.council).filter(k=>court.council[k]).length;
 court.stability=Math.max(0,Math.min(100,court.stability+(councilCount===4?1:0)+(data.dynasty.legitimacy>=70?0.3:-0.5)-(data.vassalStates&&Object.values(data.vassalStates).some(v=>v.rebellion)?3:0)));
 court.plotRisk=Math.max(0,Math.min(100,court.plotRisk+(court.stability<35?5:court.stability<55?2:-1)));
 if(!court.plot&&court.plotRisk>=65){court.plot={title:'Тайный союз недовольных домов',description:'Несколько знатных родов тайно договариваются ограничить власть короны. Укрепи совет или устрой пир, затем проведи расследование.',months:0};warNote('ПРИДВОРНЫЙ ЗАГОВОР! Разведка донесла о тайном союзе недовольных домов. Расследуй интригу.')}
 if(court.plot){court.plot.months++;if(court.plot.months>=3){court.plot=null;court.plotRisk=Math.max(25,court.plotRisk-20);court.stability=Math.max(0,court.stability-12);data.dynasty.legitimacy=Math.max(0,data.dynasty.legitimacy-5);warNote('Заговор достиг цели: знать вынудила корону уступить часть влияния. Легитимность и стабильность двора снизились.')}}

 // WHY: royal ages and heir milestones advance on the same monthly calendar as the kingdom.
 const royal=data.dynasty;royal.yearProgress++;if(royal.yearProgress>=12){royal.yearProgress=0;royal.rulerAge++;}if(royal.spouse&&!royal.heir){royal.marriageMonths++;if(royal.marriageMonths>=12){royal.heir={name:royal.marriedTo==='ashford'?'Принц Леонард':'Принцесса Элиана',age:0};royal.heirYearProgress=0;royal.legitimacy=Math.min(100,royal.legitimacy+8);warNote('В королевском доме родился наследник '+royal.heir.name+'. Династия получила продолжение.')}}else if(royal.heir&&royal.heir.age<16){royal.heirYearProgress++;if(royal.heirYearProgress>=12){royal.heirYearProgress=0;royal.heir.age++;if(royal.heir.age===16)warNote('Наследник '+royal.heir.name+' достиг совершеннолетия. Теперь можно передать ему корону.')}}
 // WHY: vassal tribute and unrest resolve on the same kingdom-month action as province income.
 Object.entries(data.vassalStates).forEach(([key,v])=>{if(!data.defeatedRivals.includes(key))return;v.months++;if(v.rebellion){v.unrest=Math.min(100,v.unrest+4);return}const tribute=v.policy==='high'?9:v.policy==='autonomy'?2:5;data.treasury+=tribute;const loyaltyDelta=v.policy==='high'?-3:v.policy==='autonomy'?3:1;v.loyalty=Math.max(0,Math.min(100,v.loyalty+loyaltyDelta));v.unrest=Math.max(0,Math.min(100,v.unrest+(v.policy==='high'?9:v.policy==='autonomy'?-5:-1)));if(v.loyalty<=15||v.unrest>=90){v.rebellion=true;warNote('ВОССТАНИЕ! Вассалы державы '+rivalInfo[key].name+' подняли мятеж и отказались платить дань. Выбери: подавить восстание или изменить политику управления.')} });
 // WHY: rival forces and truces advance with the kingdom month, while invasions are announced before battle.
 Object.keys(data.truces).forEach(key=>data.truces[key]=Math.max(0,(data.truces[key]||0)-1));
 Object.keys(data.enemyForces).forEach(key=>{if(!data.defeatedRivals.includes(key))data.enemyForces[key]=Math.min(40,(data.enemyForces[key]||0)+1)});
 if(data.invasion&&!data.invasion.ready){data.invasion.months--;if(data.invasion.months<=0){data.invasion.ready=true;warNote('Войска противника подошли к рубежу. Выбери тактику и начни сражение.')}}else if(!data.invasion)prepareInvasion();
 resolveSiegeMonth();
  resolveCapitalSiegeMonth();
 advanceFieldArmies();
 spawnEnemyArmy();
 advanceEnemyArmies();
 const income=data.owned.reduce((sum,id)=>sum+(byId[id]?.gold||0),0);
 const influence=data.owned.reduce((sum,id)=>sum+(byId[id]?.influence||0),0);
 data.treasury+=income;data.influence+=influence;save();render();
});
render();
})();