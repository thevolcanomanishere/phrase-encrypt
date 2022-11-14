# Simple crypto secret phrase creation and encryption

Naive implementation of a simple crypto secret phrase creation and encryption. Includes QR code generation for easier import into your wallet. No need to copy and paste! 

Features: 
- AES-256 encryption
- [Argon2](https://en.wikipedia.org/wiki/Argon2) key derivation function
- Outputs QR code in the terminal for easy wallet importing

Why?
- Many people store their secret phrase unencrypted in their notes, Google docs, etc.
- Far easier to store a simple JSON file.
- Pieces of paper go missing.

## Requirements

- Node.js 12 or higher (I think. Maybe it works with even older. I don't know.)

## Usage

```bash
$ node index.js
```

Encrypting
![Screenshot](images/encrypt.png)

Decrypting
![Screenshot](images/decrypt.png)

## TODO GUI
- [X] QR code generation
- [ ] Have someone who knows their stuff to look at implementation
- [ ] Add GUI
- [ ] Option for 24 word phrase
