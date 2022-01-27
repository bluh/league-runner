import { createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk';
import { default as rootReducer } from "./reducers/rootReducer";

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;