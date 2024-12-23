import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Field, Form } from "react-final-form";
import { validateEpisodeForm } from "../../../types/validators";
import { createForm } from "final-form";
import { Form as AntdForm, Button, Col, DatePicker, Input, Row, Select, Switch, Table, TimePicker } from "antd";
import { connect } from "react-redux";

import "./EditEpisodeForm.scss";
import { DeleteOutlined } from "@ant-design/icons";

class EditEpisodeForm extends React.Component {
  constructor(props) {
    super(props);

    this.rowKey = 0;

    this.formRef = createForm({
      initialValues: this.props.defaultValues,
      validate: validateEpisodeForm,
      onSubmit: (values) => this.props.onSubmit(values),
    });

    this.formRef.subscribe(
      (formState) => {
        if (formState.dirty) {
          this.props.onDirty();
        }
      },
      {
        dirty: true,
        values: true
      }
    )

    this.colsWithoutTimestamp = [
      {
        title: "Queen",
        dataIndex: ["queen", "name"],
        key: "queen",
      },
      {
        title: "Rule",
        dataIndex: ["rule", "name"],
        key: "rule.name",
        render: (val, record) => <span className={`rule-col ${record.rule.points >= 0 ? "good" : "bad"}`}>{val}</span>
      },
      {
        title: "Points",
        dataIndex: ["rule", "points"],
        key: "rule.points",
        render: (val, record) => <span className={`rule-col ${record.rule.points >= 0 ? "good" : "bad"}`}>{val}</span>,
        width: 75
      },
      {
        title: "Delete",
        render: (_, __, index) => (
          <Button onClick={() => this.removeEvent(index)} type="primary" >
            <DeleteOutlined />
          </Button>
        ),
        width: 75,
      }
    ];

    this.colsWithTimestamp = [
      this.colsWithoutTimestamp[0],
      this.colsWithoutTimestamp[1],
      {
        title: "Timestamp",
        dataIndex: "timestamp",
        key: "timestamp",
        render: (val) => val.format("HH:mm:ss"),
        width: 100
      },
      this.colsWithoutTimestamp[2],
      this.colsWithoutTimestamp[3]
    ]
  }

  addEvent(formValues) {
    const { details, selectedQueen, selectedRule, timestamp, timestampToggle } = formValues;
    const queenVal = this.props.queensList.find(v => v.id === selectedQueen);
    const ruleVal = this.props.leagueRules.find(v => v.id === selectedRule);

    this.rowKey++;

    if(!queenVal || !ruleVal)
      return;

    const newVal = {
      key: this.rowKey,
      queen: queenVal,
      rule: ruleVal,
      timestamp: timestampToggle && timestamp ? timestamp : moment("00:00:00", "HH:mm:ss")
    }

    this.formRef.batch(() => {
      this.formRef.change("details", [
        ...(details || []),
        newVal
      ]);
      this.formRef.resetFieldState("selectedQueen");
      this.formRef.change("selectedQueen", null);
      this.formRef.resetFieldState("selectedRule");
      this.formRef.change("selectedRule", null);
      this.formRef.resetFieldState("timestamp");
      this.formRef.change("timestamp", null);
    })
  }

  removeEvent(recordIndex) {
    this.formRef.batch(() => {
      const formState = this.formRef.getState();
      const { details } = formState.values;

      const modifiedDetails = details.toSpliced(recordIndex, 1);
      
      this.formRef.change("details", modifiedDetails);
      
      this.props.onDirty();
    });
  }

  resetForm(formValues) {
    this.formRef.restart(formValues);
  }

  submitForm() {
    this.formRef.submit();
  }

  render() {
    return (
      <Form
        form={this.formRef}
        initialValues={this.props.defaultValues}
      >
        {({
          values
        }) => (
          <>
            <AntdForm
              labelCol={{
                span: 6
              }}
              wrapperCol={{
                span: 16
              }}
            >
              <Field name="number">
                {({ input, meta }) => (
                  <AntdForm.Item
                    required
                    colon
                    label="Episode Number"
                    validateStatus={meta.touched && meta.error ? "error" : "success"}
                    help={(meta.touched && meta.error) ? meta.error : null}
                  >
                    <Input type="number" {...input} disabled={this.props.isEdit} />
                  </AntdForm.Item>
                )}
              </Field>

              <Field name="name">
                {({ input, meta }) => (
                  <AntdForm.Item
                    required
                    colon
                    label="Episode Name"
                    validateStatus={meta.touched && meta.error ? "error" : "success"}
                    help={(meta.touched && meta.error) ? meta.error : null}
                  >
                    <Input {...input} />
                  </AntdForm.Item>
                )}
              </Field>

              <Field name="airDate">
                {({ input, meta }) => (
                  <AntdForm.Item
                    required
                    colon
                    label="Air Date"
                    validateStatus={meta.touched && meta.error ? "error" : "success"}
                    help={(meta.touched && meta.error) ? meta.error : null}
                  >
                    <DatePicker
                      {...input}
                      onChange={(val) => input.onChange(val.utc(true).startOf("day"))}
                      style={{ width: "100%" }}
                      picker="date"
                    />
                  </AntdForm.Item>
                )}
              </Field>

              <hr />

              <Field name="timestampToggle">
                {({ input, meta }) => (
                  <AntdForm.Item
                    colon
                    label="Use Timestamps"
                    validateStatus={meta.touched && meta.error ? "error" : "success"}
                    help={(meta.touched && meta.error) ? meta.error : null}
                  >
                    <Switch {...input} />
                  </AntdForm.Item>
                )}
              </Field>
            </AntdForm>
            <AntdForm
              layout="vertical"
            >
              <Row gutter={12}>
                <Col span={8}>
                  <Field name="selectedQueen">
                    {({ input, meta }) => (
                      <AntdForm.Item
                        label="Queen"
                        validateStatus={meta.touched && meta.error ? "error" : "success"}
                        help={(meta.touched && meta.error) ? meta.error : null}
                      >
                        <Select
                          showSearch
                          allowClear
                          options={this.props.queensList.map(q => ({ value: q.id, label: q.name }))}
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          {...input}
                        />
                      </AntdForm.Item>
                    )}
                  </Field>
                </Col>
                <Col span={8}>
                  <Field name="selectedRule">
                    {({ input, meta }) => (
                      <AntdForm.Item
                        label="Rule"
                        validateStatus={meta.touched && meta.error ? "error" : "success"}
                        help={(meta.touched && meta.error) ? meta.error : null}
                      >
                        <Select
                          showSearch
                          allowClear
                          options={this.props.leagueRules.map(q => ({
                            value: q.id,
                            label: (
                              <span className={`rule-display ${q.points >= 0 ? "good" : "bad"}`}>
                                <span>{q.name}</span><span>{q.points}</span>
                              </span>
                            ),
                            labelText: q.name
                          }))}
                          filterOption={(input, option) =>
                            (option?.labelText ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          {...input}
                        />
                      </AntdForm.Item>
                    )}
                  </Field>
                </Col>
                <Col span={8}>
                  <Field name="timestamp">
                    {({ input, meta }) => (
                      <AntdForm.Item
                        label="Timestamp"
                        validateStatus={meta.touched && meta.error ? "error" : "success"}
                        help={(meta.touched && meta.error) ? meta.error : null}
                      >
                        <TimePicker
                          {...input}
                          disabled={!values.timestampToggle}
                          showNow={false}
                          hideDisabledOptions
                          disabledTime={() => ({
                            disabledHours: () => Array(22).fill(0).map((_, i) => i + 3)
                          })}
                          style={{ width: "100%" }}
                        />
                      </AntdForm.Item>
                    )}
                  </Field>
                </Col>
                <Col span={24}>
                  <Button onClick={() => this.addEvent(values)} block>Add Event</Button>
                </Col>
                <Col span={24}>
                  <Table
                    dataSource={values.details ?? []}
                    pagination={false}
                    columns={values.timestampToggle ? this.colsWithTimestamp : this.colsWithoutTimestamp}
                    rowKey={row => row.key}
                  />
                </Col>
              </Row>



            </AntdForm>
          </>
        )}
      </Form>
    )
  }
}

EditEpisodeForm.propTypes = {
  isEdit: PropTypes.bool,
  defaultValues: PropTypes.object,
  onSubmit: PropTypes.func,
  onDirty: PropTypes.func,
  queensList: PropTypes.array,
  leagueRules: PropTypes.array,
}

EditEpisodeForm.defaultProps = {
  isEdit: false,
  defaultValues: {},
  onSubmit: () => { },
  onDirty: () => { },
  queensList: [],
  leagueRules: []
}

const mapStateToProps = (state) => {
  const { queensList } = state.Queens;
  const { leagueRules } = state.League;

  return {
    queensList,
    leagueRules
  }
}

export default connect(mapStateToProps, null, null, { forwardRef: true })(EditEpisodeForm);