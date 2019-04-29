import { AllChangedListener } from '../src/ng-changes-listener'
import {
  SimpleChange,
  SimpleChanges,
} from '@angular/core';

class Test {
  props1: number = 0;
  props2: number = 0;
  props1Changed = false;
  props2Changed = false;

  @AllChangedListener(['props1']) testProps1Changed() {
    this.props1Changed = true;
  }

  @AllChangedListener(['props1', 'props2']) testProps1Ang2Changed() {
    this.props1Changed = true;
    this.props2Changed = true;
  }

  @AllChangedListener(['props1', 'props2']) testProps1Ang2EmitterChanged = {
    emit: (changed: any) => {
      this.props1 = changed.props1;
      this.props2 = changed.props2;
      this.props1Changed = true;
      this.props2Changed = true;
    }
  }
}

const callNgOnChanges = (host: any, changes: SimpleChanges) => host.ngOnChanges(changes);

describe("AllChangedListener", () => {
  it("works with one input if something change", () => {
    const test = new Test();
    expect('ngOnChanges' in test).toBeTruthy();
    callNgOnChanges(test, {
      props1: {
        currentValue: 1,
      } as SimpleChange,
    });
    expect(test.props1Changed).toBeTruthy();
  });
  it("not works if nothing change", () => {
    const test = new Test();
    expect('ngOnChanges' in test).toBeTruthy();
    callNgOnChanges(test, {
    });
    expect(test.props1Changed).toBeFalsy();
    expect(test.props2Changed).toBeFalsy();
  });
  it("works with multiple inputs nothing change", () => {
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
    expect(test.props1Changed).toBeTruthy();
    expect(test.props2Changed).toBeTruthy();
  });
  it("works with emitter", () => {
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
})
