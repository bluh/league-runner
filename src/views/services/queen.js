import api from "./api";

function getQueensInLeague(leagueID) {
  return api.get(`league/${leagueID}/queens`)
    .then(response => response.data);
}

function getWeeklyScores(leagueID, queenID){
  return api.get(`league/${leagueID}/weekly/${queenID}`)
    .then(response => response.data);
}

export default {
  getQueensInLeague,
  getWeeklyScores
}