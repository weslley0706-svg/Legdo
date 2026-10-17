// LEGADO FC v1.6 — Grupo de Clubes / Clube B
// Mantém cada clube com caixa e elenco próprios e permite movimentação interna de jogadores.
function ensureGroup(){
  if(!state)return;
  state.group=state.group||{name:`Grupo ${state.owner||'Legado'}`,clubs:[state.clubId]};
  if(!state.group.clubs.includes(state.clubId))state.group.clubs.unshift(state.clubId);
}
function groupClubs(){ensureGroup();return state.clubs.filter(c=>state.group.clubs.includes(c.id));}
function createBClub(){
  ensureGroup();
  if(groupClubs().some(c=>c.isBClub))return alert('Seu grupo já possui um Clube B.');
  const main=state.clubs.find(c=>c.id===state.clubId);
  const name=(prompt('Nome do Clube B:',`${main.name} B`)||'').trim();
  if(!name)return;
  if(state.clubs.some(c=>c.name.toLowerCase()===name.toLowerCase()))return alert('Já existe um clube com esse nome.');
  const id=Math.max(0,...state.clubs.map(c=>+c.id||0))+1;
  const b={...clone(main),id,name,division:'Série B',owned:true,isBClub:true,parentClubId:main.id,cash:0,debt:0,purchasePrice:0,transferBudget:0,capacity:Math.min(10000,main.capacity||10000),stadium:`Centro Esportivo ${name}`,reputation:Math.max(40,(main.reputation||70)-20),coach:'Técnico do Clube B',coachQuality:60,coachConfidence:70,fanMood:60};
  state.clubs.push(b);state.group.clubs.push(id);
  state.table[id]={p:0,j:0,v:0,e:0,d:0,gp:0,gc:0,sg:0};
  state.news.unshift(`${name} foi criado e passou a integrar ${state.group.name}.`);
  save();render();
}
function moveGroupPlayer(id,toId){
  ensureGroup();
  const p=state.players.find(x=>x.id===id),dest=state.clubs.find(c=>c.id===+toId);
  if(!p||!dest||!state.group.clubs.includes(dest.id))return;
  const origin=state.clubs.find(c=>c.name===p.club);
  if(origin&&origin.id===dest.id)return;
  p.club=dest.name;p.youth=false;p.contractStatus='Clube';
  state.transferLog=state.transferLog||[];
  state.transferLog.unshift({player:p.name,from:origin?.name||'Grupo',to:dest.name,value:0,date:state.date,internal:true});
  state.news.unshift(`${p.name} foi movido para ${dest.name} dentro do grupo.`);
  save();render();
}
function groupPage(){
  ensureGroup();const clubs=groupClubs();
  const cards=clubs.map(c=>`<div class="card group-club-card"><div class="muted">${c.id===state.clubId?'CLUBE PRINCIPAL':c.isBClub?'CLUBE B':'CLUBE DO GRUPO'}</div><h2>${c.name}</h2><p><b>${c.division||'Sem divisão'}</b> · Caixa ${money(c.cash||0)}</p><p class="muted">${state.players.filter(p=>p.club===c.name&&!p.youth&&p.contractStatus!=='Livre').length} jogadores profissionais</p></div>`).join('');
  const ownedNames=new Set(clubs.map(c=>c.name));
  const players=state.players.filter(p=>ownedNames.has(p.club)&&!p.youth&&p.contractStatus!=='Livre').sort((a,b)=>b.overall-a.overall);
  const rows=players.map(p=>{const current=clubs.find(c=>c.name===p.club);const opts=clubs.filter(c=>c.id!==current?.id).map(c=>`<option value="${c.id}">${c.name}</option>`).join('');return `<tr><td><b>${p.name}</b><br><span class="muted">${p.position} · OVR ${p.overall}</span></td><td>${p.club}</td><td>${opts?`<select onchange="if(this.value)moveGroupPlayer(${p.id},this.value)"><option value="">Mover para...</option>${opts}</select>`:'—'}</td></tr>`}).join('');
  return `<div class="top"><div><div class="muted">PROPRIEDADE MULTICLUBE</div><h1>${state.group.name}</h1></div>${clubs.some(c=>c.isBClub)?'':`<button class="btn" onclick="createBClub()">+ CRIAR CLUBE B</button>`}</div><div class="notice"><b>Grupo de Clubes:</b> jogadores podem ser movimentados entre os clubes do grupo. O Clube B começa na Série B e não poderá disputar a mesma divisão do clube principal.</div><div class="grid group-grid">${cards}</div><div class="card"><h2>Movimentação interna</h2><div class="table-wrap"><table class="table"><tr><th>Jogador</th><th>Clube atual</th><th>Destino</th></tr>${rows||'<tr><td colspan="3">Nenhum jogador disponível.</td></tr>'}</table></div></div>`;
}
const v16Layout=window.layout;
window.layout=function(content){
  let html=v16Layout(content);
  const needle=`<button onclick="exitCareer()">← Sair da carreira</button>`;
  if(html.includes(needle))html=html.replace(needle,`<button class="${screen==='group'?'active':''}" onclick="screen='group';render()">🏢 Grupo de Clubes</button>${needle}`);
  return html;
};
const v16Render=window.render;
window.render=function(){
  if(appMode==='career'&&state&&screen==='group'){
    ensureGroup();document.querySelector('#app').innerHTML=layout(groupPage());return;
  }
  return v16Render();
};
