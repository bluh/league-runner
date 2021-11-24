import { default as constants } from "./constants";

const initialState = {
  usersList: [],
  loading: false,
  error: null
}

export default function(state = initialState, action){
  switch(action.type){
    case constants.GET_USERS:
      return {
        ...state,
        ...initialState,
        loading: true,
      }
    case constants.GET_USERS_SUCCESS:
      return {
        ...state,
        usersList: action.users,
        loading: false
      }
    case constants.GET_USERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: true
      }
    default:
      return state;
  }
}