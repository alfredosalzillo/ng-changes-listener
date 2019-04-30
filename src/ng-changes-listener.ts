import { SimpleChanges, EventEmitter } from '@angular/core';

const isEventEmitter = <T = any>(value: any): value is EventEmitter<T> => 'emit' in value;

const ChangesListenersSymbol = Symbol('ChangesListeners');

export type ChangeListenerFn = (this: any, change: SimpleChanges) => void;
export type ChangesPredicate = (changes: SimpleChanges) => boolean;
export type ChangesListenerHost<T = any, S = keyof T> = {
  ngOnChanges?(changes: SimpleChanges): void,
  [ChangesListenersSymbol]: ChangeListenerFn[],
  [P: string]: any,
};
const isChangesListenerHost = (value: any) : value is ChangesListenerHost => (
  'ngOnChanges' in value
  && ChangesListenersSymbol in value
);

const ngOnChanges = (ngOnChanges: Function) => function (
  this: ChangesListenerHost, changes: SimpleChanges,
) {
  if (ngOnChanges) ngOnChanges.call(this, changes);
  this[ChangesListenersSymbol].forEach(listener => listener.call(this, changes));
};
const action = (
  operation: (host: ChangesListenerHost, changes: SimpleChanges) => void,
) => function (
  this: ChangesListenerHost, changes: SimpleChanges,
) { operation(this, changes); };

export const ChangesListener = (
  isChanged: ChangesPredicate,
  transform: (changes: SimpleChanges) => any,
): PropertyDecorator => (
  target: any,
  propertyKey: string | symbol,
) => {
  if (!isChangesListenerHost(target)) {
    Object.defineProperty(target, ChangesListenersSymbol, {
      value: [],
    });
    Object.defineProperty(target, 'ngOnChanges', {
      value: ngOnChanges(target.ngOnChanges),
    });
  }
  target[ChangesListenersSymbol].push(action(((host, changes) => {
    if (typeof propertyKey !== 'string') {
      // TODO lanch exception or FIX
      return;
    }
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
const currentValues = <C, S = keyof C>(inputs: S[]) => (changes: SimpleChanges) => inputs
  .map(input => typeof input === 'string' && changes[input] && changes[input].currentValue);
const everyChanged = <C, S = keyof C>(inputs: S[]) => (changes: SimpleChanges) =>
  inputs.every(input => typeof input === 'string' && input in changes);

export const ChangeListener = <C, S = keyof C>(inputs: S | S[]) => ChangesListener(
  everyChanged<C, S>(flatten<S>(inputs)),
  currentValues<C, S>(flatten<S>(inputs)),
);
