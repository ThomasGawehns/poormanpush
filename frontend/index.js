var subscribe = function () { console.log("subscribe  nicht implementiert")};
var unsubscribe = function () { console.log("unsubscribe  nicht implementiert")};

console.log("public key: " + public_key);

(function()
	{
		const yourSubscriptionUrl = 'some path to your subscription'; // change this to your homepage

		let divs = {
			"startup": document.getElementById("startup"),
			"notImplemented": document.getElementById("notImplemented"),
			"subscribed": document.getElementById("subscribed"),
			"unsubscribed": document.getElementById("unsubscribed"),
		};
		let visibleDiv = divs["startup"];

		function setVisible(div)
		{
			if(typeof divs[div] !== 'undefined'){
				div = divs[div];
				visibleDiv.style.display = "none";
				visibleDiv = div;
				visibleDiv.style.display = "block";
			}
		};

		if (!("Notification" in window)) {
			setVisible('notImplemented');
			return;
		}

		function urlBase64ToUint8Array(base64String) {
			const padding = '='.repeat((4 - base64String.length % 4) % 4);
			const base64 = (base64String + padding)
				.replace(/\-/g, '+')
				.replace(/_/g, '/');

			const rawData = window.atob(base64);
			const outputArray = new Uint8Array(rawData.length);

			for (let i = 0; i < rawData.length; ++i) {
				outputArray[i] = rawData.charCodeAt(i);
			}
			return outputArray; 
		}
		function displayTextArea(id, value)
		{ 
			text = document.getElementById(id);
			text.value = value;
			text.style.height = "auto";
			text.style.height = text.scrollHeight+'px';
		}

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.ready.then(reg =>
				{
					reg.pushManager.getSubscription().then(subst => {

						if(subst){
							setVisible("subscribed");
							displayTextArea('subscription', JSON.stringify(subst));
						}else{
							setVisible("unsubscribed");
						}
						unsubscribe = async function()
						{
							await subst.unsubscribe();
							setVisible("unsubscribed");
						}
						subscribe = async function()
						{
							try {
								if(Notification.permisssion === "denied")
									await Notification.requestPermission();
								if(Notification.permission === "denied")
									return;
								subst = await reg.pushManager.subscribe({ 
									userVisibleOnly: true, 
									applicationServerKey: urlBase64ToUint8Array(public_key),
								});
								setVisible("subscribed");
								var data = await fetch(yourSubscriptionUrl, {
									body: JSON.stringify(subst),
									method: 'POST'});
								var res = await data.json();
								displayTextArea('subscription', JSON.stringify(res));
							}catch(err)
							{
								console.log(err);
							}
						}
					})})
					.catch(e => { 
						console.log(e);
					})
		}
	}());
