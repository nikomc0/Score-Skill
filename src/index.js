'use strict';

var Alexa = require('alexa-sdk');
var APP_ID = undefined;
var SKILL_NAME = 'Baseball Scores';
var teams = require('teams');
var mlb = require('mlb');
var express = require('express')
var request = require('request')

var app = express();

var GA_TRACKING_ID = 'UA-104579134-1';

function track(category, action, label, value, callback) {
  var data = {
    v: '1',
    tid: GA_TRACKING_ID,
    cid: '555',
    t: 'event',
    ec: category,
    ea: action,
    el: label,
    ev: value,
  };

  request.post(
    'http://www.google-analytics.com/collect', {
      form: data
    },
    function(err, response) {
      if (err) { return callback(err); }
      if (response.statusCode !== 200) {
        return callback(new Error('Tracking failed'));
      }
      callback();
    }
  );
}

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
    'ScoresIntent': function (intent, session, response) {
      try {
        var teamSlot = this.event.request.intent.slots.Team;
        var teamName;
        if (teamSlot && teamSlot.value) {
          teamName = teamSlot.value.toLowerCase();
        }
      } catch (e) {
        var speechOutput = 'You can ask questions such as, what\'s the score of the Giants game, or, you can say exit... '
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
        trackEvent(
          'Intent',
          'AMAZON.ScoresIntent',
          'na',
          '100',
          function (err) {
            if (err) {
              return next(err);
            }
            var speechOutput = "Okay.";
            response.tell(speechOutput);
          });
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
    'AMAZON.CancelIntent': function (intent, session, response) {
      trackEvent(
        'Intent',
        'AMAZON.CancelIntent',
        'na',
        '100',
        function (err) {
          if (err) {
            return next(err);
          }
          var speechOutput = "Okay.";
          response.tell(speechOutput);
        });
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest':function () {
        this.emit(':tell', 'Goodbye!');
    }
};
