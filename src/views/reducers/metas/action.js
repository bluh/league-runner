import { default as constants } from "./constants";
import metasService from "../../services/metas";


function getUsersList(){
  const request = () => ({ type: constants.GET_USERS });
  const success = (users) => ({ type: constants.GET_USERS_SUCCESS, users });
  const failure = () => ({ type: constants.GET_USERS_FAILURE });

  return (dispatch) => {
    dispatch(request())
    metasService.getUsersList()
      .then(result => {
        dispatch(success(result));
      })
      .catch(err => {
        dispatch(failure());
      })
  }
}

export default {
  getUsersList,
}