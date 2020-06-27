var ENCRYPTION_STANDARD = "RSA-PSS"
var SALT_SIZE = 128
var privateKey;
var publicKey;

function asciiToUint8Array(str) {
    var chars = [];
    for (var i = 0; i < str.length; ++i)
        chars.push(str.charCodeAt(i));
    return new Uint8Array(chars);
}

function generate() {
    window.crypto.subtle.generateKey({
            name: ENCRYPTION_STANDARD,
            saltLength: SALT_SIZE,
            modulusLength: 2048, 
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: {name: "SHA-256"}, 
        },
        true, 
        ["sign", "verify"]
    )
    .then(function(key) {

        publicKey = key.publicKey;
        privateKey = key.privateKey;
        
        window.crypto.subtle.exportKey("jwk", key.publicKey).then(
            function(keydata) {
                publicKeyhold = keydata;
                publicKeyJson = JSON.stringify(publicKeyhold);
                document.getElementById("public").value = publicKeyJson;
            }
        );

        window.crypto.subtle.exportKey("jwk", key.privateKey).then(
            function(keydata) {
                privateKeyhold = keydata;
                privateKeyJson = JSON.stringify(privateKeyhold);
                document.getElementById("private").value = privateKeyJson;
            }
        );
    });
}

function sign() {
    var cryptoObj = window.crypto || window.msCrypto;

    if(!cryptoObj)
    {
        alert("Unsupported Browser");
        return;
    }

    var transData = document.getElementById("transData").value;

    window.crypto.subtle.sign({
            name: ENCRYPTION_STANDARD,
            saltLength: SALT_SIZE,
        },
        privateKey,
        asciiToUint8Array(transData) 
    )
    .then(function(signature) {
        document.getElementById("encryptedData").value = bytesToHexString(signature);
    })
    .catch(function(err) {
        console.error(err);
    });
}

function verify() {

var cryptoObj = window.crypto || window.msCrypto;

if(!cryptoObj)
{
    alert("Crypto API is not supported by the Browser");
    return;
}

var encryptedData = document.getElementById("encryptedData").value;
var transData = document.getElementById("transData").value;

if(!publicKey)
{
    alert("Generate Keys First")
    return;
}

window.crypto.subtle.verify({
            name: ENCRYPTION_STANDARD,
            saltLength: SALT_SIZE,
        },
        publicKey, 
        hexStringToUint8Array(encryptedData), 
        asciiToUint8Array(transData)
    )
    .then(function(decrypted) {
        alert("Verified   " + decrypted);
    })
    .catch(function(err) {
        console.error(err);
    });

}

function bytesToASCIIString(bytes) {
    return String.fromCharCode.apply(null, new Uint8Array(bytes));
}

function bytesToHexString(bytes) {
    if (!bytes)
        return null;

    bytes = new Uint8Array(bytes);
    var hexBytes = [];

    for (var i = 0; i < bytes.length; ++i) {
        var byteString = bytes[i].toString(16);
        if (byteString.length < 2)
            byteString = "0" + byteString;
        hexBytes.push(byteString);
    }

    return hexBytes.join("");
}

function hexStringToUint8Array(hexString) {
    if (hexString.length % 2 != 0)
        throw "Invalid hexString";
    var arrayBuffer = new Uint8Array(hexString.length / 2);

    for (var i = 0; i < hexString.length; i += 2) {
        var byteValue = parseInt(hexString.substr(i, 2), 16);
        if (byteValue == NaN)
            throw "Invalid hexString";
        arrayBuffer[i / 2] = byteValue;
    }

    return arrayBuffer;
}

function failAndLog(error) {
    console.log(error);
}
