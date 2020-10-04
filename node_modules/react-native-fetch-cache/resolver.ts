
export interface IResolverElement<TKey> {
    Key: TKey;
}

export class Resolver<TKey, T extends IResolverElement<TKey>>
{
    constructor() {
        this.Collection = [];
    }
    Collection: Array<T>
    public Add(element: T) {
        console.log("ok")
        if (this.Collection && this.Collection.findIndex(t => t.Key === element.Key) !== -1)
            throw "Already exists!";
        this.Collection.push(element);
    }
    public Find(key: TKey): T {
        return this.Collection.find(t => t.Key === key);
    }
}
