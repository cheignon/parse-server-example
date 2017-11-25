
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define("push", function(request, response) {
	console.log(request);
  res.success(request);
});