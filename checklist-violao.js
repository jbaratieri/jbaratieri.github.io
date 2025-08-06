'use strict';
/* =====================================================
   UTILIDADES
===================================================== */
const $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
const $=(s,c=document)=>c.querySelector(s);

/* =====================================================
   ELEMENTOS PRINCIPAIS
===================================================== */
const btnDG=$('#btnDetalhesGerais');
const boxDG=$('#detalhesGerais');
const btnGerarPDF=$('#btnGerarPDF');
const btnExpandAll=$('#btnExpandAll');
const btnCollapseAll=$('#btnCollapseAll');
const btnSalvar=$('#btnSalvarDados');
const btnLimpar=$('#btnLimparDados');
const etapasCont=$('#etapasContainer');
const etapas=$$('#etapasContainer .etapa');
const progressFill=$('#progressFill');
const progressText=$('#progressText');

/* =====================================================
   LOCALSTORAGE KEYS (mantidos p/ compatibilidade)
===================================================== */
const DATA_KEY='violaoDadosBasicosV3';
const CHECK_KEY='violaoChecklistV3';

/* =====================================================
   CAMPOS DADOS BÁSICOS
===================================================== */
const dataFields=['nomeCliente','tipoInstrumento','quantasCordas','tipoCordas','madeiraTampo','madeiraFundo','madeiraBraco','madeiraEscala','madeiraFiletes','madeiraEncosto','madeiraHeadplate','AltTravessaTampo','LarTravessaTampo','LarChanfroTampo','TipoTravessTampo','AltBarraFundo','LarBarraFundo','LarChanfroFundo','tipoBarraFundo','MedFaixaFront','MedFaixaBack','MedFaixaComp','MedDobrasFaixas','ConsidGerais','medEspTampo','medEspFundo','medAltBraPes','medAltBraC12','medEspBraPes','medEspBraCul','medEscala','medCompCorpo','medLargOmbro','medLargCintura','medLargBasso'];

function getDataPayload(){const payload={};dataFields.forEach(id=>{const el=document.getElementById(id);if(el)payload[id]=el.value;});return payload;}
function saveData(immediate=false){localStorage.setItem(DATA_KEY,JSON.stringify(getDataPayload()));if(immediate)alert('Dados salvos.');}
function loadData(){try{const raw=localStorage.getItem(DATA_KEY);if(!raw)return;const payload=JSON.parse(raw);Object.entries(payload).forEach(([k,v])=>{const el=document.getElementById(k);if(el)el.value=v;});}catch(e){console.warn('Falha carregar dados',e);}}
function clearData(){localStorage.removeItem(DATA_KEY);alert('Dados removidos.');}

let dataSaveTimer=null;function scheduleAutoSave(){clearTimeout(dataSaveTimer);dataSaveTimer=setTimeout(()=>saveData(false),500);}dataFields.forEach(id=>{const el=document.getElementById(id);if(!el)return;el.addEventListener('input',scheduleAutoSave);});
btnSalvar?.addEventListener('click',()=>saveData(true));
btnLimpar?.addEventListener('click',clearData);

/* =====================================================
   DETALHES GERAIS TOGGLE
===================================================== */
btnDG?.addEventListener('click',()=>{const open=boxDG.style.display==='block';boxDG.style.display=open?'none':'block';if(!open){boxDG.scrollIntoView({behavior:'smooth',block:'start'});}});

/* =====================================================
   DETALHES SUBETAPA (show/hide)
===================================================== */
document.addEventListener('click',e=>{const btn=e.target.closest('.subetapa-toggle-detail');if(!btn)return;const id=btn.dataset.target;const box=document.getElementById(id);if(!box)return;box.style.display=(box.style.display==='block')?'none':'block';});

/* =====================================================
   EXPAND / COLLAPSE ALL
===================================================== */
btnExpandAll?.addEventListener('click',()=>{etapas.forEach(e=>{const b=e.querySelector('.etapa-body');if(b)b.style.display='block';});});
btnCollapseAll?.addEventListener('click',()=>{etapas.forEach(e=>{const b=e.querySelector('.etapa-body');if(b)b.style.display='none';});});

/* =====================================================
   ABRIR/FECHAR ETAPA CABEÇALHO
===================================================== */
document.addEventListener('click',e=>{const header=e.target.closest('.etapa-header');if(!header)return;const body=header.nextElementSibling;body.style.display=(body.style.display==='none')?'block':'none';});

/* =====================================================
   CHECKLIST ESTADO / PROGRESSO
===================================================== */
function updateEtapaState(etapaEl){const checks=$$('.sub-check',etapaEl);const done=checks.filter(c=>c.checked).length;const total=checks.length;const tick=$('.etapa-tick',etapaEl);const prog=$('.etapa-progress',etapaEl);const all=done===total&&total>0;tick.style.display=all?'inline':'none';prog.textContent=`${done}/${total}`;checks.forEach(ch=>{const row=ch.closest('.subetapa');if(row)row.classList.toggle('checked-row',ch.checked);});}

function updateAllEtapas(){etapas.forEach(updateEtapaState);updateGlobalProgress();}

function getChecklistPayload(){const payload={};$$('.sub-check').forEach(ch=>{payload[ch.id]=ch.checked;});return payload;}
function saveChecklist(){localStorage.setItem(CHECK_KEY,JSON.stringify(getChecklistPayload()));}
function loadChecklist(){try{const raw=localStorage.getItem(CHECK_KEY);if(!raw)return;const payload=JSON.parse(raw);$$('.sub-check').forEach(ch=>{if(payload.hasOwnProperty(ch.id))ch.checked=!!payload[ch.id];});}catch(e){console.warn('Falha carregar checklist',e);}}

function updateGlobalProgress(){const allChecks=$$('.sub-check');const done=allChecks.filter(c=>c.checked).length;const total=allChecks.length||1;const pct=Math.round((done/total)*100);progressFill.style.width=pct+'%';progressText.textContent=`${pct}% concluído`;saveChecklist();}

document.addEventListener('change',e=>{if(!e.target.classList.contains('sub-check'))return;updateAllEtapas();});

/* =====================================================
   ÍNDICE AUTOMÁTICO (TOC)
===================================================== */
function buildTOC(){const tocList=$('#tocList');if(!tocList)return;tocList.innerHTML='';etapas.forEach(sec=>{const id=sec.id;const title=$('.etapa-title',sec)?.textContent?.trim()||id;const li=document.createElement('li');const a=document.createElement('a');a.href='#'+id;a.textContent=title;li.appendChild(a);tocList.appendChild(li);});}

/* =====================================================
   CAPA DE IMPRESSÃO PREENCHE CAMPOS
===================================================== */
function fillCover(){const getVal=id=>document.getElementById(id)?.value?.trim()||'';$('#coverCliente').textContent=getVal('nomeCliente');$('#coverInstrumento').textContent=getVal('tipoInstrumento');$('#coverCordas').textContent=`${getVal('quantasCordas')} ${getVal('tipoCordas')}`.trim();$('#coverTampo').textContent=getVal('madeiraTampo');$('#coverFundo').textContent=getVal('madeiraFundo');$('#coverBraco').textContent=getVal('madeiraBraco');$('#coverFiletes').textContent=getVal('filetes');$('#coverEscala').textContent=getVal('medEscala');const d=new Date();$('#coverData').textContent=`Gerado em ${d.toLocaleDateString()}`;}

/* OPTIONAL: permitir usuário definir logo via base64 / URL salvo no localStorage */
const LOGO_KEY='violaoLogoBase64';
function loadLogo(){const src=localStorage.getItem(LOGO_KEY);const img=$('#coverLogo');if(!img)return;if(src){img.src=src;img.style.display='block';}}

/* =====================================================
   GERAR PDF (IMPRIMIR)
===================================================== */
btnGerarPDF?.addEventListener('click',()=>{fillCover();buildTOC();btnExpandAll?.click();setTimeout(()=>{window.print();},100);});

/* =====================================================
   INICIALIZAÇÃO
===================================================== */
function init(){loadData();loadChecklist();loadLogo();buildTOC();updateAllEtapas();/* abrir corpo etapas por padrão */etapas.forEach(e=>{const body=e.querySelector('.etapa-body');if(body)body.style.display='block';});}

document.addEventListener('DOMContentLoaded',init);
init(); // fallback caso DOMContentLoaded já tenha disparado


