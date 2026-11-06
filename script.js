const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CATS={
 exp:{n:'Makanan kedaluwarsa',c:'#e5484d',ex:'Tanggal kedaluwarsa pada kemasan sudah lewat.',tip:'Catat lokasi dan jenis produk, lalu laporkan. Jangan mengonsumsi makanan tersebut.'},
 con:{n:'Makanan terkontaminasi',c:'#2f9e6b',ex:'Makanan berbau tidak biasa, berubah warna, atau diduga tercemar.',tip:'Laporkan kondisi dan foto jika aman. Hindari mengonsumsi makanan yang dicurigai.'},
 hyg:{n:'Tempat makan tidak higienis',c:'#3b82f6',ex:'Area penyajian kotor atau kebersihan penjamah makanan diragukan.',tip:'Laporkan lokasi dan kondisi yang terlihat tanpa mengganggu aktivitas di tempat tersebut.'},
 sto:{n:'Penyimpanan tidak sesuai',c:'#f5b301',ex:'Makanan mudah rusak dibiarkan terlalu lama pada suhu ruang.',tip:'Sampaikan jenis masalah dan lokasi. Ikuti panduan penyimpanan yang aman.'},
 oth:{n:'Lainnya',c:'#8b5cf6',ex:'Masalah keamanan pangan lain yang perlu diperhatikan.',tip:'Tuliskan keterangan yang jelas dan sertakan foto jika tersedia.'}
};
const EDU=[
 ['label','🏷️','Baca tanggal kedaluwarsa','Cek label sebelum membeli dan makan.','Bedakan "baik digunakan sebelum" dan "kedaluwarsa". Hindari kemasan penyok, bocor, atau menggembung.'],
 ['label','🔎','Memilih bahan pangan','Pilih bahan segar, bersih, dan tidak berbau.','Daging dan ikan berwarna segar, sayur tidak layu atau berlendir, telur tanpa retak.'],
 ['bersih','🧼','Cuci tangan sebelum makan','Sebelum menyiapkan makanan, cuci dengan sabun.','Gosok telapak, punggung tangan, sela jari, dan kuku selama 20 detik, lalu bilas dengan air bersih.'],
 ['bersih','💧','Air bersih &amp; bahan yang aman','Gunakan air bersih untuk mencuci dan memasak.','Cuci buah dan sayur di bawah air mengalir. Pisahkan talenan untuk bahan mentah dan matang.'],
 ['simpan','❄️','Simpan pada suhu sesuai','Makanan mudah rusak jangan dibiarkan di suhu ruang.','Masukkan ke kulkas maksimal 2 jam setelah dimasak. Simpan bahan mentah di bagian bawah.'],
 ['masak','🔥','Masak hingga matang sempurna','Daging, ayam, dan telur harus matang merata.','Panaskan ulang sisa makanan sampai benar-benar panas dan jangan dipanaskan berulang kali.']
];
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{toast('Penyimpanan penuh, foto tidak disimpan.')}};
let reports=load('am_reports',null)||[
 {id:1,cat:'exp',place:'Minimarket Sei Putih',desc:'Susu kotak kedaluwarsa masih dijual di rak.',lat:3.5731,lng:98.6618,st:2,t:Date.now()-864e5*3},
 {id:2,cat:'hyg',place:'Kedai Jl. Gatot Subroto',desc:'Area penyajian kotor dan banyak lalat.',lat:3.5805,lng:98.6554,st:1,t:Date.now()-864e5*2},
 {id:3,cat:'sto',place:'Warung Nasi Padang',desc:'Lauk dibiarkan terbuka di suhu ruang seharian.',lat:3.5902,lng:98.6781,st:0,t:Date.now()-864e5}];
let rems=load('am_rems',[]),selCat='exp',sel=null,remF='all';

/* toast */
function toast(m,c){const t=document.createElement('div');t.className='toast';if(c)t.style.setProperty('--c',c);t.textContent=m;$('#toasts').append(t);setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),350)},3800)}

/* nav */
addEventListener('scroll',()=>$('#nav').classList.toggle('sc',scrollY>20));
$('#burger').onclick=()=>$('#menu').classList.toggle('open');
$$('#menu a').forEach(a=>a.onclick=()=>$('#menu').classList.remove('open'));
const spy=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)$$('#menu a').forEach(a=>a.classList.toggle('on',a.hash==='#'+e.target.id))}),{rootMargin:'-45% 0px -50%'});
$$('section[id]').forEach(s=>spy.observe(s));
$('#bell').onclick=()=>{$('#bellDot').hidden=true;toast('Tip: cuci tangan dengan sabun sebelum menyiapkan makanan.','#17805f')};
setTimeout(()=>$('#bellDot').hidden=false,5000);

/* auth modal */
let reg=false;
const authUI=()=>{$('#authT').textContent=reg?'Daftar akun baru':'Masuk ke Aman Makan';$('#an').hidden=!reg;$('#swAuth').textContent=reg?'Sudah punya akun? Masuk':'Belum punya akun? Daftar'};
$('#openAuth').onclick=()=>$('#modal').hidden=false;
$('#closeAuth').onclick=()=>$('#modal').hidden=true;
$('#modal').onclick=e=>{if(e.target.id==='modal')e.target.hidden=true};
$('#swAuth').onclick=e=>{e.preventDefault();reg=!reg;authUI()};
$('#authForm').onsubmit=e=>{e.preventDefault();$('#modal').hidden=true;const n=$('#an').value||$('#ae').value.split('@')[0];$('#openAuth').textContent='Hai, '+n;toast(reg?'Akun berhasil dibuat.':'Berhasil masuk.');e.target.reset()};

/* category chips + guide */
$('#chips').innerHTML=Object.entries(CATS).map(([k,v])=>`<button type="button" class="chip${k===selCat?' on':''}" data-k="${k}" style="--c:${v.c}">${v.n}</button>`).join('');
$('#legend').innerHTML=Object.values(CATS).map(v=>`<span style="--c:${v.c}"><i></i>${v.n}</span>`).join('');
function guide(){const v=CATS[selCat];const g=$('#guide');g.style.setProperty('--c',v.c);g.innerHTML=`<div class="swap"><span class="tag">${v.n}</span><h3>Saran tindakan</h3><p><b>Contoh kondisi:</b> ${v.ex}</p><p>${v.tip}</p></div>`}
$('#chips').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;selCat=b.dataset.k;$$('.chip').forEach(c=>c.classList.toggle('on',c===b));guide()};
guide();

/* map */
const map=L.map('map').setView([3.5952,98.6722],12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
const layer=L.layerGroup().addTo(map);let tmp=null;
const pin=c=>L.divIcon({className:'',html:`<div class="pin" style="--c:${c}"></div>`,iconSize:[20,20],iconAnchor:[10,20]});
function setSel(lat,lng){sel={lat,lng};$('#loc').value=lat.toFixed(5)+', '+lng.toFixed(5);if(tmp)tmp.setLatLng([lat,lng]);else tmp=L.marker([lat,lng],{opacity:.6}).addTo(map)}
map.on('click',e=>{setSel(e.latlng.lat,e.latlng.lng);toast('Lokasi laporan dipilih dari peta.')});
function drawMap(){layer.clearLayers();reports.forEach(r=>{if(r.lat!=null)L.marker([r.lat,r.lng],{icon:pin(CATS[r.cat].c)}).addTo(layer).bindPopup(`<b>${esc(r.place)}</b><br>${CATS[r.cat].n}<br><small>${esc(r.desc)}</small>`)})}
$('#geo').onclick=()=>{if(!navigator.geolocation)return toast('Browser tidak mendukung lokasi.');navigator.geolocation.getCurrentPosition(p=>{setSel(p.coords.latitude,p.coords.longitude);map.flyTo([p.coords.latitude,p.coords.longitude],15);toast('Lokasi berhasil diambil.')},()=>toast('Izin lokasi ditolak. Klik peta untuk memilih manual.','#e5484d'))};

/* photo */
let photo=null;
$('#photo').onchange=e=>{const f=e.target.files[0];if(!f)return;const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),s=Math.min(1,500/im.width);c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);photo=c.toDataURL('image/jpeg',.7);$('#prev').src=photo;$('#prev').hidden=false;$('#dropT').hidden=true};im.src=fr.result};fr.readAsDataURL(f)};

/* reports */
const STEPS=['Terkirim','Ditinjau','Ditindaklanjuti'];
const fmt=t=>new Date(t).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
function drawReports(){
 $('#reports').innerHTML=reports.length?[...reports].reverse().map(r=>{const v=CATS[r.cat];return `<article class="rp" style="--c:${v.c}"><div class="rp-h"><b>${esc(r.place)}</b><span class="badge">${v.n}</span></div><p>${esc(r.desc)}</p><small style="color:var(--mut)">${fmt(r.t)}</small>${r.img?`<br><img src="${r.img}" alt="Foto laporan">`:''}<div class="steps">${STEPS.map((s,i)=>`<div class="${i<=r.st?'done':''}">${s}</div>`).join('')}</div></article>`}).join(''):'<div class="empty">Belum ada laporan.</div>';
 drawMap();counters()}
$('#reportForm').onsubmit=e=>{e.preventDefault();const place=$('#place').value.trim(),desc=$('#desc').value.trim();
 if(!place||!desc)return toast('Isi nama tempat dan keterangan dulu.','#e5484d');
 const c=map.getCenter(),r={id:Date.now(),cat:selCat,place,desc,lat:sel?sel.lat:c.lat,lng:sel?sel.lng:c.lng,st:0,t:Date.now(),img:photo};
 reports.push(r);save('am_reports',reports);e.target.reset();photo=null;$('#prev').hidden=true;$('#dropT').hidden=false;sel=null;if(tmp){tmp.remove();tmp=null}
 drawReports();toast('Laporan terkirim.',CATS[r.cat].c);$('#bellDot').hidden=false;
 setTimeout(()=>advance(r.id,1),6000);setTimeout(()=>advance(r.id,2),14000);
 setTimeout(()=>$('#status').scrollIntoView({behavior:'smooth'}),700)};
function advance(id,st){const r=reports.find(x=>x.id===id);if(!r||r.st>=st)return;r.st=st;save('am_reports',reports);drawReports();toast(`Laporan "${r.place}": ${STEPS[st].toLowerCase()} (simulasi).`,CATS[r.cat].c)}
reports.forEach(r=>{if(r.st<2&&Date.now()-r.t<3e4){setTimeout(()=>advance(r.id,1),3000);setTimeout(()=>advance(r.id,2),9000)}});

/* reminders */
const days=d=>Math.ceil((new Date(d+'T23:59:59')-Date.now())/864e5);
function drawRems(){
 const l=rems.map(r=>({...r,d:days(r.date)})).filter(r=>remF==='all'||(remF==='soon'&&r.d>=0&&r.d<=3)||(remF==='exp'&&r.d<0)).sort((a,b)=>a.d-b.d);
 $('#remList').innerHTML=l.length?l.map(r=>{const c=r.d<0?'#e5484d':r.d<=3?'#f5b301':'#2f9e6b',t=r.d<0?`Lewat ${-r.d} hari`:r.d===0?'Hari ini!':`${r.d} hari lagi`;
  return `<li style="--c:${c}"><div class="grow"><b>${esc(r.name)}</b><small>${fmt(r.date)}</small></div><span class="badge">${t}</span><button class="del" data-id="${r.id}" aria-label="Hapus">🗑️</button></li>`}).join(''):'<div class="empty">Belum ada pengingat di kategori ini.</div>';
 counters()}
$('#remForm').onsubmit=e=>{e.preventDefault();rems.push({id:Date.now(),name:$('#rn').value.trim(),date:$('#rd').value});save('am_rems',rems);e.target.reset();drawRems();toast('Pengingat disimpan.','#8b5cf6')};
$('#remList').onclick=e=>{const b=e.target.closest('.del');if(!b)return;rems=rems.filter(r=>r.id!=b.dataset.id);save('am_rems',rems);drawRems()};
$('#remTabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;remF=b.dataset.f;$$('#remTabs button').forEach(x=>x.classList.toggle('on',x===b));drawRems()};
setTimeout(()=>{const n=rems.filter(r=>{const d=days(r.date);return d>=0&&d<=3}).length;if(n)toast(`${n} makanan hampir kedaluwarsa. Cek pengingatmu.`,'#f5b301')},1500);

/* edukasi */
$('#edu').innerHTML=EDU.map(e=>`<div class="ec" data-t="${e[0]}" tabindex="0"><span class="ic">${e[1]}</span><h3>${e[2]}</h3><p>${e[3]}</p><div class="more">${e[4]}</div></div>`).join('');
$('#edu').onclick=e=>{const c=e.target.closest('.ec');if(c)c.classList.toggle('open')};
$('#edu').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.target.click()}};
$('#eduTabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;$$('#eduTabs button').forEach(x=>x.classList.toggle('on',x===b));$$('.ec').forEach(c=>c.classList.toggle('hide',b.dataset.f!=='all'&&c.dataset.t!==b.dataset.f))};
$('#helpBtn').onclick=()=>{toast('Hubungi Puskesmas atau rumah sakit terdekat. Darurat: 119.','#e5484d')};

/* counters + reveal */
function counters(){$$('[data-count]').forEach(el=>{const k=el.dataset.count,to=k==='reports'?reports.length:k==='reminders'?rems.length:+k,from=+el.textContent||0,t0=performance.now();
 (function f(t){const p=Math.min((t-t0)/900,1);el.textContent=Math.round(from+(to-from)*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(t0)})}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
$$('.head,.card,.ec,.map-wrap,.alert').forEach(el=>{el.classList.add('rv');io.observe(el)});
drawReports();drawRems();