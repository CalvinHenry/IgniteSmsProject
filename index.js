var express = require('express'); //Simple framework for our server
var bodyParser = require('body-parser'); //Converts body data into nice json objects for us to read
var request = require('request'); //Makes it easy for us to get or post to different urls
var summary = require('node-summary'); //Handy tool for summarizing text
var unfluff = require('unfluff'); //Handy tool which returns just the text and title for an article
var scaper = require('google-scraper');

require('dotenv').config(); //Load in the variables defined in our .env file


var app = express();


//Set up middleware. The function we provide here will be run on ALL incoming requests.
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res){
    getPage('https://www.cnet.com/uk/news/samsung-galaxy-note-7-superfans-holding-onto-phones/');
    //sendMessage(getPage('https://www.cnet.com/uk/news/samsung-galaxy-note-7-superfans-holding-onto-phones/'));
    //sendMessage("Hello");  
});
//For testing, print a message and then text the person back.
app.post('/',function(req,res){
    process.setMaxListeners(0);
    console.log("URL: " + req.body.Body);
    getPage(req.body.Body);
//    console.log("Received Text: "+req.body.Body);
  //  sendMessage('Thanks for sending me that message!');
});
app.listen(8080,function(){
    console.log("Listening on 8080");
    //Run this function just for testing
    //getPage('https://www.cnet.com/uk/news/samsung-galaxy-note-7-superfans-holding-onto-phones/');
});
/**
 * Make a GET request to load the html from the page
 * Then use unfluff to get just the article body text (strip the html, leaving just text)
 * Then use node-summary to convert that text into a nice summary
 */
function getPage(url) {
    request.get({
	url: url,
    }, function(error,response,body) {
	//Print the message twilio sends back
	if(!error) {
	    console.log("Extracting article text...");
	    var articleData = unfluff.lazy(body,'en');
	    console.log("Summarizing article...");
	    summary.summarize(articleData.title(),articleData.text(),function(err,summary){
		if(!err){
		    console.log("\n\nARTICLE SUMMARY\n=================\n\n"+summary);
		    sendMessage(summary);
		}else
		    console.log("Error! "+err);
	    });
	} else {
	    console.log("Error: "+JSON.stringify(error));
	}
    });
}

/**
 * Send a message to the user
 * Load twilio SID and Auth Token from .env file
 * Read the documentation here: https://www.twilio.com/docs/api/rest/sending-messages#post
 */
function sendMessage(messageText) {
    //Text back
    if(messageText.length > 1000){
	messageText = messageText.substring(0,1000);
    }
    console.log("Trying to send a message");
    request.post({
	url: 'https://'+process.env.TWILIO_SID+':'+process.env.AUTH_TOKEN+'@api.twilio.com/2010-04-01/Accounts/'+process.env.TWILIO_SID+'/Messages',
	form: {
	    From: '3177933513',
	    To: process.env.TEST_NUMBER,
	    Body: messageText
	}
    }, function(error,response,body) {
	//Print the message twilio sends back
	if(error)
	    console.log(JSON.stringify(error));
	else
	    console.log("Sent Text to "+process.env.TEST_NUMBER);
    });
}
