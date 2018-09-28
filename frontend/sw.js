(function(){

self.addEventListener('push', function(e) {
	var body = (typeof e.data != undefined && e.data != null) ? e.data.text() : " leer ";
	var url = "";
	if (typeof e.data != undefined && e.data != null) {
	    let msg = JSON.parse(e.data.text());
	    body = msg.msg;
	    url = msg.url;
	}
  var options = {
    body: body,
    // icon: 'images/example.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    data: {
     url: url
   },
   tag: "tag",
    actions: [
    ]
  };
  e.waitUntil(
    self.registration.showNotification('push', options)
  );
});
self.addEventListener('notificationclick', function(event) {
  console.log('On notification click: ', event.notification.tag);
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url === event.notification.data.url && 'focus' in client)
        return client.focus();
    }
    if (clients.openWindow)
      return clients.openWindow(event.notification.data.url);
  }));
});
}());
