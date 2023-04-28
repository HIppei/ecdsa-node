const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { keccak256 } = require('ethereum-cryptography/keccak');
const { toHex, hexToBytes } = require('ethereum-cryptography/utils');

app.use(cors());
app.use(express.json());

const balances = {
  a0b975fa60cdc2eed0af230c64e9fd3b69bc04b8: 100,
  cf25ceccc21c272df50736fe297ed1e193c85e2c: 50,
  '8c2c373c8caf18640b46fe320bd6d6b3ddc526c2': 75,
};

app.get('/balance/:address', (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', async (req, res) => {
  const { recipient, amount, sign, msgHash, hexPublicKey } = req.body;

  // Verify the sign from sender
  if (!secp256k1.verify(sign, msgHash, hexPublicKey)) {
    res.status(400).send({ message: 'Wrong signature!' });
    return;
  }

  // Restore sender address
  const senderPublicKey = hexToBytes(hexPublicKey);
  const senderAddress = toHex(keccak256(senderPublicKey.slice(1)).slice(-20));

  setInitialBalance(senderAddress);
  setInitialBalance(recipient);

  if (balances[senderAddress] < amount) {
    res.status(400).send({ message: 'Not enough funds!' });
  } else {
    balances[senderAddress] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[senderAddress] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
