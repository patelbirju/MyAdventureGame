
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

function fEnterOrBack(req, res){
    var sFrom = req.body.From;
    var sAction = req.body.Body;
    var twiml = new twilio.twiml.MessagingResponse();

    if(sAction.toLowerCase().search("enter") != -1){
        twiml.message("Yaay! We made it out of the Haunted house. Congratulations :) Exit or play again?");
        oConnections[sFrom].fCurrState = fPlayOrIntro;
    }
    else if(sAction.toLowerCase().search("back") != -1
            || sAction.toLowerCase().search("go back") != -1){
        twiml.message("Well...it's never bad to try your luck in such situations. Which door should I try now?");
        oConnections[sFrom].fCurrState = fDoorCheck;          
    }
    else{
        twiml.message("I don't think "+sAction+"will help you!");
    }
    res.writeHead(200, {'Content-Type' : 'text/xml'});
    res.end(twiml.toString());
}

function fTalkOrBack(req, res){
    var sFrom = req.body.From;
    var sAction = req.body.Body;
    var twiml = new twilio.twiml.MessagingResponse();

    if (sAction.toLowerCase().search("talk") != -1){
        twiml.message("Oh no! Its a Zombieee....!! Run for dear life!!");

    }
    else if(sAction.toLowerCase().search("back") != -1){
        twiml.message("Hmm... Maybe its a wise choice. You never know! Which door should I try now?");
        oConnections[sFrom].fCurrState = fDoorCheck;
    }
    else if(sAction.toLowerCase().search("run") != -1){
        twiml.message("Oh boy...That was a narrow escape <> Which door should I try now?");
        oConnections[sFrom].fCurrState = fDoorCheck;
    }
    else{
        twiml.message("I don't think "+sAction+"will help you!");
    }
    res.writeHead(200, {'Content-Type' : 'text/xml'});
    res.end(twiml.toString());
}

function fDoorCheck(req, res){
    var sFrom = req.body.From;
    var sAction = req.body.Body;
    var twiml = new twilio.twiml.MessagingResponse();

    if(sAction.search("1") != -1){
        twiml.message("I can barely see anything....! Its really dark. I think we should try another door. Which door should I try?");
    }
    else if(sAction.search("2") != -1){
        twiml.message("Woah...its much better in here. However I don't see any other way our from here. I think we should try another door. Which door should I try?");
    }
    else if(sAction.search("3") != -1){
        twiml.message("Wait...I see someone here! Want to talk or go back?");
        oConnections[sFrom].fCurrState = fTalkOrBack;
    }
    else if(sAction.search("4") != -1){
        twiml.message("I see a tunnel entrance here! Want to enter or go back?");
        oConnections[sFrom].fCurrState = fEnterOrBack;
    }
    else{
        twiml.message(sAction + " is not a door. Which door should I try now?")
    }
    res.writeHead(200, {'Content-Type' : 'text/xml'});
    res.end(twiml.toString());

}

function fPlayOrIntro(req, res){
    var sFrom = req.body.From;
    var sAction = req.body.Body;
    var twiml = new twilio.twiml.MessagingResponse();

    if(sAction.toLowerCase().search("intro") != -1){
        twiml.message("Welcome to the Adveture game! This is an adveture game where you wil have to find your way out of the haunted house by choosing which doors to enter. Hope you find your way out! Play or Exit?");
    }
    else if(sAction.toLowerCase().search("play") != -1){
        twiml.message("Great! There are 5 doors here (1-5). Which one would you like to open?");
        oConnections[sFrom].fCurrState = fDoorCheck;
    }
    else if(sAction.toLowerCase().search("exit") != -1){
        twiml.message("Hope you enjoyed the game! Good bye:)");
    }
    else{
        twiml.message("I can't get you. Why don't you try again? Would you like an intro, play oe exit the game?");
    }
    res.writeHead(200, {'Content-Type' : 'text/xml'});
    res.end(twiml.toString());
}

function fStart(req,res){
    var sFrom = req.body.From;
    oConnections[sFrom].fCurrState = fPlayOrIntro;
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