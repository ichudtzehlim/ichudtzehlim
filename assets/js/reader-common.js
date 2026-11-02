/* shared helpers for the reader pages (emails, messages, gilyonos) */
window.TZ=(function(){
  function parseCSV(text){
    var rows=[],insideQuotes=false,field="",row=[];
    for(var i=0;i<text.length;i++){
      var c=text[i],n=text[i+1];
      if(c==='"'&&insideQuotes&&n==='"'){field+='"';i++;}
      else if(c==='"')insideQuotes=!insideQuotes;
      else if(c===','&&!insideQuotes){row.push(field);field="";}
      else if((c==='\n'||c==='\r')&&!insideQuotes){
        if(field||row.length){row.push(field);rows.push(row);row=[];field="";}
        if(c==='\r'&&n==='\n')i++;
      }else field+=c;
    }
    if(field||row.length){row.push(field);rows.push(row);}
    return rows.map(function(r){return r.map(function(cell){return cell.replace(/^"|"$/g,"").replace(/""/g,'"').trim();});});
  }
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  /* Reader shell. Desktop: list on the side, item beside it.
     Phones (<768px): the list fills the screen; tapping an item opens it full screen
     with a back button (the phone's own back button works too). */
  function shell(opts){
    var app=document.getElementById('app'),list=document.getElementById('items'),
        btn=document.getElementById('menuBtn'),
        search=document.getElementById('search'),title=document.getElementById('viewTitle');
    var mobile=function(){return window.innerWidth<768;};
    var listScroll=0,pushed=false;
    if('scrollRestoration' in history)history.scrollRestoration='manual';
    function closeView(){
      if(!app.classList.contains('viewing'))return;
      app.classList.remove('viewing');
      var y=listScroll;
      window.scrollTo(0,y);
      requestAnimationFrame(function(){window.scrollTo(0,y);});
    }
    function openView(){
      if(app.classList.contains('viewing'))return;
      listScroll=window.scrollY;
      app.classList.add('viewing');
      try{history.pushState({tzView:1},'');pushed=true;}catch(e){pushed=false;}
      window.scrollTo(0,0);
    }
    btn.addEventListener('click',function(){
      if(pushed&&history.state&&history.state.tzView){history.back();}else{closeView();}
    });
    window.addEventListener('popstate',function(){pushed=false;closeView();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&mobile())btn.click();});
    var items=[];
    function select(b,d,fromUser){
      items.forEach(function(x){x.classList.remove('selected');x.removeAttribute('aria-current');});
      b.classList.add('selected');b.setAttribute('aria-current','true');
      title.textContent=d.label;
      if(fromUser&&mobile())openView();
      opts.onSelect(d);
    }
    function render(data){
      list.innerHTML="";items=[];
      data.forEach(function(d){
        var b=document.createElement('button');b.type='button';b.className='app-item';
        b.innerHTML='<strong>'+esc(d.label)+'</strong>'+(d.date?'<small>'+esc(d.date)+'</small>':'');
        b._search=(d.label+' '+(d.text||'')+' '+(d.date||'')).toLowerCase();
        b._data=d;
        b.addEventListener('click',function(){select(b,d,true);});
        list.appendChild(b);items.push(b);
      });
      if(!data.length)list.innerHTML='<div class="app-state">'+esc(opts.emptyText||'')+'</div>';
    }
    if(search)search.addEventListener('input',function(){
      var q=search.value.trim().toLowerCase();
      items.forEach(function(b){b.hidden=q&&b._search.indexOf(q)<0;});
    });
    function first(){
      /* desktop shows the newest item straight away; phones start on the list */
      if(!mobile()&&items[0]&&!items.some(function(x){return x.classList.contains('selected');}))select(items[0],items[0]._data,false);
    }
    window.addEventListener('resize',function(){
      if(!mobile()){if(app.classList.contains('viewing'))app.classList.remove('viewing');first();}
    });
    return{render:render,first:first,
      state:function(html,err){list.innerHTML='<div class="app-state'+(err?' err':'')+'">'+html+'</div>';},
      openList:function(){closeView();}};
  }
  return{parseCSV:parseCSV,esc:esc,shell:shell};
})();
