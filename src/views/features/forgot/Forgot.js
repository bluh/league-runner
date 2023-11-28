import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row } from "antd";
import React from "react";

const FORGOT_STATES = {
  UNDECIDED: 0,
  PASSWORD: 1,
  USERNAME: 2
}

class Forgot extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      forgotState: FORGOT_STATES.UNDECIDED
    };
  }

  render() {
    switch (this.state.forgotState) {
      case FORGOT_STATES.PASSWORD:
        return (
          <Row justify="center">
            <Col span={12}>
              <h1>Password Reset Form</h1>
              <Button type="link" size="small" onClick={() => this.setState({ forgotState: FORGOT_STATES.UNDECIDED })} icon={<ArrowLeftOutlined/>}> Back</Button> <br/>
              <label>Username:</label>
              <Input type="text" title="Username" />
              <Input type="button" onClick></Input>
            </Col>
          </Row>
        )
      case FORGOT_STATES.USERNAME:
        return (
          <Row justify="center">
            <Col span={12}>
              <h1>Password Reset Form</h1>
              <Row>
                <Col span={4}>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => this.setState({ forgotState: FORGOT_STATES.UNDECIDED })}
                    icon={<ArrowLeftOutlined />}
                  >
                    Back
                  </Button>
                </Col>
              </Row>
              <Form
                labelCol={{span: 4}}
                wrapperCol={{span: 20}}
              >
                <Form.Item
                  label="Email"
                  required
                >
                  <Input type="text"/>
                </Form.Item>
                <Form.Item wrapperCol={{offset: 4, span: 20}}>
                  <Button htmlType="submit">Submit</Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        )
      case FORGOT_STATES.UNDECIDED:
      default:
        return (
          <Row justify="center">
            <Col span={12}>
              <h1>Password Reset Form</h1>
              <Button type="primary" block onClick={() => this.setState({ forgotState: FORGOT_STATES.PASSWORD })}>Forgot Password?</Button>
              <br/><br/>
              <Button type="primary" block onClick={() => this.setState({ forgotState: FORGOT_STATES.USERNAME })}>Forgot Username?</Button>
            </Col>
          </Row>
        )
    }
  }
}


export default Forgot;