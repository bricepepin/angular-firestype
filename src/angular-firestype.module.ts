import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { EnablePersistenceToken } from 'angularfire2/firestore';
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
  /**
   * Initialize AngularFirestype with the model description.
   * Optionnaly enable persistance if second parameter is true.
   */
  static forRoot(model: {[key: string]: ModelType<any>}, enablePersistence: boolean = false): ModuleWithProviders {
    ModelTransformer.setDescriptors(model);

    return {
      ngModule: AngularFirestypeModule,
      providers: [
        { provide: EnablePersistenceToken, useValue: enablePersistence },
      ]
    };
  }
}
