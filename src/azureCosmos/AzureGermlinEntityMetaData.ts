import { IEntityMetaData } from 'js-frontend-repository/models/interfaces/IEntityMetaData';
import { AzureCosmosEntityMetaDataContext } from './AzureCosmosEntityMetaDataContext';
import { AzureGermlinFetch } from './AzureGermlinFetch';

export class AzureGermlinEntityMetaData implements IEntityMetaData<AzureGermlinFetch> {
    context: AzureCosmosEntityMetaDataContext;

    networking: AzureGermlinFetch = new AzureGermlinFetch();

    constructor(context: AzureCosmosEntityMetaDataContext) {
      this.context = context;
    }
}
