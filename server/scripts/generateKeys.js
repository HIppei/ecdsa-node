const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const utils = require('ethereum-cryptography/utils');
const { keccak256 } = require('ethereum-cryptography/keccak');

const privateKey = secp256k1.utils.randomPrivateKey();
const publicKey = secp256k1.getPublicKey(privateKey);
const address = utils.toHex(keccak256(publicKey.slice(1)).slice(-20));

console.log('Private Key: ', utils.toHex(privateKey));
console.log('Public Key: ', address);
