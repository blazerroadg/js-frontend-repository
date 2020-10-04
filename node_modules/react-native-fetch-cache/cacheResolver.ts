
class CacheManagerKeyModel {
    ExpireDateTime: number;
    stateName: string
    constructor(expireDateTime: number, stateName: string) {
        this.ExpireDateTime = expireDateTime;
        this.stateName = stateName;
    }
}

class CacheManager {
    keys: Array<CacheManagerKeyModel>;
    expireAfter: number;
    static myInstance: CacheManager = null;

    static getInstance(expireAfter: number) {
        if (CacheManager.myInstance == null) {
            CacheManager.myInstance = new CacheManager(expireAfter);
        }

        return this.myInstance;
    }

    constructor(expireAfter: number) {
        this.keys = new Array<CacheManagerKeyModel>();
        const expAfter = expireAfter ? expireAfter : Number.MAX_VALUE;
        this.expireAfter = expAfter;
    }

    isValid(stateName: string, expireAfter: number): boolean {
        const expAfter = expireAfter ? expireAfter : this.expireAfter;
        let matchKeyIndex = this.keys.findIndex(t => t.stateName === stateName);
        if (matchKeyIndex != -1) {
            return this.keys[matchKeyIndex].ExpireDateTime > (new Date()).getTime() + expAfter;
        }
        this.keys.push(new CacheManagerKeyModel(expAfter, stateName));
        return false;
    }

    remove(stateName: string): void {
        let matchKeyIndex = this.keys.findIndex(t => t.stateName === stateName);
        if (matchKeyIndex != -1) {
            this.keys.splice(matchKeyIndex, 1)
        }
    }

    removeAll() {
        this.keys = new Array<CacheManagerKeyModel>();
    }
}


export const cache = (stateName: string, expireAfter: number) => {
    let instance = CacheManager.getInstance(expireAfter);
    return instance.isValid(stateName, expireAfter);
}

export const init = (expireAfter: number) => {
    CacheManager.getInstance(expireAfter);
}



