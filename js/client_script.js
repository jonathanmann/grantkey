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
                publicKeyJson = JSON.stringify(keydata);
                //document.getElementById("public").value = publicKeyJson;
            }
        );

        window.crypto.subtle.exportKey("jwk", key.privateKey).then(
            function(keydata) {
                privateKeyJson = JSON.stringify(keydata);
                //document.getElementById("private").value = privateKeyJson;
            }
        );
    });
}

function save_key(key_type) {
    
    if(!publicKey)
    {
        alert("Generate Keys First")
        return;
    }

    var key;
    if (key_type == "private"){
        key = privateKeyJson;
    } else {
        key = publicKeyJson;
    }
    var a = document.createElement("a");
    var dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(key);
    a.setAttribute("href",     dataStr     );
    a.setAttribute("download", key_type + "-key.jwk");
    a.click();
}

function save_keys() {
    
    if(!publicKey)
    {
        alert("Generate Keys First")
        return;
    }

    //var keys = {};
    //keys["private"] = privateKey;
    //keys["public"] = publicKey;
    var a = document.createElement("a");
    var dataStr = "data:application/json;charset=utf-8," + '{"private":' + privateKeyJson + ',"public":' + publicKeyJson + "}";
    a.setAttribute("href",     dataStr     );
    a.setAttribute("download", "key_pair.json");
    a.click();
}

function sign() {
    var cryptoObj = window.crypto || window.msCrypto;

    if(!cryptoObj)
    {
        alert("Unsupported Browser");
        return;
    }

    var transData = document.getElementById("transData").value;

    //console.log(privateKey);

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
var start = new Date();
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
        var elapsed = new Date() - start
        alert("Verified   " + decrypted + " in " + elapsed + " ms");
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

async function bImportKey(k,usage) {
    const algo = {
        name: ENCRYPTION_STANDARD,
        saltLength: SALT_SIZE,
        modulusLength: 2048, 
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: 'SHA-256' }
    };
    return await window.crypto.subtle.importKey('jwk', k, algo, true, usage);
}

async function importKeyFile(keyType) {
    var keyView = document.getElementById(keyType);
    var file = document.querySelector('#' + keyType + '-key-file').files[0];
    var reader = new FileReader()
    reader.onload = function (event) {
        keyView.value = event.target.result;

        if (keyType == 'private'){
            bImportKey(JSON.parse(keyView.value),["sign"]).then(result => {privateKey = result})
        } else {
            bImportKey(JSON.parse(keyView.value),["verify"]).then(result => {publicKey = result})
        }

    }
    reader.readAsText(file);
}

function importKeys() {
    var file = document.querySelector('#key-file').files[0];
    var reader = new FileReader()
    reader.onload = function (event) {        
        var keypair = JSON.parse(event.target.result);  
        var privKey = keypair["private"]
        var pubKey = keypair["public"]
        document.getElementById("private").value = JSON.stringify(privKey);
        document.getElementById("public").value = JSON.stringify(pubKey);      
        bImportKey(privKey,["sign"]).then(result => {privateKey = result});
        bImportKey(pubKey,["verify"]).then(result => {publicKey = result});

    }
    reader.readAsText(file);
}
