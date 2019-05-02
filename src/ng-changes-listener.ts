import { SimpleChanges, EventEmitter, SimpleChange } from '@angular/core';
import 'reflect-metadata';

type StringKeyOf<C> = Extract<keyof C, string>;
type ChangeListenerFn = (this: Object, change: SimpleChanges) => void;

const isEventEmitter = <T = any>(value: any): value is EventEmitter<T> =>
  'emit' in value;

const changesListenersKey = Symbol('changes-listeners');
const getChangesListeners = (target: Object) =>
  Reflect.getMetadata(changesListenersKey, target) as Function[];
const defineChangesListeners = (target: Object) =>
  Reflect.defineMetadata(changesListenersKey, [], target);
const pushChangesListeners = (target: Object, value: Function) =>
  getChangesListeners(target).push(value);

const ngOnChanges = function (this: Object, changes: SimpleChanges) {
  getChangesListeners(this).forEach((listener: Function) =>
    listener.call(this, changes),
  );
};
const action = (
  operation: (host: Object, changes: SimpleChanges) => void,
): ChangeListenerFn =>
  function (this: object, changes: SimpleChanges) {
    operation(this, changes);
  };

/**
 * ChangeListener decorator Generator
 * add the method or the EventEmitter as listener to ngOnChanges lifecycle
 * @param input the properties to listen changes
 * */
export const ChangeListener = <C>(input: StringKeyOf<C>): PropertyDecorator => (
  target: any,
  propertyKey: string | symbol,
) => {
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
      if (!(input in changes)) {
        return;
      }
      const listener = Reflect.get(host, propertyKey);
      // can't use only Type === EventEmitter for a know bug
      // https://github.com/Microsoft/TypeScript/issues/18995
      if (Type === EventEmitter || isEventEmitter(listener)) {
        return listener.emit(changes[input].currentValue);
      }
      if (Type === Function) {
        const parametersType: any[] = Reflect.getMetadata(
          'design:paramtypes',
          target,
          propertyKey,
        );
        return listener.call(
          host,
          ...parametersType.map(paramType => {
            if (paramType === SimpleChange) {
              return changes[input];
            }
            return changes[input].currentValue;
          }),
        );
      }
      throw new Error(
        `${propertyKey.toString()} is neither an EventEmitter or a Function`,
      );
    }),
  );
};
