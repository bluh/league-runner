import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import _ from "lodash";
import episodeService from "../../services/episode";
import { Table } from "antd";
import { GradientText, ScoreDisplay } from "..";
import { connect } from "react-redux";

class EpisodeDetailsList extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      loading: false,
      data: []
    }

    this.cols = [
      {
        title: "Queen",
        render: (item) => item.queen?.name,
        key: "queen",
        sorter: (a,b) => a.queen.name.localeCompare(b.queen.name)
      },
      {
        title: "Rule",
        render: (item) => item.rule?.name,
        key: "rule",
        sorter: (a,b) => a.rule.name.localeCompare(b.rule.name)
      },
      {
        title: "Timestamp",
        render: (item) => item.timestamp ? moment(item.timestamp).utc().format("HH:mm:ss") : "",
        key: "timestamp",
        sorter: (a,b) => new Date(a.timestamp) - new Date(b.timestamp),
        defaultSortOrder: "ascend",
        width: 150
      },
      {
        title: "Points",
        render: (item) => this.renderPoints(item.rule?.points),
        key: "points",
        sorter: (a,b) => a.rule.points - b.rule.points,
        width: 150
      },
    ]
  }

  componentDidMount(){
    if(this.props.episodeID > 0){
      this.loadEpisode();
    }
  }

  componentDidUpdate(prevProps) {
    if(this.props.episodeID !== prevProps.episodeID){
      this.loadEpisode();
    }
  }

  loadEpisode(){
    this.setState({
      loading: true
    })
    episodeService.getEpisodeDetails(this.props.episodeID)
      .then(data => {
        this.setState({
          data,
          loading: false
        });
      })
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

  generateSummary = (totalData) => {
    const results = {};
    totalData.forEach(row => 
      results[row.queen.id] = {
        name: row.queen.name,
        total: (results[row.queen.id]?.total || 0) + row.rule.points,
        leader: (results[row.queen.id]?.leader || 0) + Math.max(0, row.rule.points),
      }
    );

    this.props.queensList.forEach(queen => {
      if(!results?.[queen.id]) {
        results[queen.id] = {
          name: queen.name,
          total: 0,
          leader: 0,
        }
      }
    })

    const totalRanks = Object.entries(this.props.queensList).length;    
    const ranks = _
      .chain(results) // { [id] : { total: ... } }
      .map(value => value.total) // [ total1, total2, total2, total3 ...]
      .sort()
      .reverse()
      .reduce((reduced, value, index) => {
        if(!reduced?.[value] && reduced[value] !== 0){ // truncate out already-seen values
          reduced[value] = index
        }
        return reduced;
      }, {}) // { total1: rank1, total2: rank2, total3: rank3 }
      .value();

    const sortedResults = _
      .chain(results)
      .toPairs() // [ [queenID, resultValue], ... ]
      .sortBy(([_index, value]) => ranks[value.total]) // sort by their rank value and use for rendering
      .value();

    return (
      <Table.Summary>
        <Table.Summary.Row style={{ fontWeight: "bold", backgroundColor: "#f3f3f3"}}>
          <Table.Summary.Cell colSpan={2}>
            Totals
          </Table.Summary.Cell>
          <Table.Summary.Cell>
            Points
          </Table.Summary.Cell>
          <Table.Summary.Cell>
            Rank
          </Table.Summary.Cell>
        </Table.Summary.Row>
        {sortedResults.map(([queenID, resultValue]) => {
          const rank = ranks[resultValue.total];
          return (
            <Table.Summary.Row key={queenID} style={{ backgroundColor: "#fafafa"}}>
              <Table.Summary.Cell colSpan={2}>
                {resultValue.name}
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                {this.props.showLeaderPoints ? <ScoreDisplay total={resultValue.total} leader={resultValue.leader} /> : resultValue.total }
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <GradientText total={totalRanks} index={rank} text={`${rank + 1}`} />
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        })}
      </Table.Summary>
    )
  }

  render() {
    return (
      <Table
        loading={this.state.loading}
        columns={this.cols}
        dataSource={this.state.data}
        rowKey={item => item.id}
        bordered
        tableLayout="auto"
        pagination={{
          hideOnSinglePage: true
        }}
        summary={this.generateSummary}
        locale={{emptyText: "No details to show for this episode yet."}}
      />
    )
  }
}

EpisodeDetailsList.propTypes = {
  episodeID: PropTypes.number,
  showLeaderPoints: PropTypes.bool,
  queensList: PropTypes.array
}

EpisodeDetailsList.defaultProps = {
  episodeID: 0,
  showLeaderPoints: true,
  queensList: []
}

const mapStateToProps = (state) => {
  const { queensList } = state.Queens;

  return {
    queensList
  }
}

export default connect(mapStateToProps)(EpisodeDetailsList);