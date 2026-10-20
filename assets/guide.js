const toggle=document.querySelector('#menu-toggle');
const sidebar=document.querySelector('#sidebar');
function closeMenu(){sidebar.classList.remove('open');toggle.setAttribute('aria-expanded','false')}
toggle.addEventListener('click',()=>{const open=sidebar.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});
document.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&sidebar.classList.contains('open')){closeMenu();toggle.focus()}});
document.addEventListener('click',event=>{if(!sidebar.contains(event.target)&&!toggle.contains(event.target))closeMenu()});
const sectionMenu=document.querySelector('.local-menu');
const topNav=document.querySelector('.top-nav');
const links=[...document.querySelectorAll('.local-menu a[href^="#"]')];
const sections=links.map(link=>document.querySelector(link.getAttribute('href')));
const narrowNavigation=window.matchMedia('(max-width: 900px)');
let sectionToggle=null;
function closeSections(){
    sectionMenu?.classList.remove('expanded');
    sectionToggle?.setAttribute('aria-expanded','false');
}
if(sectionMenu){
    const heading=document.createElement('span');
    heading.className='section-nav-heading';
    heading.textContent='BU REHBERDE';
    const list=document.createElement('div');
    list.className='local-links';
    list.id='section-links';
    links.forEach(link=>list.append(link));
    sectionToggle=document.createElement('button');
    sectionToggle.type='button';
    sectionToggle.className='section-nav-toggle';
    sectionToggle.setAttribute('aria-controls',list.id);
    sectionToggle.setAttribute('aria-expanded','false');
    sectionToggle.textContent='Bölümler';
    sectionToggle.addEventListener('click',()=>{
        const open=sectionMenu.classList.toggle('expanded');
        sectionToggle.setAttribute('aria-expanded',String(open));
    });
    sectionMenu.replaceChildren(heading,sectionToggle,list);
    sectionMenu.classList.add('enhanced');
    links.forEach(link=>link.addEventListener('click',closeSections));
    document.addEventListener('keydown',event=>{
        if(event.key==='Escape'&&sectionMenu.classList.contains('expanded')){
            closeSections();sectionToggle.focus();
        }
    });
    document.addEventListener('click',event=>{if(!sectionMenu.contains(event.target))closeSections()});
}
function highlight(){
    let current=sections[0];
    if(!current)return;
    const threshold=(topNav?.offsetHeight||64)+(narrowNavigation.matches?80:32);
    for(const section of sections){if(section&&section.getBoundingClientRect().top<=threshold)current=section}
    if(window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-3){current=sections.filter(Boolean).at(-1)||current}
    links.forEach(link=>{
        const active=link.hash==='#'+current.id;
        link.classList.toggle('active',active);
        if(active){link.setAttribute('aria-current','location');if(sectionToggle)sectionToggle.textContent='Bölümler · '+link.textContent}
        else link.removeAttribute('aria-current');
    });
}
let scrollFrame=0;
function scheduleHighlight(){if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;highlight()})}
function sizeNavigation(){document.documentElement.style.setProperty('--ecosystem-nav-height',(topNav?.offsetHeight||64)+'px');scheduleHighlight()}
if('ResizeObserver' in window&&topNav){const navigationResize=new ResizeObserver(sizeNavigation);navigationResize.observe(topNav)}
window.addEventListener('resize',sizeNavigation,{passive:true});
window.addEventListener('scroll',scheduleHighlight,{passive:true});
sizeNavigation();highlight();
const search=document.querySelector('#command-search');
const commands=[...document.querySelectorAll('#commands .command')];
const normalize=value=>value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
function filterCommands(){const query=normalize(search.value.trim());let visible=0;commands.forEach(command=>{const match=normalize(command.textContent).includes(query);command.hidden=!match;if(match)visible++});document.querySelector('#result-count').textContent=visible+' / '+commands.length+' komut gösteriliyor';document.querySelector('#no-results').hidden=visible!==0}
if(search){search.addEventListener('input',filterCommands);filterCommands()}
let messageTimer;
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{const status=document.querySelector('#copy-status');try{await navigator.clipboard.writeText(button.dataset.copy);status.textContent='Kopyalandı: '+button.dataset.copy}catch{status.textContent='Kopyalanamadı. Komutu seçip elle kopyalayabilirsiniz.'}clearTimeout(messageTimer);messageTimer=setTimeout(()=>status.textContent='',3500)}));

// Per-skill details from the pinned version, shared by the overview and examples.
const detailsPayload=document.querySelector('#workflow-details');
const workflowDialog=document.querySelector('#workflow-dialog');
if(detailsPayload&&workflowDialog){
    const workflowDetails=JSON.parse(detailsPayload.textContent);
    let workflowOpener=null;
    document.querySelectorAll('article').forEach(card=>{
        const command=card.querySelector('code.cmd')?.textContent.trim();
        const entry=workflowDetails[command];
        if(!entry)return;
        const button=document.createElement('button');
        button.type='button';button.className='workflow-details-button';
        button.textContent=entry.sourceOutline?'Kaynak ayrıntıları ↗':'Akış adımları ↗';
        button.setAttribute('aria-haspopup','dialog');
        button.setAttribute('aria-label',command+' akış ayrıntıları');
        const heading=card.querySelector('.board-item-title,.phase-header,h4,h3');
        if(heading)heading.insertAdjacentElement('afterend',button);else card.append(button);
        button.addEventListener('click',()=>{
            workflowOpener=button;
            workflowDialog.querySelector('h2').textContent=command;
            workflowDialog.querySelector('.dialog-note').textContent=entry.sourceOutline
                ?'Bu sayfada belirtilen sürümün kaynak tanımındaki bölüm başlıklarıdır; her başlık zorunlu ve sıralı bir çalışma adımı değildir. Uygulama talimatları için kaynak bağlantısını açın.'
                :'Bu sayfada belirtilen sürümün akış özeti. Seçilen niyet, devam durumu ve kısa yollar nedeniyle her çalıştırma bütün adımlardan geçmeyebilir.';
            const list=workflowDialog.querySelector('.dialog-steps');list.replaceChildren();
            entry.steps.forEach(step=>{const li=document.createElement('li');li.textContent=step;list.append(li)});
            workflowDialog.querySelector('.dialog-source').href=entry.source;
            workflowDialog.showModal();
        });
    });
    workflowDialog.querySelector('.dialog-close').addEventListener('click',()=>workflowDialog.close());
    workflowDialog.addEventListener('click',event=>{if(event.target===workflowDialog){const r=workflowDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)workflowDialog.close()}});
    workflowDialog.addEventListener('close',()=>workflowOpener?.focus());
}
