import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)));
const DATA_FILE = process.env.DATA_FILE || join(ROOT, 'data', 'doriqidir.json');
const PORT = Number(process.env.PORT || 3050);
const ADMIN_KEY = process.env.ADMIN_KEY || 'demo-dori-admin';
const statuses = ['new', 'confirmed', 'ready', 'collected', 'cancelled'];
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml' };

async function db() { return JSON.parse(await readFile(DATA_FILE, 'utf8')); }
async function save(data) { await writeFile(DATA_FILE, JSON.stringify(data, null, 2)); }
function json(res, code, body) { res.writeHead(code, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); res.end(JSON.stringify(body)); }
function body(req) { return new Promise((resolve, reject) => { let raw=''; req.on('data', c => raw += c); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('JSON noto‘g‘ri')); } }); }); }
function admin(req) { return req.headers['x-admin-key'] === ADMIN_KEY; }
function clean(v, max=300) { return typeof v === 'string' ? v.trim().slice(0,max) : ''; }
function publicPharmacy(p) { return {id:p.id,name:p.name,area:p.area,address:p.address,phone:p.phone,openUntil:p.openUntil}; }

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') return json(res,200,{ok:true,service:'doriqidir'});
    const data = await db();
    if (req.method === 'GET' && url.pathname === '/api/areas') return json(res,200,[...new Set(data.pharmacies.map(p=>p.area))].sort());
    if (req.method === 'GET' && url.pathname === '/api/medicines') {
      const q = clean(url.searchParams.get('q'),80).toLowerCase(); const area = clean(url.searchParams.get('area'),80);
      const medicines = data.medicines.filter(m => (!q || `${m.name} ${m.generic} ${m.form}`.toLowerCase().includes(q)) && (!area || m.stocks.some(s => data.pharmacies.find(p=>p.id===s.pharmacyId)?.area === area))).map(m => ({...m, stocks:m.stocks.map(s => ({...s, pharmacy:publicPharmacy(data.pharmacies.find(p=>p.id===s.pharmacyId))}))}));
      return json(res,200,medicines);
    }
    if (req.method === 'POST' && url.pathname === '/api/reservations') {
      const b = await body(req); const medicineId=clean(b.medicineId,40), pharmacyId=clean(b.pharmacyId,40), name=clean(b.customer?.name,80), phone=clean(b.customer?.phone,30);
      const medicine=data.medicines.find(m=>m.id===medicineId), pharmacy=data.pharmacies.find(p=>p.id===pharmacyId);
      if (!medicine || !pharmacy) return json(res,400,{error:'Dori yoki dorixona topilmadi'});
      if (name.length < 2 || !/^\+?\d[\d ()-]{7,}$/.test(phone)) return json(res,400,{error:'Ism va telefon raqamini to‘g‘ri kiriting'});
      const stock=medicine.stocks.find(s=>s.pharmacyId===pharmacyId && s.quantity>0); if (!stock) return json(res,409,{error:'Bu dorixona uchun zaxira tugagan'});
      const reservation={id:`rez-${Date.now()}`,medicineId,medicine:medicine.name,pharmacyId,pharmacy:pharmacy.name,customer:{name,phone},quantity:Math.min(Math.max(Number(b.quantity)||1,1),stock.quantity),status:'new',createdAt:new Date().toISOString()};
      data.reservations.unshift(reservation); await save(data); return json(res,201,reservation);
    }
    if (req.method === 'GET' && url.pathname === '/api/reservations') { if (!admin(req)) return json(res,401,{error:'Admin kaliti talab qilinadi'}); return json(res,200,data.reservations); }
    const match=url.pathname.match(/^\/api\/reservations\/([^/]+)$/);
    if (req.method === 'PATCH' && match) { if (!admin(req)) return json(res,401,{error:'Admin kaliti talab qilinadi'}); const b=await body(req); if(!statuses.includes(b.status)) return json(res,400,{error:'Noto‘g‘ri status'}); const r=data.reservations.find(x=>x.id===match[1]); if(!r) return json(res,404,{error:'Rezervatsiya topilmadi'}); r.status=b.status; r.updatedAt=new Date().toISOString(); await save(data); return json(res,200,r); }
    if (req.method === 'GET') { const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1); if (file.includes('..')) return json(res,404,{error:'Topilmadi'}); try { const content=await readFile(join(ROOT,'public',file)); res.writeHead(200,{'Content-Type':mime[extname(file)]||'text/plain; charset=utf-8'}); return res.end(content); } catch {} }
    return json(res,404,{error:'Topilmadi'});
  } catch (e) { return json(res, e.message==='JSON noto‘g‘ri'?400:500, {error:e.message}); }
}
http.createServer(handler).listen(PORT,'0.0.0.0',()=>console.log(`DoriQidir http://localhost:${PORT}`));
