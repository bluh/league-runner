import api from "./api";

function login(username, password){
  return api.post('user/login', { username, password })
    .then(response => response.data);
}

function logout() {
  return api.get('user/logout');
}

function getUser(){
  return api.get('user/info')
    .then(response => response.data)
    .catch(() => null);
}

function register(username, password, email){
  return api.post('user/register', {username, password, email})
    .then(response => response.data);
}

function sendReset(hash, password) {
  return api.post('user/reset', { hash, password })
    .then(response => response.data);
}

export default {
  login,
  logout,
  getUser,
  register,
  sendReset
}