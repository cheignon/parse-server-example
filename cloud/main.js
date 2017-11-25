
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('push', function(request, response) {

  var messageText = request.object.get('message');
  var usersReceived = request.object.get('receiver');
	console.log(usersReceived);
	console.log(messageText);
  res.success('Hi');
});