import { Button, Card, Col, Input, Row, Form as AntdForm, message } from "antd";
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Field, Form } from "react-final-form";
import leagueValidator from "../../validators/league";
import leagueActions from "../../reducers/league/action";
import { FORM_ERROR } from "final-form";

class AdminLeagueForm extends React.Component {
  onFinished = (data) => {
    this.props.updateLeague(this.props.league.id, data, err => {
      if(err){
        const errorText = err.response?.data?.message || "";
        message.error(`Error updating League: ${errorText}`);
        return { [FORM_ERROR]: errorText };
      }else{
        console.log(this.props.league);
        message.success("League updated");
      }
    });
  }

  render() {
    return (
      <div>
        <Card title="Details">
          <Row>
            <Col span={20} offset={2}>
              <Form
                initialValues={{
                  name: this.props.league.name,
                  description: this.props.league.description,
                  drafts: this.props.league.drafts,
                  draftLeader: this.props.league.draftLeader
                }}
                onSubmit={(data) => this.onFinished({
                  ...data,
                  drafts: data.drafts * 1,
                })}
                validate={leagueValidator.validateUpdateLeague}
              >
                {({
                  handleSubmit,
                  dirty,
                  valid,
                }) => (
                  <AntdForm
                    labelCol={{
                      span: 6
                    }}
                    wrapperCol={{
                      span: 16
                    }}
                  >
                    <Field name="name">
                      {({ input, meta }) => (
                        <AntdForm.Item
                          required
                          colon
                          label="League Name"
                          validateStatus={meta.touched && meta.error ? "error" : "success"}
                          help={(meta.touched && meta.error) ? meta.error : null}
                        >
                          <Input type="text" maxLength="20" {...input} />
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
                          <Input.TextArea maxLength="200" {...input} />
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
                          <Input type="number" {...input} min={1} />
                        </AntdForm.Item>
                      )}
                    </Field>

                    <Field name="draftLeader" type="checkbox">
                      {({ input, meta }) => (
                        <AntdForm.Item
                          required
                          label="Allow Team Leaders?"
                          validateStatus={meta.touched && meta.error ? "error" : "success"}
                          help={(meta.touched && meta.error) ? meta.error : null}
                        >
                          <Input type="checkbox" {...input} />
                        </AntdForm.Item>
                      )}
                    </Field>
                    <Col span={4} offset={18}>
                      <Button
                        type="primary"
                        block
                        onClick={handleSubmit}
                        disabled={!dirty || !valid}
                      >
                        Save Changes
                      </Button>
                    </Col>
                  </AntdForm>
                )}
              </Form>
            </Col>
          </Row>
        </Card>
      </div>
    )
  }
}

AdminLeagueForm.propTypes = {
  league: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    drafts: PropTypes.number,
    draftLeader: PropTypes.bool,
  }),
  updateLeague: PropTypes.func,
}


AdminLeagueForm.defaultProps = {
  league: {
    id: 0,
    name: "",
    description: "",
    drafts: 0,
    draftLeader: false,
  },
  updateLeague: () => {},
}


const mapStateToProps = (state) => {
  const { league } = state.League;

  return {
    league
  };
}


const mapDispatchToProps = {
  updateLeague: leagueActions.updateLeague
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminLeagueForm);