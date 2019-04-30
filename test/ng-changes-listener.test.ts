import { EventEmitter, SimpleChange, SimpleChanges } from '@angular/core';
import { ChangeListener } from '../src/ng-changes-listener';
import { tap } from 'rxjs/operators';

class Test {
  props1 = 0;
  props2 = 0;
  props3 = 0;
  props4 = 0;

  constructor() {
    this.testProps1And2EmitterChanged
      .pipe(
        tap(([props3, props4]) => {
          this.props3 = props3;
          this.props4 = props4;
        }),
      )
      .subscribe();
  }

  @ChangeListener(['props1'])
  testProps1Changed([props1]: number[]) {
    this.props1 = props1;
  }

  @ChangeListener(['props1', 'props2'])
  testProps1And2Changed([props1, props2]: number[]) {
    this.props1 = props1;
    this.props2 = props2;
  }

  @ChangeListener(['props3', 'props4'])
  testProps1And2EmitterChanged = new EventEmitter<[number, number]>();
}

const callNgOnChanges = (host: any, changes: SimpleChanges) => host.ngOnChanges(changes);

describe('ChangeListener', () => {
  it('works with one input if something change', () => {
    const test = new Test();
    expect('ngOnChanges' in test).toBeTruthy();
    callNgOnChanges(test, {
      props1: {
        currentValue: 1,
      } as SimpleChange,
    });
    expect(test.props1).toBe(1);
  });
  it('not works if nothing change', () => {
    const test = new Test();
    expect('ngOnChanges' in test).toBeTruthy();
    callNgOnChanges(test, {});
    expect(test.props1).toBe(0);
    expect(test.props2).toBe(0);
  });
  it('works with multiple inputs nothing change', () => {
    const test = new Test();
    expect('ngOnChanges' in test).toBeTruthy();
    callNgOnChanges(test, {
      props1: {
        currentValue: 1,
      } as SimpleChange,
      props2: {
        currentValue: 2,
      } as SimpleChange,
    });
    console.log(test);
    expect(test.props1).toBe(1);
    expect(test.props2).toBe(2);
  });
  it('works with emitter', () => {
    const test = new Test();
    expect('ngOnChanges' in test).toBeTruthy();
    callNgOnChanges(test, {
      props3: {
        currentValue: 1,
      } as SimpleChange,
      props4: {
        currentValue: 2,
      } as SimpleChange,
    });
    expect(test.props3).toBe(1);
    expect(test.props4).toBe(2);
  });
});
