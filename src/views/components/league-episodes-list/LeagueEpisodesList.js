import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Table } from "antd";
import moment from "moment";
import leagueActions from "../../reducers/league/action";
import LeagueEpisodeExpanded from "./LeagueEpisodeExpanded";


class LeagueEpisodesList extends React.Component {
  constructor(props){
    super(props);

    this.cols = [
      {
        title: "Ep. Number",
        dataIndex: "number",
        key: "number",
        sorter: (a,b) => a.number - b.number,
        defaultSortOrder: "ascend",
        width: 150,
      },
      {
        title: "Episode",
        dataIndex: "name",
        key: "name",
        sorter: (a,b) => a.name.localeCompare(b.name)
      },
      {
        title: "Air Date",
        dataIndex: "airDate",
        key: "airDate",
        sorter: (a,b) => new Date(a.airDate) - new Date(b.airDate),
        render: (_, record) => moment(record.airDate).utc().format("MM/DD/YYYY"),
        width: 150,
      },
    ]
  }

  componentDidUpdate(prevProps){
    if(this.props.leagueID && this.props.leagueID !== prevProps.leagueID){
      this.props.dispatch(leagueActions.getLeagueEpisodes(this.props.leagueID));
    }
  }

  render() {
    return (
      <Table
        bordered
        loading={this.props.loading}
        rowKey={item => item.id}
        dataSource={this.props.episodes}
        columns={this.cols}
        expandable={{
          expandedRowRender: (record) => (<LeagueEpisodeExpanded episodeID={record.id} showLeaderPoints={this.props.showLeaderPoints}/>)
        }}
        pagination={{
          hideOnSinglePage: true
        }}
        locale={{emptyText: "No episodes in this league!"}}
      />
    )
  }
}

LeagueEpisodesList.propTypes = {
  leagueID: PropTypes.number,
  loading: PropTypes.bool,
  showLeaderPoints: PropTypes.bool,
  episodes: PropTypes.array
}

LeagueEpisodesList.defaultProps = {
  leagueID: null,
  loading: false,
  showLeaderPoints: true,
  episodes: []
}

const mapStateToProps = (state) => {
  const { loadingEpisodes, episodes } = state.League;

  return {
    episodes,
    loading: loadingEpisodes
  }
}

export default connect(mapStateToProps)(LeagueEpisodesList);