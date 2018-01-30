 # AngularFirestype
Type handling for AngularFirestore

This module extends AngularFirestore with type handling.
Using a mapping object, it can add custom objects and get instanciated data from Firestore without additional steps.

## Install
```bash
npm install angular-firestype --save
```

## Use
### Module initialization
Import the module in your app after AngularFireModule :
```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestypeModule, ModelType } from 'angular-firestype';
import { environment } from '../environments/environment';

import { User } from './user.ts';
import { Address } from './address.ts';
import { Message } from './message.ts';

/**
 * Definition of the app model mapping.
 * For more information, see part #mapping-object below.
 */
const model: {[key: string]: ModelType<any>} = {
  users: {
    type: User,
    arguments: ['username', 'image'],
    structure: {
      adress: Address
    },
    subcollections: {
      messages: Message
    }
  }
};

@NgModule({
 imports: [
   AngularFireModule.initializeApp(environment.firebase),
   AngularFireAuthModule,
   AngularFirestypeModule.forRoot(model),          // Import AngularFirestypeModule using forRoot() method to add mapping information
 ],
 declarations: [ AppComponent ],
 bootstrap: [ AppComponent ]
})
export class AppModule {}
```
"model" is a mapping object representing your app model structure.
AngularFirestypeModule should replace your AngularFirestoreModule if you have one imported.

### Service injection and data manipulation
Then just inject service AngularFirestype and use it to get and set data to Firestore :
```ts
import { Component } from '@angular/core';
import { AngularFirestype, Collection, Document } from 'angular-firestype';

import { User } from './user.ts';

@Component({
 selector: 'app-root',
 templateUrl: 'app.component.html',
 styleUrls: ['app.component.css']
})
export class AppComponent {
   constructor(db: AngularFirestype) {
       const usersCollection: Collection<User> = db.collection<User>('users');
       const users: Observable<User[]>  = usersCollection.valueChanges();

       const userDoc: Document<User> = usersCollection.doc('user1');
       const user: User = userDoc.valueChanges();
   }
}
```
AngularFirestype acts just as AngularFirestore but uses instances of custom objects defined in a mapping object.

## Mapping object
In order for AngularFirestype to know how to transform your custom object to raw objects and instanciate them back from Firestore, you need to provide a mapping object containing data about your application model.

The mapping object is a map of **ModelType**, himself either a class for simple custom objects or a **ModelDescriptor** for more complex ones.
Here is an exemple of mapping object :
```ts
import { ModelType } from 'angular-firestype';
import { User } from './user.ts';
import { Address } from './address.ts';
import { Message } from './message.ts';

const model: {[key: string]: ModelType<any>} = {    // use {[key: string]: ModelType<any>} to get TypeScript checking
  messages: Message,
  users: {
    type: User,
    arguments: ['username', 'image'],
    structure: {
      address: Address
    },
    subcollections: {
      messages: Message
    }
  }
};
```

The mapping object **model** has two entries **messages** and **users**. They both represent a root collection in Firestore : /messages and /users.
 - **messages** will be instances of class **Message**, a simple custom class. A class is simple if it only contains basic types and no custom ones.
 - **users** is more complex one and needs to be described as a **ModelDescriptor**.

 **ModelDescriptor** has the following attributes :
 - **type** : class that will be instanciated for this collection (**User** for **users** collection).
 The constructor needs to be idempotent to work properly.
 - **arguments** : array of arguments names to send to the constructor.
 If this attribute is defined, the constructor will be called with the values of the arguments names *in order*.
 For exemple, documents of the collection **users** will be instanciated this way : `new User(valueOfUsername, valueOfImage)`.
 If not defined, the constructor is called without arguments, like `new Message()`.
 AngularFirestype only handle object's attributes as constructor arguments. Other ones needs to be optional.
 - **structure** : map of **ModelType**. This is the internal object description. AngularFirestype only needs to know about custom types and automatically handle basic types.
 In the case of **users**, the **structure** attribute is saying that the class **User** has a simple custom type **Address** as attribute **address**. We could also have a complex custom type here and describe it like we did with the collection **users**, allowing nested custom types.
 - **subcollections** : map of **ModelType**. Map of the collection subcollections and their corresponding custom types.
 Works the same as **structure** but for collections.
 For example, collection **users** have a subcollection **messages** of custom type **Message**. We could also have a complex custom type here and describe it like we did with the collection **users**, allowing nested subcollections.

## Differences with AngularFirestore
AngularFirestype presents a few differences with AngularFirestore :
 - The module is initialized via AngularFirestypeModule.forRoot(model) :
    This is used to pass the mapping object to AngularFirestype. If you need offline persistance, you can do it calling AngularFirestypeModule.forRoot(model, true)
 - Collection and Document replace AngularFirestoreCollection and AngularFirestoreDocument.
    They work with custom types directly, inferred from the collection path and the mapping object. They also have two additional helper methods :
    -- current(callback: (model: T[]) => void) :
        Returns the current data to the callback and automatically unsubscribe right after. Allows to get data without the need to unsubscribe.
    -- currentSnapshot(callback: (snapshot: DocumentChangeAction[]) => void) :
        Same as current(callback) for a DocumentSnapshot
- DocumentSnapshot has a new method rawData() allowing to get the data as AngularFirestore would, without instanciation.
- DocumentSnapshot, DocumentChange and DocumentChangeAction have been redifined to work with custom types.
