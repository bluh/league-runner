import { DeleteOutlined, SmileOutlined, ToolOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, Row, Col, Card, Avatar, Menu, Dropdown, Tooltip } from "antd";
import TextArea from "antd/lib/input/TextArea";
import React from "react";
import { connect } from "react-redux";
import { Prompt } from "react-router-dom";
import LeagueBreadcrumb from "./LeagueBreadcrumb";

class LeagueNew extends React.Component {
  constructor(props){
    super(props);

    this.formRef = React.createRef();

    this.state = {
      users: []
    };
  }

  componentDidMount() {
    this.setState({
      users: [
        {
          username: this.props.username,
          role: 3
        }
      ]
    })
  }

  getRoleMenu = (itemName, index) => {
    const selectedKey = this.formRef.current && this.formRef.current.getFieldValue(['users', ...itemName]) || "1";
    return (
      <Menu selectedKeys={[selectedKey]} onClick={(data) => this.onRoleChange(data.key, index)}>
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

  onRoleChange = (value, index) => {
    const users = this.formRef.current && this.formRef.current.getFieldValue('users');
    const update = [...users];
    update[index]['role'] = value;
    this.formRef.current && this.formRef.current.setFieldsValue({ users });
  }

  getUserAvatar = (itemName) => {
    const role = this.formRef.current && this.formRef.current.getFieldValue(['users', ...itemName]);
    const commonProps = {
      size: 32
    }
    if(role === "2"){
      return (
        <Tooltip title="Admin (Click to change)">
          <Avatar
            icon={<ToolOutlined/>}
            className="admin-icon"
            {...commonProps}
          />
        </Tooltip>
      );
    }else if(role === "3"){
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

  render() {
    return (
      <div className="league-new">
        <LeagueBreadcrumb leagueName="New League"/>
        <Prompt message="You have unsaved changes. Navigating away from this page will discard these changes." when={true} />
        <h1>New League</h1>
        <Form
          ref={this.formRef}
          labelCol={{
            span: 4
          }}
          wrapperCol={{
            span: 20
          }}
          onFieldsChange={(changed, all) => {
            console.log('fields', changed, all, this.formRef)
          }}
          onFinish={values => {
            console.log('finished', values);
          }}
        >
          <Row gutter={[16,32]}>
            <Col span={14}>
              <Card title="Description">
                <Form.Item
                  name="name"
                  label="League Name"
                  rules={[
                    {
                      required: true,
                      message: "Please specify a name for the new league"
                    },
                    {
                      max: 20,
                      message: "Please enter a shorter League name"
                    }
                  ]}
                >
                  <Input type="text" name="name"></Input>  
                </Form.Item>

                <Form.Item
                  name="description"
                  label="League Description"
                  rules={[
                    {
                      max: 200,
                      message: "Please enter a shorter description"
                    }
                  ]}
                >
                  <TextArea maxLength="200" name="description" />
                </Form.Item>
              </Card>
            </Col>
            <Col span={10}>
              <Card title="Users">
                <Form.List
                  name="users"
                  label="Users"
                  tooltip="Add users to the league"
                  initialValue={[
                    {
                      role: "3",
                      name: this.props.username
                    }
                  ]}
                >
                  {( values, { add, remove } ) => {
                    return (
                      <div className="league-admin-list">
                        <Row style={{ paddingBottom: 16 }}>
                          <Col span={24}>
                            <Button type="dashed" onClick={() => add()} style={{ width: "100%" }}>
                              Add new user
                            </Button>
                          </Col>
                        </Row>
                        {values.map(field => (
                          <Form.Item
                            noStyle
                            key={field.key}
                          >
                            <Row gutter={[8, 8]}>
                              <Col>
                                <Form.Item
                                  name={[field.name, "role"]}
                                  initialValue="1"
                                  tooltip={{
                                    title: "Assign new role"
                                  }}
                                >
                                  <Dropdown
                                    overlay={() => this.getRoleMenu([field.name, "role"], field.name)}
                                    trigger={['click']}
                                  >
                                    {this.getUserAvatar([field.name, "role"])}
                                  </Dropdown>
                                </Form.Item>
                              </Col>
                              <Col flex="auto">
                                <Form.Item
                                  name={[field.name, "name"]}
                                  validateTrigger={['onChange', 'onBlur']}
                                  wrapperCol={{
                                    span: 24
                                  }}
                                >
                                  <Input readOnly={field.key === 0}/>
                                </Form.Item>
                              </Col>
                              <Col>
                                <Button disabled={field.key === 0} type="text" onClick={() => remove(field.name)}>
                                  <DeleteOutlined />
                                </Button>
                              </Col>
                            </Row>
                          </Form.Item>
                        ))}
                      </div>
                    )
                  }}
                </Form.List>
              </Card>
            </Col>
          </Row>
          

          <Button htmlType="submit">Submit</Button>
        </Form>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { user } = state.User;

  return {
    username: user ? user.user : ""
  }
}

export default connect(mapStateToProps)(LeagueNew);