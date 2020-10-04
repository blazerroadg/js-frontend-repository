
import CryptoJS from 'crypto-js';

export const AzureToken = (url,method) => {

    const mastKey = "gLNLj4yNpqWGd6LUFGU7PuHcG7h3EIctW500HqfZt4nTXPCSxf7KA3YZ5wnsBfXIpq1S3sH3E4V6L3A2vQX7RQ==";
    const today = new Date();
    const UTCstring = today.toUTCString();

    let strippedurl = url.replace(new RegExp('^https?://[^/]+/'), '/');
    const strippedparts = strippedurl.split("/");
    const truestrippedcount = (strippedparts.length - 1);
    let resourceId = "";
    let resType = "";
    if (truestrippedcount % 2) {
        resType = strippedparts[truestrippedcount];
        if (truestrippedcount > 1) {
            var lastPart = strippedurl.lastIndexOf("/");
            resourceId = strippedurl.substring(1, lastPart);
            console.log(resourceId);
        }
    }
    else {
        resType = strippedparts[truestrippedcount - 1];
        strippedurl = strippedurl.substring(1);
        resourceId = strippedurl;
    }

    var verb = method.toLowerCase();
    var date = UTCstring.toLowerCase();
    var key = CryptoJS.enc.Base64.parse(mastKey);
    var text = (verb || "").toLowerCase() + "\n" +
        (resType || "").toLowerCase() + "\n" +
        (resourceId || "") + "\n" +
        (date || "").toLowerCase() + "\n" +
        "" + "\n";

    var signature = CryptoJS.HmacSHA256(text, key);
    var base64Bits = CryptoJS.enc.Base64.stringify(signature);
    var MasterToken = "master";
    var TokenVersion = "1.0";
    const auth = encodeURIComponent("type=" + MasterToken + "&ver=" + TokenVersion + "&sig=" + base64Bits);

    return { auth: auth, date: date }
}

export const AzureDocHeader = (token, date, partitionkey) => {
    return {
        'Accept': 'application/json',
        'x-ms-version': "2017-02-22",
        'Authorization': token,
        'x-ms-date': date,
        'Content-Type': 'application/json',
        'x-ms-documentdb-partitionkey': '["' + partitionkey + '"]'
    }
}
export const AzureQuieryHeader = (token, date, partitionkey) => {
    var bs = AzureDocHeader(token, date, partitionkey);
    bs['Content-Type'] = 'application/query+json';
    bs['x-ms-documentdb-isquery'] = "true";
    return bs;

}
