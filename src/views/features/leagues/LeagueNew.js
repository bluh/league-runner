import { DeleteOutlined, SmileOutlined, ToolOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Input, Row, Col, Card, Avatar, Menu, Dropdown, Tooltip, Form as StyleForm } from "antd";
import React from "react";
import { Form, Field } from "react-final-form";
import { connect } from "react-redux";
import { Prompt } from "react-router-dom";
import { UserPicker } from "../../components";
import LeagueBreadcrumb from "./LeagueBreadcrumb";
import validateJs from "validate.js";

class LeagueNew extends React.Component {
  constructor(props){
    super(props);

    this.userKeys = 1;
    this.formRef = React.createRef();
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
    cb();
  }

  changeUserValue = (form, users, index, newUser, cb) => {
    const newUsers = [...users];
    newUsers[index] = {
      ...users[index],
      user: newUser * 1
    };

    form.change("users", newUsers);
    cb();
  }

  removeUser = (form, users, index) => {
    const newUsers = [...users];
    newUsers.splice(index, 1);

    form.change("users", newUsers);
  }

  render() {
    return (
      <div className="league-new">
        <LeagueBreadcrumb leagueName="New League"/>
        <h1>New League</h1>
        <Form
          onSubmit={values => {
            console.log('finished', values);
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

            return errors;
          }}
          initialValues={{
            name: "",
            description: "",
            users: [
              {
                role: 3,
                user: this.props.userID,
                name: this.props.username,
                key: 0,
              }
            ]
          }}
        >
          {({
            handleSubmit,
            form,
            values,
            pristine,
          }) => (
            <StyleForm
              labelCol={{
                span: 6
              }}
              wrapperCol={{
                span: 18
              }}
              onFinish={handleSubmit}
            >
              <Prompt message="You have unsaved changes. Navigating away from this page will discard these changes." when={!pristine} />
              <Row gutter={[16,32]}>
                <Col span={14}>
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
          )}
        </Form>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { user } = state.User;

  return {
    username: user ? user.user : "",
    userID: user.id,
  }
}

export default connect(mapStateToProps)(LeagueNew);