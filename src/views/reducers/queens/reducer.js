import constants from "./constants";

const initialState = {
  queensList: [],
  loading: false,
  error: null
}

export default function(state = initialState, action){
  switch(action.type){
    case constants.GET_QUEENS:
      return {
        ...state,
        ...initialState,
        loading: true,
      }
    case constants.GET_QUEENS_SUCCESS:
      return {
        ...state,
        queensList: action.data,
        loading: false
      }
    case constants.GET_QUEENS_FAILURE:
      return {
        ...state,
        loading: false,
        error: true
      }
    default:
      return state;
  }
}