import { NgModule, InjectionToken } from '@angular/core';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import 'rxjs/add/operator/first';

import { AngularFirestype } from './angular-firestype.service';
import { Collection } from './collection/collection';
import { Document } from './document/document';
import { ModelTransformer } from './model/model-transformer';
import { ModelType } from './model/model-type';

/**
 * Typed AngularFirestore. Needs to be initialiazed with AngularFirestypeModule.forRoot(model)
 * where model is an object of ModelType to properly process type handling.
 */
@NgModule({
  imports: [
    AngularFirestoreModule
  ],
  providers: [
    AngularFirestype
  ]
})
export class AngularFirestypeModule {
  static forRoot(model: {[key: string]: ModelType<any>}) {
    ModelTransformer.setDescriptors(model);
    return {ngModule: AngularFirestypeModule};
  }
}
