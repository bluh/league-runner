import React from "react";
import PropTypes from "prop-types";
import queenService from "../../services/queen";
import { Table } from "antd";
import { GradientText, ScoreDisplay } from "..";

class QueensListExpanded extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      loading: false,
      data: []
    }

    this.cols = [
      {
        title: "Ep. Number",
        render: (item) => item.episode?.number,
        key: "episodeNum",
        width: 150,
      },
      {
        title: "Episode",
        render: (item) => item.episode?.name,
        key: "episodeName"
      },
      {
        title: "Ep. Points",
        dataIndex: "weeklyPoints",
        key: "weeklyPoints",
        render: (_, record) => <ScoreDisplay total={record.weeklyPoints} leader={props.showLeaderPoints ? record.weeklyLeaderPoints : null} />,
        width: 150,
      },
      {
        title: "Ep. Rank",
        dataIndex: "weeklyRank",
        key: "weeklyRank",
        render: (_, record) => this.renderRank(record.weeklyRank),
        width: 150,
      },
      {
        title: "Total Points",
        dataIndex: "overallPoints",
        key: "overallPoints",
        render: (_, record) => <ScoreDisplay total={record.overallPoints} leader={props.showLeaderPoints ? record.overallLeaderPoints : null} />,
        width: 150,
      },
      {
        title: "Overall Rank",
        dataIndex: "overallRank",
        key: "overallRank",
        render: (_, record) => this.renderRank(record.overallRank),
        width: 150,
      }
    ]
  }

  componentDidMount(){
    this.setState({
      loading: true
    })
    queenService.getWeeklyScores(this.props.leagueID, this.props.queenID)
      .then(data => {
        this.setState({
          data,
          loading: false
        });
      })
  }

  renderRank(rank){
    if(this.state.data){
      const rankIndex = rank * 1 - 1;
      const numRanks = this.props.totalQueens;
      console.log(rank, rankIndex, numRanks);

      return <GradientText total={numRanks} index={rankIndex} text={rank}/>
    }
  }

  render() {
    return (
      <Table
        loading={this.state.loading}
        columns={this.cols}
        dataSource={this.state.data}
        rowKey={item => item.episode ? item.episode.id : 0}
        tableLayout="auto"
        pagination={{
          hideOnSinglePage: true
        }}
        locale={{emptyText: "No episodes to show for this queen yet."}}
      />
    )
  }
}

QueensListExpanded.propTypes = {
  totalQueens: PropTypes.number,
  leagueID: PropTypes.number,
  queenID: PropTypes.number,
  showLeaderPoints: PropTypes.bool
}

QueensListExpanded.defaultProps = {
  totalQueens: 0,
  leagueID: 0,
  queenID: 0,
  showLeaderPoints: true
}

export default QueensListExpanded;