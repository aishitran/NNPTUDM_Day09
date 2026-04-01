const { generateKeyPairSync } = require('crypto');
const fs = require('fs');

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

// ghi file
fs.writeFileSync('private.key', privateKey);
fs.writeFileSync('public.key', publicKey);

console.log("Tao key thanh cong!");