import { DateTime } from 'luxon';

const odooDateFormat = 'yyyy-MM-dd';

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

const fromFormatToOdoo = (dateStr: string) => {
  const date = fromFormatToJSDate(dateStr, 'dd-MM-yyyy');
  return date.toISOString().slice(0, 10);
};

const fromOdooToFormat = (odooDate: string, format: string) => {
  const date = fromFormatToJSDate(odooDate, 'yyyy-MM-dd');
  return fromJSDateToString(date, format);
};

export {
  addMonthToDate,
  fromFormatToJSDate,
  fromJSDateToString,
  fromFormatToOdoo,
  fromOdooToFormat,
};
