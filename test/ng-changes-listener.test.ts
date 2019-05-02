import { EventEmitter, SimpleChange, SimpleChanges } from '@angular/core';
import { ChangeListener, ListenerData } from '../src/ng-changes-listener';
import { tap } from 'rxjs/operators';

class Test {
  props1 = 0;
  props2 = 0;
  change: any = null;

  constructor() {
    this.testProps1And2EmitterChanged
      .pipe(
        tap(props2 => {
          this.props2 = props2;
        })
      )
      .subscribe();
  }

  @ChangeListener('props1')
  testProps1Changed(props1: number) {
    this.props1 = props1;
  }

  @ChangeListener('props1')
  testProps1ChangedSimpleChange(change: SimpleChange) {
    this.change = change;
  }

  @ChangeListener('props2')
  testProps1And2EmitterChanged = new EventEmitter<number>();
}

class TestWithNgOnChanges {
  props0 = 0;
  props1 = 0;

  ngOnChanges() {
    this.props0 = 1;
  }

  @ChangeListener('props1')
  testProps1Changed(props1: number) {
    console.log(props1);
    this.props1 = props1;
  }
}
class TestWithException {
  props1 = 0;

  @ChangeListener('props1')
  testProps1Changed: number = 0;
}

const callNgOnChanges = (host: any, changes: SimpleChanges) => host.ngOnChanges(changes);

describe('ChangeListener', () => {
  it('works with one input if something change', () => {
    const test = new Test();
    expect('ngOnChanges' in test).toBeTruthy();
    callNgOnChanges(test, {
      props1: {
        currentValue: 1
      } as SimpleChange
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
  it('will pass the SimpleChange if is a type of the parameters', () => {
    const test = new Test();
    expect('ngOnChanges' in test).toBeTruthy();
    const changes = {
      props1: {
        currentValue: 1
      } as SimpleChange
    };
    callNgOnChanges(test, changes);
    expect(test.change).toBe(changes.props1);
  });
  it('works with emitter', () => {
    const test = new Test();
    expect('ngOnChanges' in test).toBeTruthy();
    callNgOnChanges(test, {
      props2: {
        currentValue: 1
      } as SimpleChange
    });
    expect(test.props2).toBe(1);
  });
  it('execute the original ngOnChanges', () => {
    const test = new TestWithNgOnChanges();
    expect('ngOnChanges' in test).toBeTruthy();
    callNgOnChanges(test, {
      props1: {
        currentValue: 1
      } as SimpleChange
    });
    expect(test.props0).toBe(1);
    expect(test.props1).toBe(1);
  });
  it('throw Error if listener is neither a Function or an EventEmitter', () => {
    const test = new TestWithException();
    expect('ngOnChanges' in test).toBeTruthy();
    expect(() =>
      callNgOnChanges(test, {
        props1: {
          currentValue: 1
        } as SimpleChange
      })
    ).toThrowError();
  });
});
