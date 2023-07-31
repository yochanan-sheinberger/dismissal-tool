var express = require("express");
var router = express.Router();
const connection = require("../connect");
const dayjs = require("dayjs");
var calendar = require("dayjs/plugin/calendar");
dayjs.extend(calendar);

router.post("/get-dismissal-status", (req, res, next) => {
  let query = `select weeklyDismissal.*, student.firstName, exceptionalDismissal.dismissalMethod, exceptionalDismissal.excDate from student
  left join weeklyDismissal
  on (parentsId = 1 and student.id = weeklyDismissal.studentId)
  left join exceptionalDismissal on student.id = exceptionalDismissal.studentId;`;
  connection.query(query, function (err, results, fields) {
    if (err) {
      console.log(err.message);
    }
    console.log(fields);
    const studentsData = organizeDismissalMethods(results);
    const dataByDay = setMonthDates(req.body.date, studentsData.obj);
    res.json({ dataByDay, ids: studentsData.ids });
  });
});

router.post("/change-dismissal", (req, res, next) => {
  let queries = [];
  if (req.body.selectedDates) {
    for (let date of req.body.selectedDates) {
      for (let student of req.body.student) {
        queries.push(`insert into exceptionalDismissal (studentId, excDate, dismissalMethod) values (${student}, ${JSON.stringify(date)}, ${JSON.stringify(req.body.method)});`);
      }
    }
  } else {
    for (let student of req.body.student) {
      let fields = "";
      for (let day of req.body.selectedDays) {
        fields += day + "=" + JSON.stringify(req.body.method) + ",";
      }
      fields = fields.slice(0, -1);
      queries.push(`update weeklyDismissal set ${fields} where studentId = ${student};`);
    }
  }
  for (let query of queries) {
    connection.query(query, function (err, results, fields) {
      if (err) {
        console.log(err.message);
      }
    });
  }
  res.json("");
});

function setMonthDates(date, studentsData) {
  const startOfMonth = dayjs(date).startOf("month");
  const monthdays = new Array(dayjs(date).endOf("month").date())
    .fill(startOfMonth)
    .map((day, i) => day.add(i, "day"))
    .map((day) => {
      const studentObj = {};
      for (let student in studentsData) {
        if (
          studentsData[student][6] &&
          day.format("DD-MM-YYYY") in studentsData[student][6]
        ) {
          studentObj[student] =
            studentsData[student][6][day.format("DD-MM-YYYY")];
        } else {
          studentObj[student] = studentsData[student][day.day() - 1];
        }
      }
      return studentObj;
    });
  return monthdays;
}

function organizeDismissalMethods(data) {
  const obj = {};
  const ids = {};
  for (row of data) {
    if (!(row.firstName in obj)) {
      ids[row.firstName] = row.studentId;
      obj[row.firstName] = [
        row.monday,
        row.tuesday,
        row.wednesday,
        row.thursday,
        row.friday,
        row.saturday,
        {},
      ];
    }
    if (row.excDate) {
      obj[row.firstName][6][dayjs(row.excDate).format("DD-MM-YYYY")] =
        row.dismissalMethod;
    }
  }
  return { obj, ids };
}

module.exports = router;
