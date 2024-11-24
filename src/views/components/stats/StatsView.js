import React from "react";
import PropTypes from "prop-types";
import { Collapse, Table } from "antd";
import { connect } from "react-redux";
import QueenWeeklyStatsView from "./QueenWeeklyStatsView";

class StatsView extends React.Component {
  constructor() {
    super();
    this.cols = [
      {
        title: "Queen Name",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        defaultSortOrder: "ascend"
      }
    ]
  }

  render() {
    return (
      <Collapse>
        <Collapse.Panel header="Queens' Weekly Score Stats">
          <Table
            bordered
            loading={this.props.loading}
            rowKey={item => item.id}
            dataSource={this.props.queensList}
            expandable={{
              expandedRowRender: (record) => (
                <QueenWeeklyStatsView
                  leagueID={this.props.leagueID}
                  queenID={record.id}
                  queenName={record.name}
                  totalRanks={this.props.queensList.length}
                  scoreStats
                />
              ),
              expandRowByClick: true
            }}
            columns={this.cols}
            pagination={{
              hideOnSinglePage: true
            }}
            locale={{ emptyText: "No queens in this league!" }}
          />
        </Collapse.Panel>
        <Collapse.Panel header="Queens' Weekly Rank Stats">
          <Table
            bordered
            loading={this.props.loading}
            rowKey={item => item.id}
            dataSource={this.props.queensList}
            expandable={{
              expandedRowRender: (record) => (
                <QueenWeeklyStatsView
                  leagueID={this.props.leagueID}
                  queenID={record.id}
                  queenName={record.name}
                  totalRanks={this.props.queensList.length}
                />
              ),
              expandRowByClick: true
            }}
            columns={this.cols}
            pagination={{
              hideOnSinglePage: true
            }}
            locale={{ emptyText: "No queens in this league!" }}
          />
        </Collapse.Panel>
      </Collapse>
    )
  }
}

StatsView.propTypes = {
  queensList: PropTypes.array,
  loading: PropTypes.bool,
  leagueID: PropTypes.number
}

StatsView.defaultProps = {
  queensList: [],
  loading: false,
  leagueID: 0,
}

const mapStateToProps = (state) => {
  const { loading, queensList } = state.Queens;

  return {
    queensList,
    loading
  }
}

export default connect(mapStateToProps)(StatsView);