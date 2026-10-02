const vm=require('vm'),fs=require('fs'),assert=require('assert');
const source=fs.readFileSync('assets/cloud-sync.js','utf8');
const tick=()=>new Promise(r=>setImmediate(r));
async function scenario(){
let remote={parentLedgerResetVersion:1,petBalanceResetVersion:1,petAssetResetVersion:2,weekIndex:0,extra:-10,materialBalance:100,adjustments:[{id:'old',n:-10}],weekData:[]};
const s=structuredClone(remote),storage=new Map([['little-star-offline-copy',JSON.stringify(s)]]);let patches=0,release;
const ls={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const node={setAttribute(){},remove(){},textContent:'',className:''};
const c={s,localStorage:ls,document:{querySelector:()=>null,createElement:()=>({...node}),body:{append(){}},head:{append(){}},addEventListener(){}},window:{addEventListener(){},setInterval(){},setOfficialRole(){}},location:{search:'?role=dad'},URLSearchParams,console,setTimeout,clearTimeout,render(){},fetch:async(url,opts)=>{if(opts.method==='PATCH'){patches++;const next=JSON.parse(opts.body).state;if(patches===1)await new Promise(r=>release=r);remote=next;return {ok:true,json:async()=>[{state:structuredClone(remote),updated_at:new Date(Date.now()+patches).toISOString()}]}}return {ok:true,json:async()=>[{state:structuredClone(remote),updated_at:'2026-10-02T00:00:00Z'}]}}};vm.createContext(c);vm.runInContext(source,c);await tick();await tick();
function edit(n,id){s.extra+=n;s.materialBalance+=n*10;s.adjustments.unshift({id,n});ls.setItem('little-star-offline-copy',JSON.stringify(s))}
edit(5,'new1');await tick();edit(3,'new2');release();for(let i=0;i<8;i++)await tick();
assert.equal(remote.extra,-2);assert.equal(remote.materialBalance,180);assert.equal(remote.adjustments.length,3);assert.equal(s.extra,-2);assert.equal(storage.has('little-star-cloud-pending'),false);
edit(-2,'new3');for(let i=0;i<5;i++)await tick();assert.equal(remote.extra,-4);assert.equal(remote.adjustments.length,4);assert.equal(remote.materialBalance,160);
// Reload using the confirmed snapshot and verify the historical reset does not run again.
vm.runInContext(source,c);for(let i=0;i<5;i++)await tick();assert.equal(remote.extra,-4);assert.equal(remote.adjustments.length,4);
console.log('PASS: historical ledger preserved, +5/+3 during in-flight save, -2, reload, pending cleared');
}
scenario().catch(e=>{console.error(e);process.exit(1)});
