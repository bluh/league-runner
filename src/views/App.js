import React from "react";

import { Provider } from "react-redux";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Layout } from "./components";
import { Home } from "./features";
import store from "./store";

import "antd/dist/antd.css";

class App extends React.Component{
  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <Layout>
            <Switch>
              <Route path="/" exact>
                <Home />
              </Route>
            </Switch>
          </Layout>
        </BrowserRouter>
      </Provider>
    )
  }
}

export default App;