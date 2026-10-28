// Royals Mills — ऐप तुरंत खुले: फ़ोन की सेव कॉपी पहले, नया वर्ज़न पीछे से (अगली बार खुलने पर लगता है)
var CACHE='royals-mills-v4';
self.addEventListener('install',function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(['./','index.html','manifest.json'].map(function(u){return c.add(u).catch(function(){});}));
  }));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
function sig(r){return (r&&r.headers)?[r.headers.get('etag'),r.headers.get('last-modified'),r.headers.get('content-length')].join('|'):'';}
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var url=new URL(req.url);
  if(url.origin!==self.location.origin)return;                 // Firebase / Google Fonts को न छुएँ
  e.respondWith(caches.open(CACHE).then(function(cache){
    return cache.match(req,{ignoreSearch:true}).then(function(cached){
      var net=fetch(req).then(function(res){
        if(res&&res.status===200){
          var changed=cached&&sig(cached)!==sig(res)&&sig(res)!=='||';
          cache.put(req,res.clone());
          if(changed){self.clients.matchAll({type:'window'}).then(function(cs){cs.forEach(function(c){c.postMessage({type:'NEW_VERSION'});});});}
        }
        return res;
      }).catch(function(){return null;});
      if(cached){e.waitUntil(net);return cached;}             // सेव कॉपी तुरंत, नेट का इंतज़ार नहीं
      return net.then(function(res){return res||cache.match('./')||Response.error();});
    });
  }));
});
