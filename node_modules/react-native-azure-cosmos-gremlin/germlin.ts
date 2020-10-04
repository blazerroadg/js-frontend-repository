import CryptoJS from 'crypto-js'
import { cache } from 'react-native-fetch-cache/cacheResolver'

interface AzureConfig {
    masterkey: string;
    serviceurl: string;
    methodname: string;

}
export class Param {
    constructor(name: string, value: string) {
        this.name = name;
        this.value = value
    }
    name: string;
    value: string;
}

export interface FetchParam {
    query: string;
    parameters: Array<Param>,
    actionName: string

}


export class FetchParamDefualt implements FetchParam {
    query: string;
    parameters: Array<Param>;
    actionName: string
    constructor(query: string, parameters: Array<Param>, actionName: string) {
        this.query = query;
        this.parameters = parameters;
        this.actionName = actionName;
    }
}

class AuthParam {
    constructor(paramscount: number, methodname: string, date: string, key: string) {
        this.paramscount = paramscount;
        this.methodname = methodname;
        this.date = date;
        this.key = key
    }
    paramscount: number;
    methodname: string;
    date: string;
    key: string
}

class AzureGermlin {
    static myInstance: AzureGermlin = null;
    static config: AzureConfig;

    static getInstance() {
        if (AzureGermlin.myInstance == null) {
            AzureGermlin.myInstance = new AzureGermlin();
        }
        return this.myInstance;
    }

    public fetch(param: FetchParam): Promise<Response> {

        const isValid = cache(param.actionName, undefined)
        if (isValid) {
            const response = new Response(null, { status: 304, statusText: "cache" })
            return new Promise<Response>((resolve, reject) => {
                resolve(response)
            });
        }

        const today = new Date();
        const UTCstring = today.toUTCString();
        const auth = this.auth(new AuthParam(param.parameters.length, AzureGermlin.config.methodname, UTCstring, AzureGermlin.config.masterkey))
        return fetch(AzureGermlin.config.serviceurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth,
                'x-ms-date': UTCstring
            },
            body: JSON.stringify({ query: param.query, parameters: param.parameters })
        });

    }
    public auth(param: AuthParam) {
        const signatureRaw = `POST${param.paramscount}${param.methodname}${param.date}`;
        const signatureBytes = CryptoJS.HmacSHA256(signatureRaw, CryptoJS.enc.Base64.parse(param.key));
        const signatureEncoded = signatureBytes.toString(CryptoJS.enc.Base64);
        return signatureEncoded;
    }
    constructor() {
    }
}

export const azuregermlinfetch = async (param: FetchParam) => {
    let instance = AzureGermlin.getInstance();
    return instance.fetch(param)
}


export const initCosmosGermlin = (config: AzureConfig) => {
    AzureGermlin.config = config;
}



