import api from "./api";

function getUserLeagues() {
  return api.get('/leagues')
    .then(response => response.data);
}

function getLeague(id) {
  return api.get(`/league/${id}`)
    .then(response => response.data);
}

function newLeague(data){
  return api.post('/league', data)
    .then(response => response.data);
}

function getLeagueUsers(id){
  return api.get(`/league/${id}/users`)
    .then(response => response.data);
}

export default {
  getUserLeagues,
  getLeague,
  newLeague,
  getLeagueUsers
}