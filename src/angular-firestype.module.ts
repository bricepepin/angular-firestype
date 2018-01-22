import { NgModule, InjectionToken } from '@angular/core';
import 'rxjs/add/operator/first';

import { AngularFirestype } from './angular-firestype.service';
import { Collection } from './collection/collection';
import { Document } from './document/document';
import { ModelType } from './model/model-type';

/** Descriptors map */
export const Descriptors = new InjectionToken<{[key: string]: ModelType<any>}>('AngularFirestypeDescriptors');

@NgModule({
  providers: [
    AngularFirestype
  ]
})
export class AngularFirestypeModule {
  static forRoot(descriptors: {[key: string]: ModelType<any>} = {}) {
    return {
      ngModule: AngularFirestypeModule,
      providers: [
        { provide: Descriptors, useValue: descriptors }
      ]
    };
  }
}
