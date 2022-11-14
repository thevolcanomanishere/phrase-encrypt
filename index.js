const crypto = require('crypto')
const bip39 = require('bip39')
const fs = require('fs')
const readline = require('readline');

const pad = str => {
    if (str.length > 32) {
        return str.substring(0, 32)
    }
    return str.padEnd(32, ' ')
}

const algorithm = 'aes-256-ctr'

const encrypt = (secretPhrase, password) => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, password, iv)
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
    const key = pad(password)
    const secretPhrase = bip39.generateMnemonic();
    console.log('Your secret phrase is: ', secretPhrase)
    const encryptedSecretPhrase = encrypt(secretPhrase, key)
    console.log('Your encrypted secret phrase is: ', encryptedSecretPhrase)
    fs.writeFileSync('SecretPhrase.json', JSON.stringify(encryptedSecretPhrase))
    console.log("Your secret phrase has been encrypted and saved to SecretPhrase.json")
    console.log("Note: You MUST use this tool to decrypt your secret phrase in the future.")
}

const decryptSecretPhrase = async () => {
    const password = await askQuestion('Enter password to decrypt your secret pharse: ')
    const key = pad(password)
    const encryptedSecretPhrase = JSON.parse(fs.readFileSync('SecretPhrase.json'))
    const decryptedSecretPhrase = decrypt(encryptedSecretPhrase, key)
    console.log('Your decrypted secret phrase is: ', decryptedSecretPhrase)
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
