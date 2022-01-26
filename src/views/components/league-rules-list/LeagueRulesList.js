import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import leagueActions from "../../reducers/league/action";
import { Table } from "antd";

class LeagueRuleList extends React.Component {
  constructor(props){
    super(props);

    this.cols = [
      {
        title: "Rule",
        dataIndex: "name",
        key: "name",
        sorter: (a,b) => a.name.localeCompare(b.name)
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        sorter: (a,b) => a.description.localeCompare(b.description)
      },
      {
        title: "Points",
        dataIndex: "points",
        key: "points",
        sorter: (a,b) => a.points - b.points,
        render: (_, record) => this.renderPoints(record.points),
        width: 150
      },
    ]
  }

  componentDidUpdate(prevProps){
    if(this.props.leagueID && this.props.leagueID !== prevProps.leagueID){
      this.props.dispatch(leagueActions.getLeagueRules(this.props.leagueID));
    }
  }

  renderPoints(points){
    const pointsStyle = { fontWeight: "bold" };
    if(points > 0){
      pointsStyle["color"] = "#00AA00";
    }else if(points < 0){
      pointsStyle["color"] = "#AA0000";
    }

    return <span style={pointsStyle}>{points}</span>;
  }

  render() {
    return (
      <Table
        bordered
        loading={this.props.loading}
        rowKey={item => item.id}
        dataSource={this.props.rulesList}
        columns={this.cols}
        pagination={{
          hideOnSinglePage: true
        }}
        tableLayout="auto"
        locale={{emptyText: "No rules in this league!"}}
      />
    )
  }
}

LeagueRuleList.propTypes = {
  leagueID: PropTypes.number,
  loading: PropTypes.bool,
  rulesList: PropTypes.array
}

LeagueRuleList.defaultProps = {
  leagueID: null,
  loading: false,
  rulesList: []
}

const mapStateToProps = (state) => {
  const { loadingLeagueRules, leagueRules } = state.League;

  return {
    rulesList: leagueRules,
    loading: loadingLeagueRules
  }
}

export default connect(mapStateToProps)(LeagueRuleList);