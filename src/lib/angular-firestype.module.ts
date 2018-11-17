import { ModuleWithProviders, NgModule } from '@angular/core';
import { EnablePersistenceToken } from '@angular/fire/firestore';

import { AngularFirestype } from './angular-firestype.service';
import { ModelToken } from './model-token';
import { ValueType } from './value/value-type';
import { ObjectOf } from './utils/object-of';

/**
 * Typed AngularFirestore. Needs to be initialiazed with AngularFirestypeModule.forRoot(value)
 * where value is an object of ValueType to properly process type handling.
 */
@NgModule({
  providers: [
    AngularFirestype
  ]
})
export class AngularFirestypeModule {
  /**
   * Initialize AngularFirestype with the provided model.
   * Optionnaly enable persistance if second parameter is true.
   */
  static forRoot(model: ObjectOf<ValueType<any>>, enablePersistence: boolean = false): ModuleWithProviders {
    return {
      ngModule: AngularFirestypeModule,
      providers: [
        { provide: ModelToken, useValue: model },
        { provide: EnablePersistenceToken, useValue: enablePersistence }
      ]
    };
  }
}
