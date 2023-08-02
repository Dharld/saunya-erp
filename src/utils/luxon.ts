import { DateTime } from 'luxon';

const addMonthToDate = (numberOfMonth: number, date: Date) => {
  const dt = DateTime.fromJSDate(date).minus({ month: numberOfMonth });
  return dt.toJSDate();
};

const fromFormatToJSDate = (dateStr: string, format: string) => {
  return DateTime.fromFormat(dateStr, format).toJSDate();
};

const fromJSDateToString = (date: Date, format: string) => {
  return DateTime.fromJSDate(date).toFormat(format);
};

export { addMonthToDate, fromFormatToJSDate, fromJSDateToString };
