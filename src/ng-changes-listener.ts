import { SimpleChanges, EventEmitter } from '@angular/core';
import 'reflect-metadata';

type ChangeListenerFn = (this: Object, change: SimpleChanges) => void;
type ChangesPredicate = (changes: SimpleChanges) => boolean;

export class ListenerData {
  constructor(public changes: SimpleChanges) {}
}

const isEventEmitter = <T = any>(value: any): value is EventEmitter<T> => 'emit' in value;

const changesListenersKey = Symbol('changes-listeners');
const getChangesListeners = (target: Object) =>
  Reflect.getMetadata(changesListenersKey, target) as Function[];
const defineChangesListeners = (target: Object) =>
  Reflect.defineMetadata(changesListenersKey, [], target);
const pushChangesListeners = (target: Object, value: Function) =>
  getChangesListeners(target).push(value);

const ngOnChanges = function (this: Object, changes: SimpleChanges) {
  getChangesListeners(this).forEach((listener: Function) => listener.call(this, changes));
};
const action = (operation: (host: Object, changes: SimpleChanges) => void): ChangeListenerFn =>
  function (this: object, changes: SimpleChanges) {
    operation(this, changes);
  };

/**
 * General Decorator Generator
 * */
const NgChangesListener = (
  isChanged: ChangesPredicate,
  transform: (changes: SimpleChanges) => any,
): PropertyDecorator => (target: any, propertyKey: string | symbol) => {
  if (!Reflect.hasOwnMetadata(changesListenersKey, target)) {
    defineChangesListeners(target);
    if ('ngOnChanges' in target) {
      pushChangesListeners(target, target.ngOnChanges);
    }
    Object.defineProperty(target, 'ngOnChanges', {
      value: ngOnChanges,
    });
  }
  const Type = Reflect.getMetadata('design:type', target, propertyKey);
  pushChangesListeners(
    target,
    action((host, changes) => {
      const listener = Reflect.get(host, propertyKey);
      if (!isChanged(changes)) {
        return;
      }
      // can't use only Type === EventEmitter for a know bug
      // https://github.com/Microsoft/TypeScript/issues/18995
      if (Type === EventEmitter || isEventEmitter(listener)) {
        return listener.emit(transform(changes));
      }
      if (Type === Function) {
        const parametersType: any[] = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        return listener.call(
          host,
          ...parametersType.map((paramType) => {
            if (paramType === ListenerData) {
              return new ListenerData(changes);
            }
            return transform(changes);
          }),
        );
      }
      throw new Error(`${propertyKey.toString()} is neither an EventEmitter or a Function`);
    }),
  );
};

const flatten = <T>(arr: T[] | T) => ([] as T[]).concat(arr);
const everyChanged = <C, S = keyof C>(inputs: S[]) => (changes: SimpleChanges) =>
  inputs.every(input => typeof input === 'string' && input in changes);
const currentValues = <C, S = keyof C>(inputs: S[]) => (changes: SimpleChanges) =>
  inputs.map(input => typeof input === 'string' && changes[input] && changes[input].currentValue);
const singleValue = <C, S = keyof C>(input: S) => (changes: SimpleChanges) =>
  typeof input === 'string' && changes[input] && changes[input].currentValue;

/**
 * ChangeListener decorator Generator
 * add the method or the EventEmitter as listener to ngOnChanges lifecycle
 * @param inputs the properties or array of properties how trigger the changes
 * */
export const ChangeListener = <C, S = keyof C>(inputs: S | S[]) =>
  NgChangesListener(
    everyChanged<C, S>(flatten<S>(inputs)),
    typeof inputs === 'string' ? singleValue(inputs) : currentValues<C, S>(flatten<S>(inputs)),
  );
