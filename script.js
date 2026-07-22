const fallbackPrices={solana:78.266,bitcoin:66335,tether:0.9995,tron:0.32923,the_open_network:1.575,dai:0.9657,ethereum:2035.71};
const coins=[
{id:'solana',name:'Solana',symbol:'SOL',amount:.00750905,logo:'assets/logos/solana.png',change:'+$0.0021'},
{id:'bitcoin',name:'Bitcoin',symbol:'BTC',amount:.00000794,logo:'assets/logos/bitcoin.png',change:'+$0.0084'},
{id:'tether',key:'usdt-sol',name:'Tether USDT',symbol:'USDT',amount:.2,logo:'assets/logos/usdt-sol.png',change:'$0.00'},
{id:'tron',name:'Tron',symbol:'TRX',amount:.455002,logo:'assets/logos/tron.png',change:'+$0.0015'},
{id:'the_open_network',key:'ton',name:'TON',symbol:'TON',amount:.00863336,logo:'assets/logos/ton.png',change:'+$0.0013'},
{id:'tether',key:'usdt-arb',name:'Tether USD',symbol:'USDT',amount:.002002,logo:'assets/logos/usdt-arb.png',change:'$0.00'},
{id:'dai',name:'Dai',symbol:'DAI',amount:.00113938,logo:'assets/logos/dai.png',change:'+$0.0₅1139'},
{id:'ethereum',key:'ethereum-arb',name:'Ethereum',symbol:'ETH',amount:.00000014,logo:'assets/logos/ethereum-arb.png',change:'+$0.0₅2902'},
{id:'ethereum',key:'ethereum',name:'Ethereum',symbol:'ETH',amount:0,logo:'assets/logos/ethereum.png',change:'$0.00'},
{id:'tether',key:'usdt-eth',name:'Tether USD',symbol:'USDT',amount:0,logo:'assets/logos/usdt-sol.png',change:'$0.00'}
];
let prices={...fallbackPrices},active=null,mode='coin';
const saved=JSON.parse(localStorage.getItem('walletAmounts')||'{}');coins.forEach((c,i)=>{c.uid=c.key||`${c.id}-${i}`;if(saved[c.uid]!==undefined)c.amount=Number(saved[c.uid])});
const list=document.getElementById('tokenList'),totalEl=document.getElementById('totalBalance'),editor=document.getElementById('editor'),input=document.getElementById('amountInput');
const usd=n=>n<.000001?'$0.00':n<.001?'$'+n.toFixed(6).replace(/0+$/,''):n<1?'$'+n.toFixed(4):'$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const crypto=n=>n===0?'0':n>=1?n.toLocaleString('en-US',{maximumFractionDigits:8}):n.toFixed(8).replace(/0+$/,'').replace(/\.$/,'');
function value(c){return c.amount*(prices[c.id]||0)}
function render(){coins.sort((a,b)=>value(b)-value(a));list.innerHTML='';coins.forEach(c=>{const row=document.createElement('article');row.className='token';row.innerHTML=`<button class="logo-button" aria-label="Edit ${c.name}"><img class="token-logo" src="${c.logo}" alt="${c.name} logo"></button><div class="token-main"><div class="token-name">${c.name}</div><div class="token-amount">${crypto(c.amount)} ${c.symbol}</div></div><div class="token-values"><div class="token-usd">${usd(value(c))}</div><div class="token-change ${c.change==='$0.00'?'zero':''}">${c.change}</div></div>`;row.querySelector('button').style.cssText='border:0;background:transparent;padding:0;width:44px;height:44px';row.querySelector('button').addEventListener('click',()=>openEditor(c));list.appendChild(row)});const total=coins.reduce((s,c)=>s+value(c),0);totalEl.textContent=usd(total)}
function openEditor(c){active=c;mode='coin';document.getElementById('editorLogo').src=c.logo;document.getElementById('editorTitle').textContent=`Edit ${c.name}`;input.value=crypto(c.amount);updateMode();editor.hidden=false;setTimeout(()=>input.focus(),80)}
function updateMode(){document.getElementById('coinMode').classList.toggle('selected',mode==='coin');document.getElementById('usdMode').classList.toggle('selected',mode==='usd');document.getElementById('amountLabel').textContent=mode==='coin'?`${active.symbol} amount`:'USD value';input.value=mode==='coin'?crypto(active.amount):value(active).toFixed(2);preview()}
function preview(){if(!active)return;const n=Math.max(0,Number(input.value)||0);document.getElementById('conversionPreview').textContent=mode==='coin'?`≈ ${usd(n*prices[active.id])}`:`≈ ${crypto(n/prices[active.id])} ${active.symbol}`}
function close(){editor.hidden=true;active=null}
document.getElementById('coinMode').addEventListener('click',()=>{mode='coin';updateMode()});document.getElementById('usdMode').addEventListener('click',()=>{mode='usd';updateMode()});input.addEventListener('input',preview);document.getElementById('cancelEdit').addEventListener('click',close);editor.addEventListener('click',e=>{if(e.target===editor)close()});document.getElementById('saveEdit').addEventListener('click',()=>{const n=Math.max(0,Number(input.value)||0);active.amount=mode==='coin'?n:n/prices[active.id];localStorage.setItem('walletAmounts',JSON.stringify(Object.fromEntries(coins.map(c=>[c.uid,c.amount]))));close();render()});input.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('saveEdit').click()});document.getElementById('closePromo').addEventListener('click',e=>e.currentTarget.closest('.promo').remove());
async function refreshPrices(){try{const ids=[...new Set(coins.map(c=>c.id))].join(',');const r=await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,{cache:'no-store'});if(!r.ok)throw Error();const d=await r.json();for(const id of Object.keys(d))if(d[id]?.usd)prices[id]=d[id].usd;render()}catch{render()}}
render();refreshPrices();setInterval(refreshPrices,60000);
