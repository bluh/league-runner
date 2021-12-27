import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import queenActions from "../../reducers/queens/action";
import { Button, Table } from "antd";

class QueenList extends React.Component {
  constructor(props){
    super(props);

    this.cols = [
      {
        title: "Queen",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "Points",
        dataIndex: "points",
        key: "points"
      },
      // {
      //   title: "",
      //   key: "actions",
      //   render: (_, record) => (
      //     <Button href={`/stats/queen/${record.id}`}>Stats</Button>
      //   )
      // }
    ]
  }
  componentDidUpdate(prevProps){
    if(this.props.leagueID && this.props.leagueID !== prevProps.leagueID){
      this.props.dispatch(queenActions.getQueensList(this.props.leagueID));
    }
  }

  render() {
    return (
      <Table
        loading={this.props.loading}
        rowKey={item => item.id}
        dataSource={this.props.queensList}
        columns={this.cols}
        pagination={{
          hideOnSinglePage: true
        }}
        locale={{emptyText: "No queens in this league!"}}
      />
    )
  }
}

QueenList.propTypes = {
  leagueID: PropTypes.number,
  loading: PropTypes.bool,
  queensList: PropTypes.array
}

QueenList.defaultProps = {
  leagueID: null,
  loading: false,
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