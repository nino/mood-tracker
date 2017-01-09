import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;
import OldMetrics from '../test/SampleMetricsWithEntries';

import { MoodWithEntries, BurnsWithEntries } from '../test/SampleMetrics';

import {
  upgradeDataFormat,
  downloadFileAsJSON,
  isValidMetricsArray,
  mergeMetrics,
  uploadAsJSON,
} from './lib';

describe('lib', () => {
  describe('upgradeDataFormat', () => {
    const newMetric = {
      id: 23,
      lastModified: 1481717924971,
      props: {
        name: 'Mood',
        colorGroups: [
          {
            minValue: 1,
            maxValue: 4,
            color: 'this is just to check its working',
          },
        ],
        maxValue: 10,
        minValue: 1,
        type: 'int',
      },
      entries: ['there can be anything in here and it should not be touched'],
    };

    const oldMetric = {
      id: 23,
      name: 'Mood',
      colorGroups: [
        {
          minValue: 1,
          maxValue: 4,
          color: 'this is just to check its working',
        },
      ],
      maxValue: 10,
      minValue: 1,
      type: 'int',
      entries: ['there can be anything in here and it should not be touched'],
    };

    it('converts metrics from the old format to the new format', () => {
      const converted = upgradeDataFormat([oldMetric])[0];
      expect(converted).to.have.property('props')
        .and.to.deep.equal(newMetric.props);
      expect(converted).not.to.have.property('name');
      expect(converted).not.to.have.property('maxValue');
      expect(converted).not.to.have.property('minValue');
      expect(converted).not.to.have.property('colorGroups');
      expect(converted).not.to.have.property('type');
      expect(converted).to.have.property('lastModified').and.to.be.a('number');
    });

    it('leaves metrics alone if they already have the current format', () => {
      expect(upgradeDataFormat([newMetric])).to.eql([newMetric]);
    });

    it('inserts default values', () => {
      const untitledMetric = {
        id: 51,
      };
      const result = upgradeDataFormat([untitledMetric])[0];
      expect(result).to.have.property('props').and.to.have.property('name', 'Untitled metric');
      expect(result).to.have.property('lastModified').and.to.equal(0);
      expect(result.props).to.have.property('maxValue', 10);
      expect(result.props).to.have.property('minValue', 1);
      expect(result.props).to.have.property('type', 'int');
      expect(result.props).to.have.property('colorGroups').and.to.eql([]);
      expect(result).to.have.property('entries').and.to.eql([]);
    });

    it('deletes corrupt metric entries', () => {
      const input = [
        {
          id: 3,
          props: {},
          lastModified: 10,
          entries: [
            { date: '2016-12-21T11:52:24.949Z', value: 4 },
            { date: '2016-12-21T11:52:24.949Z', value: 6 },
          ],
        },
        {
          id: 3,
          props: {},
          lastModified: 10,
          entries: [
            { date: '2016-12-21T11:52:24.949Z', value: 6 },
            { date: 'asrcdi.', value: 'hu' },
          ],
        },
      ];
      const result = mergeMetrics(input);
      expect(result).to.have.length(1);
      expect(result[0]).to.have.property('entries').and.to.have.length(2);
      expect(result[0].entries[0]).to.have.property('date').and.to.equal('2016-12-21T11:52:24.949Z');
      expect(result[0].entries[1]).to.have.property('date').and.to.equal('2016-12-21T11:52:24.949Z');
    });
  });

  describe('isValidMetricsArray()', () => {
    it('returns true for valid metrics', () => {
      const metrics = [
        {
          id: 34,
          lastModified: 1234567890,
          props: {
            name: 'hello',
            maxValue: 10,
            minValue: 1,
            type: 'int',
            colorGroups: [],
          },
          entries: [
          ],
        },
      ];
      expect(isValidMetricsArray(metrics)).to.equal(true);
    });

    it('returns false for invalid metrics', () => {
      const metrics = [
        {
          id: 'hey',
          props: {
            name: 'hello',
            maxValue: 20,
          },
        },
      ];
      expect(isValidMetricsArray(metrics)).to.equal(false);
    });
  });

  describe('mergeMetrics()', () => {
    it('upgrades metrics to the new file format', () => {
      const result = mergeMetrics(OldMetrics);
      expect(result).to.have.length(2);
      expect(isValidMetricsArray(result)).to.equal(true);
      expect(result[0]).to.have.property('props');
      expect(result[0]).to.have.property('lastModified');
      expect(result[0]).to.have.property('entries').and.to.have.length(10);
    });

    it('prefers props of more recent version of metrics with same ID', () => {
      const input = [
        {
          id: 5,
          props: {
            name: 'food',
            maxValue: 10,
            minValue: 1,
            type: 'int',
            colorGroups: [],
          },
          lastModified: 20,
          entries: [],
        },
        {
          id: 5,
          props: {
            name: 'mood',
            maxValue: 12,
            minValue: 1,
            type: 'int',
            colorGroups: [],
          },
          lastModified: 10,
          entries: [],
        },
      ];
      const result = mergeMetrics(input);
      expect(result).to.have.length(1);
      expect(result[0]).to.have.property('props').and.to.have.property('name', 'food');
      expect(result[0]).to.have.property('lastModified').and.to.equal(20);
    });

    it('merges the entries of metrics with the same ID', () => {
      const input = [
        {
          id: 3,
          props: {},
          lastModified: 10,
          entries: [
            { date: '2016-12-21T11:52:24.949Z', value: 4 },
            { date: '2016-12-21T11:52:24.949Z', value: 6 },
          ],
        },
        {
          id: 3,
          props: {},
          lastModified: 10,
          entries: [
            { date: '2016-12-21T11:52:24.949Z', value: 6 },
            { date: '2016-12-21T11:56:24.949Z', value: 9 },
          ],
        },
      ];
      const result = mergeMetrics(input);
      expect(result).to.have.length(1);
      expect(result[0]).to.have.property('entries').and.to.have.length(3);
      expect(result[0].entries[0]).to.have.property('date').and.to.equal('2016-12-21T11:52:24.949Z');
      expect(result[0].entries[1]).to.have.property('date').and.to.equal('2016-12-21T11:52:24.949Z');
      expect(result[0].entries[2]).to.have.property('date').and.to.equal('2016-12-21T11:56:24.949Z');
    });
  });

  describe('downloadFileAsJSON()', () => {
    it('returns an object with {ok: true, data: {...}} if successful', () => {
      const dbxMock = {};
      let filesListFolderCalled = false;
      dbxMock.filesListFolder = (args) => {
        filesListFolderCalled = true;
        return new Promise((resolve, reject) => {
          resolve({
            entries: [
              { name: 'file1' }, // we're looking for this one
              { name: 'file2' },
            ],
          });
        });
      };
      dbxMock.filesDownload = (args) => {
        return new Promise((resolve, reject) => {
          resolve({
            fileBlob: new Blob(
              ['[1, 2, 3]'],
              {type : 'application/json'},
            ),
          });
        });
      };
      const response = downloadFileAsJSON(dbxMock, 'file1');
      return Promise.all([
        expect(response).to.eventually.be.resolved,
        expect(response).to.eventually.eql({ ok: true, data: [1, 2, 3] }),
      ]);
    });

    it('returns {ok: false, error: ...} if file not found', () => {
      const dbxMock = {};
      let filesListFolderCalled = false;
      dbxMock.filesListFolder = (args) => {
        filesListFolderCalled = true;
        return new Promise((resolve, reject) => {
          resolve({
            entries: [
              { name: 'file1' },
              { name: 'file2' },
            ],
          });
        });
      };
      dbxMock.filesDownload = (args) => {
        return new Promise((resolve, reject) => {
          resolve({
            fileBlob: new Blob(
              ['[1, 2, 3]'],
              {type : 'application/json'},
            ),
          });
        });
      };
      const response = downloadFileAsJSON(dbxMock, 'file3');
      return Promise.all([
        expect(response).to.eventually.be.resolved,
        expect(response).to.eventually.eql({ ok: false, error: 'Error: File not found' }),
      ]);
    });

    it('returns an object with {ok: false, error: ...} if download failed', () => {
      const dbxMock = {};
      let filesListFolderCalled = false;
      dbxMock.filesListFolder = (args) => {
        filesListFolderCalled = true;
        return new Promise((resolve, reject) => {
          resolve({
            entries: [
              { name: 'file1' },
              { name: 'file2' },
            ],
          });
        });
      };
      dbxMock.filesDownload = (args) => {
        return new Promise((resolve, reject) => {
          reject();
        });
      };
      const response = downloadFileAsJSON(dbxMock, 'file1');
      return Promise.all([
        expect(response).to.eventually.be.resolved,
        expect(response).to.eventually.eql({ ok: false, error: 'Error: Download error' }),
      ]);
    });
  });

  describe('uploadAsJSON()', () => {
    const dbxMock = {
      filesUpload: jest.fn(),
    };
    const dataMock = [MoodWithEntries, BurnsWithEntries];

    it('returns ok: true on success', () => {
      dbxMock.filesUpload.mockReturnValueOnce(
        new Promise((resolve) => {
          resolve({ server_modified: 2395, id: 'yes' });
        })
      );
      const response = uploadAsJSON(dbxMock, '/path', dataMock);
      return Promise.all([
        expect(response).to.eventually.be.resolved,
        expect(response).to.eventually.eql({ ok: true }),
      ]);
    });

    it('returns ok: false on failure', () => {
      dbxMock.filesUpload.mockReturnValueOnce(
        new Promise((resolve, reject) => {
          reject({ error: 'something went wrong' });
        })
      );
      const response = uploadAsJSON(dbxMock, '/path', dataMock);
      return Promise.all([
        expect(response).to.eventually.be.resolved,
        expect(response).to.eventually.have.property('ok', false),
        expect(response).to.eventually.have.property('error'),
      ]);
    });
  });
});
