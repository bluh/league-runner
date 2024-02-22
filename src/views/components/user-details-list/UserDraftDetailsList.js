import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Table, Tooltip } from "antd";
import leagueServices from "../../services/league";
import GradientText from "../gradient-text/GradientText";

import "./UserDraftDetailsList.scss";

class UserDraftDetailsList extends React.Component {
  constructor(props) {
    super(props);

    this.cols = [
      {
        title: "Queen",
        key: "queen",
        dataIndex: ["queen", "name"],
        render: (name, record) => record.queen.leader ? <Tooltip title="Leader">{name}</Tooltip> : name
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
        render: (_, record) => <GradientText total={this.props.numQueens} index={record.rank - 1} text={`${record.rank}`} />,
        width: 150,
      }
    ]

    this.state = {
      loading: false,
      tableData: []
    }
  }

  componentDidMount() {
    this.setState({ loading: true });

    leagueServices.getLeagueUserDrafts(this.props.leagueID, this.props.userID, this.props.episodeID)
      .then((data) => {
        this.setState({ loading: false, tableData: data });
      })
  }

  render() {
    return (
      <Table
        bordered
        className="user-draft-details-list"
        loading={this.state.loading}
        key={this.props.userID}
        rowKey={item => item.id}
        dataSource={this.state.tableData}
        rowClassName={(record) => record.queen.leader ? "leader-row" : ""}
        columns={this.cols}
        pagination={{
          hideOnSinglePage: true
        }}
        locale={{ emptyText: "No drafts for this episode!" }}
      />
    )
  }
}

UserDraftDetailsList.propTypes = {
  leagueID: PropTypes.number,
  numUsers: PropTypes.number,
  userID: PropTypes.number,
  loading: PropTypes.bool,
  episodes: PropTypes.array
}

UserDraftDetailsList.defaultProps = {
  leagueID: 0,
  numUsers: 0,
  userID: 0,
  loading: false,
  episodes: []
}

const mapStateToProps = (state) => {
  const { queensList } = state.Queens;
  const numQueens = queensList.length;

  return {
    numQueens
  }
}

export default connect(mapStateToProps)(UserDraftDetailsList);