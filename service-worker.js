// Royals Mills — पेज हमेशा पहले नेट से, ताकि नया वर्ज़न तुरंत मिले
var CACHE='royals-mills-v2';
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
  e.respondWith(
    fetch(req).then(function(res){
      if(res&&res.status===200){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy);});}
      return res;
    }).catch(function(){
      return caches.match(req).then(function(m){return m||caches.match('./');});
    })
  );
});
