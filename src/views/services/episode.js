import api from "./api";

function getEpisode(id){
  return api.get(`/episode/${id}`)
    .then(response => response.data);
}

function getEpisodeDetails(id) {
  return api.get(`/episode/${id}/details`)
    .then(response => response.data);
}

function addNewEpisode(data){
  return api.post(`/episode`, data)
    .then(response => response.data);
}

function updateEpisode(data, episodeID) {
  return api.put(`/episode/${episodeID}`, data)
    .then(response => response.data);
}

export default {
  getEpisode,
  getEpisodeDetails,
  addNewEpisode,
  updateEpisode
}