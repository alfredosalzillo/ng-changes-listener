import { EventEmitter, SimpleChange, SimpleChanges } from '@angular/core';
import { ChangeListener, ListenerData } from '../src/ng-changes-listener';
import { tap } from 'rxjs/operators';

class Test {
  props1 = 0;
  props2 = 0;
  props3 = 0;
  props4 = 0;
  props5 = 0;
  changes: any = null;

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

  @ChangeListener('props5')
  testProps5SingleChanged(props5: number) {
    this.props5 = props5;
  }

  @ChangeListener(['props1', 'props2'])
  testProps1And2Changed([props1, props2]: number[], data: ListenerData) {
    this.props1 = props1;
    this.props2 = props2;
    this.changes = data.changes;
  }

  @ChangeListener(['props3', 'props4'])
  testProps1And2EmitterChanged = new EventEmitter<[number, number]>();
}

class TestWithNgOnChanges {
  props0 = 0;
  props1 = 0;

  ngOnChanges() {
    this.props0 = 1;
  }

  @ChangeListener(['props1'])
  testProps1Changed([props1]: number[]) {
    this.props1 = props1;
  }
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
    expect(test.props1).toBe(1);
    expect(test.props2).toBe(2);
  });
  it('will pass ListenerData if is a type of the parameters', () => {
    const test = new Test();
    expect('ngOnChanges' in test).toBeTruthy();
    const changes = {
      props1: {
        currentValue: 1,
      } as SimpleChange,
      props2: {
        currentValue: 2,
      } as SimpleChange,
    };
    callNgOnChanges(test, changes);
    expect(test.changes).toBe(changes);
  });
  it('if no array of inputs, pass no array but single value', () => {
    const test = new Test();
    expect('ngOnChanges' in test).toBeTruthy();
    callNgOnChanges(test, {
      props5: {
        currentValue: 5,
      } as SimpleChange,
    });
    expect(test.props5).toBe(5);
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
  it('execute the original ngOnChanges', () => {
    const test = new TestWithNgOnChanges();
    expect('ngOnChanges' in test).toBeTruthy();
    callNgOnChanges(test, {
      props1: {
        currentValue: 1,
      } as SimpleChange,
    });
    expect(test.props0).toBe(1);
    expect(test.props1).toBe(1);
  });
});
