# [9.0.0](https://github.com/bricepepin/angular-firestype/compare/8.0.0...9.0.0) (2018-11-28)

### Features

* **document:** add `get()` function to retrieve the document once, and some utility functions :
 - `documentChanges()` returns the `DocumentSnapshot` corresponding to this `Document` only once
 - `value()` returns the value of the document only once
([d98a073](https://github.com/bricepepin/angular-firestype/commit/d98a073))([3150166](https://github.com/bricepepin/angular-firestype/commit/3150166))([736bff3](https://github.com/bricepepin/angular-firestype/commit/736bff3))

add `get()` to retrieve a document once, and `model()` to retrieve the value of the document once

* **collection:** add `get()` function to retrieve a query once, and multiple utility functions :
 - `documentChanges()` returns an array of `DocumentSnapshot` returned by the query
 - `firstDocumentChanges()` returns the first `DocumentSnapshot` returned by the query
 - `getDocuments()` returns an array of `DocumentSnapshot` returned by the query only once
 - `getFirstDocument()` returns the the first `DocumentSnapshot` returned by the query only once
 - `values()` returns an array of values returned by the query only once
 ([fcd4355](https://github.com/bricepepin/angular-firestype/commit/fcd4355))([3150166](https://github.com/bricepepin/angular-firestype/commit/3150166))([736bff3](https://github.com/bricepepin/angular-firestype/commit/736bff3))

* **query snapshot:** add `QuerySnapshot` class returned by `Collection.get()` function adding `documents` and `values` properties. It has the same use that `DoucmentSnapshot` provide ([3150166](https://github.com/bricepepin/angular-firestype/commit/3150166))
* **collection and document:** add properties `id` and `path` and funciton `parent()` to `Collection` and `document` for ease of use ([77c6236](https://github.com/bricepepin/angular-firestype/commit/77c6236))
* **service:** add new persistenceSettings to AngularFirestype service ([f5089a2](https://github.com/bricepepin/angular-firestype/commit/f5089a2))
* **angular:** move to angular@7.0.0 peer dependency ([5ff0937](https://github.com/bricepepin/angular-firestype/commit/5ff0937))*


### Performance Improvements

* **collection and document:** optimize typing data for most of the querying functions in order to improve queries ([736bff3](https://github.com/bricepepin/angular-firestype/commit/736bff3))


### BREAKING CHANGES

This version include some drastic changes that will require actions to upgrade. Breaking changes should be limited from now on.

* **model:** `model` was referencing two different concepts: custom type objects and the whole application data model. `model` new reference only the whole application data model while custom type objects are now referenced as `value`. In addition, `DocumentSnapshot` now adds properties instead of functions to ease their use in Angular apps.

Those changes will need some work as `DocumentSnapshot` has been redefined :
 - function `document()` is changed to property `document`
 - function `model()` is changed to property `value`

Classes `ModelDescriptor`, `ModelOptions`, `ModelTransformer`, `ModelType` are changed to `ValueDescriptor`, `ValueOptions`, `ValueTransformer`, `ValueType` respectively.
([3150166](https://github.com/bricepepin/angular-firestype/commit/3150166))

* **query:** add ability to use query operators directly from `Collection` like in firebase. This allow chaining without the add of an intermediate function. You can't use @angular/fire query parameter anymore when getting a `Collection` to ensure you are working with AngularFirestype `Collection`. For exemple, `db.collection('items', ref => ref.where('size', '==', 'large'))` will become `db.collection('items').where('size', '==', 'large')`. ([581ac1b](https://github.com/bricepepin/angular-firestype/commit/581ac1b))

* **collection:** `doc()` is back to @angular/fire behaviour to avoid compatibility problems. You should use `document()` to get a Document instance instead ([4a51306](https://github.com/bricepepin/angular-firestype/commit/4a51306))
* **transaction:** remove typed transaction as this kind of operations should be done server side instead of unsafe front end ([4ad4319](https://github.com/bricepepin/angular-firestype/commit/4ad4319))
* **@angular/fire:** update from angularfire2 to @angular/fire package. Now needs @angular/fire as peer dependency ([5ff0937](https://github.com/bricepepin/angular-firestype/commit/5ff0937))


<a name="8.0.0"></a>
# [8.0.0](https://github.com/bricepepin/angular-firestype/compare/7.0.0...8.0.0) (2018-07-05)

### BREAKING CHANGES
* **helpers:** Collection and Document helpers promises are removed as they were not working as intended and returning promises instead of observables is not recommended in angular.

Here is the list of the removed promises :
- Collection:
  - current
  - currentSnapshot
  - first
  - firstSnapshot
- Document:
  - current
  - currentSnapshot


<a name="7.0.0"></a>
# [7.0.0](https://github.com/bricepepin/angular-firestype/compare/6.2.0...7.0.0) (2018-05-23)


### Features

* **collection:** allow to call doc() without arguments as does firebase SDK ([2d88bba](https://github.com/bricepepin/angular-firestype/commit/2d88bba))


### BREAKING CHANGES

* **helpers:** Move helpers functions to promises for better interoperability. ([24e9caa](https://github.com/bricepepin/angular-firestype/commit/24e9caa))

To update your code, you only need to add `.then` after each function name. For exemple, `doc.current(data => console.log(data))` becomes `doc.current.then(data => console.log(data))`.

Here is the list of all changed functions :
- Collection:
  - current
  - currentSnapshot
  - first
  - firstSnapshot
- Document:
  - current
  - currentSnapshot


<a name="6.2.0"></a>
# [6.2.0](https://github.com/bricepepin/angular-firestype/compare/6.1.1...6.2.0) (2018-05-19)


### Features

* **angularfire2:** support for angularfire2@5.0.0-rc.9 ([05dd0bf](https://github.com/bricepepin/angular-firestype/commit/05dd0bf))



<a name="6.1.1"></a>
## [6.1.1](https://github.com/bricepepin/angular-firestype/compare/6.1.0...6.1.1) (2018-05-15)

### Bug Fixes

* **firebase:** Fix Fix firebase 5.0.0 imports ([633fb9b](https://github.com/bricepepin/angular-firestype/commit/633fb9b))


<a name="6.1.0"></a>
# [6.1.0](https://github.com/bricepepin/angular-firestype/compare/6.0.0...6.1.0) (2018-05-15)


### Features

* **AngularFire2:** Upgrade to AngularFire2@5.0.0-rc.8.0 and remove rxjs-compat requirement. ([10812bc](https://github.com/bricepepin/angular-firestype/commit/10812bc))



<a name="6.0.0"></a>
# [6.0.0](https://github.com/bricepepin/angular-firestype/compare/6.0.0-rc.0...6.0.0) (2018-05-11)


### Features

* Upgrade to Angular 6.0.0 and AngularFire2 5.0.0-rc.7 ([43ad7be](https://github.com/bricepepin/angular-firestype/commit/43ad7be))

* **angular:** Upgrade to Angular 6 and rxjs 6. Now requires rxjs-compat@^6.0.0 until angularfire2 upgrade to rxjs 6. ([d970d5b](https://github.com/bricepepin/angular-firestype/commit/d970d5b))
* **collection:** Add the possibility to pass Document<T> reference to collection queries ([faf240f](https://github.com/bricepepin/angular-firestype/commit/faf240f))
* **Collection:** Add helpers methods addDocument(), document(), first() and firstSnapshot(). ([f041363](https://github.com/bricepepin/angular-firestype/commit/f041363))
* **model:** Add Model and ModelTransformer to public API to allow model transformation outside of firestype service ([e94584d](https://github.com/bricepepin/angular-firestype/commit/e94584d))
* **transformer:** Handle collections starting with a slash ([67168c3](https://github.com/bricepepin/angular-firestype/commit/67168c3))

### BREAKING CHANGES

* **Collection:** Improve typings for better typescript support

Add model types on classes DocumentChange<T>, DocumentChangeAction<T> and DocumentSnapshot<T>.
DocumentSnapshot redefinition :
- data() is now back to firebase default behaviour, and rawData() is removed.
- model() is the new function to call to get the instancied custom object.
- document() can be called to get the Document<T> reference.


<a name="6.0.0-rc.0"></a>
# [6.0.0-rc.0](https://github.com/bricepepin/angular-firestype/compare/5.2.0...6.0.0-rc.0) (2018-04-26)


### Features

* **angular:** Upgrade to Angular 6-rc and rxjs 6. Now requires rxjs-compat@^6.0.0 until angularfire2 upgrade to rxjs 6. ([d970d5b](https://github.com/bricepepin/angular-firestype/commit/d970d5b))
* **collection:** Add the possibility to pass Document<T> reference to collection queries ([faf240f](https://github.com/bricepepin/angular-firestype/commit/faf240f))
* **Collection:** Add helpers methods addDocument(), document(), first() and firstSnapshot(). ([f041363](https://github.com/bricepepin/angular-firestype/commit/f041363))
* **model:** Add Model and ModelTransformer to public API to allow model transformation outside of firestype service ([e94584d](https://github.com/bricepepin/angular-firestype/commit/e94584d))
* **transformer:** Handle collections starting with a slash ([67168c3](https://github.com/bricepepin/angular-firestype/commit/67168c3))


### BREAKING CHANGES

* **Collection:** Improve typings for better typescript support

Add model types on classes DocumentChange<T>, DocumentChangeAction<T> and DocumentSnapshot<T>.
DocumentSnapshot redefinition :
- data() is now back to firebase default behaviour, and rawData() is removed.
- model() is the new function to call to get the instancied custom object.
- document() can be called to get the Document<T> reference.



<a name="5.2.0"></a>
# [5.2.0](https://github.com/bricepepin/angular-firestype/compare/5.1.4...5.2.0) (2018-03-01)


### Features

* **model:** Add collections management via the 'elements' attribute in ModelType ([7fad214](https://github.com/bricepepin/angular-firestype/commit/7fad214))
* **model:** Add options to ModelDescriptor with first options timestampOnCreate and timestampOnUpdate ([c3f167b](https://github.com/bricepepin/angular-firestype/commit/c3f167b))
* **model:** Handle AngularFirestype Document as DocumentReference when specified in model structure ([13f6001](https://github.com/bricepepin/angular-firestype/commit/13f6001))



<a name="5.1.4"></a>
## [5.1.4](https://github.com/bricepepin/angular-firestype/compare/5.1.3...5.1.4) (2018-02-22)


### Bug Fixes

* Fix index error on model description control ([0ea3370](https://github.com/bricepepin/angular-firestype/commit/0ea3370))



<a name="5.1.3"></a>
## [5.1.3](https://github.com/bricepepin/angular-firestype/compare/5.1.2...5.1.3) (2018-02-22)


### Bug Fixes

* **model:** Model descriptor not found error for subcollections ([8f12679](https://github.com/bricepepin/angular-firestype/commit/8f12679))



<a name="5.1.2"></a>
## [5.1.2](https://github.com/bricepepin/angular-firestype/compare/5.1.1...5.1.2) (2018-02-21)


### Bug Fixes

* **aot:** Use InjectionToken for model initialization to work with aot compilation ([1f3f5e1](https://github.com/bricepepin/angular-firestype/commit/1f3f5e1))
* **model:** Add model descriptor not found error for root collections ([1f3f5e1](https://github.com/bricepepin/angular-firestype/commit/1f3f5e1))



<a name="5.1.1"></a>
## 5.1.1 (2018-02-14)


### Bug Fixes

* **typings:** Do not use types from [@angular](https://github.com/angular)/firestore-types as values ([94feb76](https://github.com/bricepepin/angular-firestype/commit/94feb76))



<a name="5.1.0"></a>
# 5.1.0 (2018-02-12)

### Features
* Add transactions with type handling and `runTransaction()` on `AngularFirestype` ([b8c1c02](https://github.com/bricepepin/angular-firestype/commit/b8c1c02))
* Add reject and complete callbacks to `current()` and `currentSnapshot()` methods ([b8c1c02](https://github.com/bricepepin/angular-firestype/commit/b8c1c02))
* Add `CollectionUtils` containing a first utility function to move a document within a transaction ([b8c1c02](https://github.com/bricepepin/angular-firestype/commit/b8c1c02))

<a name="5.0.0"></a>
# 5.0.0 (2018-02-03)

### Features
* First release, version 5.0.0 to match angular & angularfire2 versioning. ([65ab312](https://github.com/bricepepin/angular-firestype/commit/65ab312))