import React from "react";
import { Provider } from "react-redux";
import { ConfigProvider } from "antd";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Authenticator, Layout } from "./components";
import { Episode, Forgot, Home, Leagues, Login, Register, Reset } from "./features";
import store from "./store";
import { theme } from "./theme";

import "antd/dist/antd.variable.min.css";
import "./styles/overrides.scss"

class App extends React.Component {
  constructor(props){
    super(props);

    ConfigProvider.config(theme);
  }

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

                <Route path="/login">
                  <Login />
                </Route>

                <Route path="/reset">
                  <Reset />
                </Route>

                <Route path="/forgot">
                  <Forgot />
                </Route>

                <Route path="/register">
                  <Register />
                </Route>

                <Route path="/leagues" component={Leagues} />

                <Route path="/episode" component={Episode} />

              </Switch>
            </Layout>
          </Authenticator>
        </BrowserRouter>
      </Provider>
    )
  }
}

export default App;