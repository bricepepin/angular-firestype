import { ModuleWithProviders, NgModule } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import 'rxjs/add/operator/first';

import { EnablePersistenceToken } from './enable-persistence-token';
import { AngularFirestype } from './angular-firestype.service';
import { ModelToken } from './model/model-token';
import { ModelType } from './model/model-type';
import { ObjectOf } from './object-of';

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
  static forRoot(model: ObjectOf<ModelType<any>>, enablePersistence: boolean = false): ModuleWithProviders {
    return {
      ngModule: AngularFirestypeModule,
      providers: [
        { provide: ModelToken, useValue: model },
        { provide: EnablePersistenceToken, useValue: enablePersistence }
      ]
    };
  }
}
