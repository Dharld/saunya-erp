import { DateTime } from 'luxon';

const addMonthToDate = (numberOfMonth: number, date: Date) => {
  const dt = DateTime.fromJSDate(date).minus({ month: numberOfMonth });
  return dt.toJSDate();
};

export { addMonthToDate };
