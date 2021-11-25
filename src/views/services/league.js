import api from "./api";

function getUserLeagues() {
  return api.get('/leagues')
    .then(response => response.data);
}

function newLeague(data){
  return api.post('/leagues', data)
    .then(response => response.data);
}

export default {
  getUserLeagues,
  newLeague
}