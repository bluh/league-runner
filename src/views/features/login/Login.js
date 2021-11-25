import React from "react";
import PropTypes from "prop-types";
import { Button, Col, Form, Input, Row, Spin } from "antd";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import userActions from "../../reducers/user/action";

class Login extends React.Component {
  constructor(props){
    super(props);

    this.formRef = React.createRef();
  }

  formSubmit = (data) => {
    this.props.loginUser(data.username, data.password, () => {
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
                <h1>Login</h1>
                <Form ref={this.formRef} onFinish={this.formSubmit}>
                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[
                      {
                        required: true,
                        message: "Username is required."
                      }
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      {
                        required: true,
                        message: "Password is required."
                      }
                    ]}
                  >
                    <Input type="password"/>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Log In
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

Login.propTypes = {
  loggedIn: PropTypes.bool,
  loading: PropTypes.bool,
  loginUser: PropTypes.func,
}

Login.defaultProps = {
  loggedIn: false,
  loading: true,
  loginUser: () => {},
}

const mapStateToProps = (state) => {
  const { loggedIn, loading } = state.User;

  return {
    loggedIn,
    loading
  }
}

const mapDispatchToProps = {
  loginUser: userActions.loginUser
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login))