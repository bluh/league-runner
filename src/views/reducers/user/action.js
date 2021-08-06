import { default as constants } from "./constants";

function authenticateUser(username, password){
  const request = () => ({ type: constants.AUTHENTICATE });
  const success = (username) => ({ type: constants.AUTHENTICATE_SUCCESS, username });
  const failure = () => ({ type: constants.AUTHENTICATE_FAILURE });

  return (dispatch) => {
    dispatch(request())
    setTimeout(() => {
      dispatch(success("Aadu"));
    }, 5000);
  }
}

export default {
  authenticateUser
}