import { createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk';
import { default as rootReducer } from "./reducers/rootReducer";

export default createStore(rootReducer, applyMiddleware(thunk));