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
    
    @ChangeListener('props2') props2Changed(props2: number) {
      console.log(`props2 changed: ${props2}`);
    }
    
    @ChangeListener(['props1', 'props2']) props1And2Changed([props1, props2]) {
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

This library use [reflect-metadata](https://github.com/rbuckton/reflect-metadata) so `emitDecoratorMetadata`
in `tsconfig.json` must be `true`.

## Usage

This library expose the `ChangeListener` decorator generator.

`ChangeListener` accept a name or an array of properties name.
If the property or the properties all changes call the decorated method or emit the `EventEmitter`.

```typescript
  import { Component, Input, EventEmitter } from '@angular/core';
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
    
    /// `props1Changed` will be called when props1 change
    /// to props1Changed will be passed only the props1 currentValue
    @ChangeListener('props1') props1Changed(props1: number) {
      console.log(`props1 changed: ${props1}`);
    }
    
    /// `props2Change` will emit the props1 currentValue 
    @ChangeListener('props2') props2Change = new EventEmitter<number>()
    
    /// `props1And2Changed` will be called when props1 and prop2 both change at the same time
    /// to props1And2Changed will be passed an array of the props1 and props2 currentValue
    @ChangeListener(['props1', 'props2']) props1And2Changed([props1, props2]) {
      console.log(`props1 and props2 changed: ${props1} ${props2}`);
    }
  }
```
