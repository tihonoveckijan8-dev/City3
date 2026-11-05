(() => {
const $=id=>document.getElementById(id),copy=o=>JSON.parse(JSON.stringify(o));
const initialPeople=[
{name:'Эдрик',job:'Староста',icon:'🧔'},{name:'Мира',job:'Житель',icon:'👩'},
{name:'Томас',job:'Житель',icon:'🧑'},{name:'Элла',job:'Житель',icon:'👩'},
{name:'Бран',job:'Житель',icon:'🧔'},{name:'Лина',job:'Житель',icon:'👩'},
{name:'Роланд',job:'Житель',icon:'🧑'},{name:'Агна',job:'Житель',icon:'👵'}
];
const fresh=()=>({month:1,year:1,season:0,day:1,clock:7*60,tiles:copy(World.initial),resources:{wood:34,stone:20,gold:24,food:34,grain:0,flour:0},population:8,happiness:72,people:copy(initialPeople).map((p,i)=>({...p,id:i+1,home:i<4?31:49,workplace:null,pos:i<4?31:49,route:[],routeIndex:0,desiredTarget:null,status:'resting',walkTicks:0})),selected:null,build:'road',log:['Поселенцы основали лагерь в долине Эльдории.','Староста Эдрик призвал построить дороги и первые мастерские.']});
let state=Save.load()||fresh();
const seasons=['Весна','Лето','Осень','Зима'],names=Object.keys(Buildings),dayNames=['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
state.people=Array.isArray(state.people)?state.people:copy(initialPeople);
state.tiles=state.tiles||copy(World.initial);state.resources=state.resources||{wood:34,stone:20,gold:24,food:34,grain:0,flour:0};
state.log=state.log||[];state.clock=Number.isFinite(state.clock)?state.clock:420;state.day=state.day||1;
state.people.forEach((p,i)=>{p.id=p.id||i+1;p.home=p.home??(i<4?31:49);p.workplace=p.workplace??null;p.pos=p.pos??p.home;p.route=Array.isArray(p.route)?p.route:[];p.routeIndex=p.routeIndex||0;p.desiredTarget=p.desiredTarget??null;p.status=p.status||'resting';p.walkTicks=p.walkTicks||0});
function addLog(s){state.log.unshift(s);state.log=state.log.slice(0,8)}
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
 for(const [id,t] of Object.entries(state.tiles)){const b=Buildings[t.type];if(b?.jobs&&World.hasAccess(Number(id),state.tiles))for(let n=0;n<b.jobs;n++)slots.push({id:Number(id),name:b.name})}
 state.people.forEach((p,i)=>{const slot=slots[i];p.workplace=slot?.id??null;p.job=slot?.name??'Без работы';p.desiredTarget=null;p.route=[];p.routeIndex=0;if(p.pos==null)p.pos=p.home});
}
function desiredFor(c){const h=state.clock/60;if(c.workplace&&h>=8&&h<17)return c.workplace;return c.home}
function updateCitizen(c){
 const target=desiredFor(c);
 if(c.desiredTarget!==target){c.desiredTarget=target;routeTo(c,target)}
 if(c.status==='walking'&&c.route.length){
  c.walkTicks++;if(c.walkTicks>=2){c.walkTicks=0;c.routeIndex++;if(c.routeIndex<c.route.length)c.pos=c.route[c.routeIndex];else{c.pos=target;c.route=[];c.routeIndex=0;c.status=target===c.home?'resting':'working'}}}
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
 $('log').innerHTML=state.log.slice(0,5).map((s,i)=>'<div class="log-entry"><time>Запись '+(state.log.length-i)+'</time>'+s+'</div>').join('');
 $('selectionLabel').textContent=state.selected===null?'Выбери клетку для постройки':'Клетка '+(state.selected+1)+' · '+(state.tiles[state.selected]?Buildings[state.tiles[state.selected].type].name:'свободна');
 $('buildHint').textContent='Выбрано: '+Buildings[state.build].name;
 $('buildings').innerHTML=names.map(k=>{const b=Buildings[k];return '<button class="building '+(state.build===k?'active':'')+'" data-kind="'+k+'"><span class="emoji">'+b.icon+'</span><b>'+b.name+'</b><small>'+b.desc+'</small><small class="cost">'+Object.entries(b.cost||{}).map(([r,v])=>({wood:'🪵',stone:'🪨',gold:'🪙'}[r])+v).join(' · ')+'</small></button>'}).join('');
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
 for(const t of Object.values(state.tiles)){const b=Buildings[t.type];if(!b)continue;if(b.production)for(const [k,v] of Object.entries(b.production))r[k]+=v;if(b.recipe&&Object.entries(b.recipe.input).every(([k,v])=>r[k]>=v)){for(const [k,v] of Object.entries(b.recipe.input))r[k]-=v;for(const [k,v] of Object.entries(b.recipe.output))r[k]+=v}}
 const need=state.population*2,available=r.food;r.food=Math.max(0,available-need);
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