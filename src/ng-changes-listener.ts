import { SimpleChange, SimpleChanges, EventEmitter } from '@angular/core';

const isEventEmitter = <T = any>(value: any): value is EventEmitter<T> => 'emit' in value;

const ChangesListeners = Symbol('ChangesListeners');

export type ChangeListenerFn = (this: any, change: SimpleChanges) => void;
export type ChangesPredicate = (changes: SimpleChanges) => boolean;
export type ChangesListenerHost = {
  ngOnChanges?(changes: SimpleChanges): void
  [ChangesListeners]: ChangeListenerFn[]
  [key: string]: any,
};
const isChangesListenerHost = (value: any) : value is ChangesListenerHost => (
  'ngOnChanges' in value
  && ChangesListeners in value
);

const ngOnChanges = (ngOnChanges: Function) => function (
  this: ChangesListenerHost, changes: SimpleChanges,
) {
  if (ngOnChanges) ngOnChanges.call(this, changes);
  this[ChangesListeners].forEach(listener => listener.call(this, changes));
};
const action = (
  operation: (host: ChangesListenerHost, changes: SimpleChanges) => void,
) => function (
  this: ChangesListenerHost, changes: SimpleChanges,
) { operation(this, changes); };

export const ChangesListener = <T>(
  isChanged: ChangesPredicate,
  transform: (changes: SimpleChanges) => T,
) => (
  target: any,
  propertyKey: string,
) => {
  if (!isChangesListenerHost(target)) {
    target[ChangesListeners] = [];
    target.ngOnChanges = ngOnChanges(target.ngOnChanges);
  }
  target[ChangesListeners].push(action(((host, changes) => {
    const listener = host[propertyKey];
    if (!isChanged(changes)) {
      return;
    }
    if (isEventEmitter(listener)) {
      return listener.emit(transform(changes));
    }
    if (typeof listener === 'function') {
      return listener.call(host, transform(changes));
    }
  })));
};

const flatten = <T>(arr: T[] | T) => ([] as T[]).concat(arr);
const currentValues = (inputs: string[]) => (changes: SimpleChanges) => inputs
  .map(input => changes[input] && changes[input].currentValue);
const everyChanged = (inputs: string[]) => (changes: SimpleChanges) =>
  inputs.every(input => input in changes);

export const ChangeListener = (inputs: string | string[]) => ChangesListener(
  everyChanged(flatten(inputs)),
  currentValues(flatten(inputs)),
);
