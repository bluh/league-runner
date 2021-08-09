import api from "./api";

function login(username, password){
  return api.post('user/login', { username, password })
    .then(response => response.data);
}

function getUser(){
  return api.get('user/info')
    .then(response => response.data)
    .catch(err => null);
}

export default {
  login,
  getUser
}