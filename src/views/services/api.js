import axios from "axios";
import { message } from "antd";
import store from "../store";
import userActions from "../reducers/user/action";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true
})

api.interceptors.response.use(null, (err) => {
  if(err?.response?.status === 401){
    const state = store.getState();
    if(state.User.loggedIn){
      message.info("Your login has expired, please log in again.");
      store.dispatch(userActions.logoutUser());
    }
  }
  return Promise.reject(err);
})

export default api;