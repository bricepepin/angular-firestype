import { DocumentChangeAction as ADocumentChangeAction } from '@angular/fire/firestore';
import { Document } from '../document/document';
import { DocumentChangeAction } from '../document/document-change-action';
import { AngularFirestype } from '../angular-firestype.service';
import { ValueTransformer } from '../value/value-transformer';

export class CollectionUtils {
  /**
   * Cast generic actions to typed ones
   * @param actions : array of actions to cast
   * @param db : instance of database to use
   * @param transformer : transformer to use
   */
  static typeActions<T>(actions: ADocumentChangeAction<T>[], db: AngularFirestype, transformer: ValueTransformer<T>)
      : DocumentChangeAction<T>[] {
    actions.forEach(action => Document.fromSnapshot<T>(action.payload.doc, db, transformer));
    return actions as DocumentChangeAction<T>[];
  }
}
