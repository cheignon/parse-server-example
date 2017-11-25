
Parse.Cloud.define('hello', function(req, res) {


  console.log(req.params);
  res.success('Hi');
});