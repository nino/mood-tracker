module.exports = [
  {
    name: 'Mood',
    id: 1,
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
    entries: [
    ],
  },
  {
    name: 'Burns depression score',
    id: 2,
    type: 'int',
    minValue: 0,
    maxValue: 100,
    entries: [
    ],
  },
];
