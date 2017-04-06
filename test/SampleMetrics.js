// @flow
import type { TMetric } from '../src/types';

export const MoodWithEntries: TMetric = {
  id: 1,
  lastModified: 1481462412358,
  props: {
    name: 'Mood',
    type: 'int',
    minValue: 1,
    maxValue: 10,
    colorGroups: [
      {
        minValue: 1,
        maxValue: 3,
        color: 'red',
      },
      {
        minValue: 4,
        maxValue: 6,
        color: 'yellow',
      },
      {
        minValue: 7,
        maxValue: 9,
        color: 'green',
      },
      {
        minValue: 10,
        maxValue: 10,
        color: 'blue',
      },
    ],
  },
  entries: [
    {
      date: '2016-10-22T08:47:04.917Z',
      value: 8,
    },
    {
      date: '2016-10-22T08:51:08.779Z',
      value: 8,
    },
    {
      date: '2016-10-22T08:57:43.786Z',
      value: 9,
    },
    {
      date: '2016-10-22T09:02:48.067Z',
      value: 8,
    },
    {
      date: '2016-10-22T09:26:09.380Z',
      value: 6,
    },
    {
      date: '2016-10-22T11:11:13.676Z',
      value: 7,
    },
    {
      date: '2016-10-22T11:41:02.436Z',
      value: 8,
    },
    {
      date: '2016-10-22T12:27:25.356Z',
      value: 9,
    },
    {
      date: '2016-10-22T12:33:14.318Z',
      value: 6,
    },
    {
      date: '2016-10-22T14:51:57.521Z',
      value: 9,
    },
  ],
};

export const MoodWithoutEntries: TMetric = {
  id: 1,
  props: {
    name: 'Mood',
    type: 'int',
    minValue: 1,
    maxValue: 10,
    colorGroups: [
      {
        minValue: 1,
        maxValue: 3,
        color: 'red',
      },
      {
        minValue: 4,
        maxValue: 6,
        color: 'yellow',
      },
      {
        minValue: 7,
        maxValue: 9,
        color: 'green',
      },
      {
        minValue: 10,
        maxValue: 10,
        color: 'blue',
      },
    ],
  },
  entries: [],
  lastModified: 0,
};

export const BurnsWithEntries: TMetric = {
  id: 2,
  lastModified: 1325809,
  props: {
    name: 'Burns depression score',
    type: 'int',
    minValue: 0,
    maxValue: 100,
    colorGroups: [],
  },
  entries: [
    {
      date: '2016-10-17T14:46:40.919Z',
      value: 40,
    },
  ],
};

export const BurnsWithoutEntries: TMetric = {
  id: 2,
  lastModified: 135987,
  props: {
    name: 'Burns depression score',
    type: 'int',
    minValue: 0,
    maxValue: 100,
    colorGroups: [],
  },
  entries: [],
};
