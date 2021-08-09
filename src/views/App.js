import React from "react";

import { Provider } from "react-redux";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Authenticator, Layout } from "./components";
import { Home, Login } from "./features";
import store from "./store";

import "antd/dist/antd.css";

class App extends React.Component{
  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <Authenticator>
            <Layout>
              <Switch>
                <Route path="/" exact>
                  <Home />
                </Route>

                <Route path="/login" exact>
                  <Login />
                </Route>
              </Switch>
            </Layout>
          </Authenticator>
        </BrowserRouter>
      </Provider>
    )
  }
}

export default App;