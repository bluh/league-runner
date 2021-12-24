import constants from "./constants";
import metasService from "../../services/metas";
import { simpleReducerHelper } from "../helpers";


function getUsersList(){
  return simpleReducerHelper({
    request: constants.GET_USERS,
    success: constants.GET_USERS_SUCCESS,
    failure: constants.GET_USERS_FAILURE
  }, metasService.getUsersList);
}

export default {
  getUsersList,
}