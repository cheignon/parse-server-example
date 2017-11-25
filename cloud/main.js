
Parse.Cloud.define('hello', function(req, res) {

  var messageText = req.object.get('message');
  var usersReceived = req.object.get('receiver');
	console.log(usersReceived);
	console.log(messageText);
  res.success('Hi');
});