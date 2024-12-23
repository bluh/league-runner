import api from "./api";

function getUserLeagues() {
  return api.get('/leagues')
    .then(response => response.data);
}

function getLeague(id) {
  return api.get(`/league/${id}`)
    .then(response => response.data);
}

function newLeague(data) {
  return api.post('/league', data)
    .then(response => response.data);
}

function updateLeague(id, data) {
  return api.put(`/league/${id}`, data);
}

function getLeagueUsers(id) {
  return api.get(`/league/${id}/users`)
    .then(response => response.data);
}

function getLeagueUserWeekly(leagueId, userId) {
  return api.get(`/league/${leagueId}/users/${userId}/weekly`)
    .then(response => response.data);
}

function getLeagueUserDrafts(leagueId, userId, episodeId) {
  return api.get(`/league/${leagueId}/users/${userId}/drafts/${episodeId}`)
    .then(response => response.data);
}

function getLeagueRules(id) {
  return api.get(`/league/${id}/rules`)
    .then(response => response.data);
}

function getLeagueEpisodes(id) {
  return api.get(`/league/${id}/episodes`)
    .then(response => response.data);
}

function addLeagueUser(leagueId, userId, data) {
  return api.post(`/league/${leagueId}/users/${userId}`, data)
    .then(response => response.data);
}

function updateLeagueUser(leagueId, userId, data) {
  return api.put(`/league/${leagueId}/users/${userId}`, data)
    .then(response => response.data);
}

function deleteLeagueUser(leagueId, userId) {
  return api.delete(`/league/${leagueId}/users/${userId}`)
    .then(response => response.data);
}

export default {
  getUserLeagues,
  getLeague,
  newLeague,
  updateLeague,
  getLeagueUsers,
  getLeagueUserWeekly,
  getLeagueUserDrafts,
  getLeagueRules,
  getLeagueEpisodes,
  addLeagueUser,
  updateLeagueUser,
  deleteLeagueUser
}