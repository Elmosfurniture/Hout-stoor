/* elmo's Hout Stoor — Service Worker
   Handles push notifications so a message can reach the phone even when
   the app is closed (added to home screen). */

self.addEventListener('install', function(e){
  self.skipWaiting();
});
self.addEventListener('activate', function(e){
  e.waitUntil(self.clients.claim());
});

// Fires when a push arrives from the server (Supabase Edge Function)
self.addEventListener('push', function(event){
  var data={};
  try{ data=event.data?event.data.json():{}; }catch(e){ data={title:'Hout Stoor',body:event.data?event.data.text():''}; }
  var title=data.title||"Hout Stoor";
  var options={
    body:data.body||'',
    icon:data.icon||'icon-192.png',
    badge:data.badge||'icon-192.png',
    tag:data.tag||'hout-stoor',
    data:{url:data.url||'./'},
    vibrate:[100,50,100]
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

// Fires when the user taps the notification
self.addEventListener('notificationclick', function(event){
  event.notification.close();
  var url=(event.notification.data&&event.notification.data.url)||'./';
  event.waitUntil(
    self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
      for(var i=0;i<list.length;i++){
        var c=list[i];
        if('focus' in c) return c.focus();
      }
      if(self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
