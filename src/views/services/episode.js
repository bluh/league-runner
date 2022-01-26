import api from "./api";

function getEpisodeDetails(id) {
  return api.get(`/episode/${id}`)
    .then(response => response.data);
}

export default {
  getEpisodeDetails
}