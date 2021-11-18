import React, { useState } from "react";
import * as dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {
  Calendar,
  DatePicker,
  Col,
  Row,
  Typography,
  Button,
  Radio,
  Form,
} from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useForm } from "react-hook-form";
import { modeOptions, daysOptions, dayModeOptions, changeDismissal } from "./dismissalChangeService";

import "./dismissalChange.css";
dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

function DismissalChange({ getStatus, studentsIDs, COLORS_CLASSES }) {
  const [changeMode, setChangeMode] = useState("dates");
  const [selectedDates, setSelectedDates] = useState({});
  const [selectedDays, setSelectedDays] = useState({});
  const [dayMode, setDayMode] = useState("permanently");
  const [range, setRange] = useState([]);
  const [dateError, setDateError] = useState(false);
  const [dayError, setDayError] = useState(false);
  const [rangeError, setRangeError] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    if (validate()) {
      let method = data.dismissalMethod;
      let student = data.students.map((s) => +s);
      if (changeMode === "dates") {
        changeDismissal({
          selectedDates: Object.keys(selectedDates),
          method,
          student,
        }).then(() => getStatus());
      } else if (changeMode === "recurring" && dayMode === "limited") {
        let selectedDates = filterRangeDates();
        changeDismissal({ selectedDates, method, student }).then(() => getStatus());
      } else if (changeMode === "recurring" && dayMode === "permanently") {
        changeDismissal({
          selectedDays: Object.values(selectedDays),
          method,
          student,
        }).then(() => getStatus());
      } else if (changeMode === "range") {
        let selectedDates = filterRangeDates();
        changeDismissal({ selectedDates, method, student }).then(() => getStatus());
      }
    }
  };

  const validate = () => {
    if (changeMode === "dates") {
      if (Object.keys(selectedDates).length === 0) {
        setDateError(true);
        return false;
      }
    } else if (changeMode === "recurring") {
      if (Object.values(selectedDays).length === 0) {
        setDayError(true);
        return false;
      } else if (dayMode === "limited" && range.length === 0) {
        setRangeError(true);
        return false;
      }
    } else if (range.length === 0) {
      setRangeError(true);
      return false;
    }
    return true;
  };

  const filterRangeDates = () => {
    return range.filter((date) => {
      if (changeMode === "recurring") {
        return dayjs(date).day() in selectedDays;
      } else {
        return dayjs(date).day() !== 0;
      }
    });
  };

  const headerRender = ({ value, type, onChange, onTypeChange }) => {
    const localeData = value.localeData();
    const nextMonth = () => {
      const newValue = value.clone();
      const currentMonth = value.month();
      newValue.month(currentMonth + 1);
      onChange(newValue);
    };

    const prevMonth = () => {
      const newValue = value.clone();
      const currentMonth = value.month();
      newValue.month(currentMonth - 1);
      onChange(newValue);
    };

    return (
      <>
        <div
          style={{
            padding: 2,
            textAlign: "center",
          }}
        >
          <Row align="middle">
            <Col span={3}>
              <Button
                type="primary"
                icon={<LeftOutlined />}
                onClick={prevMonth}
                size="small"
              ></Button>
            </Col>
            <Col span={18}>
              <Typography.Title level={5}>
                {localeData.months()[value.month()] + " " + value.year()}
              </Typography.Title>
            </Col>
            <Col span={3}>
              <Button
                type="primary"
                icon={<RightOutlined />}
                onClick={nextMonth}
                size="small"
              ></Button>
            </Col>
          </Row>
        </div>
      </>
    );
  };

  const dateFullCellRender = (value) => {
    return (
      <div
        key={value.format()}
        className={value.format("YYYY-MM-DD") in selectedDates ? "active cell" : "cell"}
        onClick={() => toggleSelect(value)}
      >
        {value.date()}
      </div>
    );
  };

  const getDisabledDates = (value) => {
    if (
      dayjs(value).isBetween(
        dayjs().subtract(1, "day"),
        dayjs().add(1, "M"),
        null,
        "[]"
      ) &&
      value.day() !== 0
    ) {
      return false;
    }
    return true;
  };

  const toggleSelect = (date) => {
    setDateError(false);
    const SD = { ...selectedDates };
    if (SD[date.format("YYYY-MM-DD")]) {
      delete SD[date.format("YYYY-MM-DD")];
    } else {
      SD[date.format("YYYY-MM-DD")] = date.format("YYYY-MM-DD");
    }
    setSelectedDates(SD);
  };

  const toggleSelectDays = (day, name) => {
    setDayError(false);
    const SD = { ...selectedDays };
    if (SD[day]) {
      delete SD[day];
    } else {
      SD[day] = name;
    }
    setSelectedDays(SD);
  };

  const selectRange = (range) => {
    setRangeError(false);
    let num =
      -dayjs(range[0].format("YYYY-MM-DD")).diff(dayjs(range[1].format("YYYY-MM-DD"))) / 86400000;
    const rangDays = new Array(num + 1)
      .fill(dayjs(range[0]))
      .map((day, i) => day.add(i, "day").format("YYYY-MM-DD"));
    setRange(rangDays);
  };

  return (
    <>
      <div style={{ textAlign: "center" }}>
        <Typography.Title level={4} className="change-header">
          Change Dismissal Method
        </Typography.Title>
      </div>
      <div className="change-body">
        <Radio.Group
          className="radio-group"
          options={modeOptions}
          optionType="button"
          buttonStyle="solid"
          size="small"
          value={changeMode}
          onChange={(e) => setChangeMode(e.target.value)}
        />
        <form layout="vertical" onSubmit={handleSubmit(onSubmit)}>
          {changeMode === "dates" && (
            <Form.Item label="Select Dates:" className="form-item">
              <Calendar
                className="day-calendar"
                fullscreen={false}
                dateFullCellRender={dateFullCellRender}
                disabledDate={getDisabledDates}
                headerRender={headerRender}
              />
              {dateError && (
                <Typography.Text
                  style={{ height: "0px", display: "flex" }}
                  type="danger"
                >
                  Select at list one Date
                </Typography.Text>
              )}
            </Form.Item>
          )}
          {changeMode === "recurring" && (
            <>
              <Form.Item label="Select Recurring Days:" className="form-item">
                {daysOptions.map((day) => (
                  <Button
                    onClick={() => toggleSelectDays(day.value, day.name)}
                    type={[day.value] in selectedDays ? "primary" : "default"}
                    size="small"
                    shape="round"
                    className="day-btn"
                  >
                    {day.label}
                  </Button>
                ))}
                {dayError && (
                  <Typography.Text
                    style={{ height: "0px", display: "flex" }}
                    type="danger"
                  >
                    Select at list one Day
                  </Typography.Text>
                )}
              </Form.Item>
              <Form.Item className="form-item">
                <Radio.Group
                  style={{
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "10px",
                  }}
                  options={dayModeOptions}
                  buttonStyle="solid"
                  value={dayMode}
                  onChange={(e) => setDayMode(e.target.value)}
                />
              </Form.Item>
            </>
          )}
          {((changeMode === "recurring" && dayMode === "limited") ||
            changeMode === "range") && (
            <Form.Item label="Select Range" className="form-item">
              <RangePicker disabledDate={getDisabledDates} onChange={selectRange} />
              {rangeError && (
                <Typography.Text
                  style={{ height: "0px", display: "flex" }}
                  type="danger"
                >
                  Select Range
                </Typography.Text>
              )}
            </Form.Item>
          )}
          <Form.Item
            label="Type Dismissal Method"
            labelCol={{ offset: 1 }}
            wrapperCol={{ span: 17, offset: 1 }}
          >
            <input
              className={errors.dismissalMethod ? "input error" : "input"}
              type="text"
              {...register("dismissalMethod", { required: true })}
            />
          </Form.Item>
          <Form.Item
            wrapperCol={{ offset: 1, span: 16 }}
            labelCol={{ offset: 1 }}
            label="Apply For"
            style={{ display: "block" }}
          >
            <div>
              {studentsIDs &&
                Array.from(
                  Object.entries(studentsIDs).map((student, i) => (
                    <>
                      <span className={`checkbox-${COLORS_CLASSES[i]}`}>
                        <input
                          type="checkbox"
                          style={{
                            backgroundColor: COLORS_CLASSES[i],
                            fontSize: "18px",
                          }}
                          name="students"
                          value={student[1]}
                          className="input"
                          {...register("students", {
                            validate: () => !!watch().students.length,
                          })}
                        />
                        <label
                          style={{
                            marginLeft: "3px",
                            color: COLORS_CLASSES[i],
                            fontSize: "16px",
                          }}
                        >
                          {student[0]}
                        </label>
                      </span>
                      <br />
                    </>
                  ))
                )}
              {errors.students && (
                <Typography.Text type="danger">
                  Select at list one student
                </Typography.Text>
              )}
            </div>
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 1, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Apply Changes
            </Button>
          </Form.Item>
        </form>
      </div>
    </>
  );
}

export default DismissalChange;
