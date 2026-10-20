// Royals Mills — पहले नेट से (नया वर्ज़न तुरंत), पर नेट धीमा हो तो 3 सेकंड बाद सेव की हुई कॉपी
var CACHE='royals-mills-v3';
var WAIT_MS=3000;
self.addEventListener('install',function(e){self.skipWaiting();});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var url=new URL(req.url);
  if(url.origin!==self.location.origin)return;   // Firebase / Google fonts को न छुएँ
  e.respondWith(new Promise(function(resolve){
    var done=false;
    function answer(r){if(!done){done=true;resolve(r);}}
    // नेट 3 सेकंड में न आए तो सेव की हुई कॉपी दिखाओ (नेट आने पर कॉपी अपने-आप नई हो जाती है)
    var timer=setTimeout(function(){
      caches.match(req,{ignoreSearch:true}).then(function(m){if(m)answer(m);});
    },WAIT_MS);
    fetch(req).then(function(res){
      clearTimeout(timer);
      if(res&&res.status===200){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy);});}
      answer(res);
    },function(){
      clearTimeout(timer);
      caches.match(req,{ignoreSearch:true}).then(function(m){return m||caches.match('./');}).then(function(m){answer(m||Response.error());});
    });
  }));
});
