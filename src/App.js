import './App.css';
import * as LitJsSdk from '@lit-protocol/lit-node-client';

// -- init litNodeClient
const litNodeClient = new LitJsSdk.LitNodeClient();
litNodeClient.connect();

function App() {

  const go = async () => {

    const messageToEncrypt = "this is a secret message";

    const chain = 'ethereum';

    const authSig = await LitJsSdk.checkAndSignAuthMessage({chain})

    const accessControlConditions = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: 'eth_getBalance',
        parameters: [':userAddress', 'latest'],
        returnValueTest: {
          comparator: '>=',
          value: '0',  // 0 ETH, so anyone can open
        },
      },
    ];

    // 1. Encryption
    // <Blob> encryptedString
    // <Uint8Array(32)> symmetricKey 
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(messageToEncrypt);

    console.warn("symmetricKey:", symmetricKey);
    
    // 2. Saving the Encrypted Content to the Lit Nodes
    // <Unit8Array> encryptedSymmetricKey
    const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    });
    
    console.warn("encryptedSymmetricKey:", encryptedSymmetricKey);
    console.warn("encryptedString:", encryptedString);

    // 3. Decrypt it
    // <String> toDecrypt
    const toDecrypt = LitJsSdk.uint8arrayToString(encryptedSymmetricKey, 'base16');
    console.log("toDecrypt:", toDecrypt);

    // <Uint8Array(32)> _symmetricKey 
    const _symmetricKey = await litNodeClient.getEncryptionKey({
      accessControlConditions,
      toDecrypt,
      chain,
      authSig
    })

    console.warn("_symmetricKey:", _symmetricKey);

    // <String> decryptedString
    const decryptedString = await LitJsSdk.decryptString(
      encryptedString,
      symmetricKey
    );

    console.warn("decryptedString:", decryptedString);
    
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => go()}>GO</button>
      </header>
    </div>
  );
}

export default App;
