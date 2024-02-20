import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button, Table } from "antd";
import queenActions from "../../reducers/queens/action";
import { EditOutlined } from "@ant-design/icons";

class AdminQueenList extends React.Component {
  constructor(props) {
    super(props);

    this.cols = [
      {
        title: "Queen",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        defaultSortOrder: "ascend",
      },
      {
        title: "Edit",
        render: (_, record) => (
          <Button onClick={() => this.editQueen(record.id)} type="primary">
            <EditOutlined />
          </Button>
        ),
        width: 75,
      }
    ]
  }

  componentDidUpdate(prevProps) {
    if (this.props.leagueID && this.props.leagueID !== prevProps.leagueID) {
      this.props.dispatch(queenActions.getQueensList(this.props.leagueID));
    }
  }

  editQueen(queenID) {
    console.log(queenID);
  }

  render() {
    return (
      <Table
        bordered
        loading={this.props.loading}
        rowKey={item => item.id}
        dataSource={this.props.queensList}
        columns={this.cols}
        pagination={{
          hideOnSinglePage: true
        }}
        locale={{ emptyText: "No queens in this league!" }}
      />
    )
  }
}

AdminQueenList.propTypes = {
  leagueID: PropTypes.number,
  loading: PropTypes.bool,
  showLeaderPoints: PropTypes.bool,
  queensList: PropTypes.array
}

AdminQueenList.defaultProps = {
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

export default connect(mapStateToProps)(AdminQueenList);