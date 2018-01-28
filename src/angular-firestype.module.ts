import { NgModule } from '@angular/core';
import 'rxjs/add/operator/first';

import { AngularFirestype } from './angular-firestype.service';
import { ModelTransformer } from './model/model-transformer';
import { ModelType } from './model/model-type';

/**
 * Typed AngularFirestore. Needs to be initialiazed with AngularFirestypeModule.forRoot(model)
 * where model is an object of ModelType to properly process type handling.
 */
@NgModule({
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
