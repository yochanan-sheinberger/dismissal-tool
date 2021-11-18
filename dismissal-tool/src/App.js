import React, { useEffect, useState } from "react";
import * as dayjs from "dayjs";
import axios from "axios";
import "./App.css";
import DismissalStatus from "./components/dismissal-status/DismissalStatus";
import DismissalChange from "./components/dismissal-change/DismissalChange";
import { Layout, Row, Col, Checkbox } from "antd";
import "antd/dist/antd.css";
const {Content } = Layout;
const COLORS_CLASSES = ["red", "green", "blue", "yellow"];
const COLORS = ["#ffb6b6", "#baffba", "#b8d4ff", "yellow"];

async function getDismissalStatus(date) {
  const { data } = await axios.post(
    `${process.env.REACT_APP_API_URL}get-dismissal-status`,
    { date }
  );
  return data;
}

function App() {
  const [students, setStudents] = useState();
  const [studentsIDs, setStudentsIDs] = useState();
  const [date, setDate] = useState(dayjs().startOf("month"));
  const [studentsData, setStudentsData] = useState();

  useEffect(() => {
    getStatus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const getStatus = () => {
    getDismissalStatus(date).then((data) => {
      setStudentsData(data.dataByDay);
      if (!students) {
        const obj = {};
        for (const student in data.ids) {
          obj[student] = false;
        }
        setStudents(obj);
        setStudentsIDs(data.ids);
      }
    });
  }

  const toggleStudents = (e) => {
    setStudents((state) => ({
      ...state,
      [e.target.value]: !state[e.target.value],
    }));
  };

  return (
    <Layout>
      <Content style={{ backgroundColor: "#fff" }}>
        <Row>
          <Col span={20} offset={3}>
            <div style={{ height: "40px" }}>
              {students &&
                Array.from(
                  Object.keys(students).map((student, i) => (
                    <span className={`checkbox-${COLORS_CLASSES[i]}`}>
                      <Checkbox
                        style={{ color: COLORS_CLASSES[i], fontSize: "18px" }}
                        value={student}
                        onChange={toggleStudents}
                      >
                        {student}
                      </Checkbox>
                    </span>
                  ))
                )}
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={13} offset={3}>
            <Row>
              <DismissalStatus
                students={students}
                studentsData={studentsData}
                setStudentsData={setStudentsData}
                setDate={setDate}
                date={date}
                COLORS={COLORS}
              />
            </Row>
          </Col>
          <Col style={{ marginLeft: "20px" }} span={5}>
            <DismissalChange
              COLORS_CLASSES={COLORS_CLASSES}
              students={students}
              studentsIDs={studentsIDs}
              toggleStudents={toggleStudents}
              getStatus={getStatus}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default App;
