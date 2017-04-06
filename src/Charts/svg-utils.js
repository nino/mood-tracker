/* @flow */
import {
  map,
  flatten,
  rangeRight,
  range,
  filter,
  findLast,
} from 'lodash';
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
  const indices = rangeRight(0, 5);
  const selectedValues = map(indices, idx => valueRange[1] - (idx * stepSize));
  const ticks = map(selectedValues, value => ({
    label: `${value}`,
    position: yValueToPixels(value, valueRange, chartHeight, padding),
  }));
  return ticks;
}

type TMomentAxisTick = { date: moment$Moment, label: string };

type TTicksSelectorFunction = (boundaries: [moment$Moment, moment$Moment]) => TMomentAxisTick[];

const maybeYear: (moment$Moment) => string = date => (date.dayOfYear() === 1 ? ` ${date.year()}` : '');

export function getAllYears(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const years = range(boundaries[0].year() + 1, boundaries[1].year() + 1);
  const ticks = map(years, year => ({
    date: moment({ year }),
    label: `${year}`,
  }));
  return ticks;
}

export function getHalfYears(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const years = range(boundaries[0].year(), boundaries[1].year() + 1);
  const ticksGroupedByYear = map(years, year => [
    { label: `Jan ${year}`, date: moment({ year }) },
    { label: 'Jul', date: moment({ year, month: 6 }) },
  ]);
  const ticks = flatten(ticksGroupedByYear);
  const ticksFiltered = filter(ticks, tick => tick.date.isBetween(boundaries[0], boundaries[1]));
  return ticksFiltered;
}

export function getQuarterYears(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const years = range(boundaries[0].year(), boundaries[1].year() + 1);
  const ticksGroupedByYear = map(years, year => [
    { label: `Jan ${year}`, date: moment({ year }) },
    { label: 'Apr', date: moment({ year, month: 3 }) },
    { label: 'Jul', date: moment({ year, month: 6 }) },
    { label: 'Oct', date: moment({ year, month: 9 }) },
  ]);
  const ticks = flatten(ticksGroupedByYear);
  const ticksFiltered = filter(ticks, tick => tick.date.isBetween(boundaries[0], boundaries[1]));
  return ticksFiltered;
}

export function getAllMonths(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const offsets = range(0, moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).as('months') + 1);
  const months = map(offsets, offset => moment(boundaries[0]).add(offset + 1, 'months').startOf('month'));
  const ticks = map(months, month => ({
    label: `${moment.monthsShort()[month.month()]}${maybeYear(month)}`,
    date: moment(month),
  }));
  const ticksFiltered = filter(ticks, tick => tick.date.isBetween(boundaries[0], boundaries[1]));
  return ticksFiltered;
}

export function getMonthThirds(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const offsets = range(0, moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asMonths() + 1);
  const months = map(offsets, monthOffset => moment(boundaries[0]).startOf('month').add(monthOffset, 'months'));
  const ticksGroupedByMonth = map(months, month => [
    { label: `1 ${moment.monthsShort()[month.month()]}${maybeYear(month)}`, date: moment(month) },
    { label: `10 ${moment.monthsShort()[month.month()]}`, date: moment(month).add(9, 'days') },
    { label: `20 ${moment.monthsShort()[month.month()]}`, date: moment(month).add(19, 'days') },
  ]);
  const ticks = flatten(ticksGroupedByMonth);
  const ticksFiltered = filter(ticks, tick => tick.date.isBetween(boundaries[0], boundaries[1]));
  return ticksFiltered;
}

export function getMonthHalfs(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const offsets = range(0, moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asMonths() + 1);
  const months = map(offsets, monthOffset => moment(boundaries[0]).startOf('month').add(monthOffset, 'months'));
  const ticksGroupedByMonth = map(months, month => [
    { label: `1 ${moment.monthsShort()[month.month()]}${maybeYear(month)}`, date: moment(month) },
    { label: `15 ${moment.monthsShort()[month.month()]}`, date: moment(month).add(14, 'days') },
  ]);
  const ticks = flatten(ticksGroupedByMonth);
  const ticksFiltered = filter(ticks, tick => tick.date.isBetween(boundaries[0], boundaries[1]));
  return ticksFiltered;
}

export function getMonthSixths(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const offsets = range(0, moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asMonths() + 1);
  const months = map(offsets, monthOffset => moment(boundaries[0]).startOf('month').add(monthOffset, 'months'));
  const ticksGroupedByMonth = map(months, month => [
    { label: `1 ${moment.monthsShort()[month.month()]}${maybeYear(month)}`, date: moment(month) },
    { label: `5 ${moment.monthsShort()[month.month()]}`, date: moment(month).add(4, 'days') },
    { label: `10 ${moment.monthsShort()[month.month()]}`, date: moment(month).add(9, 'days') },
    { label: `15 ${moment.monthsShort()[month.month()]}`, date: moment(month).add(14, 'days') },
    { label: `20 ${moment.monthsShort()[month.month()]}`, date: moment(month).add(19, 'days') },
    { label: `25 ${moment.monthsShort()[month.month()]}`, date: moment(month).add(24, 'days') },
  ]);
  const ticks = flatten(ticksGroupedByMonth);
  const ticksFiltered = filter(ticks, tick => tick.date.isBetween(boundaries[0], boundaries[1]));
  return ticksFiltered;
}

export function getAllDays(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const offsets = range(0, moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asDays() + 1);
  const days = map(offsets, dayOffset => moment(boundaries[0]).startOf('day').add(dayOffset, 'days'));
  const ticks = map(days, day => ({
    label: `${day.date()} ${moment.monthsShort()[day.month()]}${maybeYear(day)}`,
    date: moment(day),
  }));
  const ticksFiltered = filter(ticks, tick => tick.date.isBetween(boundaries[0], boundaries[1]));
  return ticksFiltered;
}

export function getHalfDays(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const offsets = range(0, (moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asDays() + 1) * 2);
  const moments = map(offsets, offset => moment(boundaries[0]).startOf('day').add(offset * 12, 'hours'));
  const ticks = map(moments, date => ({
    label: date.hour() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : '12:00',
    date: moment(date),
  }));
  const ticksFiltered = filter(ticks, tick => tick.date.isBetween(boundaries[0], boundaries[1]));
  return ticksFiltered;
}

export function getDayQuarters(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const offsets = range(0, (moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asDays() + 1) * 4);
  const moments = map(offsets, offset => moment(boundaries[0]).startOf('day').add(6 * offset, 'hours'));
  const ticks = map(moments, date => ({
    label: date.hour() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : `${moment(date).format('HH:mm')}`,
    date: moment(date),
  }));
  const ticksFiltered = filter(ticks, tick => tick.date.isBetween(boundaries[0], boundaries[1]));
  return ticksFiltered;
}

export function getDayEighths(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const offsets = range(0, (moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asDays() + 1) * 8);
  const moments = map(offsets, offset => moment(boundaries[0]).startOf('day').add(3 * offset, 'hours'));
  const ticks = map(moments, date => ({
    label: date.hour() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : `${moment(date).format('HH:mm')}`,
    date: moment(date),
  }));
  const ticksFiltered = filter(ticks, tick => tick.date.isBetween(boundaries[0], boundaries[1]));
  return ticksFiltered;
}

export function getAllHours(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const offsets = range(0, (moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).as('hours') + 1));
  const moments = map(offsets, offset => moment(boundaries[0]).startOf('hour').add(offset, 'hours'));
  const ticks = map(moments, date => ({
    label: date.hour() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : `${moment(date).format('HH:mm')}`,
    date: moment(date),
  }));
  const ticksFiltered = filter(ticks, tick => tick.date.isBetween(boundaries[0], boundaries[1]));
  return ticksFiltered;
}

export function getHalfHours(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const offsets = range(0, (moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asHours() + 1) * 2);
  const moments = map(offsets, offset => moment(boundaries[0]).startOf('hour').add(30 * offset, 'minutes'));
  const ticks = map(moments, date => ({
    label: date.hour() === 0 && date.minute() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : `${moment(date).format('HH:mm')}`,
    date: moment(date),
  }));
  const ticksFiltered = filter(ticks, tick => tick.date.isBetween(boundaries[0], boundaries[1]));
  return ticksFiltered;
}

export function getQuarterHours(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const offsets = range(0, (moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asHours() + 1) * 4);
  const moments = map(offsets, offset => moment(boundaries[0]).startOf('hour').add(15 * offset, 'minutes'));
  const ticks = map(moments, date => ({
    label: date.hour() === 0 && date.minute() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : `${moment(date).format('HH:mm')}`,
    date: moment(date),
  }));
  const ticksFiltered = filter(ticks, tick => tick.date.isBetween(boundaries[0], boundaries[1]));
  return ticksFiltered;
}

export function getFiveMinutes(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const offsets = range(0, (moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asHours() + 1) * 12);
  const moments = map(offsets, offset => moment(boundaries[0]).startOf('hour').add(5 * offset, 'minutes'));
  const ticks = map(moments, date => ({
    label: date.hour() === 0 && date.minute() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : `${moment(date).format('HH:mm')}`,
    date: moment(date),
  }));
  const ticksFiltered = filter(ticks, tick => tick.date.isBetween(boundaries[0], boundaries[1]));
  return ticksFiltered;
}

export function getAllMinutes(boundaries: [moment$Moment, moment$Moment]): TMomentAxisTick[] {
  const offsets = range(0, moment.duration(+moment(boundaries[1]) - +moment(boundaries[0])).asMinutes() + 1);
  const moments = map(offsets, offset => moment(boundaries[0]).startOf('minute').add(offset, 'minutes'));
  const ticks = map(moments, date => ({
    label: date.hour() === 0 && date.minute() === 0 ? `${date.date()} ${moment.monthsShort()[date.month()]}${maybeYear(date)}` : `${moment(date).format('HH:mm')}`,
    date: moment(date),
  }));
  const ticksFiltered = filter(ticks, tick => tick.date.isBetween(boundaries[0], boundaries[1]));
  return ticksFiltered;
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
  const currentLevel = findLast(dateTickLevels, level => (level.threshold > currentMsPerPx));
  if (currentLevel == null) {
    return [];
  }
  const momentTicks: TMomentAxisTick[] = currentLevel.selector([moment(dateRange[0]), moment(dateRange[1])]);
  const finalTicks: TAxisTick[] = map(momentTicks, momentTick => ({
    label: momentTick.label,
    position: xValueToPixels(+moment(momentTick.date), dateRange, chartWidth, padding),
  }));
  return finalTicks;
}

