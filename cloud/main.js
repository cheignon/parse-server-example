
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define("Push", function(request, response) {


  console.log(request);
  // request has 2 parameters: params passed by the client and the authorized user                                                                                                                               
  var params = request.params;
  var user = request.user;

  // Our "Message" class has a "text" key with the body of the message itself                                                                                                                                    
  var messageText = params.text;

  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo('deviceType', 'ios'); // targeting iOS devices only                                                                                                                                          

  Parse.Push.send({
    where: pushQuery, // Set our Installation query                                                                                                                                                              
    data: {
      alert: "Message: " + messageText
    }
  }, { success: function() {
      console.log("#### PUSH OK");
  }, error: function(error) {
      console.log("#### PUSH ERROR" + error.message);
  }, useMasterKey: true});

  response.success('success');
});
