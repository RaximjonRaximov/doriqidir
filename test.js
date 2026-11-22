import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const raw=await readFile('./data/doriqidir.json','utf8'); const d=JSON.parse(raw);
assert.equal(d.pharmacies.length,3); assert.equal(d.medicines.length,4); assert.ok(d.medicines.every(m=>m.stocks.length>0));
const server=await import('./server.js');
const base='http://127.0.0.1:3050';
async function get(p,o){const r=await fetch(base+p,o);return {s:r.status,d:await r.json()}}
await new Promise(r=>setTimeout(r,100));
let x=await get('/api/health'); assert.equal(x.s,200); assert.equal(x.d.ok,true);
x=await get('/api/medicines?q=paratsetamol'); assert.equal(x.d.length,1); assert.equal(x.d[0].name,'Paratsetamol 500 mg');
x=await get('/api/reservations'); assert.equal(x.s,401);
x=await get('/api/reservations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({medicineId:'m1',pharmacyId:'p1',customer:{name:'Test User',phone:'+998901234567'},quantity:2})}); assert.equal(x.s,201); const id=x.d.id;
x=await get('/api/reservations',{headers:{'x-admin-key':'demo-dori-admin'}}); assert.equal(x.s,200); assert.equal(x.d.length,1);
x=await get('/api/reservations/'+id,{method:'PATCH',headers:{'Content-Type':'application/json','x-admin-key':'demo-dori-admin'},body:JSON.stringify({status:'confirmed'})}); assert.equal(x.d.status,'confirmed');
const updated=JSON.parse(await readFile('./data/doriqidir.json','utf8')); updated.reservations=[]; await (await import('node:fs/promises')).writeFile('./data/doriqidir.json',JSON.stringify(updated,null,2));
console.log('6 ta DoriQidir smoke test muvaffaqiyatli');
