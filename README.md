# ng-changes-listeners
[![Build Status](https://travis-ci.org/alfredosalzillo/ng-changes-listener.svg?branch=master)](https://travis-ci.org/alfredosalzillo/ng-changes-listener)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Add NgOnChanges listener using method and property decorator.

## Why?

As today to listen to changes why need to implement `ngOnChanges`
or create setter and private variables method and lines of code
for every `@Input()` we wont to do stuff on changes.

Without **ng-changes-listeners**:
```typescript
  import { Component, OnChanges, SimpleChanges, Input } from '@angular/core';
  
  @Component({
    selector: 'my-fancy-component',
    template: `
      <div>Awesome</div>
    `,
    styles: [],
  })
  class MyFancyComponent implements OnChanges {
    @Input() props1: number;
    @Input() props2: number;
    
    ngOnChanges(changes: SimpleChanges) {
      if ('props1' in changes) {
        console.log(`props1 changed: ${changes['props1'].currentValue}`);
      }
      if ('props2' in changes) {
        console.log(`props2 changed: ${changes['props2'].currentValue}`);
      }
      if ('props1' in changes && 'props2' in changes) {
        console.log(`props1 and props2 changed: ${changes['props1'].currentValue} ${changes['props2'].currentValue}`);
      }
    }
  }
```

With **ng-changes-listeners**:
```typescript
  import { Component, Input } from '@angular/core';
  import { ChangeListener } from 'ng-changes-listeners';
  
  @Component({
    selector: 'my-fancy-component',
    template: `
      <div>Awesome</div>
    `,
    styles: [],
  })
  class MyFancyComponent {
    @Input() props1: number;
    @Input() props2: number;
    
    @ChangeListener('props1') props1Changed(props1: number) {
      console.log(`props1 changed: ${props1}`);
    }
    
    @ChangeListener('props2') props1Changed(props2: number) {
      console.log(`props2 changed: ${props2}`);
    }
    
    @ChangeListener(['props1', 'props2']) props1Changed([props1, props2]) {
      console.log(`props1 and props2 changed: ${props1} ${props2}`);
    }
  }
```

## Install

Install via npm or yarn.

```bash
  npm install --save ng-changes-listener
  yarn add ng-changes-listener
```
