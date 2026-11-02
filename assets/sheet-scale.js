/* scales the fixed-size weekly sheet (11in x 8.5in) to the available width */
(function(){
  var box=document.getElementById('sheetScale'),fr=document.getElementById('sheetFrame');
  if(!box||!fr)return;
  var W=1100,H=920;
  function measure(){
    try{var d=fr.contentDocument;if(d&&d.body){W=Math.max(d.documentElement.scrollWidth,1080);H=d.documentElement.scrollHeight;}}catch(e){}
    fr.style.width=W+'px';fr.style.height=H+'px';fit();
  }
  function fit(){var s=Math.min(1,box.clientWidth/W);fr.style.transform='scale('+s+')';box.style.height=Math.ceil(H*s)+'px';}
  fr.addEventListener('load',function(){measure();setTimeout(measure,1500);setTimeout(measure,4000);});
  window.addEventListener('resize',fit);fit();
})();
