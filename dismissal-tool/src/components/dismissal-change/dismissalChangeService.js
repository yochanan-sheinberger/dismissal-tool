import axios from 'axios';

const modeOptions = [
  { label: "Dates", value: "dates" },
  { label: "Recurring Days", value: "recurring" },
  { label: "Date Range", value: "range" },
];
const daysOptions = [
  { label: "Mo", value: 1, name: "monday" },
  { label: "Tu", value: 2, name: "tuesday" },
  { label: "We", value: 3, name: "wednesday" },
  { label: "Th", value: 4, name: "thursday" },
  { label: "Fr", value: 5, name: "friday" },
  { label: "Sa", value: 6, name: "saturday" },
];

const dayModeOptions = [
  { label: "permanently", value: "permanently" },
  { label: "For a limited time", value: "limited" },
];

async function changeDismissal(payload) {
  const {data}  = await axios.post(`${process.env.REACT_APP_API_URL}change-dismissal`, payload);
  return data;
}

export { modeOptions, daysOptions, dayModeOptions, changeDismissal }