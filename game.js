(() => {
const $=id=>document.getElementById(id),copy=o=>JSON.parse(JSON.stringify(o));
const initialPeople=[
{name:'Эдрик',job:'Староста',icon:'🧔'},{name:'Мира',job:'Житель',icon:'👩'},
{name:'Томас',job:'Житель',icon:'🧑'},{name:'Элла',job:'Житель',icon:'👩'},
{name:'Бран',job:'Житель',icon:'🧔'},{name:'Лина',job:'Житель',icon:'👩'},
{name:'Роланд',job:'Житель',icon:'🧑'},{name:'Агна',job:'Житель',icon:'👵'}
];
const fresh=()=>({month:1,year:1,season:0,day:1,clock:7*60,tiles:copy(World.initial),resources:{wood:34,stone:20,gold:24,food:34,grain:0,flour:0},population:8,happiness:72,people:copy(initialPeople).map((p,i)=>({...p,id:i+1,home:i<4?31:49,workplace:null,pos:i<4?31:49,route:[],routeIndex:0,desiredTarget:null,status:'resting',walkTicks:0})),selected:null,build:'road',caravan:{months:2,arrived:false},log:['Поселенцы основали лагерь в долине Эльдории.','Староста Эдрик призвал построить дороги и первые мастерские.']});
let state=Save.load()||fresh();
const seasons=['Весна','Лето','Осень','Зима'],names=Object.keys(Buildings),dayNames=['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
state.people=Array.isArray(state.people)?state.people:copy(initialPeople);
state.tiles=state.tiles||copy(World.initial);
// WHY: migrate only the untouched original starter layout; preserve any player-built structures.
if(state.tiles[38]?.type==='road'&&state.tiles[39]?.type==='house'&&state.tiles[40]?.type==='house'&&state.tiles[41]?.type==='road'&&state.tiles[42]?.type==='road'&&state.tiles[43]?.type==='road'){[38,39,40,41,42,43].forEach(id=>delete state.tiles[id]);Object.assign(state.tiles,copy(World.initial))}
state.resources=state.resources||{wood:34,stone:20,gold:24,food:34,grain:0,flour:0};
state.log=state.log||[];state.caravan=state.caravan||{months:2,arrived:false};state.clock=Number.isFinite(state.clock)?state.clock:420;state.day=state.day||1;
state.people.forEach((p,i)=>{p.id=p.id||i+1;p.home=p.home??(i<4?31:49);p.workplace=p.workplace??null;p.pos=p.pos??p.home;p.route=Array.isArray(p.route)?p.route:[];p.routeIndex=p.routeIndex||0;p.desiredTarget=p.desiredTarget??null;p.status=p.status||'resting';p.walkTicks=p.walkTicks||0});
function addLog(s){state.log.unshift(s);state.log=state.log.slice(0,8)}
const tradeGoods={wood:{label:'Древесина',icon:'🪵',base:2},stone:{label:'Камень',icon:'🪨',base:3},food:{label:'Провизия',icon:'🥖',base:2},grain:{label:'Зерно',icon:'🌾',base:2},flour:{label:'Мука',icon:'⚪',base:3}};
function hasMarket(){return Object.values(state.tiles).some(t=>t.type==='market')}
function tradePrice(key,side){const good=tradeGoods[key],stock=state.resources[key]||0;const pressure=Math.max(.65,Math.min(2.1,1.55-stock/90));let price=Math.max(1,Math.round(good.base*pressure));if(state.caravan.arrived)price=Math.max(1,Math.round(price*(side==='buy'?.9:1.15)));return price}
function trade(key,side){if(!hasMarket()){addLog('Для торговли построй рынок и назначь на него торговцев.');render();return}const qty=5,price=tradePrice(key,side),total=price*qty;if(side==='buy'){if(state.resources.gold<total){addLog('Казна пуста: не хватает золота для покупки.');render();return}state.resources.gold-=total;state.resources[key]=(state.resources[key]||0)+qty;addLog('Куплено '+qty+' ед. ресурса «'+tradeGoods[key].label+'» за '+total+' золотых.')}else{if((state.resources[key]||0)<qty){addLog('На складе недостаточно ресурса для продажи.');render();return}state.resources[key]-=qty;state.resources.gold+=total;addLog('Продано '+qty+' ед. ресурса «'+tradeGoods[key].label+'» за '+total+' золотых.')}render()}
function afford(cost){return Object.entries(cost||{}).every(([k,v])=>(state.resources[k]||0)>=v)}
function pay(cost){for(const [k,v] of Object.entries(cost||{}))state.resources[k]-=v}
function housingCount(){return Object.values(state.tiles).reduce((n,t)=>n+(Buildings[t.type]?.housing||0),0)}
function connectedRoads(){return World.roadSet(state.tiles)}
function accessRoads(buildingId,roads){return World.neighbors(buildingId).filter(id=>roads.has(id))}
function roadPath(start,end,roads){
 if(start===end)return [start];
 const queue=[start],previous=new Map([[start,null]]);
 while(queue.length){const here=queue.shift();for(const next of World.neighbors(here)){if(!roads.has(next)||previous.has(next))continue;previous.set(next,here);if(next===end){const path=[end];let at=end;while(previous.get(at)!==null){at=previous.get(at);path.push(at)}return path.reverse()}queue.push(next)}}
 return null;
}
function routeTo(c,target){
 if(target==null||c.pos===target){c.route=[];c.routeIndex=0;c.status='resting';return}
 const roads=connectedRoads(),startIsRoad=roads.has(c.pos),starts=startIsRoad?[c.pos]:accessRoads(c.pos,roads),ends=accessRoads(target,roads);
 let best=null;
 for(const a of starts)for(const b of ends){const p=roadPath(a,b,roads);if(p&&(!best||p.length<best.length))best=p}
 if(!best){c.route=[];c.routeIndex=0;c.status='blocked';return}
 const route=[...(startIsRoad?[]:[c.pos]),...best,target];
 c.route=route.filter((v,i)=>i===0||v!==route[i-1]);c.routeIndex=0;c.status='walking';c.walkTicks=0;
}
function assignJobs(){
 const slots=[];
 for(const [id,t] of Object.entries(state.tiles)){const b=Buildings[t.type];if(b?.jobs&&World.hasAccess(Number(id),state.tiles))for(let n=0;n<b.jobs;n++)slots.push({id:Number(id),name:b.jobTitle||b.name})}
 state.people.forEach((p,i)=>{const slot=slots[i];p.workplace=slot?.id??null;p.job=slot?.name??'Без работы';p.desiredTarget=null;p.route=[];p.routeIndex=0;if(p.pos==null)p.pos=p.home});
}
function desiredFor(c){const h=state.clock/60;if(c.workplace&&h>=8&&h<17)return c.workplace;return c.home}
function updateCitizen(c){
 const target=desiredFor(c);
 if(c.desiredTarget!==target){c.desiredTarget=target;routeTo(c,target)}
 if(c.status==='walking'&&c.route.length){
  c.walkTicks++;
  if(c.walkTicks>=2){
   c.walkTicks=0;c.routeIndex++;
   if(c.routeIndex<c.route.length)c.pos=c.route[c.routeIndex];
   else{c.pos=target;c.route=[];c.routeIndex=0;c.status=target===c.home?'resting':'working'}
  }
 }else if(c.status==='blocked'&&c.desiredTarget!==target)routeTo(c,target);
 else if(c.status!=='blocked')c.status=target===c.home?'resting':'working';
}
function clockText(){const h=Math.floor(state.clock/60)%24,m=state.clock%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')}
function renderMap(){
 const map=$('map'),cells=[];map.innerHTML='';
 for(let i=0;i<World.size*World.size;i++){
  const tile=document.createElement('button'),placed=state.tiles[i],kind=placed?.type||World.terrain[i];
  tile.className='tile '+(placed?(kind==='road'?'road':'building'):kind);tile.type='button';
  tile.title=placed?Buildings[kind].name:({grass:'Луг',forest:'Лес',water:'Вода',rock:'Скалы'}[kind]);
  tile.textContent=placed?Buildings[kind].icon:({grass:'·',forest:'🌲',water:'≈',rock:'◈'}[kind]);
  tile.addEventListener('click',()=>{state.selected=i;build()});map.append(tile);cells[i]=tile;
 }
 state.people.forEach((p,i)=>{const cell=cells[p.pos];if(!cell)return;const dot=document.createElement('span');dot.className='citizen-dot '+(p.status==='walking'?'walking':p.status==='working'?'working':p.status==='blocked'?'blocked':'resting');dot.title=p.name+' · '+p.job;cell.append(dot)});
}
function renderPeople(){ $('people').innerHTML=state.people.map(p=>'<div class="person"><span class="avatar">'+p.icon+'</span><span>'+p.name+'<small>'+p.job+' · <span class="status">'+({walking:'в пути',working:'на работе',resting:'дома',blocked:'нет дороги'}[p.status]||'дома')+'</span></small></span></div>').join('') }
function render(){
 const workers=state.people.filter(p=>p.workplace!==null).length;
 $('dateLabel').textContent=seasons[state.season]+' · Год '+state.year;
 $('clockLabel').textContent=clockText()+' · '+(state.clock<360?'Ночь':state.clock<720?'Утро':state.clock<1080?'День':'Вечер');
 $('stats').innerHTML=[['ЖИТЕЛИ',state.population,'в поселении'],['СЧАСТЬЕ',state.happiness+'%','настроение общины'],['РАБОЧИЕ',workers,'назначены на работу'],['ЖИЛЬЁ',housingCount(),'мест для жителей']].map(x=>'<div class="stat"><span>'+x[0]+'</span><strong>'+x[1]+'</strong><small>'+x[2]+'</small></div>').join('');
 $('resources').innerHTML=[['wood','🪵','Древесина'],['stone','🪨','Камень'],['gold','🪙','Золото'],['food','🥖','Провизия'],['grain','🌾','Зерно'],['flour','⚪','Мука']].map(([k,ic,n])=>'<div class="resource"><span>'+ic+' '+n+'</span><b>'+state.resources[k]+'</b></div>').join('');
 renderPeople();
 const market=$('market');if(market){const available=hasMarket(),caravan=state.caravan.arrived;market.innerHTML='<div class="market-status"><span class="market-emblem">🐎</span><div><b>'+(available?(caravan?'Караван прибыл в Эльдорию':'Рынок открыт'):'Торговля пока недоступна')+'</b><small>'+(available?(caravan?'Гости привезли товары и готовы к обмену':'Следующий караван через '+state.caravan.months+' мес.'):'Построй рынок, чтобы открыть торговлю')+'</small></div></div><div class="trade-list">'+Object.entries(tradeGoods).map(([k,g])=>'<div class="trade-row"><span class="trade-good">'+g.icon+' '+g.label+'<small>5 ед. · '+tradePrice(k,'buy')+' 🪙 купить / '+tradePrice(k,'sell')+' 🪙 продать за ед.</small></span><span class="trade-actions"><button data-trade="buy" data-good="'+k+'" '+(!available?'disabled':'')+'>Купить</button><button data-trade="sell" data-good="'+k+'" '+(!available?'disabled':'')+'>Продать</button></span></div>').join('')+'</div>';market.querySelectorAll('[data-trade]').forEach(btn=>btn.addEventListener('click',()=>trade(btn.dataset.good,btn.dataset.trade)))}
 $('log').innerHTML=state.log.slice(0,5).map((s,i)=>'<div class="log-entry"><time>Запись '+(state.log.length-i)+'</time>'+s+'</div>').join('');
 $('selectionLabel').textContent=state.selected===null?'Выбери клетку для постройки':'Клетка '+(state.selected+1)+' · '+(state.tiles[state.selected]?Buildings[state.tiles[state.selected].type].name:'свободна');
 $('buildHint').textContent='Выбрано: '+Buildings[state.build].name;
 $('buildings').innerHTML=names.map(k=>{const b=Buildings[k],staff=Object.values(state.tiles).filter(t=>t.type===k).reduce((n,t)=>n+state.people.filter(p=>p.workplace===Object.keys(state.tiles).find(id=>state.tiles[id]===t)*1).length,0);return '<button class="building '+(state.build===k?'active':'')+'" data-kind="'+k+'"><span class="emoji">'+b.icon+'</span><b>'+b.name+'</b><small>'+b.desc+'</small><small class="staffing">'+(b.jobs?'Рабочие: '+staff+'/'+(b.jobs*Object.values(state.tiles).filter(t=>t.type===k).length)+' · '+(b.jobTitle||'рабочие'):'Не требует рабочих')+'</small><small class="cost">'+Object.entries(b.cost||{}).map(([r,v])=>({wood:'🪵',stone:'🪨',gold:'🪙'}[r])+v).join(' · ')+'</small></button>'}).join('');
 document.querySelectorAll('.building').forEach(btn=>btn.addEventListener('click',()=>{state.build=btn.dataset.kind;render()}));
 renderMap();Save.write(state);
}
function build(){
 const id=state.selected;if(id===null)return;const b=Buildings[state.build];
 if(!World.canBuild(id,state.build,state.tiles)){addLog('Здесь нельзя построить '+b.name.toLowerCase()+'. Для здания нужна свободная клетка у дороги.');state.selected=null;render();return}
 if(!afford(b.cost)){addLog('Не хватает ресурсов для строительства: '+b.name+'.');state.selected=null;render();return}
 pay(b.cost);state.tiles[id]={type:state.build};state.selected=null;assignJobs();addLog('Построено: '+b.name+'. Жители получили новые рабочие места.');render();
}
function month(){
 const r=state.resources;
 for(const [id,t] of Object.entries(state.tiles)){const b=Buildings[t.type];if(!b)continue;const staffed=state.people.filter(p=>p.workplace===Number(id)).length;if(b.jobs&&!staffed)continue;const ratio=b.jobs?staffed/b.jobs:1;if(b.production)for(const [k,v] of Object.entries(b.production))r[k]+=Math.floor(v*ratio);if(b.recipe){const input=Object.fromEntries(Object.entries(b.recipe.input).map(([k,v])=>[k,Math.max(1,Math.floor(v*ratio))]));const output=Object.fromEntries(Object.entries(b.recipe.output).map(([k,v])=>[k,Math.max(1,Math.floor(v*ratio))]));if(Object.entries(input).every(([k,v])=>r[k]>=v)){for(const [k,v] of Object.entries(input))r[k]-=v;for(const [k,v] of Object.entries(output))r[k]+=v}}}
 const buildingCount=Object.keys(state.tiles).filter(id=>state.tiles[id].type!=='road').length;const tax=Math.floor(state.population/3),upkeep=Math.floor(buildingCount/3);r.gold=Math.max(0,r.gold+tax-upkeep);if(tax||upkeep)addLog('Казна: налоги +'+tax+' 🪙, содержание построек −'+upkeep+' 🪙.');if(state.caravan.arrived){state.caravan.arrived=false;state.caravan.months=3;addLog('Караван покинул Эльдорию. Следующий прибудет через три месяца.')}else{state.caravan.months--;if(state.caravan.months<=0){state.caravan.arrived=true;addLog('К Эльдории прибыл торговый караван! На рынке особые цены.')}}const need=state.population*2,available=r.food;r.food=Math.max(0,available-need);
 if(available<need){state.happiness=Math.max(0,state.happiness-9);addLog('Запасов еды не хватило. Жители голодают, настроение падает.')}else state.happiness=Math.min(100,state.happiness+1);
 if(housingCount()>state.population&&r.food>=state.population){state.population++;const pool=['Илья','София','Марк','Алиса','Грегор','Нора','Феликс','Рада'];const name=pool[(state.people.length*3+state.month)%pool.length];state.people.push({name,job:'Без работы',icon:'🧑',id:state.people.length+1,home:state.people.length%2?31:49,workplace:null,pos:state.people.length%2?31:49,route:[],routeIndex:0,desiredTarget:null,status:'resting',walkTicks:0});assignJobs();addLog('В Эльдорию прибыла новая семья. Население выросло.')}
 state.month++;if(state.month>12){state.month=1;state.year++;state.season=(state.season+1)%4;addLog('Наступил новый год. Эльдория пережила ещё один круг времён.')}else addLog('Прошёл месяц. Мастера трудились, а жители заботились о поселении.');render();
}
function tick(){
 state.clock+=15;if(state.clock>=1440){state.clock=0;state.day++;if(state.day%7===1)addLog('Началась новая неделя в Эльдории.')}
 state.people.forEach(updateCitizen);$('clockLabel').textContent=clockText()+' · '+(state.clock<360?'Ночь':state.clock<720?'Утро':state.clock<1080?'День':'Вечер');
 renderPeople();renderMap();Save.write(state);
}
assignJobs();
$('nextMonth').addEventListener('click',month);
render();window.setInterval(tick,900);
})();