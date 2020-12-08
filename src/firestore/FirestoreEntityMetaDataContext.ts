export class FirestoreEntityMetaDataContext {
    collectionName: string;

    constructor(collectionName = '') {
      this.collectionName = collectionName;
    }
}
