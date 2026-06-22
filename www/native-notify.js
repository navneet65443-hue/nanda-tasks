/* Nanda Tasks — native notification bridge.
   This file does NOTHING on the website. It only activates inside the
   native Android app (Capacitor), where it schedules real on-device
   notifications that fire even when the app is fully closed. */
(function(){
  var Cap = window.Capacitor;
  if(!Cap || typeof Cap.isNativePlatform !== "function" || !Cap.isNativePlatform()) return;   // web → do nothing
  var LN = (Cap.Plugins && Cap.Plugins.LocalNotifications) || null;
  if(!LN) return;

  try { LN.requestPermissions(); } catch(e){}
  try { LN.createChannel && LN.createChannel({ id:"reminders", name:"Task reminders", description:"Reminders for your shop tasks", importance:5, vibration:true }); } catch(e){}

  function intId(s){ var h=0; s=String(s||""); for(var i=0;i<s.length;i++){ h=(h*31 + s.charCodeAt(i))|0; } return Math.abs(h)%1000000 + 1; }
  var lastIds = [];

  /* The web app calls this on each render with today's upcoming timed tasks:
     list = [{ id:"taskid", title:"Open shop", at: <ms timestamp> }]  */
  window.__nandaNotify = function(list){
    try{
      if(lastIds.length){ LN.cancel({ notifications: lastIds.map(function(id){ return { id:id }; }) }).catch(function(){}); }
      var now = Date.now(), notifs = [], ids = [];
      (list||[]).forEach(function(t){
        if(!t || !t.at || t.at <= now + 15000) return;          // only schedule future reminders
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
      if(notifs.length){ LN.schedule({ notifications: notifs }).catch(function(){}); }
    }catch(e){}
  };
})();
