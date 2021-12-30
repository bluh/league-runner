import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import leagueActions from "../../reducers/league/action";
import { Table } from "antd";

class LeagueUserList extends React.Component {
  constructor(props){
    super(props);

    this.cols = [
      {
        title: "User",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "Points",
        dataIndex: "points",
        key: "points"
      }
    ]
  }
  componentDidUpdate(prevProps){
    if(this.props.leagueID && this.props.leagueID !== prevProps.leagueID){
      this.props.dispatch(leagueActions.getLeagueUsers(this.props.leagueID));
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
  console.log(state.League);

  return {
    usersList: leagueUsers,
    loading: loadingLeagueUsers
  }
}

export default connect(mapStateToProps)(LeagueUserList);