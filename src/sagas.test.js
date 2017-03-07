/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
/* global localStorage window */
import { expect } from 'chai';
import {
  syncData,
  executeSyncData,
  restoreCache,
  checkLogin,
  executeCancelModal,
  executeConfirmModal,
  executeLogout,
  updateMetric,
} from './sagas';
import {
  STATE_WITH_SOME_METRICS,
} from '../test/SampleApplicationStates';
import {
  MoodWithEntries,
  BurnsWithoutEntries,
  BurnsWithEntries,
} from '../test/SampleMetrics';
import { DATA_FILE_PATH, DEFAULT_METRIC_PROPS } from './constants';
import { isValidMetricsArray } from './lib';
import type {
  TMetric,
  TEditedMetricProps,
  TAuthenticationState,
  TOldMetric,
  TModal,
 } from './types';
import { requestUpdateMetric, deleteMetric, beginSyncData } from './actions';
import { getMetricsItems, getAuthentication } from './selectors';

const authAuthenticated: TAuthenticationState = {
  isAuthenticated: true,
  isAuthenticating: false,
  accessToken: 'yup',
};

describe('check login saga', () => {
  it('uses the accessToken from localStorage to authenticate', () => {
    localStorage.setItem('accessToken', 'abc');
    const generator = checkLogin();
    const next = generator.next();
    expect(next).to.have.deep.property('value.PUT.action.type', 'SUCCESS_CHECK_LOGIN');
    expect(next).to.have.deep.property('value.PUT.action.accessToken', 'abc');
    expect(next).to.have.deep.property('value.PUT.action.lastAuthenticated').and.to.be.a('number');
    expect(generator.next()).to.have.property('done', true);
  });

  it('uses the accessToken from location hash to authenticate', () => {
    localStorage.removeItem('accessToken');
    window.location.hash = '#access_token=abc2';
    const generator = checkLogin();
    const next = generator.next();
    expect(next).to.have.deep.property('value.PUT.action.type', 'SUCCESS_CHECK_LOGIN');
    expect(next).to.have.deep.property('value.PUT.action.accessToken', 'abc2');
    expect(next).to.have.deep.property('value.PUT.action.lastAuthenticated').and.to.be.a('number');
    expect(generator.next()).to.have.property('done', true);
  });

  it('prefers location hash over local accessToken', () => {
    localStorage.setItem('accessToken', 'abcLocal');
    window.location.hash = '#access_token=abcHash';
    const generator = checkLogin();
    const next = generator.next();
    expect(next).to.have.deep.property('value.PUT.action.type', 'SUCCESS_CHECK_LOGIN');
    expect(next).to.have.deep.property('value.PUT.action.accessToken', 'abcHash');
    expect(next).to.have.deep.property('value.PUT.action.lastAuthenticated').and.to.be.a('number');
    expect(generator.next()).to.have.property('done', true);
  });

  it('fails if no token is found in localStorage or location hash', () => {
    localStorage.removeItem('accessToken');
    window.location.hash = null;
    const generator = checkLogin();
    const next = generator.next();
    expect(next.value).to.have.deep.property('PUT.action.type', 'ERROR_CHECK_LOGIN');
    expect(generator.next()).to.have.property('done', true);
  });
});

describe('sync data saga', () => {
  it('does nothing if not authenticated', () => {
    const generator = syncData();
    let next = generator.next();
    const authenticationMock = { isAuthenticated: false };
    next = generator.next(authenticationMock);
    expect(next).to.have.deep.property('value.PUT.action.type', 'ERROR_SYNC_DATA');
    expect(generator.next()).to.have.property('done', true);
  });

  it('uploads new entries', () => {
    const generator = syncData();
    let next = generator.next();

    // Fetch authentication state from store
    expect(next).to.have.deep.property('value.SELECT.selector', getAuthentication);
    const authMock: TAuthenticationState = {
      isAuthenticated: true,
      isAuthenticating: false,
      accessToken: 'abc',
    };
    next = generator.next(authMock);

    // We're authenticated, so let's PUT the restore cache action
    expect(next, 'must PUT REQUEST_RESTORE_CACHE').to.have.deep.property('value.PUT.action.type', 'REQUEST_RESTORE_CACHE');
    next = generator.next();

    // Fetch metrics items from store
    expect(next, 'must SELECT metrics items').to.have.deep.property('value.SELECT.selector', getMetricsItems);
    if (STATE_WITH_SOME_METRICS.metrics.items == null) { expect(false).to.be.ok; return; }
    const metricsMock: TMetric[] = STATE_WITH_SOME_METRICS.metrics.items;
    next = generator.next(metricsMock);

    // Download data file as JSON
    expect(next, 'must request data file download').to.have.deep.property('value.CALL.args').and.to.have.length(2);
    expect(next).to.have.deep.property('value.CALL.args[1]').and.to.be.a('string');
    const responseMock: { ok: boolean, data: TMetric[] } = {
      ok: true,
      data: [
        {
          id: metricsMock[0].id,
          props: metricsMock[0].props,
          entries: metricsMock[0].entries.slice(0, 6),
        },
        {
          id: metricsMock[1].id,
          props: metricsMock[1].props,
          entries: metricsMock[1].entries,
        },
      ],
    };
    next = generator.next(responseMock);

    expect(next, 'must request data file upload').to.have.deep.property('value.CALL.args').and.to.have.length(3);
    expect(next).to.have.deep.property('value.CALL.args[1]').and.to.eql(DATA_FILE_PATH);
    expect(next).to.have.deep.property('value.CALL.args[2]').and.to.be.a('array');
    if (next.value == null) { expect(false).to.be.ok; return; }
    expect(isValidMetricsArray(next.value.CALL.args[2]), 'uploaded metric needs to be valid').to.be.ok;
    next = generator.next({ ok: true });

    expect(localStorage, 'localStorage must have metrics').to.have.property('metrics');
    const cachedMetrics = localStorage.getItem('metrics');
    if (cachedMetrics == null) { expect(false).to.be.ok; return; }
    const localStorageMetrics = JSON.parse(cachedMetrics);
    expect(localStorageMetrics, 'should still be exactly 2 metrics in localStorage').to.have.length(2);
    expect(localStorageMetrics[0], 'should still be 10 entries in Mood metric in localStorage').to.have.property('entries')
      .and.to.have.length(10);

    // PUT action to finish the saga
    expect(next, 'must PUT success sync data').to.have.deep.property('value.PUT.action.type', 'SUCCESS_SYNC_DATA');
    expect(next, 'metrics must be unchanged').to.have.deep.property('value.PUT.action.data[0].props').and.to.eql(metricsMock[0].props);
    expect(next).to.have.deep.property('value.PUT.action.data[1].props').and.to.deep.eql(metricsMock[1].props);
    expect(next).to.have.deep.property('value.PUT.action.lastSynced').and.to.be.a('number', 'must look like a timestamp');

    // And done
    next = generator.next();
    expect(next).to.have.property('done').and.to.equal(true);
  });

  it('creates a new data file if the file is not found', () => {
    const generator = syncData();
    let next = generator.next();

    // Fetch outhentication state
    expect(next).to.have.deep.property('value.SELECT.selector', getAuthentication);
    const authenticationMock: TAuthenticationState = {
      isAuthenticated: true,
      isAuthenticating: false,
      accessToken: 'abc2',
    };
    next = generator.next(authenticationMock);
    expect(next.done).to.not.be.ok;

    // We're authenticated, so let's PUT the restore cache action
    expect(next, 'must PUT REQUEST_RESTORE_CACHE').to.have.deep.property('value.PUT.action.type', 'REQUEST_RESTORE_CACHE');
    next = generator.next();

    // Fetch metrics state
    expect(next, 'must fetch metrics items state').to.have.deep.property('value.SELECT.selector', getMetricsItems);
    const localMetricsMock: TMetric[] = [MoodWithEntries, BurnsWithoutEntries];
    next = generator.next(localMetricsMock);

    // Attempt to download but ERROR file not found
    expect(next, 'must attempt data file download').to.have.deep.property('value.CALL.args').and.to.have.length(2);
    expect(next).to.have.deep.property('value.CALL.args[1]').to.equal(DATA_FILE_PATH);
    next = generator.next({ ok: false, error: 'Error: File not found' });

    // Call for upload of local data
    expect(next, 'must send upload request').to.have.deep.property('value.CALL.args').and.to.have.length(3);
    expect(next).to.have.deep.property('value.CALL.args[1]').and.to.eql(DATA_FILE_PATH);
    expect(next).to.have.deep.property('value.CALL.args[2]').and.to.be.a('array');
    const uploadResponseMock = { ok: true };
    next = generator.next(uploadResponseMock);

    // Check local storage up to date
    expect(global.localStorage).to.have.property('metrics');
    expect(JSON.parse(global.localStorage.metrics)).to.eql(localMetricsMock);

    // PUT finish
    expect(next).to.have.deep.property('value.PUT.action.type', 'SUCCESS_SYNC_DATA');
    next = generator.next();
    expect(next.done, 'generator should be done').to.equal(true);
  });

  it('downloads and stores data if no local data exists', () => {
    const authenticationMock: TAuthenticationState = {
      isAuthenticated: true,
      isAuthenticating: false,
      accessToken: 'abc',
    };
    const localMetricsMock = null;
    const remoteMetricsMock: TMetric[] = [
      {
        id: 233,
        props: {
          name: 'A cool metric',
          minValue: 1,
          maxValue: 10,
          type: 'int',
          colorGroups: [],
        },
        lastModified: 1482133305530,
        entries: [],
      },
    ];
    const downloadMock = {
      ok: true,
      data: remoteMetricsMock,
    };

    const generator = syncData();
    let next = generator.next();

    // get authentication state -- authenticated
    expect(next, 'must SELECT authentication state').to.have.deep.property('value.SELECT.selector', getAuthentication);
    next = generator.next(authenticationMock);

    // We're authenticated, so let's PUT the restore cache action
    expect(next, 'must PUT REQUEST_RESTORE_CACHE').to.have.deep.property('value.PUT.action.type', 'REQUEST_RESTORE_CACHE');
    next = generator.next();

    // get metrics items -- no metrics
    expect(next, 'must SELECT metricsItems state').to.have.deep.property('value.SELECT.selector').and.to.be.a('function');
    next = generator.next(localMetricsMock);

    // download data file
    expect(next, 'must request data file download').to.have.deep.property('value.CALL.args').and.to.have.length(2);
    expect(next, 'must request data file download').to.have.deep.property('value.CALL.args[1]').and.to.be.a('string');
    next = generator.next(downloadMock);

    // set local storage
    const cachedMetrics = localStorage.getItem('metrics');
    if (cachedMetrics == null) { expect(false).to.be.ok; return; }
    expect(JSON.parse(cachedMetrics)).to.eql(remoteMetricsMock);

    // upload updated metrics
    expect(next, 'must request upload').to.have.deep.property('value.CALL.args').and.to.have.length(3);
    expect(next).to.have.deep.property('value.CALL.args[1]').and.to.eql(DATA_FILE_PATH);
    expect(next).to.have.deep.property('value.CALL.args[2]').and.to.be.a('array');
    next = generator.next({ ok: true });

    // PUT success with remote metrics
    expect(next, 'must PUT success sync data action').to.have.deep.property('value.PUT.action.type', 'SUCCESS_SYNC_DATA');
    expect(next).to.have.deep.property('value.PUT.action.data').and.to.eql(remoteMetricsMock);
    expect(next).to.have.deep.property('value.PUT.action.lastSynced').and.to.be.a('number');
    next = generator.next();

    expect(next.done).to.equal(true);
  });

  it('merges entries of metrics with the same id', () => {
    const generator = syncData();
    let next = generator.next();

    // fetch authentication state -- authenticated
    const authenticationMock: TAuthenticationState = {
      isAuthenticated: true,
      isAuthenticating: false,
      accessToken: 'abcabc',
    };
    next = generator.next(authenticationMock);

    // We're authenticated, so let's PUT the restore cache action
    expect(next, 'must PUT REQUEST_RESTORE_CACHE').to.have.deep.property('value.PUT.action.type', 'REQUEST_RESTORE_CACHE');
    next = generator.next();


    // fetch local metrics items -- metrics present, have some entries
    const localMetricsMock: TMetric[] = [
      {
        id: MoodWithEntries.id,
        props: MoodWithEntries.props,
        lastModified: MoodWithEntries.lastModified,
        entries: [
          MoodWithEntries.entries[0],
          // not 1
          MoodWithEntries.entries[2],
          MoodWithEntries.entries[3],
          MoodWithEntries.entries[4],
          // not 5
          MoodWithEntries.entries[6],
          // not 7, 8, 9
        ],
      },
      BurnsWithEntries,
    ];
    next = generator.next(localMetricsMock);

    // download data file from dropbox -- success
    expect(next, 'must request data file download').to.have.deep.property('value.CALL.args').and.to.have.length(2);
    expect(next).to.have.deep.property('value.CALL.args[1]').and.to.be.a('string');
    const downloadMock: { ok: boolean, data: TMetric[] } = {
      ok: true,
      data: [
        {
          id: MoodWithEntries.id,
          props: MoodWithEntries.props,
          lastModified: MoodWithEntries.lastModified,
          entries: [
            MoodWithEntries.entries[1],
            MoodWithEntries.entries[5],
            MoodWithEntries.entries[7],
            MoodWithEntries.entries[8],
            MoodWithEntries.entries[9],
          ],
        },
        BurnsWithEntries,
      ] };
    next = generator.next(downloadMock);

    // update localstorage with merged metrics
    const mergedMetrics = [MoodWithEntries, BurnsWithEntries];
    expect(global.localStorage).to.have.property('metrics');
    expect(JSON.parse(global.localStorage.metrics)).to.eql(mergedMetrics);

    // upload the merged metrics
    expect(next, 'must request data file upload').to.have.deep.property('value.CALL.args').and.to.have.length(3);
    next = generator.next({ ok: true });

    // put success with remote metrics
    expect(next).to.have.deep.property('value.PUT.action.type', 'SUCCESS_SYNC_DATA');
    expect(next).to.have.deep.property('value.PUT.action.data').and.to.eql(mergedMetrics);
    expect(next).to.have.deep.property('value.PUT.action.lastSynced').and.to.be.a('number');
    expect(generator.next()).to.have.property('done', true);
  });

  it('uploads props if local props are newer', () => {
    const generator = syncData();
    let next = generator.next();

    // fetch authentication state -- authenticated
    next = generator.next(authAuthenticated);

    const localMetricsMock: TMetric[] = [
      {
        id: 123,
        lastModified: 1234,
        props: {
          name: 'TMetric!',
          minValue: 1,
          maxValue: 10,
          type: 'int',
          colorGroups: [
            {
              minValue: 1,
              maxValue: 3,
              color: 'green',
            },
          ],
        },
        entries: [],
      },
    ];
    const downloadMock: { ok: boolean, data: TMetric[] } = {
      ok: true,
      data: [
        {
          id: 123,
          lastModified: 1231,
          props: {
            name: 'old TMetric',
            minValue: 0,
            maxValue: 10,
            type: 'int',
            colorGroups: [
              {
                minValue: 0,
                maxValue: 3,
                color: 'blue',
              },
            ],
          },
          entries: [],
        },
      ] };

    // We're authenticated, so let's PUT the restore cache action
    expect(next, 'must PUT REQUEST_RESTORE_CACHE').to.have.deep.property('value.PUT.action.type', 'REQUEST_RESTORE_CACHE');
    next = generator.next();

    // fetch local metrics items -- metrics present
    expect(next, 'must fetch metrics items from store').to.have.deep.property('value.SELECT.selector');
    next = generator.next(localMetricsMock);

    // download data file from dropbox -- success
    expect(next, 'must request data file download').to.have.deep.property('value.CALL.args').and.to.have.length(2);
    expect(next).to.have.deep.property('value.CALL.args[1]').and.to.be.a('string');
    next = generator.next(downloadMock);

    // update localstorage with metrics with local props
    expect(global.localStorage).to.have.property('metrics');
    expect(JSON.parse(global.localStorage.metrics)).to.eql(localMetricsMock);

    // upload updated metrics
    expect(next, 'must request upload').to.have.deep.property('value.CALL.args').and.to.have.length(3);
    expect(next).to.have.deep.property('value.CALL.args[1]').and.to.eql(DATA_FILE_PATH);
    expect(next).to.have.deep.property('value.CALL.args[2]').and.to.be.a('array');
    next = generator.next({ ok: true });

    // put success with remote metrics
    expect(next, 'must put success sync data').to.have.deep.property('value.PUT.action.type', 'SUCCESS_SYNC_DATA');
    expect(next).to.have.deep.property('value.PUT.action.data').and.to.eql(localMetricsMock);
    expect(next).to.have.deep.property('value.PUT.action.lastSynced').and.to.be.a('number');
    expect(generator.next()).to.have.property('done', true);
  });

  it('uses downloaded props if local props are older', () => {
    const generator = syncData();
    let next = generator.next();

    // fetch authentication state -- authenticated
    next = generator.next(authAuthenticated);

    const downloadMock: { ok: boolean, data: TMetric[] } = {
      ok: true,
      data: [
        {
          id: 123,
          lastModified: 1234,
          props: {
            name: 'TMetric!',
            minValue: 1,
            maxValue: 10,
            type: 'int',
            colorGroups: [
              {
                minValue: 1,
                maxValue: 3,
                color: 'green',
              },
            ],
          },
          entries: [],
        },
      ] };
    const localMetricsMock: TMetric[] = [
      {
        id: 123,
        lastModified: 1231,
        props: {
          name: 'old TMetric',
          minValue: 0,
          maxValue: 10,
          type: 'int',
          colorGroups: [
            {
              minValue: 0,
              maxValue: 3,
              color: 'blue',
            },
          ],
        },
        entries: [],
      },
    ];

    // We're authenticated, so let's PUT the restore cache action
    expect(next, 'must PUT REQUEST_RESTORE_CACHE').to.have.deep.property('value.PUT.action.type', 'REQUEST_RESTORE_CACHE');
    next = generator.next();

    // fetch local metrics items -- metrics present
    expect(next, 'must fetch metrics items from store').to.have.deep.property('value.SELECT.selector');
    next = generator.next(localMetricsMock);

    // download data file from dropbox -- success
    expect(next, 'must request data file download').to.have.deep.property('value.CALL.args').and.to.have.length(2);
    expect(next).to.have.deep.property('value.CALL.args[1]').and.to.be.a('string');
    next = generator.next(downloadMock);

    // update localstorage with metrics with downloaded props
    expect(global.localStorage).to.have.property('metrics');
    expect(JSON.parse(global.localStorage.metrics)).to.eql(downloadMock.data);

    // upload updated metrics
    expect(next, 'must request upload').to.have.deep.property('value.CALL.args').and.to.have.length(3);
    expect(next).to.have.deep.property('value.CALL.args[1]').and.to.eql(DATA_FILE_PATH);
    expect(next).to.have.deep.property('value.CALL.args[2]').and.to.be.a('array');
    next = generator.next({ ok: true });

    // put success with remote metrics
    expect(next, 'must put success sync data').to.have.deep.property('value.PUT.action.type', 'SUCCESS_SYNC_DATA');
    expect(next).to.have.deep.property('value.PUT.action.data').and.to.eql(downloadMock.data);
    expect(next).to.have.deep.property('value.PUT.action.lastSynced').and.to.be.a('number');
    expect(generator.next()).to.have.property('done', true);
  });

  it('upgrades old remote metrics', () => {
    const generator = syncData();
    let next = generator.next();

    // fetch authentication state -- authenticated
    next = generator.next(authAuthenticated);

    const downloadMock: { ok: boolean, data: TOldMetric[] } = {
      ok: true,
      data: [
        {
          id: 123,
          name: 'TMetric!',
          minValue: 1,
          maxValue: 10,
          type: 'int',
          entries: [],
          colorGroups: [
            {
              minValue: 1,
              maxValue: 3,
              color: 'green',
            },
          ],
        },
      ] };

    const localMetricsMock = null;

    // We're authenticated, so let's PUT the restore cache action
    expect(next, 'must PUT REQUEST_RESTORE_CACHE').to.have.deep.property('value.PUT.action.type', 'REQUEST_RESTORE_CACHE');
    next = generator.next();

    // fetch local metrics items -- no metrics
    expect(next, 'must fetch metrics items from store').to.have.deep.property('value.SELECT.selector');
    next = generator.next(localMetricsMock);

    // download data file from dropbox -- success
    expect(next, 'must request data file download').to.have.deep.property('value.CALL.args').and.to.have.length(2);
    expect(next).to.have.deep.property('value.CALL.args[1]').and.to.be.a('string');
    next = generator.next(downloadMock);

    // update localstorage with metrics with local props
    expect(global.localStorage, 'must set metrics in localStorage').to.have.property('metrics');
    expect(JSON.parse(global.localStorage.metrics)).to.have.length(1);
    expect(JSON.parse(global.localStorage.metrics)[0]).to.have.property('props').and.to.have.property('name', 'TMetric!');
    expect(JSON.parse(global.localStorage.metrics)).to.have.length(1);
    expect(JSON.parse(global.localStorage.metrics)[0]).to.have.property('lastModified').and.to.be.a('number');

    // upload updated metrics
    expect(next, 'must request upload').to.have.deep.property('value.CALL.args').and.to.have.length(3);
    expect(next).to.have.deep.property('value.CALL.args[1]').to.eql(DATA_FILE_PATH);
    expect(next).to.have.deep.property('value.CALL.args[2]').to.be.a('array');
    next = generator.next({ ok: true });

    // put success with remote metrics
    expect(next, 'must put success sync data').to.have.deep.property('value.PUT.action.type', 'SUCCESS_SYNC_DATA');
    expect(next).to.have.deep.property('value.PUT.action.data').and.to.have.length(1);
    expect(next).to.have.deep.property('value.PUT.action.data[0].props.name', 'TMetric!');
    expect(next).to.have.deep.property('value.PUT.action.data[0].props.colorGroups').and.to.be.a('array');
    expect(next).to.have.deep.property('value.PUT.action.lastSynced').to.be.a('number');
    expect(generator.next()).to.have.property('done', true);
  });

  it('discards all deleted metrics according to localStorage.toDelete', () => {
    global.localStorage.setItem('toDelete', `[${BurnsWithEntries.id}]`);
    const generator = syncData();
    let next = generator.next();

    // fetch authentication state -- authenticated
    next = generator.next(authAuthenticated);

    // PUT restore cache
    next = generator.next();

    // SELECT local metrics
    // BurnsWithEntries got deleted
    next = generator.next([MoodWithEntries]);

    // Download data from dropbox
    next = generator.next({
      ok: true,
      data: [MoodWithEntries, BurnsWithEntries],
    });

    // Upload data to dropbox
    next = generator.next({ ok: true });

    // PUT successSyncData
    expect(next).to.have.deep.property('value.PUT.action.data');
    if (next.value == null || next.value.PUT == null) {
      return;
    }
    next.value.PUT.action.data.forEach((metric: TMetric) => {
      expect(metric.id).to.not.equal(2);
    });

    expect(global.localStorage.getItem('toDelete')).to.not.be.ok;
  });

  describe('error handling', () => {
    it('cancels on download-error, but updates localStorage', () => {
      const generator = syncData();
      let next = generator.next();

      // fetch authentication -- authenticated
      expect(next, 'must SELECT authentication').to.have.deep.property('value.SELECT');
      next = generator.next(authAuthenticated);

    // We're authenticated, so let's PUT the restore cache action
      expect(next, 'must PUT REQUEST_RESTORE_CACHE').to.have.deep.property('value.PUT.action.type', 'REQUEST_RESTORE_CACHE');
      next = generator.next();


      // fetch metrics items -- has some metrics
      expect(next, 'must SELECT metrics items').to.have.deep.property('value.SELECT');
      next = generator.next(STATE_WITH_SOME_METRICS.metrics.items);

      // attempt data file download -- error
      expect(next, 'must request data file download').to.have.deep.property('value.CALL.args').and.to.have.length(2);
      next = generator.next({ ok: false, error: 'Error: Download error' });

      // check that local storage is updated
      expect(global.localStorage, 'must still keep localStorage up-to-date').to.have.property('metrics');
      expect(JSON.parse(global.localStorage.metrics)).to.eql(STATE_WITH_SOME_METRICS.metrics.items);

      // PUT error
      expect(next, 'must PUT error sync data').to.have.deep.property('value.PUT.action.type', 'ERROR_SYNC_DATA');
    });

    it('cancels on filesUpload error, but updates localStorage', () => {
      const generator = syncData();
      let next = generator.next();

      // fetch authentication -- authenticated
      expect(next, 'must SELECT authentication').to.have.deep.property('value.SELECT');
      next = generator.next(authAuthenticated);

      // We're authenticated, so let's PUT the restore cache action
      expect(next, 'must PUT REQUEST_RESTORE_CACHE').to.have.deep.property('value.PUT.action.type', 'REQUEST_RESTORE_CACHE');
      next = generator.next();


      // fetch metrics items -- has some metrics
      expect(next, 'must SELECT metrics items').to.have.deep.property('value.SELECT');
      next = generator.next(STATE_WITH_SOME_METRICS.metrics.items);

      // download file -- SUCCESS
      expect(next, 'must request data file download').to.have.deep.property('value.CALL.args').and.to.have.length(2);
      expect(next).to.have.deep.property('value.CALL.args[1]').and.to.be.a('string');
      next = generator.next({
        ok: true,
        data: STATE_WITH_SOME_METRICS.metrics.items,
      });

      // upload data -- ERROR
      expect(next, 'must request upload').to.have.deep.property('value.CALL.args').and.to.have.length(3);
      expect(next).to.have.deep.property('value.CALL.args[1]').and.to.eql(DATA_FILE_PATH);
      next = generator.next({ ok: false, error: 'Upload error' });

      // check that local storage is updated
      expect(global.localStorage, 'must still keep localStorage up-to-date').to.have.property('metrics');
      expect(JSON.parse(global.localStorage.metrics)).to.eql(STATE_WITH_SOME_METRICS.metrics.items);

      // PUT error
      expect(next, 'must PUT error sync data').to.have.deep.property('value.PUT.action.type', 'ERROR_SYNC_DATA');
    });
  });
});

describe('execute-sync saga', () => {
  it('dispatches a beginSyncData action', () => {
    const generator = executeSyncData();
    let next = generator.next();
    expect(next).to.have.deep.property('value.PUT.action').and.to.eql(beginSyncData());
    next = generator.next();
    expect(next).to.have.property('done', true);
  });

  it('writes the id of the deleted metric into localStorage.toDelete if a metric needs to be deleted', () => {
    global.localStorage.removeItem('toDelete');
    const generator = executeSyncData(deleteMetric(2, true));
    generator.next();
    expect(global.localStorage.getItem('toDelete')).to.eql('[2]');
  });
});

describe('executeConfirmModal', () => {
  let generator;
  let next;
  const modals: TModal[] = [
    {
      title: 'the first modal',
      message: '...',
      actions: {
        confirm: {
          action: { type: 'DELETE_METRIC', metricId: 22 },
          label: 'you clicked me',
        },
        cancel: {
          action: { type: 'DEFAULT_ACTION' },
          label: 'u did not click here',
        },
      },
    },
    {
      title: 'the second modal',
      message: 'this one dosent matter',
      actions: {
        confirm: {
          action: { type: 'DELETE_METRIC', metricId: 22 },
          label: 'don\'t do this one',
        },
        cancel: {
          action: { type: 'DEFAULT_ACTION' },
          label: 'also not this one',
        },
      },
    },
  ];

  beforeAll(() => {
    generator = executeConfirmModal();
    next = generator.next();
  });

  it('fetches the modals from the store', () => {
    expect(next).to.have.deep.property('value.SELECT');
    next = generator.next(modals);
  });

  it('dispatches the confirm action stored in the modal', () => {
    expect(next).to.have.deep.property('value.PUT.action').and.to.eql(modals[0].actions.confirm.action);
    next = generator.next();
  });

  it('dispatches successConfirmModal', () => {
    expect(next).to.have.deep.property('value.PUT.action').and.to.eql({ type: 'SUCCESS_CONFIRM_MODAL' });
    next = generator.next();
  });
});

describe('executeCancelModal', () => {
  let generator;
  let next;
  const modals: TModal[] = [
    {
      title: 'the first modal',
      message: '...',
      actions: {
        confirm: {
          action: { type: 'DEFAULT_ACTION' },
          label: 'u did not click here',
        },
        cancel: {
          action: { type: 'DELETE_METRIC', metricId: 22 },
          label: 'you clicked me',
        },
      },
    },
    {
      title: 'the second modal',
      message: 'this one dosent matter',
      actions: {
        confirm: {
          action: { type: 'REORDER_METRICS', metricId: 2, direction: 'up' },
          label: 'don\'t do this one',
        },
        cancel: {
          action: { type: 'STOP_EDITING' },
          label: 'also not this one',
        },
      },
    },
  ];

  beforeAll(() => {
    generator = executeCancelModal();
    next = generator.next();
  });

  it('fetches the modals from the store', () => {
    expect(next).to.have.deep.property('value.SELECT');
    next = generator.next(modals);
  });

  it('dispatches the cancel action stored in the modal', () => {
    expect(next).to.have.deep.property('value.PUT.action').and.to.eql(modals[0].actions.cancel.action);
    next = generator.next();
  });

  it('dispatches successCancelModal', () => {
    expect(next).to.have.deep.property('value.PUT.action').and.to.eql({ type: 'SUCCESS_CANCEL_MODAL' });
    next = generator.next();
  });
});

describe('executeLogout', () => {
  it('deletes the accessToken from localStorage', () => {
    const generator = executeLogout();
    generator.next();

    expect(localStorage.getItem('accessToken')).to.not.be.ok;
    expect(localStorage.getItem('metrics')).to.not.be.ok;
    expect(generator.next()).to.have.property('done', true);
  });

  it('PUTs success logout action', () => {
    const generator = executeLogout();
    const next = generator.next();

    expect(next).to.have.deep.property('value.PUT.action.type', 'SUCCESS_LOGOUT');
    expect(generator.next()).to.have.property('done', true);
  });
});

describe('restore cache', () => {
  // Rough outline of what the generator does:
  // - select metrics->items from store
  // - If non-null, put error
  // - Otherwise:
  //   - If localStorage has valid metrics, put success
  //   - Otherwise, put error
  it('fails if there is data in the store, no matter if there is data in localStorage', () => {
    const generator = restoreCache();
    let next = generator.next();

    expect(next, 'must get metrics->items').to.have.deep.property('value.SELECT.selector', getMetricsItems);
    next = generator.next([MoodWithEntries]);

    expect(next, 'must dispatch ERROR_RESTORE_CACHE action').to.have.deep.property('value.PUT.action.type', 'ERROR_RESTORE_CACHE');
    next = generator.next();

    expect(next).to.have.property('done', true);
  });

  it('succeeds if data is in localStorage', () => {
    localStorage.setItem('metrics', JSON.stringify([MoodWithEntries, BurnsWithEntries]));
    const generator = restoreCache();
    let next = generator.next();

    expect(next).to.have.deep.property('value.SELECT.selector', getMetricsItems);
    next = generator.next(null);

    expect(next).to.have.deep.property('value.PUT.action.type', 'SUCCESS_RESTORE_CACHE');
    expect(next).to.have.deep.property('value.PUT.action.data').and.to.eql([MoodWithEntries, BurnsWithEntries]);
    next = generator.next();

    expect(next).to.have.property('done', true);
  });

  it('fails if localStorage data is not valid metrics', () => {
    localStorage.setItem('metrics', 'huh');
    const generator = restoreCache();
    let next = generator.next();

    expect(next).to.have.deep.property('value.SELECT.selector', getMetricsItems);
    next = generator.next(null);

    expect(next).to.have.deep.property('value.PUT.action.type', 'ERROR_RESTORE_CACHE');
    next = generator.next();

    expect(next).to.have.property('done', true);
  });
});

describe('update metric', () => {
  // Outline:
  // - Check if valid TMetricProps.
  // - PUT success/error with date
  it('dispatches SUCCESS_UPDATE_METRIC if passed props are valid TMetricProps', () => {
    const updatedProps: TEditedMetricProps = {
      ...DEFAULT_METRIC_PROPS,
      minValue: 2,
      name: 'Cool',
    };
    const generator = updateMetric(requestUpdateMetric(1, updatedProps));
    let next = generator.next();

    expect(next).to.have.deep.property('value.PUT.action.type', 'SUCCESS_UPDATE_METRIC');
    expect(next).to.have.deep.property('value.PUT.action.lastModified').and.to.be.a('number');
    expect(next).to.have.deep.property('value.PUT.action.newProps').and.to.eql(updatedProps);
    next = generator.next();
    expect(next).to.have.property('done', true);
  });

  it('dispatches ERROR_UPDATE_METRIC if passed props are not valid', () => {
    const updatedProps: TEditedMetricProps = {
      ...DEFAULT_METRIC_PROPS,
      minValue: null,
      colorGroups: [{ minValue: null, maxValue: 4, color: 'green' }],
    };
    const generator = updateMetric(requestUpdateMetric(1, updatedProps));
    let next = generator.next();

    expect(next).to.have.deep.property('value.PUT.action.type', 'ERROR_UPDATE_METRIC');
    expect(next).to.have.deep.property('value.PUT.action.invalidFields').and.to.eql(['minValue', 'colorGroups/0/minValue']);
    next = generator.next();
    expect(next).to.have.property('done', true);
  });
});
