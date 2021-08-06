import React from "react";

import { Provider } from "react-redux";
import { Layout } from "./components";
import store from "./store";

class App extends React.Component{
  render() {
    return (
      <Provider store={store}>
        <Layout>

        </Layout>
      </Provider>
    )
  }
}

export default App;