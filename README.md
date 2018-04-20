[![npm](https://img.shields.io/npm/v/angular-firestype.svg)](https://www.npmjs.com/package/angular-firestype) [![npm](https://img.shields.io/npm/dt/angular-firestype.svg)](https://www.npmjs.com/package/angular-firestype) [![GitHub stars](https://img.shields.io/github/stars/bricepepin/angular-firestype.svg)](https://github.com/bricepepin/angular-firestype) [![npm](https://img.shields.io/npm/l/angular-firestype.svg)](https://www.npmjs.com/package/angular-firestype) [![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=9SXR8KQPHKUG6)

# AngularFirestype
Type handling for AngularFirestore

This module extends AngularFirestore with type handling.
Using a mapping object, it can add custom objects and get instancied data from Firestore without additional steps.

## Install
```bash
npm install firebase angularfire2 angular-firestype --save
```

## Use
### Module initialization
Import the module in your app after `AngularFireModule` :
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
    arguments: ['username', 'picture'],
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
   AngularFirestypeModule.forRoot(model),   // Import module using forRoot() to add mapping information
 ],
 declarations: [ AppComponent ],
 bootstrap: [ AppComponent ]
})
export class AppModule {}
```
`model` is a mapping object representing your app model organization.
`AngularFirestypeModule` should replace your `AngularFirestoreModule` if you have one imported.

### Service injection and data manipulation
Then just inject service `AngularFirestype` and use it to get and set data to Firestore :
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
   const users: Observable<User[]>;
   const user: User;

   constructor(db: AngularFirestype) {
       const usersCollection: Collection<User> = db.collection<User>('users');
       usersCollection.valueChanges().subscribe(users => this.users = users);

       const userDoc: Document<User> = usersCollection.doc('user1');
       userDoc.valueChanges().subscribe(user => this.user = user);
       userDoc.set(this.user);
   }
}
```
`AngularFirestype` acts just as `AngularFirestore` but uses instances of custom objects defined in a mapping object.

## Mapping object
In order for AngularFirestype to know how to transform your custom object to raw objects and instanciate them back from Firestore, you need to provide a mapping object containing data about your application model.

The mapping object is a map of `ModelType`, himself either a class for simple custom objects or a `ModelDescriptor` for more complex ones.
Here is an exemple of a mapping object :
```ts
import { ModelType } from 'angular-firestype';
import { User } from './user.ts';
import { Address } from './address.ts';
import { Message } from './message.ts';

const model: {[key: string]: ModelType<any>} = {    // {[key: string]: ModelType<any>} for TypeScript type check
  messages: Message,
  users: {
    type: User,
    arguments: ['username', 'picture'],
    structure: {
      address: Address
    },
    subcollections: {
      messages: Message
    },
    options: {
      timestampOnCreate: 'createdAt',
      timestampOnUpdate: 'updatedAt'
    }
  }
};
```

The mapping object `model` has two entries `messages` and `users`. They both represent a root collection in Firestore : /messages and /users.
- `messages` will be instances of class `Message`, a simple custom class. A class is simple if it only contains basic types and no custom ones.
- `users` is a more complex one and needs to be described as a `ModelDescriptor`.

 `ModelDescriptor` has the following attributes :
- `type` : class that will be instancied for this collection (`User` for `users` collection).
 The constructor needs to be idempotent to work properly.
- `arguments` : array of arguments names to send to the constructor.
 If this attribute is defined, the constructor will be called with the values of the arguments names *in order*.
 For exemple, documents of the collection `users` will be instancied this way : `new User(valueOfUsername, valueOfPicture)`.
 If not defined, the constructor is called without arguments, like `new Message()`.
 AngularFirestype only handle object's attributes as constructor arguments. Other ones need to be optional.
- `structure` : map of `ModelType`. This is the internal object description. AngularFirestype only needs to know about instancied types and automatically handle basic types.
 In the case of `users`, the `structure` attribute is saying that the class `User` has a custom type `Address` as attribute `address`. We could also have a complex custom type here and describe it like we did with the collection `users`, allowing nested custom types.
- `elements` : `ModelType` defining the custom type for elements contained in a collection. A  `ModelDescriptor` can't have both `structure` and `elements` defined, as it represents either a custom object or a collection of custom objects.
- `subcollections` : map of `ModelType`. Map of the collection subcollections and their corresponding custom types.
 Works the same as `structure` but for collections instead of objects.
 For example, collection `users` have a subcollection `messages` (/users/{userId}/messages in Firestore) of custom type `Message`. We could also have a complex custom type here and describe it like we did with the collection `users`, allowing nested subcollections.
 - `options` : Additional options for this `ModelDescriptor`. Options implements interface `ModelOptions`.

AngularFiretype add some model checking : you cannot add a document to a collection not defined in your mapping object. If you try to do so, you'll get the following error: *Model descriptor not found for path: your/current/path*

## Differences with AngularFirestore
AngularFirestype presents a few differences with AngularFirestore :
- The module is initialized via `AngularFirestypeModule.forRoot(model)` :
    This is used to pass the mapping object to AngularFirestype. If you need offline persistance, call `AngularFirestypeModule.forRoot(model, true)` instead.
- You cannot add a document to a collection not defined in AngularFiretype's model mapping.
- `Collection` and `Document` replace `AngularFirestoreCollection` and `AngularFirestoreDocument`.
    They work with custom types, inferred from the collection path and the mapping object. They also have some helpers method like `current()` or `first()`.
- `DocumentSnapshot`, `DocumentChange`, `DocumentChangeAction` and `Transaction` have been redefined to work with custom types.
- `DocumentSnapshot` has a new `model()` method allowing to get the instancied custom object without additional steps, and `document()` to get a `Document` reference.

## Contribution
Any contribution is appreciated : simply use AngularFirestype, talk about it, give some feedback or even develop something. And if you feel like it, you can support me through Paypal :

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=9SXR8KQPHKUG6)

In all cases, thank you for your interest in AngularFirestype !