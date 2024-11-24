import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button, Table } from "antd";
import queenActions from "../../reducers/queens/action";
import QueensListExpanded from './QueensListExpanded';
import { GradientText, ScoreDisplay } from "..";
import QueenInfoModal from "../queen-info/QueenInfoModal";

class QueenList extends React.Component {
  constructor(props) {
    super(props);

    this.cols = [
      {
        title: "Queen",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (_, record) => <span className="queen-row-container">{record.name}<Button onClick={evt => this.qmBtnClick(evt, record)}>?</Button></span>
      },
      {
        title: "Total Points",
        dataIndex: "totalPoints",
        key: "totalPoints",
        render: (_, record) => <ScoreDisplay total={record.totalPoints} leader={props.showLeaderPoints ? record.leaderPoints : null} />,
        sorter: (a, b) => a.totalPoints - b.totalPoints,
        width: 150
      },
      {
        title: "Rank",
        dataIndex: "rank",
        key: "rank",
        sorter: (a, b) => a.rank - b.rank,
        render: (_, record) => this.renderRank(record.rank),
        width: 150,
        defaultSortOrder: "ascend"
      }
    ]

    this.state = {
      displayingModal: false,
      modalForQueenID: null,
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.leagueID && this.props.leagueID !== prevProps.leagueID) {
      this.props.dispatch(queenActions.getQueensList(this.props.leagueID));
    }
  }

  qmBtnClick(evt, row) {
    evt.stopPropagation();

    this.setState({
      displayingModal: true,
      modalForQueenID: row.id
    })
  }

  renderRank(rank) {
    if (this.props.queensList) {
      const rankIndex = rank * 1 - 1;
      const numRanks = this.props.queensList.length;

      return <GradientText total={numRanks} index={rankIndex} text={rank} />
    }
  }

  render() {
    return (
      <>
        <QueenInfoModal
          showing={this.state.displayingModal}
          queenID={this.state.modalForQueenID}
          onClose={() => this.setState({ displayingModal: false })}
        />
        <Table
          bordered
          loading={this.props.loading}
          rowKey={item => item.id}
          dataSource={this.props.queensList}
          expandable={{
            expandedRowRender: (record) => (
              <QueensListExpanded
                totalQueens={this.props.queensList.length}
                leagueID={this.props.leagueID}
                queenID={record.id}
                showLeaderPoints={this.props.showLeaderPoints}
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
      </>
    )
  }
}

QueenList.propTypes = {
  leagueID: PropTypes.number,
  loading: PropTypes.bool,
  showLeaderPoints: PropTypes.bool,
  queensList: PropTypes.array
}

QueenList.defaultProps = {
  leagueID: null,
  loading: false,
  showLeaderPoints: true,
  queensList: []
}

const mapStateToProps = (state) => {
  const { loading, queensList } = state.Queens;

  return {
    queensList,
    loading
  }
}

export default connect(mapStateToProps)(QueenList);