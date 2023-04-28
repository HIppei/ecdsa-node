import server from './server';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { toHex } from 'ethereum-cryptography/utils';
import { useState } from 'react';

function Wallet({ balance, setBalance, privateKey, setPrivateKey }) {
  const [address, setAddress] = useState('');
  async function onChange(evt) {
    try {
      const privateKey = evt.target.value;
      setPrivateKey(privateKey);

      // Generate public key and convert to readable address
      const publicKey = secp256k1.getPublicKey(privateKey);
      setAddress(toHex(keccak256(publicKey.slice(1)).slice(-20)));

      if (address) {
        const {
          data: { balance },
        } = await server.get(`balance/${address}`);
        setBalance(balance);
      } else {
        throw new Error('Error');
      }
    } catch (err) {
      console.log(err);
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Your private key
        <input placeholder="Type an private key" value={privateKey} onChange={onChange}></input>
      </label>

      <label>Wallet Address {address}</label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
