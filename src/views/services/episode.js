import api from "./api";

function getEpisode(id){
  return api.get(`/episode/${id}`)
    .then(response => response.data);
}

function getEpisodeDetails(id) {
  return api.get(`/episode/${id}/details`)
    .then(response => response.data);
}

export default {
  getEpisode,
  getEpisodeDetails
}