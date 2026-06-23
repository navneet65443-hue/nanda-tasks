/* Nanda Tasks — native notification bridge.
   Does NOTHING on a normal browser. Activates only inside the native
   Android app (Capacitor), where it schedules on-device notifications
   that fire even when the app is closed. */
(function(){
  var Cap = window.Capacitor;
  if(!Cap || typeof Cap.isNativePlatform !== "function" || !Cap.isNativePlatform()) return;

  function LN(){ return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) || null; }
  function intId(s){ var h=0; s=String(s||""); for(var i=0;i<s.length;i++){ h=(h*31 + s.charCodeAt(i))|0; } return Math.abs(h)%1000000 + 1; }

  var lastIds = [];
  var pendingList = null;
  var ready = false;

  function schedule(list){
    var ln = LN();
    if(!ln){ pendingList = list; return; }
    pendingList = list;
    try{
      if(lastIds.length){ ln.cancel({ notifications: lastIds.map(function(id){ return { id:id }; }) }).catch(function(){}); }
      var now = Date.now(), notifs = [], ids = [];
      (list||[]).forEach(function(t){
        if(!t || !t.at || t.at <= now + 15000) return;
        var id = intId(t.id || t.title);
        if(ids.indexOf(id) >= 0) return;
        ids.push(id);
        notifs.push({
          id: id,
          title: "Nanda Tasks",
          body: t.title || "You have a task due now.",
          schedule: { at: new Date(t.at), allowWhileIdle: true },
          channelId: "reminders",
          smallIcon: "ic_stat_icon"
        });
      });
      lastIds = ids;
      if(notifs.length){ ln.schedule({ notifications: notifs }).catch(function(){}); }
    }catch(e){}
  }

  window.__nandaNotify = function(list){ schedule(list); };

  var tries = 0;
  (function init(){
    var ln = LN();
    if(ln){
      if(!ready){
        ready = true;
        try{ ln.requestPermissions(); }catch(e){}
        try{ ln.createChannel && ln.createChannel({ id:"reminders", name:"Task reminders", description:"Reminders for your shop tasks", importance:5, vibration:true }); }catch(e){}
      }
      if(pendingList){ schedule(pendingList); }
      return;
    }
    if(tries++ < 25) setTimeout(init, 300);
  })();
})();
