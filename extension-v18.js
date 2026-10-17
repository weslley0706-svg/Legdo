// LEGADO FC v1.8 — relatório do técnico ao proprietário
function coachNeedsV18(){
  const ps=roster(),c=club(),positions=['GOL','LD','LE','ZAG','VOL','MC','MEI','PD','PE','ATA'];
  const needs=[];
  for(const pos of positions){const list=ps.filter(p=>p.position===pos).sort((a,b)=>b.overall-a.overall);const min=['ZAG','MC'].includes(pos)?2:1;if(list.length<min)needs.push({pos,priority:'ALTA',text:`Falta ${pos==='GOL'?'um goleiro':`opção para ${pos}`} no elenco.`,ovr:Math.max(60,Math.round((ps.reduce((s,p)=>s+p.overall,0)/Math.max(1,ps.length))||65))});else if(list[0].overall<68)needs.push({pos,priority:'MÉDIA',text:`Precisamos elevar o nível na posição ${pos}.`,ovr:70});}
  const avg=ps.reduce((s,p)=>s+p.overall,0)/Math.max(1,ps.length),age=ps.reduce((s,p)=>s+(+p.age||24),0)/Math.max(1,ps.length);
  if(age>28.5)needs.push({pos:'ELENCO',priority:'MÉDIA',text:'O elenco está envelhecendo. Recomendo contratar jogadores mais jovens.',ovr:Math.round(avg)});
  return {needs:needs.slice(0,5),avg,age};
}
function coachReportV18(){
  const c=club(),r=coachNeedsV18(),ps=roster(),disp=ps.filter(p=>p.overall<Math.max(60,r.avg-8)).sort((a,b)=>a.overall-b.overall).slice(0,4);
  let target=r.avg>=78?'Lutar por títulos':r.avg>=73?'Buscar vaga continental':r.avg>=68?'Meio de tabela':'Evitar a parte de baixo da tabela';
  let infra=[];if((c.trainingLevel||1)<3)infra.push('Melhorar o CT para acelerar a evolução do elenco.');if((c.youthLevel||1)<3)infra.push('Investir na base para aumentar a qualidade dos jovens.');if((c.medicalLevel||1)<2)infra.push('Reforçar o departamento médico para reduzir impacto das lesões.');
  const requests=r.needs.map(n=>`<div class="card"><div class="muted">${n.priority} · ${n.pos}</div><h3>${n.text}</h3><p>Perfil desejado: <b>OVR ${n.ovr}+</b></p></div>`).join('');
  const content=`<div class="top"><div><div class="muted">RELATÓRIO AO PROPRIETÁRIO</div><h1>${c.coach||'Técnico'}</h1></div><span class="pill">Confiança ${c.coachConfidence||70}%</span></div><div class="notice"><b>Visão do técnico:</b> ${target}. O técnico aponta as necessidades; a decisão de investir continua sendo sua.</div><div class="grid"><div class="card kpi"><span class="muted">OVR médio</span><b>${r.avg.toFixed(1)}</b></div><div class="card kpi"><span class="muted">Idade média</span><b>${r.age.toFixed(1)}</b></div><div class="card kpi"><span class="muted">Prioridades</span><b>${r.needs.length}</b></div><div class="card kpi"><span class="muted">Objetivo</span><b style="font-size:16px">${target}</b></div></div><h2 style="margin-top:22px">Pedidos de reforços</h2><div class="grid">${requests||'<div class="card"><h3>Elenco equilibrado</h3><p class="muted">No momento não vejo uma carência urgente de contratação.</p></div>'}</div><div class="card" style="margin-top:16px"><h2>Jogadores fora dos planos</h2>${disp.length?disp.map(p=>`<p><b>${p.name}</b> · ${p.position} · OVR ${p.overall}</p>`).join(''):'<p class="muted">Nenhum jogador foi indicado para saída neste momento.</p>'}</div><div class="card" style="margin-top:16px"><h2>Estrutura que preciso</h2>${infra.length?infra.map(x=>`<p>• ${x}</p>`).join(''):'<p class="muted">A estrutura atual atende às necessidades imediatas do elenco.</p>'}</div>`;
  document.body.innerHTML=layout(content);
}
function showCoachV18(){screen='coach';coachReportV18()}
const v18Layout=window.layout;
window.layout=function(content){let html=v18Layout(content);html=html.replace(/onclick="screen='coach';render\(\)"/g,'onclick="showCoachV18()"');return html;};
