import api from "./api";

function login(username, password){
  return api.post('login', { username, password })
    .then(response => response.data);
}

export default {
  login
}