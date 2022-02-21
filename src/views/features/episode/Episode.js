import React from "react";
import { Route, Switch } from "react-router-dom";
import Authorizer from "../../components/authorizer/Authorizer";
import EpisodeView from "./EpisodeView";

class Episode extends React.Component {
  render(){
    const path = this.props.match.path;
    return (
      <div className="episode-container">
        <Authorizer>
          <Switch>
            <Route path={`${path}/:episodeID`} exact component={EpisodeView} />

            <Route path={`${path}/new`} exact>
              new episode
            </Route>
          </Switch>
        </Authorizer>
      </div>
    )
  }
}

export default Episode;