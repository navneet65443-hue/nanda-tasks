/* Nanda Tasks — Firebase Cloud Messaging (server push) bridge.
   Does NOTHING on a normal browser. In the native Android app it registers
   the phone with Firebase, gets its push token, and hands it to the app so
   the cloud scheduler can send reminders that arrive even when the phone is
   locked (battery savers can't block these the way they block local alarms). */
(function(){
  var Cap = window.Capacitor;
  if(!Cap || typeof Cap.isNativePlatform !== "function" || !Cap.isNativePlatform()) return;   // web → do nothing

  function PN(){ return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.PushNotifications) || null; }

  var tries = 0;
  (function init(){
    var pn = PN();
    if(pn){
      try{
        pn.addListener('registration', function(token){
          window.__nandaFcmToken = (token && token.value) || null;
          if(window.__onFcmToken){ try{ window.__onFcmToken(window.__nandaFcmToken); }catch(e){} }
        });
        pn.addListener('registrationError', function(err){
          window.__nandaFcmError = (function(){ try{ return JSON.stringify(err); }catch(e){ return String(err); } })();
        });
        // when a push arrives while the app is OPEN, the system tray notification is
        // not shown automatically — so show a local one so it isn't missed.
        pn.addListener('pushNotificationReceived', function(n){
          var LN = (window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) || null;
          if(LN && n){
            try{ LN.schedule({ notifications: [{ id: Date.now()%100000, title: n.title || "Nanda Tasks", body: n.body || "", smallIcon: "ic_stat_icon", channelId: "reminders" }] }); }catch(e){}
          }
        });
        pn.requestPermissions().then(function(res){
          if(res && res.receive === 'granted'){ pn.register(); }
        }).catch(function(){});
      }catch(e){}
      return;
    }
    if(tries++ < 25) setTimeout(init, 300);   // wait for the plugin to come online
  })();
})();
