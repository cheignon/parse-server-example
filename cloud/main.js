
Parse.Cloud.define('hello', function(req, res) {

	// request has 2 parameters: params passed by the client and the authorized user 
	var params = req.params;
	var receiver = params.receiver;
  	var messageText = params.text; 


	getUser(receiver).then
    (   
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user)
        {

        	var pushQuery = new Parse.Query(Parse.Installation);
  			pushQuery.equalTo('user', object);
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
        ,
        function(error)
        {
            response.error(error);
        }
    );	
});

function getUser(userId)
{
    Parse.Cloud.useMasterKey();
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("objectId", userId);

    //Here you aren't directly returning a user, but you are returning a function that will sometime in the future return a user. This is considered a promise.
    return userQuery.first
    ({
        success: function(userRetrieved)
        {
            //When the success method fires and you return userRetrieved you fulfill the above promise, and the userRetrieved continues up the chain.
            return userRetrieved;
        },
        error: function(error)
        {
            return error;
        }
    });
};