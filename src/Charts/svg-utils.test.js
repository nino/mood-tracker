/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import moment from 'moment';
import {
  getYAxisTicks,
  getAllYears,
  getHalfYears,
  getQuarterYears,
  getAllMonths,
  getMonthThirds,
  getMonthSixths,
  getAllDays,
  getHalfDays,
  getDayQuarters,
  getDayEighths,
  getAllHours,
  getHalfHours,
  getQuarterHours,
  getFiveMinutes,
  getAllMinutes,
  getXAxisTicks,
} from './svg-utils';

describe('svg-utils', () => {
  describe('getYAxisTicks()', () => {
    const yTicks = getYAxisTicks(220, [1, 10], { bottom: 20 });

    it('puts the ticks at the correct positions', () => {
      expect(yTicks.map(t => t.position)).to.eql([160, 120, 80, 40, 0]);
    });

    it('labels the ticks correctly', () => {
      expect(yTicks.map(t => t.label)).to.eql(['2', '4', '6', '8', '10']);
    });
  });

  describe('X axis ticks selectors', () => {
    describe('getAllYears()', () => {
      it('returns the 1 January of each year, with the year as the label', () => {
        /* If you're wondering why I'm calling the variables 'boundaries1' and 'result1',
         * instead of 'boundaries' and 'result', that is because, in the long run,
         * one may want to add more test cases.
         * For now, this shall suffice.
         */
        const boundaries1: [moment$Moment, moment$Moment] = [moment('2012-04-23'), moment('2017-02-23')];
        const result1 = getAllYears(boundaries1);
        expect(result1.map(r => r.label)).to.eql(['2013', '2014', '2015', '2016', '2017']);
        expect(+moment(result1[0].date)).to.be.closeTo(+moment('2013-01-01'), 1);
        expect(+moment(result1[1].date)).to.be.closeTo(+moment('2014-01-01'), 1);
        expect(+moment(result1[2].date)).to.be.closeTo(+moment('2015-01-01'), 1);
        expect(+moment(result1[3].date)).to.be.closeTo(+moment('2016-01-01'), 1);
        expect(+moment(result1[4].date)).to.be.closeTo(+moment('2017-01-01'), 1);
      });
    });

    describe('getHalfYears()', () => {
      it('returns 1 January and 1 July of each year, with Jan <Year> and Jul as the labels', () => {
        const boundaries1 = [moment('2014-01-23'), moment('2017-04-01')];
        const result1 = getHalfYears(boundaries1);
        expect(result1.map(r => r.label)).to.eql(['Jul', 'Jan 2015', 'Jul', 'Jan 2016', 'Jul', 'Jan 2017']);
        expect(+moment(result1[0].date)).to.be.closeTo(+moment('2014-07-01'), 1);
        expect(+moment(result1[1].date)).to.be.closeTo(+moment('2015-01-01'), 1);
        expect(+moment(result1[2].date)).to.be.closeTo(+moment('2015-07-01'), 1);
        expect(+moment(result1[3].date)).to.be.closeTo(+moment('2016-01-01'), 1);
        expect(+moment(result1[4].date)).to.be.closeTo(+moment('2016-07-01'), 1);
        expect(+moment(result1[5].date)).to.be.closeTo(+moment('2017-01-01'), 1);
      });
    });

    describe('getQuarterYears()', () => {
      it('returns 1 Jan, 1 Apr, 1 Jul, 1 Oct for each year, with Jan <Year> and <MMM> as labels', () => {
        const boundaries1 = [moment('2014-01-23'), moment('2016-04-01')];
        const result1 = getQuarterYears(boundaries1);
        expect(result1.map(r => r.label)).to.eql(['Apr', 'Jul', 'Oct', 'Jan 2015', 'Apr', 'Jul', 'Oct', 'Jan 2016']);
        expect(+moment(result1[0].date)).to.be.closeTo(+moment('2014-04-01'), 1);
        expect(+moment(result1[1].date)).to.be.closeTo(+moment('2014-07-01'), 1);
        expect(+moment(result1[2].date)).to.be.closeTo(+moment('2014-10-01'), 1);
        expect(+moment(result1[3].date)).to.be.closeTo(+moment('2015-01-01'), 1);
        expect(+moment(result1[4].date)).to.be.closeTo(+moment('2015-04-01'), 1);
        expect(+moment(result1[5].date)).to.be.closeTo(+moment('2015-07-01'), 1);
        expect(+moment(result1[6].date)).to.be.closeTo(+moment('2015-10-01'), 1);
        expect(+moment(result1[7].date)).to.be.closeTo(+moment('2016-01-01'), 1);
      });
    });

    describe('getAllMonths()', () => {
      it('returns the first of each month with <MMM> or Jan <yyyy> as label', () => {
        const boundaries1 = [moment('2014-07-23'), moment('2015-04-01')];
        const result1 = getAllMonths(boundaries1);
        expect(result1.map(r => r.label)).to.eql(['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan 2015', 'Feb', 'Mar']);
        expect(+moment(result1[0].date)).to.be.closeTo(+moment('2014-08-01'), 1);
        expect(+moment(result1[1].date)).to.be.closeTo(+moment('2014-09-01'), 1);
        expect(+moment(result1[2].date)).to.be.closeTo(+moment('2014-10-01'), 1);
        expect(+moment(result1[3].date)).to.be.closeTo(+moment('2014-11-01'), 1);
        expect(+moment(result1[4].date)).to.be.closeTo(+moment('2014-12-01'), 1);
        expect(+moment(result1[5].date)).to.be.closeTo(+moment('2015-01-01'), 1);
        expect(+moment(result1[6].date)).to.be.closeTo(+moment('2015-02-01'), 1);
        expect(+moment(result1[7].date)).to.be.closeTo(+moment('2015-03-01'), 1);
      });
    });

    describe('getMonthThirds()', () => {
      it('returns the first, 10th, and 20th of each month with <n> <MMM> or 1 Jan <yyyy> as label', () => {
        const boundaries1 = [moment('2014-08-03'), moment('2015-02-02')];
        const result1 = getMonthThirds(boundaries1);
        expect(result1.map(r => r.label)).to.eql([
          '10 Aug',
          '20 Aug',
          '1 Sep',
          '10 Sep',
          '20 Sep',
          '1 Oct',
          '10 Oct',
          '20 Oct',
          '1 Nov',
          '10 Nov',
          '20 Nov',
          '1 Dec',
          '10 Dec',
          '20 Dec',
          '1 Jan 2015',
          '10 Jan',
          '20 Jan',
          '1 Feb',
        ]);
        expect(+moment(result1[0].date)).to.be.closeTo(+moment('2014-08-10'), 1);
        expect(+moment(result1[1].date)).to.be.closeTo(+moment('2014-08-20'), 1);
        expect(+moment(result1[2].date)).to.be.closeTo(+moment('2014-09-01'), 1);
        expect(+moment(result1[3].date)).to.be.closeTo(+moment('2014-09-10'), 1);
        expect(+moment(result1[4].date)).to.be.closeTo(+moment('2014-09-20'), 1);
        expect(+moment(result1[5].date)).to.be.closeTo(+moment('2014-10-01'), 1);
        expect(+moment(result1[6].date)).to.be.closeTo(+moment('2014-10-10'), 1);
        expect(+moment(result1[7].date)).to.be.closeTo(+moment('2014-10-20'), 1);
        expect(+moment(result1[8].date)).to.be.closeTo(+moment('2014-11-01'), 1);
        expect(+moment(result1[9].date)).to.be.closeTo(+moment('2014-11-10'), 1);
        expect(+moment(result1[10].date)).to.be.closeTo(+moment('2014-11-20'), 1);
        expect(+moment(result1[11].date)).to.be.closeTo(+moment('2014-12-01'), 1);
        expect(+moment(result1[12].date)).to.be.closeTo(+moment('2014-12-10'), 1);
        expect(+moment(result1[13].date)).to.be.closeTo(+moment('2014-12-20'), 1);
        expect(+moment(result1[14].date)).to.be.closeTo(+moment('2015-01-01'), 1);
        expect(+moment(result1[15].date)).to.be.closeTo(+moment('2015-01-10'), 1);
        expect(+moment(result1[16].date)).to.be.closeTo(+moment('2015-01-20'), 1);
        expect(+moment(result1[17].date)).to.be.closeTo(+moment('2015-02-01'), 1);
      });
    });

    describe('getMonthSixths()', () => {
      it('returns the 1st, 5th, 10th, 15th, 20th, and 25th of each month with <n> <MMM> or 1 Jan <yyyy> as label', () => {
        const boundaries1 = [moment('2014-11-03'), moment('2015-01-12')];
        const result1 = getMonthSixths(boundaries1);
        expect(result1.map(r => r.label)).to.eql([
          '5 Nov',
          '10 Nov',
          '15 Nov',
          '20 Nov',
          '25 Nov',
          '1 Dec',
          '5 Dec',
          '10 Dec',
          '15 Dec',
          '20 Dec',
          '25 Dec',
          '1 Jan 2015',
          '5 Jan',
          '10 Jan',
        ]);
        expect(+moment(result1[0].date)).to.be.closeTo(+moment('2014-11-05'), 1);
        expect(+moment(result1[1].date)).to.be.closeTo(+moment('2014-11-10'), 1);
        expect(+moment(result1[2].date)).to.be.closeTo(+moment('2014-11-15'), 1);
        expect(+moment(result1[3].date)).to.be.closeTo(+moment('2014-11-20'), 1);
        expect(+moment(result1[4].date)).to.be.closeTo(+moment('2014-11-25'), 1);
        expect(+moment(result1[5].date)).to.be.closeTo(+moment('2014-12-01'), 1);
        expect(+moment(result1[6].date)).to.be.closeTo(+moment('2014-12-05'), 1);
        expect(+moment(result1[7].date)).to.be.closeTo(+moment('2014-12-10'), 1);
        expect(+moment(result1[8].date)).to.be.closeTo(+moment('2014-12-15'), 1);
        expect(+moment(result1[9].date)).to.be.closeTo(+moment('2014-12-20'), 1);
        expect(+moment(result1[10].date)).to.be.closeTo(+moment('2014-12-25'), 1);
        expect(+moment(result1[11].date)).to.be.closeTo(+moment('2015-01-01'), 1);
        expect(+moment(result1[12].date)).to.be.closeTo(+moment('2015-01-05'), 1);
        expect(+moment(result1[13].date)).to.be.closeTo(+moment('2015-01-10'), 1);
      });
    });

    describe('getAllDays()', () => {
      it('returns all days with <n> <MMM> or 1 Jan <yyyy> as the label', () => {
        const boundaries1 = [moment('2014-12-30T02:23'), moment('2015-01-02T01:44')];
        const result1 = getAllDays(boundaries1);
        expect(result1.map(r => r.label)).to.eql([
          '31 Dec',
          '1 Jan 2015',
          '2 Jan',
        ]);
        expect(+moment(result1[0].date)).to.be.closeTo(+moment('2014-12-31'), 1);
        expect(+moment(result1[1].date)).to.be.closeTo(+moment('2015-01-01'), 1);
        expect(+moment(result1[2].date)).to.be.closeTo(+moment('2015-01-02'), 1);
      });
    });

    describe('getHalfDays()', () => {
      it('returns 00:00 and 12:00 of all days with <d> <MMM>, 1 Jan <yyyy>, or 12:00 as labels', () => {
        const boundaries1 = [moment('2014-12-30T02:23'), moment('2015-01-02T01:44')];
        const result1 = getHalfDays(boundaries1);
        expect(result1.map(r => r.label)).to.eql([
          '12:00',
          '31 Dec',
          '12:00',
          '1 Jan 2015',
          '12:00',
          '2 Jan',
        ]);
        expect(+moment(result1[0].date)).to.be.closeTo(+moment('2014-12-30T12:00'), 1);
        expect(+moment(result1[1].date)).to.be.closeTo(+moment('2014-12-31T00:00'), 1);
        expect(+moment(result1[2].date)).to.be.closeTo(+moment('2014-12-31T12:00'), 1);
        expect(+moment(result1[3].date)).to.be.closeTo(+moment('2015-01-01T00:00'), 1);
        expect(+moment(result1[4].date)).to.be.closeTo(+moment('2015-01-01T12:00'), 1);
        expect(+moment(result1[5].date)).to.be.closeTo(+moment('2015-01-02T00:00'), 1);
      });
    });

    describe('getDayQuarters()', () => {
      it('returns 00:00, 06:00, 12:00, 18:00 for each day with <hh:mm> or <n> <MMM> or 1 Jan <yyyy> as labels', () => {
        const boundaries1 = [moment('2014-12-30T13:23'), moment('2015-01-01T01:53')];
        const result1 = getDayQuarters(boundaries1);
        expect(result1.map(r => r.label), JSON.stringify(result1.map(r => r.label))).to.eql([
          '18:00',
          '31 Dec',
          '06:00',
          '12:00',
          '18:00',
          '1 Jan 2015',
        ]);
        expect(+moment(result1[0].date)).to.be.closeTo(+moment('2014-12-30T18:00'), 1);
        expect(+moment(result1[1].date)).to.be.closeTo(+moment('2014-12-31T00:00'), 1);
        expect(+moment(result1[2].date)).to.be.closeTo(+moment('2014-12-31T06:00'), 1);
        expect(+moment(result1[3].date)).to.be.closeTo(+moment('2014-12-31T12:00'), 1);
        expect(+moment(result1[4].date)).to.be.closeTo(+moment('2014-12-31T18:00'), 1);
        expect(+moment(result1[5].date)).to.be.closeTo(+moment('2015-01-01T00:00'), 1);
      });
    });

    describe('getDayEighths()', () => {
      it('returns 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00 for each day with <hh:mm> or <n> <MMM> or 1 Jan <yyyy> as labels', () => {
        const boundaries1 = [moment('2014-12-30T13:23'), moment('2015-01-01T01:53')];
        const result1 = getDayEighths(boundaries1);
        expect(result1.map(r => r.label), JSON.stringify(result1.map(r => r.label))).to.eql([
          '15:00',
          '18:00',
          '21:00',
          '31 Dec',
          '03:00',
          '06:00',
          '09:00',
          '12:00',
          '15:00',
          '18:00',
          '21:00',
          '1 Jan 2015',
        ]);
        expect(+moment(result1[0].date)).to.be.closeTo(+moment('2014-12-30T15:00'), 1);
        expect(+moment(result1[1].date)).to.be.closeTo(+moment('2014-12-30T18:00'), 1);
        expect(+moment(result1[2].date)).to.be.closeTo(+moment('2014-12-30T21:00'), 1);
        expect(+moment(result1[3].date)).to.be.closeTo(+moment('2014-12-31T00:00'), 1);
        expect(+moment(result1[4].date)).to.be.closeTo(+moment('2014-12-31T03:00'), 1);
        expect(+moment(result1[5].date)).to.be.closeTo(+moment('2014-12-31T06:00'), 1);
        expect(+moment(result1[6].date)).to.be.closeTo(+moment('2014-12-31T09:00'), 1);
        expect(+moment(result1[7].date)).to.be.closeTo(+moment('2014-12-31T12:00'), 1);
        expect(+moment(result1[8].date)).to.be.closeTo(+moment('2014-12-31T15:00'), 1);
        expect(+moment(result1[9].date)).to.be.closeTo(+moment('2014-12-31T18:00'), 1);
        expect(+moment(result1[10].date)).to.be.closeTo(+moment('2014-12-31T21:00'), 1);
        expect(+moment(result1[11].date)).to.be.closeTo(+moment('2015-01-01T00:00'), 1);
      });
    });

    describe('getAllHours()', () => {
      it('returns the beginning of each hour with <HH:mm> or 1 Jan <yyyy> or <d> <MMM> as labels', () => {
        const boundaries1: [moment$Moment, moment$Moment] = [moment('2013-12-31T22:32'), moment('2014-01-01T02:00')];
        const result1 = getAllHours(boundaries1);
        expect(result1.map(r => r.label)).to.eql(['23:00', '1 Jan 2014', '01:00']);
        expect(+moment(result1[0].date)).to.be.closeTo(+moment('2013-12-31T23:00'), 1);
        expect(+moment(result1[1].date)).to.be.closeTo(+moment('2014-01-01T00:00'), 1);
        expect(+moment(result1[2].date)).to.be.closeTo(+moment('2014-01-01T01:00'), 1);

        // See, here's one of the promised second test cases:
        const boundaries2: [moment$Moment, moment$Moment] = [moment('2005-06-30T22:45'), moment('2005-07-01T01:14')];
        const result2 = getAllHours(boundaries2);
        expect(result2.map(r => r.label)).to.eql(['23:00', '1 Jul', '01:00']);
      });
    });

    describe('getHalfHours()', () => {
      it('returns the beginning of ever half-hour with <HH:mm> or 1 Jan <yyyy> or <d> <MMM> as labels', () => {
        const boundaries1: [moment$Moment, moment$Moment] = [moment('2011-12-31T23:12'), moment('2012-01-01T01:45')];
        const result1 = getHalfHours(boundaries1);
        expect(result1.map(r => r.label)).to.eql(['23:30', '1 Jan 2012', '00:30', '01:00', '01:30']);
        expect(+moment(result1[0].date)).to.be.closeTo(+moment('2011-12-31T23:30'), 1);
        expect(+moment(result1[1].date)).to.be.closeTo(+moment('2012-01-01T00:00'), 1);
        expect(+moment(result1[2].date)).to.be.closeTo(+moment('2012-01-01T00:30'), 1);
        expect(+moment(result1[3].date)).to.be.closeTo(+moment('2012-01-01T01:00'), 1);
        expect(+moment(result1[4].date)).to.be.closeTo(+moment('2012-01-01T01:30'), 1);
      });
    });

    describe('getQuarterHours()', () => {
      it('returns the beginning of every quarter-hour with <HH:mm> or 1 Jan <yyyy> or <d> <MMM> as labels', () => {
        const boundaries1: [moment$Moment, moment$Moment] = [moment('2042-04-15T15:21'), moment('2042-04-15T16:18')];
        const result1 = getQuarterHours(boundaries1);
        expect(result1.map(r => r.label)).to.eql(['15:30', '15:45', '16:00', '16:15']);
        expect(+moment(result1[0].date)).to.be.closeTo(+moment('2042-04-15T15:30'), 1);
        expect(+moment(result1[1].date)).to.be.closeTo(+moment('2042-04-15T15:45'), 1);
        expect(+moment(result1[2].date)).to.be.closeTo(+moment('2042-04-15T16:00'), 1);
        expect(+moment(result1[3].date)).to.be.closeTo(+moment('2042-04-15T16:15'), 1);
      });
    });

    describe('getFiveMinutes()', () => {
      it('returns the beginning of every fifth minute with <HH:mm> or 1 Jan <yyyy> or <d> <MMM> as labels', () => {
        const boundaries1: [moment$Moment, moment$Moment] = [moment('2042-04-15T15:21'), moment('2042-04-15T15:38')];
        const result1 = getFiveMinutes(boundaries1);
        expect(result1.map(r => r.label)).to.eql(['15:25', '15:30', '15:35']);
        expect(+moment(result1[0].date)).to.be.closeTo(+moment('2042-04-15T15:25'), 1);
        expect(+moment(result1[1].date)).to.be.closeTo(+moment('2042-04-15T15:30'), 1);
        expect(+moment(result1[2].date)).to.be.closeTo(+moment('2042-04-15T15:35'), 1);
      });
    });

    describe('getAllMinutes()', () => {
      it('returns the beginning of every minute with <HH:mm> or 1 Jan <yyyy> or <d> <MMM> as labels', () => {
        const boundaries1: [moment$Moment, moment$Moment] = [moment('2142-12-31T23:58:01'), moment('2143-01-01T00:02:02')];
        const result1 = getAllMinutes(boundaries1);
        expect(result1.map(r => r.label)).to.eql(['23:59', '1 Jan 2143', '00:01', '00:02']);
        expect(+moment(result1[0].date)).to.be.closeTo(+moment('2142-12-31T23:59'), 1);
        expect(+moment(result1[1].date)).to.be.closeTo(+moment('2143-01-01T00:00'), 1);
        expect(+moment(result1[2].date)).to.be.closeTo(+moment('2143-01-01T00:01'), 1);
        expect(+moment(result1[3].date)).to.be.closeTo(+moment('2143-01-01T00:02'), 1);
      });
    });
  });

  describe('getXAxisTicks()', () => {
    const boundaries = [+moment('2016-08-23T01:12:00'), +moment('2016-08-23T14:23:00')];
    const momentBoundaries = [moment(boundaries[0]), moment(boundaries[1])];
    const xTicks = getXAxisTicks(400, boundaries, { bottom: 20 });

    it('returns quarter days and all ticks are between 0 and 400 pixels', () => {
      expect(xTicks.map(t => t.label)).to.eql(getDayQuarters(momentBoundaries).map(t => t.label));
      xTicks.forEach((t) => {
        expect(t.position).to.be.within(0, 400);
      });
    });
  });
});

