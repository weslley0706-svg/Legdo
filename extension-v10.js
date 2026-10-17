// Legado FC v1.0 — idade de jogo, competições e sala de troféus
const V10_COMPETITIONS=['Brasileirão Série A','Brasileirão Série B','Copa do Brasil','CONMEBOL Libertadores','CONMEBOL Sul-Americana','Recopa Sul-Americana'];

function applyCareerAgeRule(players){
  return players.map(p=>{
    const real=Number.isFinite(+p.realAge)?+p.realAge:+p.age;
    return {...p,realAge:real,age:real>30?29:real};
  });
}
// A idade real permanece no Banco Mestre; somente a cópia criada para o save recebe a idade de jogo.
const v10BasePlayers=window.basePlayers;
window.basePlayers=function(){return applyCareerAgeRule(v10BasePlayers())};

function removeAsset(kind,name,type){
  const a=assetStore();
  if(kind==='club'&&a.clubs[name]) delete a.clubs[name].crest;
  if(kind==='competition'&&a.competitions[name]) delete a.competitions[name][type];
  saveAssets(a); render();
}
function assetUploadLabel(has,what){return has?`Trocar ${what}`:`Adicionar ${what}`}
function competitionVisualDatabase(){
  const a=assetStore();
  return `<div class="notice"><b>Imagens personalizadas.</b> PNG transparente é o formato recomendado. JPG e WebP também são aceitos. As imagens alteram apenas a identidade visual e podem ser trocadas sem afetar as carreiras.</div>
  <h2>Clubes</h2><div class="asset-grid">${D.clubs.map(c=>{const src=a.clubs[c.name]?.crest||'';return `<div class="asset-card"><div class="asset-preview">${imgOrFallback(src,c.name,'')}</div><b>${c.name}</b><label class="btn alt smallbtn" style="display:block;margin-top:10px">${src?'Trocar escudo':'Adicionar escudo'}<input hidden type="file" accept="image/png,image/jpeg,image/webp" onchange="uploadAsset('club','${c.name.replaceAll("'","\\'")}','crest',this)"></label>${src?`<button class="btn ghost smallbtn" onclick="removeAsset('club','${c.name.replaceAll("'","\\'")}','crest')">Remover</button>`:''}</div>`}).join('')}</div>
  <div class="spacer"></div><h2>Competições e troféus</h2><div class="asset-grid">${V10_COMPETITIONS.map(n=>{const logo=compAsset(n,'logo'),trophy=compAsset(n,'trophy');return `<div class="asset-card"><div class="asset-preview">${logo?`<img src="${logo}" alt="Logo ${n}">`:'<span class="asset-fallback">LOGO</span>'}</div><b>${n}</b><label class="btn alt smallbtn" style="display:block;margin-top:10px">${logo?'Trocar logo':'Adicionar logo'}<input hidden type="file" accept="image/png,image/jpeg,image/webp" onchange="uploadAsset('competition','${n}','logo',this)"></label>${logo?`<button class="btn ghost smallbtn" onclick="removeAsset('competition','${n}','logo')">Remover logo</button>`:''}<div class="trophy-title">Troféu</div><div class="asset-preview trophy-preview">${trophy?`<img src="${trophy}" alt="Troféu ${n}">`:'<span class="asset-fallback">🏆</span>'}</div><label class="btn alt smallbtn" style="display:block;margin-top:6px">${trophy?'Trocar troféu':'Adicionar troféu'}<input hidden type="file" accept="image/png,image/jpeg,image/webp" onchange="uploadAsset('competition','${n}','trophy',this)"></label>${trophy?`<button class="btn ghost smallbtn" onclick="removeAsset('competition','${n}','trophy')">Remover troféu</button>`:''}</div>`}).join('')}</div>`;
}
// Substitui a tela visual anterior pela versão completa.
const v10Database=window.database;
window.database=function(){
  if(dbSection==='visual') return `<div class="masterwrap"><div class="top"><div><div class="muted">BANCO MESTRE</div><h1>Identidade Visual</h1></div><button class="btn alt" onclick="appMode='home';render()">← Tela inicial</button></div><div class="subnav"><button onclick="dbSection='players';render()">Jogadores</button><button class="active">Escudos, logos e troféus</button></div>${competitionVisualDatabase()}</div>`;
  return v10Database();
};
function trophiesPage(){
  ensureV07(); const won=state.trophies||[];
  return `<div class="top"><div><div class="muted">HISTÓRIA DA CARREIRA</div><h1>Sala de Troféus</h1></div></div><div class="notice">Os títulos conquistados nesta carreira serão registrados aqui com a imagem personalizada do troféu cadastrada no Banco Mestre.</div><div class="trophy-room">${won.length?won.map(t=>{let n=t.competition||t.name||'Título',img=compAsset(n,'trophy');return `<div class="trophy-card"><div class="trophy-big">${img?`<img src="${img}">`:'🏆'}</div><h3>${n}</h3><p>${t.season||t.year||state.date.slice(0,4)} · ${t.club||club().name}</p></div>`}).join(''):`<div class="card empty-trophies"><div class="bigcup">🏆</div><h2>Seu legado começa agora</h2><p class="muted">Quando o clube conquistar uma competição, o troféu aparecerá aqui.</p></div>`}</div>`;
}
const v10Layout=window.layout;
window.layout=function(content){
  let html=v10Layout(content);
  const needle=`<button onclick="exitCareer()">← Sair da carreira</button>`;
  html=html.replace(needle,`<button class="${screen==='trophies'?'active':''}" onclick="screen='trophies';render()">🏆 Sala de Troféus</button>${needle}`);
  return html;
};
const v10Render=window.render;
window.render=function(){
  if(appMode==='career'&&state&&screen==='trophies'){
    document.querySelector('#app').innerHTML=layout(trophiesPage()); return;
  }
  return v10Render();
};
