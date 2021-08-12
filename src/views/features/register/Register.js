import { Button, Col, Form, Input, Row, Spin } from "antd";
import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import userActions from "../../reducers/user/action";

class Register extends React.Component {
  constructor(props){
    super(props);

    this.formRef = React.createRef();
  }

  formSubmit = (data) => {
    this.props.register(data.username, data.password, data => {
      this.props.history.push('/');
    })
  }

  render() {
    return (
      <div className="login-page">
        {this.props.loggedIn
        ? (<h3>You are already logged in!</h3>)
        : (
          <Spin spinning={this.props.loading}>
            <Row justify="center">
              <Col span={8}>
                <h1>Register</h1>
                <Form ref={this.formRef} onFinish={this.formSubmit}>
                  <Form.Item name="username" label="Username">
                    <Input />
                  </Form.Item>
                  <Form.Item name="password" label="Password">
                    <Input type="password"/>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Register
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Spin>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { loggedIn, user, loading } = state.User;

  return {
    loggedIn,
    user,
    loading
  }
}

const mapDispatchToProps = {
  register: userActions.registerUser
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Register))