import api from "./api";

function getUsersList() {
  return api.get('/metas/users')
    .then(response => response.data);
}

export default {
  getUsersList
}