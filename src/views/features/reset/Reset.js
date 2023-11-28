import React from "react";
import PropTypes from "prop-types";
import { Button, Col, Form, Input, message, Row, Spin } from "antd";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import userActions from "../../reducers/user/action";

class Reset extends React.Component {
  constructor(props) {
    super(props);

    this.formRef = React.createRef();
  }

  formSubmit = (data) => {
    const params = new URLSearchParams(this.props.location.search);
    if (params) {
      const hash = params.get("hash");
      console.log('sending ', hash);
      this.props.sendReset(hash, data.password, (err) => {
        if (!err) {
          message.success("Password successfully reset. Please log in with the new password", 5);
          this.props.history.push('/');
        }
      })
    }
  }

  render() {
    return (
      <div className="login-page">
        {this.props.loggedIn
          ? (<h3>You are already logged in!</h3>)
          : (
            <Spin spinning={this.props.loading}>
              <Row justify="center">
                <Col span={12}>
                  <h1>Reset Password</h1>
                  <Form ref={this.formRef} onFinish={this.formSubmit} layout="vertical">
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[
                        {
                          required: true,
                          message: "Password is required."
                        },
                        {
                          min: 6,
                          message: "Password must be at least 6 characters."
                        }
                      ]}
                    >
                      <Input type="password" />
                    </Form.Item>
                    <Form.Item
                      name="confirm"
                      label="Confirm Password"
                      dependencies={['password']}
                      rules={[
                        {
                          required: true,
                          message: "Please confirm your new password."
                        },
                        ({ getFieldValue }) => ({
                          validator: (_, value) => {
                            if(getFieldValue('password') !== value){
                              return Promise.reject(new Error("Password does not match"));
                            }else{
                              return Promise.resolve();
                            }
                          }
                        })
                      ]}
                    >
                      <Input type="password"/>
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Reset Password
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

Reset.propTypes = {
  loggedIn: PropTypes.bool,
  loading: PropTypes.bool,
  sendReset: PropTypes.func
}

Reset.defaultProps = {
  loggedIn: false,
  loading: true,
  sendReset: () => { }
}

const mapStateToProps = (state) => {
  const { loggedIn, loading } = state.User;

  return {
    loggedIn,
    loading
  }
}

const mapDispatchToProps = {
  sendReset: userActions.resetPassword
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Reset))