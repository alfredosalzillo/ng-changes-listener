import {
  SimpleChange,
  SimpleChanges,
} from '@angular/core';

interface Emitter<T = any> {
  emit(value: T): void;
}
const isEmitter = <T = any>(value: any): value is Emitter<T> => 'emit' in value;

const ChangesListeners = Symbol('ChangesListeners');

export type ChangeListenerFn = (this: any, change: SimpleChanges) => void;
export type ChangesPredicate = (inputs: string[], changes: SimpleChanges) => boolean;
export type ChangesListenerHost = {
  ngOnChanges?(changes: SimpleChanges): void,
  [ChangesListeners]: ChangeListenerFn[],
  [key: string]: any,
};
export const ChangesListener = (inputs: string[], changed: ChangesPredicate) => (
  target: any,
  propertyKey: string,
  descriptor?: PropertyDescriptor,
) => {
  if (!target[ChangesListeners]) {
    target[ChangesListeners] = [];
    const oriOnChanges = target.ngOnChanges;
    target.ngOnChanges = function(this: ChangesListenerHost, changes: SimpleChanges) {
      if (oriOnChanges) oriOnChanges.call(this, changes);
      this[ChangesListeners].forEach(listener => listener.call(this, changes));
    }
  }
  target[ChangesListeners].push(function (this: ChangesListenerHost, changes: SimpleChanges) {
    if (changed(inputs, changes)) {
      const listener = this[propertyKey];
      const inputsChanged = inputs.filter(input => input in changes);
      if (isEmitter(listener)) {
        listener.emit(Object.assign({}, ...inputs
          .map(input => ({
            [input]: changes[input] && changes[input].currentValue
          }))));
      }
      if (typeof listener === 'function') {
        listener.call(this, inputsChanged.map(input => changes[input]))
      }
    }
  });
};

const allChanged = (inputs: string[], changes: SimpleChanges) => inputs
  .every(input => input in changes);
export const AllChangedListener = (inputs: string[]) => ChangesListener(inputs, allChanged);
