import { NgModule, InjectionToken } from '@angular/core';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import 'rxjs/add/operator/first';

import { AngularFirestype } from './angular-firestype.service';
import { Collection } from './collection/collection';
import { Document } from './document/document';
import { ModelType } from './model/model-type';

/** Descriptors map taken as module parameter */
export let descriptors: {[key: string]: ModelType<any>} = {};

@NgModule({
  imports: [
    AngularFirestoreModule
  ],
  providers: [
    AngularFirestype
  ]
})
export class AngularFirestypeModule {
  static forRoot(model: {[key: string]: ModelType<any>} = {}) {
    descriptors = model;
    return {ngModule: AngularFirestypeModule};
  }
}
