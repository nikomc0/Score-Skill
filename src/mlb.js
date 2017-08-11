var mlb = require('./gdx');
function getScores(team, callback) {
  var date = new Date();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  var day = date.getDate() - 1;
    mlb.getGameUrl(team, new Date(year, month, day), function(err, url){
      if (!err){
        mlb.getGameInfo(url, function(err, data){
          var homeTeam = data.home_team_name;
          var awayTeam = data.away_team_name;
          var awayScore = data.away_team_runs;
          var homeScore = data.home_team_runs;
          var gameStatus = data.status;
          var localStart = data.home_time;
          var tied = homeScore === awayScore;
          var homeLeading = parseInt(homeScore) > parseInt(awayScore);

          if (gameStatus === 'Final') {
            if (homeLeading) {
              callback('The ' + homeTeam + ' beat the ' + awayTeam + ' ' + homeScore + ' to ' + awayScore);
            } else {
              callback('The ' + awayTeam + ' beat the ' + homeTeam + ' ' + awayScore + ' to ' + homeScore);
            }
          } else if (gameStatus === 'Cancelled') {
            callback('The ' + awayTeam + ' at ' + homeTeam + ' game has been cancelled.')
          } else if (gameStatus === 'Preview') {
            callback('The ' + awayTeam + ' at ' + homeTeam + ' game starts at ' + localStart + ' local time')
          } else {
            if (homeLeading) {
              callback('The ' + homeTeam + ' is leading the ' + awayTeam + ' ' + homeScore + ' to ' + awayScore);
            } else if (tied){
              callback('The ' + awayTeam + ' are tied with the  ' + homeTeam + ' ' + awayScore + ' to ' + homeScore);
            } else {
              callback('The ' + awayTeam + ' is leading the  ' + homeTeam + ' ' + awayScore + ' to ' + homeScore);
            }
          }
        });
      } else {
        callback('There does not appear to be any games for the ' + team + ' for today')
      }
    });
}

exports.getScores = getScores;
