import React from "react";
import PropTypes from "prop-types";
import { DeleteOutlined, SmileOutlined, ToolOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Input, Row, Col, Card, Avatar, Menu, Dropdown, Tooltip, Spin, Form as StyleForm, message } from "antd";
import { withRouter } from "react-router";
import { Form, Field } from "react-final-form";
import { connect } from "react-redux";
import { Prompt } from "react-router-dom";
import { UserPicker } from "../../components";
import leagueActions from "../../reducers/league/action";
import LeagueBreadcrumb from "./LeagueBreadcrumb";
import validateJs, { isArray } from "validate.js";
import { FORM_ERROR } from "final-form";

class LeagueNew extends React.Component {
  constructor(props){
    super(props);

    this.userKeys = 1;
    this.queenKeys = 1;
    this.formRef = React.createRef();

    this.state = {
      leaving: false
    }
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
      ...users,
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
      ...queens,
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
      <div className="league-new">
        <LeagueBreadcrumb leagueName="New League"/>
        <h1>New League</h1>
        <Form
          keepDirtyOnReinitialize
          onSubmit={values => {
            const newData = {
              ...values,
              drafts: values.drafts * 1,
              users: values.users.filter(v => v.user !== this.props.userID).map(v => ({role: v.role, user: v.user})),
              queens: values.queens.map(v => v.name)
            }

            this.props.createLeague(newData, err => {
              if(err){
                const errorText = err.response?.data?.message || "";
                message.error(`Error creating new League: ${errorText}`);
                return { [FORM_ERROR]: errorText };
              }else{
                message.success("New League created");
                this.setState({
                  leaving: true
                }, () => {
                  this.props.history.push("/leagues");
                })
              }
            });
          }}
          validate={values => {
            var errors = validateJs(values, {
              name: {
                type: "string",
                presence: {
                  allowEmpty: false,
                  message: "Please specify a name for the new league"
                },
                length: {
                  maximum: 20,
                  message: "Please enter a shorter league name"
                }
              },
              description: {
                type: "string",
                length: {
                  maximum: 200,
                  message: "Please enter a shorter description"
                }
              },
              drafts: {
                presence: {
                  allowEmpty: false,
                  message: "Please specify the number of drafts on a team"
                },
                numericality: {
                  onlyInteger: true,
                  greaterThan: 0,
                  notValid: "Please specify the number of drafts on a team",
                  notGreaterThan: "Please specify the number of drafts on a team"
                }
              },
              allowLeaders: {
                type: "boolean"
              },
              queens: {
                type: "array",
                length: {
                  minimum: 1,
                  tooShort: "At least one queen must be registered."
                }
              }
            }, {fullMessages: false});

            if(values.users && validateJs.isArray(values.users)){
              const totalUsersErrors = {};
              values.users.forEach((user, index) => {
                const userErrors = validateJs(user, {
                  role: {
                    type: "number",
                    presence: {
                      message: "Please select a role",
                    }
                  },
                  user: {
                    type: "number",
                    presence: {
                      message: "Please enter a username"
                    }
                  }
                }, {fullMessages: false, format: "flat"})

                if(userErrors){
                  totalUsersErrors[index] = userErrors;
                }
              });

              if(Object.keys(totalUsersErrors).length > 0){
                errors = {
                  ...errors,
                  users: totalUsersErrors
                }
              }
            }

            if(values.queens && validateJs.isArray(values.queens)){
              const totalQueensErrors = {};

              values.queens.forEach((queen, index) => {
                const queenErrors = validateJs(queen, {
                  name: {
                    type: "string",
                    presence: {
                      message: "Please enter a queen name",
                      allowEmpty: false
                    }
                  }
                }, {fullMessages: false, format: "flat"});

                if(queenErrors){
                  totalQueensErrors[index] = queenErrors;
                }
              });

              if(Object.keys(totalQueensErrors).length > 0){
                errors = {
                  ...errors,
                  queens: totalQueensErrors
                }
              }
            }

            return errors;
          }}
          initialValues={{
            name: "",
            description: "",
            drafts: 1,
            allowLeaders: true,
            users: [
              {
                role: 3,
                user: this.props.userID,
                name: this.props.username,
                key: 0,
              }
            ],
            queens: []
          }}
        >
          {({
            handleSubmit,
            form,
            values,
            pristine,
          }) => (
            <Spin
              spinning={this.props.loading}
            >
              <StyleForm
                labelCol={{
                  span: 6
                }}
                wrapperCol={{
                  span: 18
                }}
                onFinish={handleSubmit}
              >
                <Prompt message="You have unsaved changes. Navigating away from this page will discard these changes." when={!pristine && !this.state.leaving} />
                <Row gutter={[16,32]}>
                  <Col span={14}>
                    <Row gutter={[16, 32]}>
                      <Col span={24}>
                        <Card title="Description">
                          <Field name="name">
                            {({ input, meta }) => (
                              <StyleForm.Item
                                required
                                colon
                                label="League Name"
                                validateStatus={meta.touched && meta.error ? "error" : "success"}
                                help={(meta.touched && meta.error) ? meta.error : null}
                              >
                                <Input type="text" {...input}/>
                              </StyleForm.Item>
                            )}
                          </Field>
                          <Field name="description">
                            {({ input, meta }) => (
                              <StyleForm.Item
                                colon
                                label="League Description"
                                validateStatus={meta.touched && meta.error ? "error" : "success"}
                                help={(meta.touched && meta.error) ? meta.error : null}
                              >
                                <Input.TextArea maxLength="200"{...input} />
                              </StyleForm.Item>
                            )}
                          </Field>
                        </Card>
                      </Col>
                      <Col span={24}>
                        <Card title="Drafting">
                          <Field name="drafts">
                            {({ input, meta }) => (
                              <StyleForm.Item
                                required
                                colon
                                label="Number of Draft Picks"
                                validateStatus={meta.touched && meta.error ? "error" : "success"}
                                help={(meta.touched && meta.error) ? meta.error : null}
                              >
                                <Input type="number" {...input} min={1}/>
                              </StyleForm.Item>
                            )}
                          </Field>
                          <Field name="allowLeaders" type="checkbox">
                            {({ input, meta }) => (
                              <StyleForm.Item
                                required
                                label="Allow Team Leaders?"
                                validateStatus={meta.touched && meta.error ? "error" : "success"}
                                help={(meta.touched && meta.error) ? meta.error : null}
                              >
                                <Input type="checkbox" {...input}/>
                              </StyleForm.Item>
                            )}
                          </Field>
                        </Card>
                      </Col>
                      <Col span={24}>
                        <Card title="Queens">
                          <Field name="queens">
                            {({ input, meta }) => (
                              <StyleForm.Item
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
                                  <StyleForm.Item
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
                                  </StyleForm.Item>
                                ))}
                              </StyleForm.Item>
                            )}
                          </Field>
                        </Card>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={10}>
                    <Card title="Users">
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
                                <StyleForm.Item
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
                                </StyleForm.Item>
                              ))}
                            </div>
                          )}
                        </Field>
                    </Card>
                  </Col>
                </Row>
            

                <Button htmlType="submit">Create</Button>
              </StyleForm>
            </Spin>
          )}
        </Form>
      </div>
    )
  }
}

LeagueNew.propTypes = {
  username: PropTypes.string,
  userID: PropTypes.number,
  loading: PropTypes.bool,
  createLeague: PropTypes.func,
}

LeagueNew.defaultProps = {
  username: "",
  userID: 0,
  loading: false,
  createLeague: () => {},
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

const mapDispatchToProps = {
  createLeague: leagueActions.createNewLeague
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LeagueNew));