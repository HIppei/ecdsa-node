import { useState } from 'react';
import server from './server';
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { utf8ToBytes, toHex } from 'ethereum-cryptography/utils';
import { keccak256 } from 'ethereum-cryptography/keccak';

BigInt.prototype.toJSON = function () {
  return this.toString();
};

function Transfer({ setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const amount = parseInt(sendAmount);
    const msgHash = toHex(keccak256(utf8ToBytes(`${recipient}:${amount}`)));
    const sign = secp256k1.sign(msgHash, privateKey).toCompactHex();

    // Since public key is recovered from Signature instance, public key recovering goes here.
    // Server side will do the verification process and process transactions.
    const hexPublicKey = toHex(secp256k1.getPublicKey(privateKey));

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        recipient: recipient,
        amount: amount,
        sign: sign,
        msgHash: msgHash,
        hexPublicKey: hexPublicKey,
      });
      setBalance(balance);
      alert('Transfer is success!!');
    } catch (ex) {
      console.log(ex);
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input placeholder="1, 2, 3..." value={sendAmount} onChange={setValue(setSendAmount)}></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
