import React, { createRef } from "react";
import PropTypes from "prop-types";
import queenService from "../../services/queen";
import { Chart } from "../line-chart/LineChart";
import { Spin } from "antd";

class QueenWeeklyStatsView extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      loading: false
    }

    this.chartRef = createRef();
  }

  componentDidMount(){
    const { leagueID, queenID, queenName, scoreStats } = this.props;

    this.setState({
      loading: true
    });

    queenService.getWeeklyScores(leagueID, queenID)
      .then(data => {
        this.setState({
          loading: false
        });
        
        const chartAxis = data.map(v => `Episode ${v.episode.number}`)

        if(scoreStats){
          const overallData = data.map(v => v.overallPoints);
          const weeklyData = data.map(v => v.weeklyPoints);
          const overallLeaderData = data.map(v => v.overallLeaderPoints);
          const weeklyLeaderData = data.map(v => v.weeklyLeaderPoints);
          
          new Chart(this.chartRef.current, {
            data: {
              datasets: [
                {
                  type: "line",
                  label: "Overall Points",
                  data: overallData,
                  backgroundColor: "#0d2a30",
                  borderColor: "#0d2a30"
                },
                {
                  type: "line",
                  label: "Overall Points (Leader)",
                  data: overallLeaderData,
                  backgroundColor: "#bb6e11",
                  borderColor: "#bb6e11"
                },
                {
                  type: "bar",
                  label: "Weekly Points",
                  data: weeklyData,
                  backgroundColor: "#486778",
                  borderColor: "#486778"
                },
                {
                  type: "bar",
                  label: "Weekly Points (Leader)",
                  data: weeklyLeaderData,
                  backgroundColor: "#f3a32b",
                  borderColor: "#f3a32b"
                }
              ],
              labels: chartAxis
            },
            options: {
              interaction: {
                mode: "index"
              },
              plugins: {
                title: {
                  text: `${queenName}'s Weekly Point Stats`
                }
              }
            }
          })
        }else{
          const overallRankData = data.map(v => v.overallRank);
          const weeklyRankData = data.map(v => v.weeklyRank);

          const rankMax = this.props.totalRanks;
          
          new Chart(this.chartRef.current, {
            data: {
              datasets: [
                {
                  type: "line",
                  label: "Overall Rank",
                  data: overallRankData,
                  backgroundColor: "#0d2a30",
                  borderColor: "#0d2a30"
                },
                {
                  type: "line",
                  label: "Weekly Rank",
                  data: weeklyRankData,
                  backgroundColor: "#999dad",
                  borderColor: "#999dad"
                },
              ],
              labels: chartAxis
            },
            options: {
              interaction: {
                mode: "index"
              },
              scales: {
                y: {
                  reverse: true,
                  ticks: {
                    precision: 0
                  },
                  suggestedMax: rankMax
                }
              }
            }
          })
        }
      })
  }

  render() {
    return (
      <Spin spinning={this.state.loading}>
        <canvas ref={this.chartRef}></canvas>
      </Spin>
    )
  }
}

QueenWeeklyStatsView.propTypes = {
  leagueID: PropTypes.number,
  queenID: PropTypes.number,
  queenName: PropTypes.string,
  scoreStats: PropTypes.bool,
  totalRanks: PropTypes.number
}

QueenWeeklyStatsView.defaultProps = {
  leagueID: 0,
  queenID: 0,
  queenName: "",
  scoreStats: false,
  totalRanks: 0
}


export default QueenWeeklyStatsView;