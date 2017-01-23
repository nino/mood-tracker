/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import {
  syncData,
  checkLogin,
  executeCancelModal,
  executeConfirmModal,
  executeLogout,
} from './sagas';
import {
  STATE_WITH_SOME_METRICS,
} from '../test/SampleApplicationStates';
import {
  MoodWithEntries,
  BurnsWithoutEntries,
  BurnsWithEntries,
} from '../test/SampleMetrics';
import { DATA_FILE_PATH } from './constants';
import { isValidMetricsArray } from './lib';

const authAuthenticated = {
  isAuthenticated: true,
  isAuthenticating: false,
  accessToken: 'yup',
};

describe('check login saga', () => {
  it('uses the accessToken from localStorage to authenticate', () => {
    global.localStorage = { accessToken: 'abc' };
    const generator = checkLogin();
    const next = generator.next();
    expect(next.value).to.have.property('PUT').and.to.have.property('action')
      .and.to.have.property('type', 'SUCCESS_CHECK_LOGIN');
    expect(next.value.PUT.action).to.have.property('accessToken', 'abc');
    expect(next.value.PUT.action).to.have.property('lastAuthenticated').and.to.be.a('number');
    expect(generator.next()).to.have.property('done', true);
  });

  it('uses the accessToken from location hash to authenticate', () => {
    global.localStorage = { };
    global.window.location.hash = '#access_token=abc2';
    const generator = checkLogin();
    const next = generator.next();
    expect(next.value).to.have.property('PUT').and.to.have.property('action')
      .and.to.have.property('type', 'SUCCESS_CHECK_LOGIN');
    expect(next.value.PUT.action).to.have.property('accessToken', 'abc2');
    expect(next.value.PUT.action).to.have.property('lastAuthenticated').and.to.be.a('number');
    expect(generator.next()).to.have.property('done', true);
  });

  it('prefers location hash over local accessToken', () => {
    global.localStorage = { accessToken: 'abcLocal' };
    global.window.location.hash = '#access_token=abcHash';
    const generator = checkLogin();
    const next = generator.next();
    expect(next.value).to.have.property('PUT').and.to.have.property('action')
      .and.to.have.property('type', 'SUCCESS_CHECK_LOGIN');
    expect(next.value.PUT.action).to.have.property('accessToken', 'abcHash');
    expect(next.value.PUT.action).to.have.property('lastAuthenticated').and.to.be.a('number');
    expect(generator.next()).to.have.property('done', true);
  });

  it('fails if no token is found in localStorage or location hash', () => {
    global.localStorage = {};
    global.window.location.hash = null;
    const generator = checkLogin();
    const next = generator.next();
    expect(next.value).to.have.property('PUT').and.to.have.property('action')
      .and.to.have.property('type', 'ERROR_CHECK_LOGIN');
    expect(generator.next()).to.have.property('done', true);
  });
});

describe('sync data saga', () => {
  it('does nothing if not authenticated', () => {
    const generator = syncData();
    let next = generator.next();
    const authenticationMock = { isAuthenticated: false };
    next = generator.next(authenticationMock);
    expect(next).to.have.property('value').and.to.have.property('PUT')
      .and.to.have.property('action')
      .and.to.have.property('type', 'ERROR_SYNC_DATA');
    expect(generator.next()).to.have.property('done', true);
  });

  it('uploads new entries', () => {
    const generator = syncData();
    let next = generator.next();

    // Fetch authentication state from store
    next = generator.next({ accessToken: 'abc' });

    // Fetch metrics items from store
    expect(next, 'must SELECT metrics items').to.have.property('value')
      .and.to.have.property('SELECT');
    const metricsMock = STATE_WITH_SOME_METRICS.metrics.items;
    next = generator.next(metricsMock);

    // Download data file as JSON
    expect(next, 'must request data file download').to.have.property('value')
      .and.to.have.property('CALL')
      .and.to.have.property('args').and.to.have.length(2);
    expect(next.value.CALL.args[1]).to.be.a('string');
    const responseMock = {
      ok: true,
      data: [
        {
          id: STATE_WITH_SOME_METRICS.metrics.items[0].id,
          props: STATE_WITH_SOME_METRICS.metrics.items[0].props,
          entries: STATE_WITH_SOME_METRICS.metrics.items[0].entries.slice(0, 6),
        },
        {
          id: STATE_WITH_SOME_METRICS.metrics.items[1].id,
          props: STATE_WITH_SOME_METRICS.metrics.items[1].props,
          entries: STATE_WITH_SOME_METRICS.metrics.items[1].entries,
        },
      ],
    };
    next = generator.next(responseMock);

    expect(next, 'must request data file upload').to.have.property('value')
      .and.to.have.property('CALL')
      .and.to.have.property('args').and.to.have.length(3);
    expect(next.value.CALL.args[1]).to.eql(DATA_FILE_PATH);
    expect(next.value.CALL.args[2]).to.be.a('array');
    expect(
      isValidMetricsArray(next.value.CALL.args[2]),
      'uploaded metric needs to be valid',
    ).to.be.ok;
    next = generator.next({ ok: true });

    expect(global.localStorage, 'localStorage must have metrics')
      .to.have.property('metrics');
    expect(
      global.localStorage.metrics,
      'should still be exactly 2 metrics in localStorage',
    ).to.have.length(2);
    expect(
      global.localStorage.metrics[0],
      'should still be 10 entries in Mood metric in localStorage',
    ).to.have.property('entries').and.to.have.length(10);

    // PUT action to finish the saga
    expect(next, 'must PUT success sync data').to.have.property('value')
      .and.to.have.property('PUT').and.to.have.property('action')
      .and.to.have.property('type', 'SUCCESS_SYNC_DATA');
    expect(next.value.PUT.action.data[0], 'metrics must be unchanged')
      .to.have.property('props').and.to.eql(metricsMock[0].props);
    expect(next.value.PUT.action.data[1]).to.have.property('props')
      .and.to.eql(metricsMock[1].props);
    expect(next.value.PUT.action.lastSynced, 'must look like a timestamp')
      .to.be.a('number');

    // And done
    next = generator.next();
    expect(next).to.have.property('done').and.to.equal(true);
  });

  it('creates a new data file if the file is not found', () => {
    const generator = syncData();
    let next = generator.next();

    // Fetch outhentication state
    expect(next, 'must fetch authentication state').to.have.property('value')
      .and.to.have.property('SELECT')
      .and.to.have.property('selector');
    const authenticationMock = {
      isAuthenticated: true,
      isAuthenticating: false,
      accessToken: 'abc2',
    };
    next = generator.next(authenticationMock);
    expect(next.done).to.not.be.ok;

    // Fetch metrics state
    expect(next, 'must fetch metrics items state').to.have.property('value')
      .and.to.have.property('SELECT')
      .and.to.have.property('selector');
    const localMetricsMock = [MoodWithEntries, BurnsWithoutEntries];
    next = generator.next(localMetricsMock);

    // Attempt to download but ERROR file not found
    expect(next, 'must attempt data file download').to.have.property('value')
      .and.to.have.property('CALL')
      .and.to.have.property('args').and.to.have.length(2);
    expect(next.value.CALL.args[1]).to.equal(DATA_FILE_PATH);
    next = generator.next({ ok: false, error: 'Error: File not found' });

    // Call for upload of local data
    expect(next, 'must send upload request').to.have.property('value')
      .and.to.have.property('CALL')
      .and.to.have.property('args').and.to.have.length(3);
    expect(next.value.CALL.args[1]).to.eql(DATA_FILE_PATH);
    expect(next.value.CALL.args[2]).to.be.a('array');
    const uploadResponseMock = { ok: true };
    next = generator.next(uploadResponseMock);

    // Check local storage up to date
    expect(global.localStorage).to.have.property('metrics')
      .and.to.deep.equal(localMetricsMock);

    // PUT finish
    expect(next).to.have.property('value')
      .and.to.have.property('PUT').and.to.have.property('action')
      .and.to.have.property('type', 'SUCCESS_SYNC_DATA');
    next = generator.next();
    expect(next.done, 'generator should be done').to.equal(true);
  });

  it('downloads and stores data if no local data exists', () => {
    const authenticationMock = {
      isAuthenticated: true,
      isAuthenticating: false,
      accessToken: 'abc',
    };
    const localMetricsMock = null;
    const remoteMetricsMock = [
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
    expect(next, 'must SELECT authentication state').to.have.property('value')
      .and.to.have.property('SELECT');
    next = generator.next(authenticationMock);

    // get metrics items -- no metrics
    expect(next, 'must SELECT metricsItems state').to.have.property('value')
      .and.to.have.property('SELECT');
    next = generator.next(localMetricsMock);

    // download data file
    expect(next, 'must request data file download').to.have.property('value')
      .and.to.have.property('CALL')
      .and.to.have.property('args').and.to.have.length(2);
    expect(next.value.CALL.args[1]).to.be.a('string');
    next = generator.next(downloadMock);

    // set local storage
    expect(global.localStorage).to.have.property('metrics')
      .and.to.deep.equal(remoteMetricsMock);

    // upload updated metrics
    expect(next, 'must request upload').to.have.property('value')
      .and.to.have.property('CALL')
      .and.to.have.property('args').and.to.have.length(3);
    expect(next.value.CALL.args[1]).to.eql(DATA_FILE_PATH);
    expect(next.value.CALL.args[2]).to.be.a('array');
    next = generator.next({ ok: true });

    // PUT success with remote metrics
    expect(next, 'must PUT success sync data action').to.have.property('value')
      .and.to.have.property('PUT').and.to.have.property('action')
      .and.to.have.property('type', 'SUCCESS_SYNC_DATA');
    expect(next.value.PUT.action).to.have.property('data')
      .and.to.deep.equal(remoteMetricsMock);
    expect(next.value.PUT.action).to.have.property('lastSynced').and.to.be.a('number');
    next = generator.next();

    expect(next.done).to.equal(true);
  });

  it('merges entries of metrics with the same id', () => {
    const generator = syncData();
    let next = generator.next();

    // fetch authentication state -- authenticated
    const authenticationMock = {
      isAuthenticated: true,
      isAuthenticating: false,
      accessToken: 'abcabc',
    };
    next = generator.next(authenticationMock);

    // fetch local metrics items -- metrics present, have some entries
    const localMetricsMock = [
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
    expect(next, 'must request data file download').to.have.property('value')
      .and.to.have.property('CALL')
      .and.to.have.property('args').and.to.have.length(2);
    expect(next.value.CALL.args[1]).to.be.a('string');
    const downloadMock = {
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
    expect(global.localStorage)
      .to.have.property('metrics').and.to.eql(mergedMetrics);

    // upload the merged metrics
    expect(next, 'must request data file upload')
      .to.have.property('value')
      .and.to.have.property('CALL')
      .and.to.have.property('args')
      .and.to.have.length(3);
    next = generator.next({ ok: true });

    // put success with remote metrics
    expect(next).to.have.property('value').and.to.have.property('PUT')
      .and.to.have.property('action')
      .and.to.have.property('type', 'SUCCESS_SYNC_DATA');
    expect(next.value.PUT.action.data).to.eql(mergedMetrics);
    expect(next.value.PUT.action.lastSynced).to.be.a('number');
    expect(generator.next()).to.have.property('done', true);
  });

  it('uploads props if local props are newer', () => {
    const generator = syncData();
    let next = generator.next();

    // fetch authentication state -- authenticated
    next = generator.next(authAuthenticated);

    const localMetricsMock = [
      {
        id: 123,
        lastModified: 1234,
        props: {
          name: 'Metric!',
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
    const downloadMock = {
      ok: true,
      data: [
        {
          id: 123,
          lastModified: 1231,
          props: {
            name: 'old Metric',
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

    // fetch local metrics items -- metrics present
    expect(next, 'must fetch metrics items from store')
      .to.have.property('value')
      .and.to.have.property('SELECT');
    next = generator.next(localMetricsMock);

    // download data file from dropbox -- success
    expect(next, 'must request data file download').to.have.property('value')
      .and.to.have.property('CALL')
      .and.to.have.property('args').and.to.have.length(2);
    expect(next.value.CALL.args[1]).to.be.a('string');
    next = generator.next(downloadMock);

    // update localstorage with metrics with local props
    expect(global.localStorage)
      .to.have.property('metrics').and.to.eql(localMetricsMock);

    // upload updated metrics
    expect(next, 'must request upload').to.have.property('value')
      .and.to.have.property('CALL')
      .and.to.have.property('args').and.to.have.length(3);
    expect(next.value.CALL.args[1]).to.eql(DATA_FILE_PATH);
    expect(next.value.CALL.args[2]).to.be.a('array');
    next = generator.next({ ok: true });

    // put success with remote metrics
    expect(next, 'must put success sync data').to.have.property('value')
      .and.to.have.property('PUT').and.to.have.property('action')
      .and.to.have.property('type', 'SUCCESS_SYNC_DATA');
    expect(next.value.PUT.action)
      .to.have.property('data').and.to.eql(localMetricsMock);
    expect(next.value.PUT.action).to.have.property('lastSynced').and.to.be.a('number');
    expect(generator.next()).to.have.property('done', true);
  });

  it('uses downloaded props if local props are older', () => {
    const generator = syncData();
    let next = generator.next();

    // fetch authentication state -- authenticated
    next = generator.next(authAuthenticated);

    const downloadMock = {
      ok: true,
      data: [
        {
          id: 123,
          lastModified: 1234,
          props: {
            name: 'Metric!',
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
    const localMetricsMock = [
      {
        id: 123,
        lastModified: 1231,
        props: {
          name: 'old Metric',
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

    // fetch local metrics items -- metrics present
    expect(next, 'must fetch metrics items from store')
      .to.have.property('value')
      .and.to.have.property('SELECT');
    next = generator.next(localMetricsMock);

    // download data file from dropbox -- success
    expect(next, 'must request data file download').to.have.property('value')
      .and.to.have.property('CALL')
      .and.to.have.property('args').and.to.have.length(2);
    expect(next.value.CALL.args[1]).to.be.a('string');
    next = generator.next(downloadMock);

    // update localstorage with metrics with downloaded props
    expect(global.localStorage).to.have.property('metrics')
      .and.to.eql(downloadMock.data);

    // upload updated metrics
    expect(next, 'must request upload').to.have.property('value')
      .and.to.have.property('CALL')
      .and.to.have.property('args').and.to.have.length(3);
    expect(next.value.CALL.args[1]).to.eql(DATA_FILE_PATH);
    expect(next.value.CALL.args[2]).to.be.a('array');
    next = generator.next({ ok: true });

    // put success with remote metrics
    expect(next, 'must put success sync data').to.have.property('value')
      .and.to.have.property('PUT').and.to.have.property('action')
      .and.to.have.property('type', 'SUCCESS_SYNC_DATA');
    expect(next.value.PUT.action)
      .to.have.property('data').and.to.eql(downloadMock.data);
    expect(next.value.PUT.action).to.have.property('lastSynced').and.to.be.a('number');
    expect(generator.next()).to.have.property('done', true);
  });

  it('upgrades old remote metrics', () => {
    const generator = syncData();
    let next = generator.next();

    // fetch authentication state -- authenticated
    next = generator.next(authAuthenticated);

    const downloadMock = {
      ok: true,
      data: [
        {
          id: 123,
          name: 'Metric!',
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

    // fetch local metrics items -- no metrics
    expect(next, 'must fetch metrics items from store')
      .to.have.property('value')
      .and.to.have.property('SELECT');
    next = generator.next(localMetricsMock);

    // download data file from dropbox -- success
    expect(next, 'must request data file download').to.have.property('value')
      .and.to.have.property('CALL')
      .and.to.have.property('args').and.to.have.length(2);
    expect(next.value.CALL.args[1]).to.be.a('string');
    next = generator.next(downloadMock);

    // update localstorage with metrics with local props
    expect(global.localStorage, 'must set metrics in localStorage')
      .to.have.property('metrics').and.to.have.length(1);
    expect(global.localStorage.metrics[0])
      .to.have.property('props').and.to.have.property('name', 'Metric!');
    expect(global.localStorage.metrics).to.have.length(1);
    expect(global.localStorage.metrics[0]).to.have.property('lastModified').and.to.be.a('number');

    // upload updated metrics
    expect(next, 'must request upload').to.have.property('value')
      .and.to.have.property('CALL')
      .and.to.have.property('args').and.to.have.length(3);
    expect(next.value.CALL.args[1]).to.eql(DATA_FILE_PATH);
    expect(next.value.CALL.args[2]).to.be.a('array');
    next = generator.next({ ok: true });

    // put success with remote metrics
    expect(next, 'must put success sync data').to.have.property('value')
      .and.to.have.property('PUT').and.to.have.property('action')
      .and.to.have.property('type', 'SUCCESS_SYNC_DATA');
    expect(next.value.PUT.action)
      .to.have.property('data').and.to.have.length(1);
    expect(next.value.PUT.action.data[0]).to.have.property('props');
    expect(next.value.PUT.action.data[0].props)
      .to.have.property('name', 'Metric!');
    expect(next.value.PUT.action.data[0].props)
      .to.have.property('colorGroups').and.to.be.a('array');
    expect(next.value.PUT.action.lastSynced).to.be.a('number');
    expect(generator.next()).to.have.property('done', true);
  });

  describe('error handling', () => {
    it('cancels on download-error, but updates localStorage', () => {
      const generator = syncData();
      let next = generator.next();

      // fetch authentication -- authenticated
      expect(next, 'must SELECT authentication').to.have.property('value')
        .and.to.have.property('SELECT');
      next = generator.next(authAuthenticated);

      // fetch metrics items -- has some metrics
      expect(next, 'must SELECT metrics items').to.have.property('value')
        .and.to.have.property('SELECT');
      next = generator.next(STATE_WITH_SOME_METRICS.metrics.items);

      // attempt data file download -- error
      expect(next, 'must request data file download')
        .to.have.property('value').and.to.have.property('CALL')
        .and.to.have.property('args').and.to.have.length(2);
      next = generator.next({ ok: false, error: 'Error: Download error' });

      // check that local storage is updated
      expect(global.localStorage, 'must still keep localStorage up-to-date')
        .to.have.property('metrics')
        .and.to.eql(STATE_WITH_SOME_METRICS.metrics.items);

      // PUT error
      expect(next, 'must PUT error sync data').to.have.property('value')
        .and.to.have.property('PUT').and.to.have.property('action')
        .and.to.have.property('type', 'ERROR_SYNC_DATA');
    });

    it('cancels on filesUpload error, but updates localStorage', () => {
      const generator = syncData();
      let next = generator.next();

      // fetch authentication -- authenticated
      expect(next, 'must SELECT authentication').to.have.property('value')
        .and.to.have.property('SELECT');
      next = generator.next(authAuthenticated);

      // fetch metrics items -- has some metrics
      expect(next, 'must SELECT metrics items').to.have.property('value')
        .and.to.have.property('SELECT');
      next = generator.next(STATE_WITH_SOME_METRICS.metrics.items);

      // download file -- SUCCESS
      expect(next, 'must request data file download').to.have.property('value')
        .and.to.have.property('CALL')
        .and.to.have.property('args').and.to.have.length(2);
      expect(next.value.CALL.args[1]).to.be.a('string');
      next = generator.next({
        ok: true,
        data: STATE_WITH_SOME_METRICS.metrics.items,
      });

      // upload data -- ERROR
      expect(next, 'must request upload').to.have.property('value')
        .and.to.have.property('CALL')
        .and.to.have.property('args').and.to.have.length(3);
      expect(next.value.CALL.args[1]).to.eql(DATA_FILE_PATH);
      next = generator.next({ ok: false, error: 'Upload error' });

      // check that local storage is updated
      expect(global.localStorage, 'must still keep localStorage up-to-date')
        .to.have.property('metrics')
        .and.to.eql(STATE_WITH_SOME_METRICS.metrics.items);

      // PUT error
      expect(next, 'must PUT error sync data').to.have.property('value')
        .and.to.have.property('PUT').and.to.have.property('action')
        .and.to.have.property('type', 'ERROR_SYNC_DATA');
    });
  });
});

describe('executeConfirmModal', () => {
  let generator;
  let next;
  const modals = [
    {
      title: 'the first modal',
      message: '...',
      actions: {
        confirm: {
          action: { type: 'execute me' },
          label: 'you clicked me',
        },
        cancel: {
          action: { type: 'not this one' },
          label: 'u did not click here',
        },
      },
    },
    {
      title: 'the second modal',
      message: 'this one dosent matter',
      actions: {
        confirm: {
          action: { type: 'some evil action' },
          label: 'don\'t do this one',
        },
        cancel: {
          action: { type: 'other evil action' },
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
    expect(next).to.have.property('value')
      .and.to.have.property('SELECT');
    next = generator.next(modals);
  });

  it('dispatches the confirm action stored in the modal', () => {
    expect(next).to.have.property('value')
      .and.to.have.property('PUT')
      .and.to.have.property('action')
      .and.to.eql(modals[0].actions.confirm.action);
    next = generator.next();
  });

  it('dispatches successConfirmModal', () => {
    expect(next).to.have.property('value')
      .and.to.have.property('PUT')
      .and.to.have.property('action')
      .and.to.eql({ type: 'SUCCESS_CONFIRM_MODAL' });
    next = generator.next();
  });
});

describe('executeCancelModal', () => {
  let generator;
  let next;
  const modals = [
    {
      title: 'the first modal',
      message: '...',
      actions: {
        confirm: {
          action: { type: 'not this one' },
          label: 'u did not click here',
        },
        cancel: {
          action: { type: 'execute me' },
          label: 'you clicked me',
        },
      },
    },
    {
      title: 'the second modal',
      message: 'this one dosent matter',
      actions: {
        confirm: {
          action: { type: 'some evil action' },
          label: 'don\'t do this one',
        },
        cancel: {
          action: { type: 'other evil action' },
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
    expect(next).to.have.property('value')
      .and.to.have.property('SELECT');
    next = generator.next(modals);
  });

  it('dispatches the cancel action stored in the modal', () => {
    expect(next).to.have.property('value')
      .and.to.have.property('PUT')
      .and.to.have.property('action')
      .and.to.eql(modals[0].actions.cancel.action);
    next = generator.next();
  });

  it('dispatches successCancelModal', () => {
    expect(next).to.have.property('value')
      .and.to.have.property('PUT')
      .and.to.have.property('action')
      .and.to.eql({ type: 'SUCCESS_CANCEL_MODAL' });
    next = generator.next();
  });
});

describe('executeLogout', () => {
  it('deletes the accessToken from localStorage', () => {
    const generator = executeLogout();
    generator.next();

    expect(global.localStorage).not.to.have.property('accessToken');
    expect(generator.next()).to.have.property('done', true);
  });

  it('PUTs success logout action', () => {
    const generator = executeLogout();
    const next = generator.next();

    expect(next).to.have.property('value')
      .and.to.have.property('PUT')
      .and.to.have.property('action')
      .and.to.have.property('type', 'SUCCESS_LOGOUT');
    expect(generator.next()).to.have.property('done', true);
  });
});
