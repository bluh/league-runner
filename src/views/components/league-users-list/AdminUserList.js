import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import leagueActions from "../../reducers/league/action";
import { UserPicker } from "..";
import { Button, Col, Drawer, message, Row, Select, Space, Spin, Table } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import leagueServices from "../../services/league";

class AdminUserList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      drawerOpen: false,
      forEdit: false,
      drawerLoading: false,
      userData: {},
      dataDirty: false
    }

    this.cols = [
      {
        title: "User",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name)
      },
      {
        title: "Role",
        key: "role",
        render: (_, record) => record.role.name,
        sorter: (a, b) => a.name.localeCompare(b.name)
      },
      {
        title: "Edit",
        render: (_, record) => (
          <Button onClick={() => this.openEditModal(record)} type="primary" >
            <EditOutlined />
          </Button>
        ),
        width: 75,
      }
    ]
  }

  openEditModal(record) {
    if (!record)
      return;

    const data = {
      id: record.id,
      roleID: record.role.id
    }

    this.setState({
      drawerOpen: true,
      forEdit: true,
      userData: data,
      dataDirty: false
    });
  }

  openNewModal() {
    this.setState({
      drawerOpen: true,
      forEdit: false,
      userData: {
        roleID: 1
      },
      dataDirty: false
    })
  }

  selectUser(userID) {
    this.setState(oldState => ({
      userData: {
        ...oldState.userData,
        id: userID
      },
      dataDirty: true
    }));
  }

  selectNewRole(roleValue) {
    this.setState(oldState => ({
      userData: {
        ...oldState.userData,
        roleID: roleValue
      },
      dataDirty: true
    }));
  }

  closeAdminModal() {
    if (this.state.dataDirty && !confirm("Unsaved data will be lost")) {
      return;
    }

    this.setState({
      drawerOpen: false
    });
  }

  saveAdminModal() {
    const { leagueID } = this.props;
    const { forEdit, userData } = this.state;
    const { id: userID, roleID } = userData;

    if (!leagueID || !userID || !roleID) {
      return;
    }

    if (forEdit) {
      leagueServices.updateLeagueUser(leagueID, userID, { roleID })
        .then(() => {
          this.setState({
            drawerOpen: false,
            drawerLoading: false,
            userData: {},
            dataDirty: false
          });

          this.props.dispatch(leagueActions.getLeagueUsers(leagueID));
        })
        .catch(() => {
          message.error("Error saving user changes");
        })
    } else {
      leagueServices.addLeagueUser(leagueID, userID, { roleID })
        .then(() => {
          this.setState({
            drawerOpen: false,
            drawerLoading: false,
            userData: {},
            dataDirty: false
          });

          this.props.dispatch(leagueActions.getLeagueUsers(leagueID));
        })
        .catch(() => {
          message.error("Error saving user changes");
        })
    }
  }

  deleteUser() {
    if (confirm("Are you sure you wish to delete this user?")) {
      const { leagueID } = this.props;
      const { id: userID } = this.state.userData;

      leagueServices.deleteLeagueUser(leagueID, userID)
        .then(() => {
          this.setState({
            drawerOpen: false,
            drawerLoading: false,
            userData: {},
            dataDirty: false
          });

          this.props.dispatch(leagueActions.getLeagueUsers(leagueID));
        })
        .catch(() => {
          message.error("Error removing user from league");
        })
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.leagueID && this.props.leagueID !== prevProps.leagueID) {
      this.props.dispatch(leagueActions.getLeagueUsers(this.props.leagueID));
    }
  }

  render() {
    return (
      <>
        <Drawer
          open={this.state.drawerOpen}
          onClose={() => this.closeAdminModal()}
          extra={
            <Space>
              <Button onClick={() => this.closeAdminModal()}>Cancel</Button>
              <Button
                type="primary"
                onClick={() => this.saveAdminModal()}
                disabled={!this.state.userData.id || !this.state.userData.roleID || !this.state.dataDirty}
              >
                Save
              </Button>
            </Space>
          }
        >
          <Spin spinning={this.state.drawerLoading}>
            {!this.state.forEdit && (
              <>
                <Row>
                  <Col span={6}>
                    <label>User:</label>
                  </Col>
                  <Col span={18}>
                    <UserPicker
                      value={this.state.userData.id}
                      onChange={e => this.selectUser(e)}
                      excludeList={this.props.usersList.map(v => v.id)}
                    />
                  </Col>
                </Row>
                <br />
              </>
            )}
            <Row>
              <Col span={6}>
                <label>Role:</label>
              </Col>
              <Col span={18}>
                <Select
                  style={{ width: "100%" }}
                  value={this.state.userData.roleID}
                  disabled={this.state.userData.roleID === 3}
                  options={[
                    { label: "User", value: 1 },
                    { label: "Admin", value: 2 },
                    { label: "Creator", value: 3, disabled: true }
                  ]}
                  onChange={(val) => this.selectNewRole(val)}
                />
              </Col>
            </Row>
            <br />
            {this.state.forEdit && (
              <Row>
                <Col span={24}>
                  <Button
                    type="primary"
                    danger
                    block
                    disabled={this.state.userData.roleID === 3}
                    onClick={() => this.deleteUser()}
                  >
                    Remove User
                  </Button>
                </Col>
              </Row>
            )}
          </Spin>
        </Drawer>

        <Space
          direction="vertical"
          style={{
            width: "100%"
          }}
        >
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => this.openNewModal()}
            style={{ float: "right" }}
          >
            Add User
          </Button>

          <div style={{ overflowX: "scroll" }}>
            <Table
              bordered
              loading={this.props.loading}
              rowKey={item => item.id}
              dataSource={this.props.usersList}
              columns={this.cols}
              pagination={{
                hideOnSinglePage: true
              }}
              locale={{ emptyText: "No users in this league!" }}
            />
          </div>
        </Space>
      </>
    )
  }
}

AdminUserList.propTypes = {
  leagueID: PropTypes.number,
  loading: PropTypes.bool,
  usersList: PropTypes.array,
}

AdminUserList.defaultProps = {
  leagueID: null,
  loading: false,
  usersList: [],
}

const mapStateToProps = (state) => {
  const { loadingLeagueUsers, leagueUsers } = state.League;

  return {
    usersList: leagueUsers,
    loading: loadingLeagueUsers
  }
}

export default connect(mapStateToProps)(AdminUserList);