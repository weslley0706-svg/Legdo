// LEGADO FC v1.7 — proprietário, dívida, troféus e segurança de saves
function parseBRMoney(v){
  v=String(v??'').trim().replace(/\s/g,'').replace(/R\$/gi,'');
  if(!v)return 0;
  if(v.includes(',')&&v.includes('.'))v=v.replace(/\./g,'').replace(',','.');
  else if(v.includes(','))v=v.replace(',','.');
  return Math.max(0,Number(v)||0);
}
function acquisitionPrice(c){return Math.max(0,(+c.purchasePrice||0)-(+c.debt||0));}
function safeBackup(){try{const raw=localStorage.getItem(SAVESKEY);if(raw)localStorage.setItem(SAVESKEY+'-backup',raw)}catch(e){}}
const v17PutSaves=window.putSaves;
window.putSaves=function(x){safeBackup();return v17PutSaves(x)};
function restoreCareerBackup(){
  let raw=localStorage.getItem(SAVESKEY+'-backup');if(!raw)return alert('Nenhum backup local encontrado.');
  try{let b=JSON.parse(raw);if(!Array.isArray(b)||!b.length)return alert('O backup está vazio.');if(!confirm(`Restaurar backup com ${b.length} carreira(s)?`))return;localStorage.setItem(SAVESKEY,raw);appMode='home';render()}catch(e){alert('Não foi possível ler o backup.')}
}
function debtPayment(amount){
  const c=club(),debt=Math.max(0,+c.debt||0);if(!debt)return alert('O clube não possui dívida.');
  const pay=Math.min(debt,Math.max(0,+amount||0));if(!pay)return;
  if((+c.cash||0)<pay)return alert('O caixa do clube é insuficiente.');
  c.cash-=pay;c.debt=debt-pay;state.news.unshift(`${money(pay)} foram usados para amortizar a dívida de ${c.name}.`);save();showFinanceV17();
}
function customDebtPayment(){let v=prompt('Valor que deseja pagar da dívida:');if(v===null)return;debtPayment(parseBRMoney(v))}
function renegotiateDebt(){
  const c=club();if((+c.debt||0)<=0)return alert('O clube não possui dívida.');
  c.debtPlan=c.debtPlan==='alongado'?'normal':'alongado';state.news.unshift(`${c.name} ${c.debtPlan==='alongado'?'alongou':'reorganizou'} o plano de pagamento da dívida.`);save();showFinanceV17();
}
function financeV17(){
  const c=club(),d=Math.max(0,+c.debt||0),monthly=d?(c.debtPlan==='alongado'?0.004:0.0075):0;
  return `<div class="top"><div><div class="muted">GESTÃO FINANCEIRA</div><h1>Finanças</h1></div></div><div class="grid"><div class="card kpi"><span class="muted">Caixa</span><b>${money(c.cash)}</b></div><div class="card kpi"><span class="muted">Folha mensal</span><b>${money(c.payroll)}</b></div><div class="card kpi"><span class="muted">Transferências</span><b>${money(c.transferBudget)}</b></div><div class="card kpi"><span class="muted">Dívida</span><b>${money(d)}</b></div></div><div class="card" style="margin-top:16px"><div class="muted">CENTRAL DE DÍVIDAS</div><h2>${d?money(d):'Clube sem dívidas'}</h2>${d?`<p>Plano: <b>${c.debtPlan==='alongado'?'Alongado':'Normal'}</b> · juros simulados mensais <b>${(monthly*100).toFixed(2).replace('.',',')}%</b></p><div class="actions"><button class="btn" onclick="debtPayment(Math.min(${d},${+c.cash||0}))">QUITAR O MÁXIMO POSSÍVEL</button><button class="btn alt" onclick="customDebtPayment()">PAGAR OUTRO VALOR</button><button class="btn alt" onclick="renegotiateDebt()">${c.debtPlan==='alongado'?'VOLTAR AO PLANO NORMAL':'RENEGOCIAR / ALONGAR'}</button></div>`:'<p class="muted">Nenhuma obrigação financeira pendente.</p>'}</div>`;
}
function showFinanceV17(){screen='finance';document.body.innerHTML=layout(financeV17())}
function showTrophiesV17(){
  screen='trophies';state.trophies=state.trophies||[];const won=state.trophies;
  const cards=won.map(t=>{const n=t.competition||t.name||'Título',img=typeof compAsset==='function'?compAsset(n,'trophy'):'';return `<div class="trophy-card"><div class="trophy-big">${img?`<img src="${img}" alt="${n}">`:'🏆'}</div><h3>${n}</h3><p>${t.season||t.year||state.date.slice(0,4)} · ${t.club||club().name}</p></div>`}).join('');
  const content=`<div class="top"><div><div class="muted">HISTÓRIA DA CARREIRA</div><h1>Sala de Troféus</h1></div><span class="pill">${won.length} ${won.length===1?'título':'títulos'}</span></div><div class="notice">Todos os títulos conquistados nesta carreira ficam registrados aqui.</div><div class="trophy-room">${cards||`<div class="card empty-trophies"><div class="bigcup">🏆</div><h2>Seu legado começa agora</h2><p class="muted">Quando um clube do seu grupo conquistar uma competição, o troféu aparecerá aqui.</p></div>`}</div>`;
  document.body.innerHTML=layout(content);
}
const v17Layout=window.layout;
window.layout=function(content){
  let html=v17Layout(content);
  html=html.replace(/onclick="screen='trophies';render\(\)"/g,'onclick="showTrophiesV17()"');
  html=html.replace(/onclick="screen='finance';render\(\)"/g,'onclick="showFinanceV17()"');
  return html;
};
const v17Career=window.career;
window.career=function(){
  let html=v17Career();
  html=html.replace(/<label>Patrimônio pessoal<select id="wealth">[\s\S]*?<\/select><\/label>/,`<label>Patrimônio pessoal<input id="wealth" inputmode="decimal" placeholder="Ex.: 500000000" value="3000000000"><small class="muted">Digite qualquer valor.</small></label>`);
  html=html.replace(/Valor: <b>\$\{money\(c\.purchasePrice\)\}<\/b>/g,'Valor: <b>${money(c.purchasePrice)}</b>');
  html=html.replace(/<p>Caixa: \$\{money\(c\.cash\)\} · Dívida: \$\{money\(c\.debt\)\}<\/p>/g,'<p>Caixa: ${money(c.cash)} · Dívida: ${money(c.debt)}</p>');
  return html;
};
window.selectClub=function(id,el){
  selected=id;document.querySelectorAll('.club').forEach(x=>x.classList.remove('selected'));el.classList.add('selected');
  $('#start').disabled=false;$('#start').onclick=()=>{let w=parseBRMoney($('#wealth').value),c=D.clubs.find(x=>x.id==id),price=acquisitionPrice(c);if(w<price)return alert(`Seu patrimônio não é suficiente. Preço de aquisição: ${money(price)}.`);newCareerV17(id,w,price)};
};
function newCareerV17(clubId,wealth,price){
  activeSaveId='career-'+Date.now();let saveName=($('#save-name')?.value||'').trim(),src=D.clubs.find(c=>c.id==clubId);
  state={version:'1.7',saveName:saveName||('Legado '+src.name),owner:($('#owner-name')?.value||'Weslley').trim()||'Weslley',wealth:+wealth,initialWealth:+wealth,clubId:+clubId,date:D.baseDate,day:0,clubs:masterClubs(),players:basePlayers(),table:{},fixtures:[],news:[],lastMatch:null,youthGenerated:false,trophies:[],legacy:[{date:D.baseDate,type:'acquisition',text:`Comprou ${src.name} por ${money(price)} e assumiu ${money(src.debt||0)} em dívidas.`}]};
  const c=state.clubs.find(c=>c.id==clubId);state.wealth-=price;c.owned=true;c.acquisitionPrice=price;c.acquiredAt=D.baseDate;c.debtPlan='normal';generateYouth();state.youthGenerated=true;initTable();makeFixtures();save();screen='dashboard';render();
}
const v17Home=window.home;
window.home=function(){let html=v17Home();return html.replace('</div></div>','</div></div>') .replace('<div class="mastercard card">',`<div class="mastercard card"><div><div class="muted">SEGURANÇA</div><h2>Backup de Carreiras</h2><p>O jogo mantém uma cópia local do estado anterior dos seus saves.</p></div><button class="btn alt" onclick="restoreCareerBackup()">RESTAURAR BACKUP</button></div><div class="mastercard card">`)};
