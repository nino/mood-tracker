import * as IOEffects from 'redux-saga/effects';

export function* select(...args) {
  return yield IOEffects.select(...args);
}

export function* put(...args) {
  return yield IOEffects.put(...args);
}

export function* call(...args) {
  return yield IOEffects.call(...args);
}

export function* cps(...args) {
  return yield IOEffects.cps(...args);
}

export function* fork(...args) {
  return yield IOEffects.fork(...args);
}

export function* cancelled() {
  return yield IOEffects.cancelled();
}
