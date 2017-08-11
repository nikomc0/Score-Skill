'use strict';

var Alexa = require('alexa-sdk');
var APP_ID = undefined; //OPTIONAL: replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';
var SKILL_NAME = 'Baseball Scores';
var teams = require('./src/teams');
var mlb = require('./src/mlb');


exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'NewSession': function () {
      this.emit('ScoresIntent');
    },
    'ScoresIntent': function () {
      try {
        var teamSlot = this.event.request.intent.slots.Team;
        var teamName;
        if (teamSlot && teamSlot.value) {
          teamName = teamSlot.value.toLowerCase();
        }
      } catch (e) {
        var speechOutput = 'You can ask questions such as, what\'s the score of the Mariners game, or, you can say exit... '
        var repromptSpeech = 'What else can I help with?';
        speechOutput += repromptSpeech;

        this.attributes['speechOutput'] = speechOutput;
        this.attributes['repromptSpeech'] = repromptSpeech;

        this.emit(':ask', speechOutput, repromptSpeech);
        return;
      }
        if (teams[teamName]) {
          var _this = this;
            mlb.getScores(teamName, function(data) {
              _this.attributes['speechOutput'] = data;
              _this.emit(':tell', data);
            });
        } else {
            var speechOutput = 'This does not appear to be an MLB team ';
            var repromptSpeech = 'What else can I help with?';
            speechOutput += repromptSpeech;

            this.attributes['speechOutput'] = speechOutput;
            this.attributes['repromptSpeech'] = repromptSpeech;

            this.emit(':ask', speechOutput, repromptSpeech);
        }
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = 'You can ask questions such as, what\'s the score of the Mariners game, or, you can say exit... ' +
            'Now, what can I help you with?';
        this.attributes['repromptSpeech'] = 'You can say things like, what\'s the score of the Mariners game, or you can say exit...' +
            ' Now, what can I help you with?';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest':function () {
        this.emit(':tell', 'Goodbye!');
    }
};
