export class AzureCosmosEntityMetaDataContext {
    dbName: string;

    col: string;

    entityType: string;

    constructor(dbName = '', col = '', entityType = "'") {
      this.dbName = dbName;
      this.col = col;
      this.entityType = entityType;
    }
}
