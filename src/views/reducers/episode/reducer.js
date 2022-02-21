import constants from "./constants";

const initialState = {
  loading: false,
  episode: {},
  error: false
}

export default function Episode(state = initialState, action){
  switch(action.type){
    case constants.GET_EPISODE:
      return {
        ...state,
        loading: true,
        error: false
      }
    case constants.GET_EPISODE_SUCCESS:
      return {
        ...state,
        loading: false,
        episode: action.data,
        error: false
      }
    case constants.GET_EPISODE_FAILURE:
      return {
        ...state,
        loading: false,
        episode: {},
        error: true
      }
    default:
      return state;
  }
}