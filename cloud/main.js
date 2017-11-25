
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
        where: pushQuery,
        data: {
          alert: 'Testing .....',
          badge: 1,
          sound: 'default'
        }
      }, {
        useMasterKey: true,
        success: function() {
          console.log('Push sent!');
        },
        error: function(error) {
          console.log('There was a problem :( ' + error);
        }
      });

  	console.log(req.params);
  	res.success('Hi');
});