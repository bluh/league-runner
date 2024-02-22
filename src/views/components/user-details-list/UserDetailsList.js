import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Table } from "antd";
import leagueServices from "../../services/league";
import { GradientText } from "..";
import UserDraftDetailsList from "./UserDraftDetailsList";

class UserDetailsList extends React.Component {
  constructor(props) {
    super(props);

    this.cols = [
      {
        title: "Ep. Number",
        dataIndex: ["episode", "number"],
        key: "number",
        sorter: (a, b) => a.episode.number - b.episode.number,
        defaultSortOrder: "descend",
        width: 150,
      },
      {
        title: "Episode",
        dataIndex: ["episode", "name"],
        key: "name",
        sorter: (a, b) => a.episode.name.localeCompare(b.episode.name),
        render: (_, record) => <Link to={`/episode/${record.episode.id}`}>{record.episode.name}</Link>
      },
      {
        title: "Points",
        dataIndex: "weeklyPoints",
        key: "weeklyPoints",
        width: 150,
      },
      {
        title: "Rank",
        dataIndex: "weeklyRank",
        key: "weeklyRank",
        width: 150,
        render: (_, record) => <GradientText total={this.props.numUsers} index={record.weeklyRank - 1} text={`${record.weeklyRank}`} />
      },
    ]

    this.state = {
      loading: false,
      tableData: []
    }
  }

  componentDidMount() {
    this.setState({ loading: true });

    leagueServices.getLeagueUserWeekly(this.props.leagueID, this.props.userID)
      .then((data) => {
        this.setState({ loading: false, tableData: data });
      })
  }

  render() {
    return (
      <Table
        bordered
        loading={this.state.loading}
        key={this.props.userID}
        rowKey={item => item.episode.id}
        dataSource={this.state.tableData}
        columns={this.cols}
        expandable={{
          expandedRowRender: (row) => <UserDraftDetailsList leagueID={this.props.leagueID} userID={this.props.userID} episodeID={row.episode.id} />,
          expandRowByClick: true,
          expandedRowClassName: () => "user-draft-details-container"
        }}
        pagination={{
          hideOnSinglePage: true
        }}
        locale={{ emptyText: "No episodes in this league!" }}
      />
    )
  }
}

UserDetailsList.propTypes = {
  leagueID: PropTypes.number,
  numUsers: PropTypes.number,
  userID: PropTypes.number,
  loading: PropTypes.bool,
  episodes: PropTypes.array
}

UserDetailsList.defaultProps = {
  leagueID: 0,
  numUsers: 0,
  userID: 0,
  loading: false,
  episodes: []
}

export default UserDetailsList;