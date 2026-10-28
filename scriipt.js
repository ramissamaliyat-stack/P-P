const $ = s => document.querySelector(s);
const paper = $('#paper'), decorLayer = $('#decorLayer'), writingArea = $('#writingArea'), trackerGrid = $('#trackerGrid');
let currentPen = '#4e4148', trackerCount = 0, selectedDecoration = null;
const today = new Date();
$('#entryDate').value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
function showToast(message){const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),2200)}
function updateDate(){const val=$('#entryDate').value;if(!val){$('#shownDate').textContent='';return}const d=new Date(val+'T12:00:00');$('#shownDate').textContent=d.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
function setPaperStyle(){paper.classList.remove('ruled','plain','dotted','gridpaper','vintage');paper.classList.add($('#paperStyle').value)}
$('#paperSize').addEventListener('change',()=>{paper.classList.remove('a5','letter','square');paper.classList.add($('#paperSize').value)});
$('#paperStyle').addEventListener('change',setPaperStyle);
$('#paperColors').addEventListener('click',e=>{const b=e.target.closest('[data-paper]');if(!b)return;paper.classList.remove('cream','blush','lavender','sage','sky','midnight');paper.classList.add(b.dataset.paper);document.querySelectorAll('.swatch').forEach(x=>x.classList.toggle('active',x===b))});
$('#fontSelect').addEventListener('change',()=>{writingArea.style.fontFamily=`"${$('#fontSelect').value}", cursive`;$('#shownTitle').style.fontFamily=`"${$('#fontSelect').value}", cursive`});
$('#penColors').addEventListener('click',e=>{const b=e.target.closest('[data-color]');if(!b)return;currentPen=b.dataset.color;writingArea.style.color=currentPen;document.querySelectorAll('.color-dot').forEach(x=>x.classList.toggle('active',x===b));$('#customPen').value=currentPen});
$('#customPen').addEventListener('input',e=>{currentPen=e.target.value;writingArea.style.color=currentPen;document.querySelectorAll('.color-dot').forEach(x=>x.classList.remove('active'))});
$('#pageTitle').addEventListener('input',e=>$('#shownTitle').textContent=e.target.value);
$('#pageSubtitle').addEventListener('input',e=>$('#shownSubtitle').textContent=e.target.value);
$('#entryDate').addEventListener('change',updateDate);
$('#bulletBtn').addEventListener('click',()=>{writingArea.focus();document.execCommand('insertText',false,'✿  ');});
$('#boldBtn').addEventListener('click',()=>{writingArea.focus();document.execCommand('bold')});
$('#centerBtn').addEventListener('click',()=>{const t=$('#shownTitle');t.style.textAlign=t.style.textAlign==='center'?'left':'center'});
document.querySelectorAll('[data-sticker]').forEach(b=>b.addEventListener('click',()=>addDecoration('sticker',b.dataset.sticker)));
document.querySelectorAll('[data-cutout]').forEach(b=>b.addEventListener('click',()=>addDecoration('cutout',b.dataset.cutout)));
document.querySelectorAll('[data-tape]').forEach(b=>b.addEventListener('click',()=>addDecoration('tape',b.dataset.tape)));
function addDecoration(type,value){
 const el=document.createElement('div');el.className=type==='sticker'?'placed-sticker':type==='cutout'?'cutout':'tape';
 if(type==='sticker'){el.textContent=value;el.style.fontSize='36px';el.setAttribute('aria-label','decorative sticker')}
 if(type==='cutout'){el.textContent=value}
 if(type==='tape'){el.style.background=value;el.title='Washi tape'}
 const offset=(decorLayer.children.length*19)%180;
 el.style.left=(22+offset)+'px';el.style.top=(125+offset)+'px';el.dataset.kind=type;
 el.tabIndex=0;decorLayer.appendChild(el);makeDraggable(el);selectDecoration(el);showToast(type==='sticker'?'Sticker added! Drag it anywhere.':type==='cutout'?'Cutout added!':'Washi tape added!');
}
function selectDecoration(el){if(selectedDecoration)selectedDecoration.classList.remove('selected');selectedDecoration=el;el.classList.add('selected')}
function makeDraggable(el){
 let startX,startY,origX,origY,dragging=false;
 el.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;el.setPointerCapture(e.pointerId);startX=e.clientX;startY=e.clientY;origX=el.offsetLeft;origY=el.offsetTop;selectDecoration(el);e.preventDefault()});
 el.addEventListener('pointermove',e=>{if(!dragging)return;const rect=paper.getBoundingClientRect();let x=origX+(e.clientX-startX),y=origY+(e.clientY-startY);x=Math.max(0,Math.min(x,rect.width-el.offsetWidth));y=Math.max(0,Math.min(y,rect.height-el.offsetHeight));el.style.left=x+'px';el.style.top=y+'px'});
 el.addEventListener('pointerup',()=>dragging=false);el.addEventListener('pointercancel',()=>dragging=false);
 el.addEventListener('click',()=>selectDecoration(el));
}
document.addEventListener('keydown',e=>{if((e.key==='Delete'||e.key==='Backspace')&&selectedDecoration&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!document.activeElement.isContentEditable){selectedDecoration.remove();selectedDecoration=null;showToast('Decoration removed')}})
const trackerTemplates={
 habit:{title:'Habit tracker',body:'My tiny daily habits',checks:true},
 mood:{title:'Mood check-in',body:'How am I feeling today?\n☀ happy  ☁ tired  ♡ calm\n✿ anxious  ☾ hopeful'},
 water:{title:'Water tracker',body:'Little sips, big care\nTap each glass as you drink:',checks:true,checksCount:8},
 sleep:{title:'Sleep diary',body:'Bedtime: __________\nWake-up: __________\nHours slept: ________\nRested?  ☆ ☆ ☆ ☆ ☆'},
 reading:{title:'Reading corner',body:'Book: __________________\nPages read: _____________\nA line I loved: __________'},
 gratitude:{title:'Today I’m grateful for…',body:'1. ____________________\n2. ____________________\n3. ____________________'},
 spending:{title:'Spending log ৳',body:'What I bought: __________\nAmount: ৳ ______________\nNeed or want? ___________'},
 todo:{title:'Little to-do list',body:'☐ _____________________\n☐ _____________________\n☐ _____________________\n☐ _____________________'}
};
document.querySelectorAll('[data-tracker]').forEach(b=>b.addEventListener('click',()=>addTracker(b.dataset.tracker)));
function addTracker(type){
 const data=trackerTemplates[type],card=document.createElement('section');card.className='tracker';card.dataset.type=type;
 const h=document.createElement('h4');h.contentEditable='true';h.textContent=data.title;
 const body=document.createElement('div');body.className='tracker-content';body.contentEditable='true';body.textContent=data.body;
 const remove=document.createElement('button');remove.className='remove-tracker';remove.textContent='×';remove.title='Remove sticky note';remove.setAttribute('aria-label','Remove tracker');remove.addEventListener('click',()=>card.remove());
 card.append(remove,h,body);
 if(data.checks){const checks=document.createElement('div');checks.className='checks';const count=data.checksCount||7;for(let i=0;i<count;i++){const s=document.createElement('span');s.title='Tap to mark complete';s.addEventListener('click',()=>s.classList.toggle('checked'));checks.appendChild(s)}card.appendChild(checks)}
 trackerGrid.appendChild(card);showToast('Sticky note added! Edit the text directly.');
}
$('#printBtn').addEventListener('click',()=>{if(!writingArea.textContent.trim())showToast('Add a little diary note before printing ♡');setTimeout(()=>window.print(),180)});
function getDraft(){return {paperSize:$('#paperSize').value,paperStyle:$('#paperStyle').value,paperColor:['cream','blush','lavender','sage','sky','midnight'].find(c=>paper.classList.contains(c))||'cream',font:$('#fontSelect').value,pen:currentPen,title:$('#pageTitle').value,subtitle:$('#pageSubtitle').value,date:$('#entryDate').value,writing:writingArea.innerHTML,decor:decorLayer.innerHTML,trackers:trackerGrid.innerHTML}}
$('#saveBtn').addEventListener('click',()=>{try{localStorage.setItem('paperPetalsDraft',JSON.stringify(getDraft()));showToast('Your draft is saved on this device ♡')}catch(e){showToast('Could not save in this browser.')}})
function loadDraft(){try{const d=JSON.parse(localStorage.getItem('paperPetalsDraft'));if(!d)return;$('#paperSize').value=d.paperSize||'a5';paper.classList.remove('a5','letter','square');paper.classList.add(d.paperSize||'a5');$('#paperStyle').value=d.paperStyle||'ruled';setPaperStyle();paper.classList.remove('cream','blush','lavender','sage','sky','midnight');paper.classList.add(d.paperColor||'cream');$('#fontSelect').value=d.font||'Kalam';$('#pageTitle').value=d.title||'Little moments';$('#pageSubtitle').value=d.subtitle||'';$('#entryDate').value=d.date||'';currentPen=d.pen||'#4e4148';writingArea.innerHTML=d.writing||'';writingArea.style.color=currentPen;$('#shownTitle').textContent=$('#pageTitle').value;$('#shownSubtitle').textContent=$('#pageSubtitle').value;writingArea.style.fontFamily=`"${$('#fontSelect').value}", cursive`;$('#shownTitle').style.fontFamily=`"${$('#fontSelect').value}", cursive`;decorLayer.innerHTML=d.decor||'';trackerGrid.innerHTML=d.trackers||'';decorLayer.querySelectorAll('[data-kind]').forEach(makeDraggable);trackerGrid.querySelectorAll('.remove-tracker').forEach(b=>b.addEventListener('click',()=>b.parentElement.remove()));trackerGrid.querySelectorAll('.checks span').forEach(s=>s.addEventListener('click',()=>s.classList.toggle('checked')));updateDate()}catch(e){}}
$('#clearBtn').addEventListener('click',()=>{if(!confirm('Start a fresh page? Unsaved changes will be cleared.'))return;writingArea.innerHTML='';decorLayer.innerHTML='';trackerGrid.innerHTML='';$('#pageTitle').value='Little moments';$('#pageSubtitle').value='a little note to my future self';$('#shownTitle').textContent=$('#pageTitle').value;$('#shownSubtitle').textContent=$('#pageSubtitle').value;showToast('A fresh page, just for you 🌷')});
updateDate();loadDraft();