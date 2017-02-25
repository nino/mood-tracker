/* @flow */
import {
  map,
  flatten,
  flow,
  rangeRight,
  range,
  filter,
  findLast,
} from 'lodash/fp';
import moment from 'moment';
import type { TRange, TAxisTick, TChartPadding } from './types';

/**
 * Gets the height of the chart and the range of allowed values
 * and returns about 5 sensibly placed and labeled axis ticks,
 * while respecting the provided padding values.
 */
export function getYAxisTicks(chartHeight: number, valueRange: TRange, padding: TChartPadding): TAxisTick[] {
  const stepSize = Math.round((valueRange[1] - valueRange[0]) / 5);
  const paddingTop = padding.top || 0;
  const paddingBot = padding.bottom || 0;
  const drawingHeight = chartHeight - paddingBot - paddingTop;
  const pixelStepSize = Math.round(drawingHeight / 5);
  return map((idx: number) => ({
    label: `${valueRange[1] - (idx * stepSize)}`,
    position: paddingTop + (idx * pixelStepSize),
  }))(rangeRight(0, 5));
}

type TMomentAxisTick = { date: moment$Moment, label: string };

type TTicksSelectorFunction = (boundaries: [moment$Moment, moment$Moment]) => TMomentAxisTick[];

const maybeYear: (moment$Moment) => string = date => (date.dayOfYear() === 1 ? ` ${date.year()}` : '');

export function getAllYears(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return (
    map((year: number) => ({
      date: moment({ year }),
      label: `${year}`,
    }))(range(boundaries[0].year() + 1, boundaries[1].year() + 1))
  );
}

export function getHalfYears(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return flow([
    map((year: number) => [{
      label: `Jan ${year}`,
      date: moment({ year }),
    }, {
      label: 'Jul',
      date: moment({ year, month: 6 }),
    }]),
    flatten,
    filter((tick: TMomentAxisTick) => tick.date.isBetween(boundaries[0], boundaries[1])),
  ])(range(boundaries[0].year(), boundaries[1].year() + 1));
}

export function getQuarterYears(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return flow([
    map((year: number) => [{
      label: `Jan ${year}`,
      date: moment({ year }),
    }, {
      label: 'Apr',
      date: moment({ year, month: 3 }),
    }, {
      label: 'Jul',
      date: moment({ year, month: 6 }),
    }, {
      label: 'Oct',
      date: moment({ year, month: 9 }),
    }]),
    flatten,
    filter((tick: TMomentAxisTick) => tick.date.isBetween(boundaries[0], boundaries[1])),
  ])(range(boundaries[0].year(), boundaries[1].year() + 1));
}

export function getAllMonths(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return flow([
    map((monthOffset: number) => moment(boundaries[0]).add(monthOffset + 1, 'months').startOf('month')),
    map((month: moment$Moment) => ({
      label: `${moment.monthsShort()[month.month()]}${maybeYear(month)}`,
      date: moment(month),
    })),
    filter((tick: TMomentAxisTick) => tick.date.isBetween(boundaries[0], boundaries[1])),
  ])(range(0, moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).as('months') + 1));
}

export function getMonthThirds(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return flow([
    map((monthOffset: number) => moment(boundaries[0]).startOf('month').add(monthOffset, 'months')),
    map((month: moment$Moment) => [{
      label: `1 ${moment.monthsShort()[month.month()]}${maybeYear(month)}`,
      date: moment(month),
    }, {
      label: `10 ${moment.monthsShort()[month.month()]}`,
      date: moment(month).add(9, 'days'),
    }, {
      label: `20 ${moment.monthsShort()[month.month()]}`,
      date: moment(month).add(19, 'days'),
    }]),
    flatten,
    filter((tick: TMomentAxisTick) => tick.date.isBetween(boundaries[0], boundaries[1])),
  ])(range(0, moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asMonths() + 1));
}

export function getMonthSixths(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return flow([
    map((monthOffset: number) => moment(boundaries[0]).startOf('month').add(monthOffset, 'months')),
    map((month: moment$Moment) => [{
      label: `1 ${moment.monthsShort()[month.month()]}${maybeYear(month)}`,
      date: moment(month),
    }, {
      label: `5 ${moment.monthsShort()[month.month()]}`,
      date: moment(month).add(4, 'days'),
    }, {
      label: `10 ${moment.monthsShort()[month.month()]}`,
      date: moment(month).add(9, 'days'),
    }, {
      label: `15 ${moment.monthsShort()[month.month()]}`,
      date: moment(month).add(14, 'days'),
    }, {
      label: `20 ${moment.monthsShort()[month.month()]}`,
      date: moment(month).add(19, 'days'),
    }, {
      label: `25 ${moment.monthsShort()[month.month()]}`,
      date: moment(month).add(24, 'days'),
    }]),
    flatten,
    filter((tick: TMomentAxisTick) => tick.date.isBetween(boundaries[0], boundaries[1])),
  ])(range(0, moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asMonths() + 1));
}

export function getAllDays(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return flow([
    map((dayOffset: number) => moment(boundaries[0]).startOf('day').add(dayOffset, 'days')),
    map((day: moment$Moment) => ({
      label: `${day.date()} ${moment.monthsShort()[day.month()]}${maybeYear(day)}`,
      date: moment(day),
    })),
    filter((tick: TMomentAxisTick) => tick.date.isBetween(boundaries[0], boundaries[1])),
  ])(range(0, moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asDays() + 1));
}

export function getHalfDays(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return flow([
    map((offset: number) => moment(boundaries[0]).startOf('day').add(offset * 12, 'hours')),
    map((date: moment$Moment) => ({
      label: date.hour() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : '12:00',
      date: moment(date),
    })),
    filter((tick: TMomentAxisTick) => tick.date.isBetween(boundaries[0], boundaries[1])),
  ])(range(0, (moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asDays() + 1) * 2));
}

export function getDayQuarters(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return flow([
    map((offset: number) => moment(boundaries[0]).startOf('day').add(6 * offset, 'hours')),
    map((date: moment$Moment) => ({
      label: date.hour() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : `${moment(date).format('HH:mm')}`,
      date: moment(date),
    })),
    filter((tick: TMomentAxisTick) => tick.date.isBetween(boundaries[0], boundaries[1])),
  ])(range(0, (moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asDays() + 1) * 4));
}

export function getDayEighths(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return flow([
    map((offset: number) => moment(boundaries[0]).startOf('day').add(3 * offset, 'hours')),
    map((date: moment$Moment) => ({
      label: date.hour() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : `${moment(date).format('HH:mm')}`,
      date: moment(date),
    })),
    filter((tick: TMomentAxisTick) => tick.date.isBetween(boundaries[0], boundaries[1])),
  ])(range(0, (moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asDays() + 1) * 8));
}

export function getAllHours(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return flow([
    map((offset: number) => moment(boundaries[0]).startOf('hour').add(offset, 'hours')),
    map((date: moment$Moment) => ({
      label: date.hour() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : `${moment(date).format('HH:mm')}`,
      date: moment(date),
    }: TMomentAxisTick)),
    filter((tick: TMomentAxisTick) => tick.date.isBetween(boundaries[0], boundaries[1])),
  ])(range(0, (moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).as('hours') + 1)));
}

export function getHalfHours(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return flow([
    map((offset: number) => moment(boundaries[0]).startOf('hour').add(30 * offset, 'minutes')),
    map((date: moment$Moment) => ({
      label: date.hour() === 0 && date.minute() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : `${moment(date).format('HH:mm')}`,
      date: moment(date),
    })),
    filter((tick: TMomentAxisTick) => tick.date.isBetween(boundaries[0], boundaries[1])),
  ])(range(0, (moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asHours() + 1) * 2));
}

export function getQuarterHours(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return flow([
    map((offset: number) => moment(boundaries[0]).startOf('hour').add(15 * offset, 'minutes')),
    map((date: moment$Moment) => ({
      label: date.hour() === 0 && date.minute() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : `${moment(date).format('HH:mm')}`,
      date: moment(date),
    })),
    filter((tick: TMomentAxisTick) => tick.date.isBetween(boundaries[0], boundaries[1])),
  ])(range(0, (moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asHours() + 1) * 4));
}

export function getFiveMinutes(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return flow([
    map((offset: number) => moment(boundaries[0]).startOf('hour').add(5 * offset, 'minutes')),
    map((date: moment$Moment) => ({
      label: date.hour() === 0 && date.minute() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : `${moment(date).format('HH:mm')}`,
      date: moment(date),
    })),
    filter((tick: TMomentAxisTick) => tick.date.isBetween(boundaries[0], boundaries[1])),
  ])(range(0, (moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asHours() + 1) * 12));
}

export function getAllMinutes(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return flow([
    map((offset: number) => moment(boundaries[0]).startOf('minute').add(offset, 'minutes')),
    map((date: moment$Moment) => ({
      label: date.hour() === 0 && date.minute() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : `${moment(date).format('HH:mm')}`,
      date: moment(date),
    })),
    filter((tick: TMomentAxisTick) => tick.date.isBetween(boundaries[0], boundaries[1])),
  ])(range(0, moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asMinutes() + 1));
}

export function getXAxisTicks(chartWidth: number, dateRange: TRange, padding: TChartPadding): TAxisTick[] {
  const dateDiff = dateRange[1] - dateRange[0];
  const paddingLeft = padding.left || 0;
  const paddingRight = padding.right || 0;
  const pixelRange = [paddingLeft, chartWidth - paddingRight];
  const pixelDiff = pixelRange[1] - pixelRange[0];
  const dateToPixel: (date: number) => number = date => paddingLeft + (((date - dateRange[0]) / dateDiff) * pixelDiff);

  const dateTickLevels: { threshold: moment$MomentDuration, selector: TTicksSelectorFunction }[] = [{
    threshold: moment.duration(10, 'years'),
    selector: getAllYears,
  }, {
    threshold: moment.duration(2, 'years'),
    selector: getHalfYears,
  }, {
    threshold: moment.duration(1, 'year'),
    selector: getQuarterYears,
  }, {
    threshold: moment.duration(6, 'months'),
    selector: getAllMonths,
  }, {
    threshold: moment.duration(6, 'weeks'),
    selector: getMonthThirds,
  }, {
    threshold: moment.duration(4, 'weeks'),
    selector: getMonthSixths,
  }, {
    threshold: moment.duration(10, 'days'),
    selector: getMonthSixths,
  }, {
    threshold: moment.duration(5, 'days'),
    selector: getAllDays,
  }, {
    threshold: moment.duration(2, 'days'),
    selector: getHalfDays,
  }, {
    threshold: moment.duration(30, 'hours'),
    selector: getDayQuarters,
  }, {
    threshold: moment.duration(10, 'hours'),
    selector: getDayEighths,
  }, {
    threshold: moment.duration(6, 'hours'),
    selector: getAllHours,
  }, {
    threshold: moment.duration(2, 'hours'),
    selector: getHalfHours,
  }, {
    threshold: moment.duration(70, 'minutes'),
    selector: getQuarterHours,
  }, {
    threshold: moment.duration(30, 'minutes'),
    selector: getFiveMinutes,
  }, {
    threshold: moment.duration(30, 'minutes'),
    selector: getFiveMinutes,
  }, {
    threshold: moment.duration(6, 'minutes'),
    selector: getAllMinutes,
  }];

  const currentLevel = findLast(
    (level: { threshold: moment$MomentDuration, selector: TTicksSelectorFunction }) => (level.threshold.as('milliseconds') >= dateDiff),
    dateTickLevels,
  );
  const momentTicks: TMomentAxisTick[] = currentLevel.selector([moment(dateRange[0]), moment(dateRange[1])]);
  const finalTicks: TAxisTick[] = map((momentTick: TMomentAxisTick) => ({
    label: momentTick.label,
    position: dateToPixel(+moment(momentTick.date)),
  }))(momentTicks);
  return finalTicks;
}

