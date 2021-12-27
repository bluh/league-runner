import api from "./api";

function getQueensInLeague(leagueId) {
  return api.get(`league/${leagueId}/queens`)
    .then(response => response.data);
}

export default {
  getQueensInLeague
}