


customizationFunctions.notifyDataModificationMessage = function(topic, message) {
	
	var data = {
	    "props": {
	        "operationType": "getQtisWSNotification",
	        "data": {
	            "input": {
					"message": message,
					"subTenant": subTenantName,
	                 "topic": topic
	            }
	        }
	    }
	}

	var body = JSON.stringify(data);	
	for(var i=0;i<kloojj_url.length;i++){
		sendRequestMsg(body,kloojj_url[i]);
	}
	
}

var sendRequestMsg = function (body,url){
    var xhr = createCORSRequest(kloojj_method, url);
	
	xhr.onload = function() {
		  // Success code goes here.
		  console.log("Success code goes here.");
		};

		xhr.onerror = function() {
		  // Error code goes here.
		  console.log("Error code goes here.");
		};

		xhr.onreadystatechange = function() { // Call a function when the state changes.
		    console.log("state : " + this.status);
		    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
		        // Request finished. Do processing here.
				console.log("Request finished. Do processing here.");
		    }
		};
		
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('Authorization', 'Dn7kWkX8q8ha8Xwv');
	xhr.send(body);

}


var createCORSRequest = function(method, url) {
	  var xhr = new XMLHttpRequest();
	  if ("withCredentials" in xhr) {
	    // Most browsers.
	    xhr.open(method, url, true);
	  } else if (typeof XDomainRequest != "undefined") {
	    // IE8 & IE9
	    xhr = new XDomainRequest();
	    xhr.open(method, url);
	  } else {
	    // CORS not supported.
	    xhr = null;
		console.log("CORS not supported.");
	  }
	  return xhr;
	};

	//var kloojj_url = ['https://dev.kloojj.com/backend/lc/qtisSync','https://test.kloojj.com/backend/lc/qtisSync','https://staging.kloojj.com/backend/lc/qtisSync'];
	var kloojj_url = [];
	var kloojj_method = 'POST';
	
	
	
