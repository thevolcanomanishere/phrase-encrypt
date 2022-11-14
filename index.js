const crypto = require('crypto')
const bip39 = require('bip39')
const fs = require('fs')
const readline = require('readline');
const qrcode = require('qrcode-terminal');
const argon2 = require('argon2-browser');

const algorithm = 'aes-256-ctr'

const createHashedPassword = async (password, iv) => {
    const numIterations = 1000;
    console.log(`\nHashing password with ${numIterations} iterations\nThis will take a few seconds...`)
    const { hash } = await argon2.hash({
        pass: password,
        time: numIterations,
        mem: 4096,
        salt: iv.toString('hex'),
        hashLen: 32
      });
      return hash;
}

const encrypt = async (secretPhrase, password) => {
  const iv = crypto.randomBytes(16)
  const hash = await createHashedPassword(password, iv)
  const cipher = crypto.createCipheriv(algorithm, hash, iv)
  const encrypted = Buffer.concat([cipher.update(secretPhrase), cipher.final()])
  const encryptedSecretPhrase = {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  }
    return encryptedSecretPhrase;
}

const decrypt = (encryptedJSON, key) => {
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(encryptedJSON.iv, 'hex'))
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(encryptedJSON.content, 'hex')), decipher.final()])
  return decrpyted.toString()
}

const askQuestion = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

const createAndEncrypt = async () => {
    const password = await askQuestion('Enter password to encrypt your secret pharse: ')
    console.log('Your secret key is: ', password)
    const secretPhrase = bip39.generateMnemonic();
    console.log('Your secret phrase is: ', secretPhrase)
    const encryptedSecretPhrase = await encrypt(secretPhrase, password)
    fs.writeFileSync('SecretPhrase.json', JSON.stringify(encryptedSecretPhrase))
    console.log("Your secret phrase has been encrypted and saved to SecretPhrase.json")
    console.log("Now you can safely backup SecretPhrase.json to Google Drive, WhatsApp, iCloud, etc.")
    console.error("Note: You MUST use this tool to decrypt your secret phrase in the future.")
    console.log("\nScan this QR Code with your wallet to import your account.")
    qrcode.generate(secretPhrase, {small: true});

}

const decryptSecretPhrase = async () => {
    const password = await askQuestion('Enter password to decrypt your secret pharse: ')
    const encryptedSecretPhrase = JSON.parse(fs.readFileSync('SecretPhrase.json'))
    const hash = await createHashedPassword(password, encryptedSecretPhrase.iv)
    const decryptedSecretPhrase = decrypt(encryptedSecretPhrase, hash)
    console.log('Your decrypted secret phrase is: ', decryptedSecretPhrase)
    console.log("\nScan this QR Code with your wallet to import your account.")
    qrcode.generate(decryptedSecretPhrase,  {small: true});
}

const main = async () => {
    const mode = await askQuestion('Encrypt or Decrypt? (e/d): ')
    if (mode === 'e') {
        return createAndEncrypt()
    }
    if (mode === 'd') {
        return decryptSecretPhrase()
    }
    console.log("You did not enter e or d")
    process.exit(1)
}

main()
