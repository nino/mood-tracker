import { expect } from 'chai';
import {
  syncData,
  checkLogin,
} from './sagas';
import {
  INITIAL_STATE,
  STATE_WITH_SOME_METRICS,
} from '../test/SampleApplicationStates';
import {
  MoodWithEntries,
  MoodWithoutEntries,
  BurnsWithoutEntries,
  BurnsWithEntries,
} from '../test/SampleMetrics';
import { DATA_FILE_PATH } from './constants';
import { areMetricsUpgraded, isValidMetricsArray } from './lib';
import Dropbox from 'dropbox';
import { getAuthentication, getMetricsItems } from './selectors';

const authAuthenticated = {
  isAuthenticated: true,
  isAuthenticating: false,
  accessToken: 'yup',
};

const dropboxError = {
  status: 400,
  error: 'There is an error',
  response: {},
};

describe('check login saga', () => {
  it('uses the accessToken from localStorage to authenticate', () => {
    global.localStorage = { accessToken: 'abc' };
    const generator = checkLogin();
    let next = generator.next();
    expect(next.value).to.have.property('PUT').and.to.have.property('action')
      .and.to.have.property('type', 'success check login');
    expect(next.value.PUT.action).to.have.property('accessToken', 'abc');
    expect(generator.next()).to.have.property('done', true);
  });

  it('uses the accessToken from location hash to authenticate', () => {
    global.localStorage = { };
    global.window.location.hash = '#access_token=abc2';
    const generator = checkLogin();
    let next = generator.next();
    expect(next.value).to.have.property('PUT').and.to.have.property('action')
      .and.to.have.property('type', 'success check login');
    expect(next.value.PUT.action).to.have.property('accessToken', 'abc2');
    expect(generator.next()).to.have.property('done', true);
  });

  it('prefers location hash over local accessToken', () => {
    global.localStorage = { accessToken: 'abcLocal' };
    global.window.location.hash = '#access_token=abcHash';
    const generator = checkLogin();
    let next = generator.next();
    expect(next.value).to.have.property('PUT').and.to.have.property('action')
      .and.to.have.property('type', 'success check login');
    expect(next.value.PUT.action).to.have.property('accessToken', 'abcHash');
    expect(generator.next()).to.have.property('done', true);
  });

  it('fails if no token is found in localStorage or location hash', () => {
    global.localStorage = {};
    global.window.location.hash = null;
    const generator = checkLogin();
    let next = generator.next();
    expect(next.value).to.have.property('PUT').and.to.have.property('action')
      .and.to.have.property('type', 'error check login');
    expect(generator.next()).to.have.property('done', true);
  });
});
