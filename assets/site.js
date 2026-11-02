/* איחוד צעהלים — shared site script */
(function(){
  var toggle=document.querySelector('.nav-toggle'), nav=document.getElementById('site-nav');
  if(toggle&&nav){
    toggle.addEventListener('click',function(){
      var open=!nav.classList.contains('open');
      nav.classList.toggle('open',open);document.body.classList.toggle('nav-open',open);
      toggle.setAttribute('aria-expanded',open?'true':'false');
      toggle.querySelector('.nt-open').hidden=open;toggle.querySelector('.nt-close').hidden=!open;
    });
    nav.addEventListener('click',function(e){
      var a=e.target.closest('a');
      if(a&&nav.classList.contains('open')&&a.getAttribute('href').indexOf('#')>-1){toggle.click();}
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){toggle.click();toggle.focus();}});
    window.addEventListener('resize',function(){if(window.innerWidth>=1100&&nav.classList.contains('open'))toggle.click();});
  }
  document.querySelectorAll('.sub-btn').forEach(function(b){
    b.addEventListener('click',function(){
      var sub=document.getElementById(b.getAttribute('aria-controls'));
      var open=b.getAttribute('aria-expanded')!=='true';
      b.setAttribute('aria-expanded',open?'true':'false');sub.classList.toggle('open',open);
    });
  });
  var cur=document.querySelector('.sub a[aria-current="page"]');
  if(cur){var li=cur.closest('.menu>li');var b=li&&li.querySelector('.sub-btn');if(b)b.click();}

  var links=[].slice.call(document.querySelectorAll('[data-lightbox] a'));
  if(links.length&&window.HTMLDialogElement){
    var dlg=document.createElement('dialog');dlg.className='lightbox';dlg.setAttribute('aria-label','בילד');
    var X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">';
    dlg.innerHTML='<div class="lb-inner"><img alt=""></div>'+
      '<button class="lb-close" type="button" aria-label="פארמאכן">'+X+'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'+
      '<button class="lb-nav lb-prev" type="button" aria-label="פריערדיגע">'+X+'<polyline points="9 18 15 12 9 6"/></svg></button>'+
      '<button class="lb-nav lb-next" type="button" aria-label="קומענדיגע">'+X+'<polyline points="15 18 9 12 15 6"/></svg></button>';
    document.body.appendChild(dlg);
    var img=dlg.querySelector('img'),idx=0,set=[];
    function show(i){idx=(i+set.length)%set.length;img.src=set[idx].href;img.alt=(set[idx].querySelector('img')||{}).alt||'';}
    links.forEach(function(a){a.addEventListener('click',function(e){
      e.preventDefault();set=[].slice.call(a.closest('[data-lightbox]').querySelectorAll('a'));show(set.indexOf(a));dlg.showModal();});});
    dlg.querySelector('.lb-close').onclick=function(){dlg.close();};
    dlg.querySelector('.lb-prev').onclick=function(){show(idx-1);};
    dlg.querySelector('.lb-next').onclick=function(){show(idx+1);};
    dlg.addEventListener('click',function(e){if(e.target===dlg||e.target.classList.contains('lb-inner'))dlg.close();});
    var sx=null;
    dlg.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;},{passive:true});
    dlg.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>50)show(dx>0?idx+1:idx-1);});
    document.addEventListener('keydown',function(e){if(!dlg.open)return;if(e.key==='ArrowLeft')show(idx+1);if(e.key==='ArrowRight')show(idx-1);});
  }
})();
