import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Prompt } from "react-router-dom";
import leagueValidator from "../../validators/league";
import { Field, Form } from "react-final-form";
import { Tabs, Spin, Row, Col, Form as AntdForm, Input, Menu, Tooltip, Avatar, Button, Dropdown } from "antd";
import { ProfileOutlined, IdcardOutlined, TeamOutlined, VideoCameraOutlined, KeyOutlined, ToolOutlined, SmileOutlined, UserOutlined, DeleteOutlined, ExclamationCircleTwoTone } from "@ant-design/icons";
import { isArray } from "validate.js";
import { UserPicker } from "../../components";

class LeagueForm extends React.Component {
  constructor(props){
    super(props);

    this.userKeys = 1;
    this.queenKeys = 1;
  }

  renderTabTitle(RequestedIcon, title, dirty, error){
    return (
      <span style={dirty ? { fontWeight: "bold" } : {}}>
        <RequestedIcon/>
        {title} {dirty ? "*" : ""}
        {(dirty && error) ? <Tooltip title="Error on this tab"><ExclamationCircleTwoTone twoToneColor="#DD0000" style={{ marginLeft: 8, marginRight: 0 }} /></Tooltip> : null}
      </span>
    )
  }

  getRoleMenu = (key, onClick) => {
    const selectedKey = `${key}`;
    return (
      <Menu selectedKeys={[selectedKey]} onClick={(data) => onClick(data.key)}>
        <Menu.Item key="1" disabled={selectedKey === "3"}>
          User
        </Menu.Item>
        <Menu.Item key="2" disabled={selectedKey === "3"}>
          Admin
        </Menu.Item>
        <Menu.Item key="3" disabled>
          Creator
        </Menu.Item>
      </Menu>
    );
  }

  getUserAvatar = (role) => {
    const currentRole = `${role}`;
    const commonProps = {
      size: 32
    }
    if(currentRole === "2"){
      return (
        <Tooltip title="Admin (Click to change)">
          <Avatar
            icon={<ToolOutlined/>}
            className="admin-icon"
            {...commonProps}
          />
        </Tooltip>
      );
    }else if(currentRole === "3"){
      return (
        <Tooltip title="Owner">
          <Avatar
            icon={<SmileOutlined/>}
            className="creator-icon"
            {...commonProps}
          />
        </Tooltip>
      );
    }else{
      return (
        <Tooltip title="User (Click to change)">
          <Avatar
            icon={<UserOutlined/>}
            className="user-icon"
            {...commonProps}
          />
        </Tooltip>
      );
    }
  }
  
  addUser = (form, users) => {
    form.change("users", [
      ...(users || []),
      {
        role: 1,
        user: null,
        key: this.userKeys++
      }
    ])
  }

  changeUserRole = (form, users, index, role, cb) => {
    const newUsers = [...users];
    newUsers[index] = {
      ...users[index],
      role: role * 1
    };

    form.change("users", newUsers);
    cb && cb();
  }

  changeUserValue = (form, users, index, newUser, cb) => {
    const newUsers = [...users];
    newUsers[index] = {
      ...users[index],
      user: newUser * 1
    };

    form.change("users", newUsers);
    cb && cb();
  }

  removeUser = (form, users, index) => {
    const newUsers = [...users];
    newUsers.splice(index, 1);

    form.change("users", newUsers);
  }

  addQueen = (form, queens) => {
    form.change("queens", [
      ...(queens || []),
      {
        name: "",
        key: this.userKeys++
      }
    ])
  }

  changeQueenValue = (form, queens, index, newQueen) => {
    const newQueens = [...queens];
    newQueens[index] = {
      ...queens[index],
      name: newQueen
    };

    form.change("queens", newQueens);
  }

  removeQueen = (form, queens, index) => {
    const newQueens = [...queens];
    newQueens.splice(index, 1);

    form.change("queens", newQueens);
  }

  render() {
    return (
      <Form
        initialValues={this.props.initialData}
        keepDirtyOnReinitialize
        onSubmit={(values) => {
          const newData = {
            ...values,
            drafts: values.drafts * 1,
            users: values.users.filter(v => v.user !== this.props.userID).map(v => ({role: v.role, user: v.user})),
            queens: values.queens.map(v => v.name)
          }

          return this.props.onSubmit(newData);
        }}
        validate={leagueValidator.validateLeague}
      >
        {({
            handleSubmit,
            form,
            values,
            pristine,
            dirtyFields,
            errors,
            valid,
        }) => (
          <Spin
            spinning={this.props.loading}
          >
            {/* <FormSpy subscription={{ valid: true, pristine: true }} onChange={this.props.onChange} /> */}
            <AntdForm
              labelCol={{
                span: 3
              }}
              wrapperCol={{
                span: 21
              }}
              onFinish={handleSubmit}
            >
              <Prompt message="You have unsaved changes. Navigating away from this page will discard these changes." when={!pristine && !this.props.leaving} />
              <Tabs
                type="card"
                tabBarExtraContent={(<Button type="primary" disabled={pristine || !valid} onClick={handleSubmit}>Create</Button>)}
              >
                <Tabs.TabPane
                  tab={this.renderTabTitle(ProfileOutlined, "Details", dirtyFields.name || dirtyFields.description, errors.name || errors.description)}
                  key="1"
                >
                  <p>Give your new league a name and a description. Users will be able to see both of these, and can use them to identify your league in the list of the leagues they are a part of.</p>
                  <Row justify="center">
                    <Col xs={24} lg={20}>
                      <Field name="name">
                        {({ input, meta }) => (
                          <AntdForm.Item
                            required
                            colon
                            label="League Name"
                            validateStatus={meta.touched && meta.error ? "error" : "success"}
                            help={(meta.touched && meta.error) ? meta.error : null}
                          >
                            <Input type="text" {...input}/>
                          </AntdForm.Item>
                        )}
                      </Field>
                      
                      <Field name="description">
                        {({ input, meta }) => (
                          <AntdForm.Item
                            colon
                            label="League Description"
                            validateStatus={meta.touched && meta.error ? "error" : "success"}
                            help={(meta.touched && meta.error) ? meta.error : null}
                          >
                            <Input.TextArea maxLength="200"{...input} />
                          </AntdForm.Item>
                        )}
                      </Field>
                      
                      <Field name="drafts">
                          {({ input, meta }) => (
                            <AntdForm.Item
                              required
                              colon
                              label="Number of Draft Picks"
                              validateStatus={meta.touched && meta.error ? "error" : "success"}
                              help={(meta.touched && meta.error) ? meta.error : null}
                            >
                              <Input type="number" {...input} min={1}/>
                            </AntdForm.Item>
                          )}
                        </Field>

                        <Field name="allowLeaders" type="checkbox">
                          {({ input, meta }) => (
                            <AntdForm.Item
                              required
                              label="Allow Team Leaders?"
                              validateStatus={meta.touched && meta.error ? "error" : "success"}
                              help={(meta.touched && meta.error) ? meta.error : null}
                            >
                              <Input type="checkbox" {...input}/>
                            </AntdForm.Item>
                          )}
                        </Field>
                    </Col>
                  </Row>
                </Tabs.TabPane>
                <Tabs.TabPane tab={this.renderTabTitle(IdcardOutlined, "Queens", dirtyFields.queens, errors.queens)} key="2" forceRender >
                  <p>Add queens to your league. You only need to list queen names here.</p>
                  <Row justify="center">
                    <Col xs={24} lg={20}>
                      <Field name="queens">
                        {({ input, meta }) => (
                          <AntdForm.Item
                            validateStatus={meta.touched && isArray(meta.error) && meta.error[0] ? "error" : "success"}
                            help={(meta.touched && isArray(meta.error) && meta.error[0]) ? meta.error[0] : null}
                            wrapperCol={{
                              span: 24
                            }}
                          >
                            <Row style={{ paddingBottom: 16 }}>
                              <Col span={24}>
                                <Button type="dashed" onClick={() => this.addQueen(form, values.queens)} style={{ width: "100%" }}>
                                  Add new queen
                                </Button>
                              </Col>
                            </Row>
                            {input.value && input.value.map((queenValue, index) => (
                              <AntdForm.Item
                                key={queenValue.key}
                                validateStatus={meta.error && meta.error[index] ? "error" : "success"}
                                help={(meta.error && meta.error[index]) ? meta.error[index] : null}
                                wrapperCol={{
                                  span: 24
                                }}
                              >
                                <Row>
                                  <Col flex="auto">
                                    <Input value={queenValue.name} onChange={evt => this.changeQueenValue(form, values.queens, index, evt.target.value)} onFocus={input.onFocus} />
                                  </Col>
                                  <Col>
                                    <Button type="text" onClick={() => this.removeQueen(form, values.queens, index)}>
                                      <DeleteOutlined />
                                    </Button>
                                  </Col>
                                </Row>
                              </AntdForm.Item>
                            ))}
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                  </Row>
                </Tabs.TabPane>
                <Tabs.TabPane tab={this.renderTabTitle(TeamOutlined, "Players", dirtyFields.users, errors.users)} key="3" forceRender>
                  <p>Add users to your league. You can assign users to &quot;Admin&quot; or &quot;User&quot; roles within your league. Only you can be the &quot;Creator&quot; for the league.</p>
                  <Row justify="center">
                    <Col xs={24} lg={20}>
                      <Field name="users">
                        {({ input, meta }) => (
                          <div className="league-admin-list">
                            <Row style={{ paddingBottom: 16 }}>
                              <Col span={24}>
                                <Button type="dashed" onClick={() => this.addUser(form, values.users)} style={{ width: "100%" }}>
                                  Add new user
                                </Button>
                              </Col>
                            </Row>
                            {input.value && input.value.map((userValue, index) => (
                              <AntdForm.Item
                                key={userValue.key}
                                validateStatus={meta.error && meta.error[index] ? "error" : "success"}
                                help={(meta.error && meta.error[index]) ? meta.error[index] : null}
                                wrapperCol={{
                                  span: 24
                                }}
                              >
                                <Row gutter={[8, 8]}>
                                  <Col>
                                    <Dropdown
                                      overlay={() => this.getRoleMenu(userValue.role, (newRole) => this.changeUserRole(form, values.users, index, newRole))}
                                      trigger={['click']}
                                    >
                                      {this.getUserAvatar(userValue.role)}
                                    </Dropdown>
                                  </Col>
                                  <Col flex="auto">
                                    {index === 0
                                      ? (<Input readOnly={true} value={userValue.name} />)
                                      : (<UserPicker
                                          onChange={(data) => this.changeUserValue(form, values.users, index, data, input.onBlur)}
                                          value={userValue.user}
                                          excludeList={values.users && values.users.map(v => v.user || undefined).filter(v => v)}
                                        />)
                                    }
                                  </Col>
                                  <Col>
                                    <Button disabled={index === 0} type="text" onClick={() => this.removeUser(form, values.users, index)}>
                                      <DeleteOutlined />
                                    </Button>
                                  </Col>
                                </Row>
                              </AntdForm.Item>
                            ))}
                          </div>
                        )}
                      </Field>
                    </Col>
                  </Row>
                </Tabs.TabPane>
                <Tabs.TabPane tab={this.renderTabTitle(VideoCameraOutlined, "Episodes")} key="4">
                  <p>Add Episodes to your league. you can do this later</p>
                </Tabs.TabPane>
                <Tabs.TabPane tab={this.renderTabTitle(KeyOutlined, "Rules")} key="6">
                  <p>Add Rules to your league. you can do this later</p>
                </Tabs.TabPane>
              </Tabs>
            </AntdForm>
          </Spin>
        )}
      </Form>
    );
  }
}

LeagueForm.propTypes = {
  initialData: PropTypes.object,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  leaving: PropTypes.bool,
  username: PropTypes.string,
  userID: PropTypes.number,
  loading: PropTypes.bool,
}

LeagueForm.defaultProps = {
  initialData: null,
  onChange: () => {},
  onSubmit: () => {},
  leaving: false,
  username: "",
  userID: 0,
  loading: false,
}

const mapStateToProps = (state) => {
  const { user } = state.User;
  const { loadingLeague } = state.League;

  return {
    username: user?.name,
    userID: user?.id,
    loading: loadingLeague
  }
}

export default withRouter(connect(mapStateToProps)(LeagueForm));