import api from "./api";

function getUserLeagues() {
  return api.get('/leagues')
    .then(response => response.data);
}

export default {
  getUserLeagues
}