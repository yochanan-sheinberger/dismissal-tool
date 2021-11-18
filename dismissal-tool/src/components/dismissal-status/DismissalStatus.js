import React from "react";
import * as dayjs from "dayjs";
import {
  Calendar,
  Col,
  Row,
  Typography,
  Button,
} from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import "./dismissalStatus.css";
import "antd/es/calendar/style";


function DismissalStatus({students, setStudentsData, studentsData, setDate, date, COLORS}) {

  function dateCellRender(value) {
    if ((studentsData && students) && value.month() === dayjs(date).month()) {
      const list = Array.from(Object.entries(studentsData[value.date() - 1]));

      return (
        <ul className="events">
          {list.map((item, i) => (
            !getDisabledDates(value) ? <li
              style={{ backgroundColor: COLORS[i]}}
              className={students[item[0]] ? "show" : "hide"}
              key={item[0]}
            >
              {item[1]}
            </li> : ""
          ))}
        </ul>
      );
    }
  }

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

  const headerRender = ({ value, type, onChange, onTypeChange }) => {
    const localeData = value.localeData();
    if (value.month() !== dayjs(date).month()) {
      setStudentsData(null)
      setDate(dayjs(value))
    }
    const nextMonth = () => {
      const newValue = value.clone();
      const currentMonth = value.month();
      newValue.month(currentMonth + 1);
      onChange(newValue);
      setStudentsData(null)
      setDate(dayjs(date).add(1, 'M'))
    };

    const prevMonth = () => {
      const newValue = value.clone();
      const currentMonth = value.month();
      newValue.month(currentMonth - 1);
      onChange(newValue);
      setStudentsData(null)
      setDate(dayjs(date).subtract(1, 'M'))
    };

    return (
      <>
        <div
          className="calendar-header"
        >
          <Row align="middle">
            <Col span={3}>
              <Button
                type="default"
                icon={<LeftOutlined />}
                onClick={prevMonth}
              >
                Prev
              </Button>
            </Col>
            <Col span={18}>
              <Typography.Title style={{color: '#fff', padding: "5px", marginBottom: 0}} level={4}>
                {localeData.months()[value.month()] + " " + value.year()}
              </Typography.Title>
            </Col>
            <Col span={3}>
              <Button type="default" onClick={nextMonth}>
                Next
                <RightOutlined />
              </Button>
            </Col>
          </Row>
        </div>
      </>
    );
  };

  return (
    <>
      <Calendar className="calendar" headerRender={headerRender} disabledDate={getDisabledDates} dateCellRender={dateCellRender} />
    </>
  );
}

export default DismissalStatus;
