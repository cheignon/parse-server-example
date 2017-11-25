
Parse.Cloud.define('hello', function(req, res) {

	// request has 2 parameters: params passed by the client and the authorized user 
	var params = req.params;
	var receiver = params.receiver;


	Parse.Cloud.httpRequest({ 
  		url: "https://onesignal.com/api/v1/notifications", 
 		method: "POST", 
  		headers: { 
    		"Content-Type": "application/json;charset=utf-8", 
    		"Authorization": "Basic "+process.env.ONE_SIGNAL_APP_KEY 
  		}, 
  		body: JSON.stringify(jsonBody), 
  		success: function(httpResponse) { 
   			res.success();
  		}, 
  		error: function(httpResponse) { 
    		res.success('Failed with: ' + httpResponse.status); 
  		} 
	});
});