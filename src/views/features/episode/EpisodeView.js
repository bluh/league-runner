import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Collapse, Spin } from "antd";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import episodeActions from "../../reducers/episode/action";
import { EpisodeDetailsList } from "../../components";

class EpisodeView extends React.Component {
  componentDidMount() {
    const episodeID = this.props.match.params.episodeID;
    this.props.dispatch(episodeActions.getEpisode(episodeID));
  }

  render() {
    return (
      <Spin
        spinning={this.props.loading}
      >
        <div className="episode-view">
          <div className="league-return">
            <Link to={`/leagues/${this.props.episode.leagueID}`}><ArrowLeftOutlined /> Return to league</Link>
          </div>
          <h2>Episode {this.props.episode.number}: {this.props.episode.name}</h2>
          <h3>Aired on {moment(this.props.episode.airDate).utc().format("MM-DD-yyyy")}</h3>
          <Collapse>
            <Collapse.Panel header="Episode Details">
              <EpisodeDetailsList episodeID={this.props.episode.id} />
            </Collapse.Panel>
          </Collapse>
        </div>
      </Spin>
    )
  }
}

EpisodeView.propTypes = {
  loading: PropTypes.bool,
  episode: PropTypes.shape({
    id: PropTypes.number,
    leagueID: PropTypes.number,
    number: PropTypes.number,
    name: PropTypes.string,
    airDate: PropTypes.object
  })
}

EpisodeView.defaultProps = {
  loading: false,
  episode: {}
}

const mapStateToProps = (state) => {
  const { loading, episode } = state.Episode;

  return { loading, episode };
}

export default connect(mapStateToProps)(EpisodeView);