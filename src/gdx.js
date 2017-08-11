var http = require('http');
var gdx = function(){};

gdx.prototype.getGameUrl = getGameUrl;
gdx.prototype.getGameInfo = getGameInfo;

module.exports = new gdx()

function getGameUrl(team, date, callback)
{
  var url = "http://gdx.mlb.com/components/game/mlb/year_" + date.getFullYear() + "/month_" + pad(date.getMonth()) + "/day_" + pad(date.getDay()) + "/master_scoreboard.json"
  http.get(url, function(res) {
    var buffer = "";
    res.on("data", function(data){
      buffer += data;
    })
    res.on("end", function()
    {
      if (buffer.toString('ascii') === 'GameDay - 404 Not Found'){
        callback("Not Found", null);
        return;
      }
      var games = JSON.parse(buffer.toString("ascii")).data.games.game;
      gameFound = false;
      if (!games) {
        callback("Unknown Error", null);
        return;
      }
      if (games.constructor === Array) {
        games.forEach(function (game){
          if(game.home_team_name.toLowerCase() == team ||  game.away_team_name.toLowerCase() == team){
            gameFound = true;
            callback(null, "http://gd2.mlb.com"+game.game_data_directory);
          }
        });
      } else {
        if(games.home_team_name.toLowerCase() == team ||  games.away_team_name.toLowerCase() == team){
          gameFound = true;
          callback(null, "http://gd2.mlb.com"+games.game_data_directory);
        } else {
          gameFound = false;
        }
      }
      if (!gameFound){
        callback("Not Found", null);
        callback("Not Found", null);
      }
    })
  })
}

function pad(n){
    return n > 9 ? "" + n: "0" + n;
}

function getGameInfo(url, callback)
{
  http.get(url+"/linescore.json", function(res){
    var buffer = "";
    res.on("data", function(data){
      buffer += data;
    })
    res.on("end", function()
    {
      callback(null, JSON.parse(buffer.toString("ascii")).data.game);
    })
  })
}
