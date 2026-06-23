/* Nanda Tasks — native notification bridge.
   Does NOTHING on a normal browser. Activates only inside the native
   Android app (Capacitor), where it schedules real on-device notifications
   that fire even when the app is closed.
   Built to work whether the app loads its own bundled copy OR the live
   Cloudflare site (server.url mode): it waits for the notification plugin
   to be ready instead of giving up, and remembers the latest task list. */
(function(){
  var Cap = window.Capacitor;
  if(!Cap || typeof Cap.isNativePlatform !== "function" || !Cap.isNativePlatform()) return;   // web → do nothing

  function LN(){ return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) || null; }
  function intId(s){ var h=0; s=String(s||""); for(var i=0;i<s.length;i++){ h=(h*31 + s.charCodeAt(i))|0; } return Math.abs(h)%1000000 + 1; }

  var lastIds = [];
  var pendingList = null;
  var ready = false;

  function schedule(list){
    var ln = LN();
    if(!ln){ pendingList = list; return; }          // plugin not ready yet -> remember and try again later
    pendingList = list;
    try{
      if(lastIds.length){ ln.cancel({ notifications: lastIds.map(function(id){ return { id:id }; }) }).catch(function(){}); }
      var now = Date.now(), notifs = [], ids = [];
      (list||[]).forEach(function(t){
        if(!t || !t.at || t.at <= now + 15000) return;          // only future reminders
        var id = intId(t.id || t.title);
        if(ids.indexOf(id) >= 0) return;
        ids.push(id);
        notifs.push({
          id: id,
          title: "Nanda Tasks",
          body: t.title || "You have a task due now.",
          schedule: { at: new Date(t.at), allowWhileIdle: true },
          channelId: "nanda_alarm_v2",
          smallIcon: "ic_stat_icon"
        });
      });
      lastIds = ids;
      if(notifs.length){ ln.schedule({ notifications: notifs }).catch(function(){}); }
    }catch(e){}
  }

  /* The web app calls this on each render with today's upcoming timed tasks:
     list = [{ id:"taskid", title:"Open shop", at:<ms timestamp> }] */
  window.__nandaNotify = function(list){ schedule(list); };

  /* Wait for the notification plugin to come online (it can appear a moment
     after the page loads, especially in live-site mode), then ask permission,
     create the channel, and flush any reminders that were waiting. */
  var tries = 0;
  (function init(){
    var ln = LN();
    if(ln){
      if(!ready){
        ready = true;
        try{ ln.requestPermissions(); }catch(e){}
        try{ ln.createChannel && ln.createChannel({ id:"nanda_alarm_v2", name:"Task alarms", description:"Loud reminders for your shop tasks", importance:5, sound:"alarm_tone.wav", vibration:true, visibility:1 }); }catch(e){}
      }
      if(pendingList){ schedule(pendingList); }
      return;
    }
    if(tries++ < 25) setTimeout(init, 300);          // retry for ~7.5s
  })();
})();
