
Parse.Cloud.define('hello', function(req, res) {

	// request has 2 parameters: params passed by the client and the authorized user 
	var params = req.params;
	var receiver = req.sender.receiver;
  	var messageText = params.text; 
  	
	var query = new Parse.Query(Parse.User);
	query.equalTo('objectId',receiver)


	query.find({
  		success: function(results) { 
  			alert("Successfully retrieved " + results.length + " scores.");
    		// Do something with the returned Parse.Object values
    		for (var i = 0; i < results.length; i++) {
      			var object = results[i];
      			var pushQuery = new Parse.Query(Parse.Installation);
  				pushQuery.equalTo('user', object); // targeting iOS devices only  
  				// Our "Message" class has a "text" key with the body of the message itself                                                                                                                                    
  				Parse.Push.send({
                where: query,
                data: {
                    "alert": messageText,
                    "content-available": 1,
                },
                }, {
                    success: function() {
                        console.log('##### PUSH OK ');
                    },
                    error: function(error) {
                        console.log('##### PUSH ERROR ');
                    },
                    useMasterKey: true
                });
    		}
  		},
  		error: function(error) { alert("Error: " + error.code + " " + error.message); }
	});
});