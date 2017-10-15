
var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var twilio = require('twilio');

var oConnections = {};

//Port definition
app.set('port', process.env.PORT || parseInt(process.argv.pop()) || 5100);

//Document root path definition
var sPath = path.join(__dirname, '.');

app.use(express.static(sPath));
app.use(bodyParser.urlencoded({ extended: true}));

function fStart(req,res){
    var sFrom = req.body.From;
    //oConnections[sFrom].fCurrState = fPlayOrIntro;
    var twiml = new twilio.twiml.MessagingResponse();
    twiml.message('Hi...My name is Jarvis:) Welcome to the adventure game.Hope you will enjoy it! Would you like an intro or play the game?');
    res.writeHead(200, {'Content-Type' : 'text/xml'});
    res.end(twiml.toString());
}


//Method for the twilio webhook
app.post('/sms', function(req, res){
    var sFrom = req.body.From;
    if(!oConnections.hasOwnProperty(sFrom)){
        oConnections[sFrom] = {"fCurrState":fStart};
    }
    oConnections[sFrom].fCurrState(req, res);
});

//Listen for requests
var server = app.listen(app.get('port'), () =>{
    var port = server.address().port;
    console.log('Listening on localhost: '+ port);
    console.log('Document Root is: '+ sPath);
})