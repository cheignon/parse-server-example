
Parse.Cloud.define('hello', function(req, res) {

	// request has 2 parameters: params passed by the client and the authorized user 
	var params = req.params;
	var receiver = params.receiver;


	var pushQuery = new Parse.Query(Parse.Installation);
  	pushQuery.equalTo('user', receiver); // targeting iOS devices only   

  	// Our "Message" class has a "text" key with the body of the message itself                                                                                                                                    
  	var messageText = params.text;
	console.log("receiver "+receiver);
	console.log("messageText "+messageText);
  	Parse.Push.send({
    where: pushQuery, // Set our Installation query                                                                                                                                                              
    data: {
      alert: "Message: " + messageText
     }
  	}, { success: function() {
      console.log("#### PUSH OK");
      res.success('success');
  	 }, error: function(error) {
      console.log("#### PUSH ERROR" + error.message);
      res.success('Error');
   	 }, useMasterKey: true
   	});

  	console.log(req.params);
  	res.success('Hi');
});