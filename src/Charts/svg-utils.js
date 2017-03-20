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

export function yValueToPixels(value: number, valueRange: TRange, chartHeight: number, padding: TChartPadding): number {
  const paddingTop = padding.top || 0;
  const paddingBottom = padding.bottom || 0;
  const pixelDiff = chartHeight - (paddingTop + paddingBottom);
  const valueDiff = valueRange[1] - valueRange[0];
  return paddingTop + (((valueRange[1] - value) / valueDiff) * pixelDiff);
}

export function xValueToPixels(date: number, dateRange: TRange, chartWidth: number, padding: TChartPadding): number {
  const paddingLeft = padding.left || 0;
  const paddingRight = padding.right || 0;
  const pixelDiff = chartWidth - (paddingLeft + paddingRight);
  const dateDiff = dateRange[1] - dateRange[0];
  return paddingLeft + (((date - dateRange[0]) / dateDiff) * pixelDiff);
}

/**
 * Gets the height of the chart and the range of allowed values
 * and returns about 5 sensibly placed and labeled axis ticks,
 * while respecting the provided padding values.
 */
export function getYAxisTicks(chartHeight: number, valueRange: TRange, padding: TChartPadding): TAxisTick[] {
  const stepSize = Math.round((valueRange[1] - valueRange[0]) / 5);
  return flow([
    map((idx: number) => valueRange[1] - (idx * stepSize)),
    map((value: number) => ({
      label: `${value}`,
      position: yValueToPixels(value, valueRange, chartHeight, padding),
    })),
  ])(rangeRight(0, 5));
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

export function getMonthHalfs(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  return flow([
    map((monthOffset: number) => moment(boundaries[0]).startOf('month').add(monthOffset, 'months')),
    map((month: moment$Moment) => [{
      label: `1 ${moment.monthsShort()[month.month()]}${maybeYear(month)}`,
      date: moment(month),
    }, {
      label: `15 ${moment.monthsShort()[month.month()]}`,
      date: moment(month).add(14, 'days'),
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
  const drawingWidth = chartWidth - ((padding.left || 0) + (padding.right || 0));

  /*
   * The threshold is a number with the unit ms/px.
   * We want something like one tick per 80px.
   * We select the last level that has a higher threshold than the current ms/px of the chart.
   */
  const dateTickLevels: { threshold: number, selector: TTicksSelectorFunction }[] = [{
    threshold: moment.duration(2, 'years').as('ms') / 80,
    selector: getAllYears,
  }, {
    threshold: moment.duration(10, 'months').as('ms') / 80,
    selector: getHalfYears,
  }, {
    threshold: moment.duration(6, 'months').as('ms') / 80,
    selector: getQuarterYears,
  }, {
    threshold: moment.duration(2, 'months').as('ms') / 80,
    selector: getAllMonths,
  }, {
    threshold: moment.duration(20, 'days').as('ms') / 80,
    selector: getMonthHalfs,
  }, {
    threshold: moment.duration(10, 'days').as('ms') / 80,
    selector: getMonthThirds,
  }, {
    threshold: moment.duration(5, 'days').as('ms') / 80,
    selector: getMonthSixths,
  }, {
    threshold: moment.duration(2, 'days').as('ms') / 80,
    selector: getAllDays,
  }, {
    threshold: moment.duration(1, 'days').as('ms') / 80,
    selector: getHalfDays,
  }, {
    threshold: moment.duration(12, 'hours').as('ms') / 80,
    selector: getDayQuarters,
  }, {
    threshold: moment.duration(6, 'hours').as('ms') / 80,
    selector: getDayEighths,
  }, {
    threshold: moment.duration(2, 'hours').as('ms') / 80,
    selector: getAllHours,
  }, {
    threshold: moment.duration(45, 'minutes').as('ms') / 80,
    selector: getHalfHours,
  }, {
    threshold: moment.duration(25, 'minutes').as('ms') / 80,
    selector: getQuarterHours,
  }, {
    threshold: moment.duration(12, 'minutes').as('ms') / 80,
    selector: getFiveMinutes,
  }, {
    threshold: moment.duration(2, 'minutes').as('ms') / 80,
    selector: getAllMinutes,
  }];

  const currentMsPerPx = dateDiff / drawingWidth;
  const currentLevel = findLast(
    (level: { threshold: number, selector: TTicksSelectorFunction }) => (
      level.threshold > currentMsPerPx
    ),
  )(dateTickLevels);
  const momentTicks: TMomentAxisTick[] = currentLevel.selector([moment(dateRange[0]), moment(dateRange[1])]);
  const finalTicks: TAxisTick[] = map((momentTick: TMomentAxisTick) => ({
    label: momentTick.label,
    position: xValueToPixels(+moment(momentTick.date), dateRange, chartWidth, padding),
  }))(momentTicks);
  return finalTicks;
}

