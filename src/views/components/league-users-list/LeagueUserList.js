import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import leagueActions from "../../reducers/league/action";
import { Table } from "antd";
import { GradientText } from "..";

class LeagueUserList extends React.Component {
  constructor(props){
    super(props);

    this.cols = [
      {
        title: "User",
        dataIndex: "name",
        key: "name",
        sorter: (a,b) => a.name.localeCompare(b.name)
      },
      {
        title: "Points",
        dataIndex: "points",
        key: "points",
        sorter: (a,b) => a.points - b.points,
        width: 150
      },
      {
        title: "Rank",
        dataIndex: "rank",
        key: "rank",
        sorter: (a,b) => a.rank - b.rank,
        render: (_, record) => this.renderRank(record.rank),
        width: 150,
        defaultSortOrder: "ascend"
      }
    ]
  }

  componentDidUpdate(prevProps){
    if(this.props.leagueID && this.props.leagueID !== prevProps.leagueID){
      this.props.dispatch(leagueActions.getLeagueUsers(this.props.leagueID));
    }
  }

  renderRank(rank){
    if(this.props.usersList){
      const rankIndex = rank * 1 - 1;
      const numRanks = this.props.usersList.length;

      return <GradientText total={numRanks} index={rankIndex} text={rank}/>
    }
  }

  render() {
    return (
      <Table
        loading={this.props.loading}
        rowKey={item => item.id}
        dataSource={this.props.usersList}
        columns={this.cols}
        pagination={{
          hideOnSinglePage: true
        }}
        locale={{emptyText: "No users in this league!"}}
      />
    )
  }
}

LeagueUserList.propTypes = {
  leagueID: PropTypes.number,
  loading: PropTypes.bool,
  usersList: PropTypes.array
}

LeagueUserList.defaultProps = {
  leagueID: null,
  loading: false,
  usersList: []
}

const mapStateToProps = (state) => {
  const { loadingLeagueUsers, leagueUsers } = state.League;

  return {
    usersList: leagueUsers,
    loading: loadingLeagueUsers
  }
}

export default connect(mapStateToProps)(LeagueUserList);