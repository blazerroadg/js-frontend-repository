import { IEntityMetaData } from 'js-frontend-repository/models/interfaces/IEntityMetaData';
import { NullNetworking } from 'js-frontend-repository/NullNetworking';
import { nullValue } from 'js-frontend-repository/models/nullValue';
import { FirestoreEntityMetaDataContext } from './FirestoreEntityMetaDataContext';

export class FirestoreEntityMetaData implements IEntityMetaData<NullNetworking> {
    context: FirestoreEntityMetaDataContext;

    networking: NullNetworking = nullValue;

    constructor(context: FirestoreEntityMetaDataContext) {
      this.context = context;
    }
}
