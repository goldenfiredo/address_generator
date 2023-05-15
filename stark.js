
import { ethers } from 'ethers'
import { stark, hash, ec } from 'starknet'

//implementation
const whash = ['0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328', '0x5aa23d5bb71ddaa783da7ea79d405315bafa7cf0387a74f4593578c3e9e6570'] 
//class hash
const wproxy = ['0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918', '0x03131fa018d520a037686ce3efddeab8f28895662f019ca3ca18a626650f7d1e'] 

function generate_address_for_argentx(mnemonic, index) {
  const ethWallet = ethers.Wallet.fromPhrase(mnemonic)
  const masterNode = ethers.HDNodeWallet.fromSeed(ethers.toBeHex(BigInt(ethWallet.privateKey)))
  const childNode = masterNode.derivePath(`m/44'/9004'/0'/0/${index}`)
  const groundKey = ec.starkCurve.grindKey(childNode.privateKey)
  const privateKey = `0x${groundKey}` 
  console.log('private key: ', privateKey)
  
  const publicKey = ec.starkCurve.getStarkKey(privateKey)
  const constructorCallData = stark.compileCalldata({
    implementation: whash[0],
    selector: hash.getSelectorFromName('initialize'),
    calldata: stark.compileCalldata({ signer: publicKey, guardian: '0' })
  })
  const contractAddress = hash.calculateContractAddressFromHash(publicKey, wproxy[0], constructorCallData, 0)
  console.log('address: ', contractAddress.replace('0x', '0x0'))
}

function generate_address_for_braavos(mnemonic, index) {
  const node = ethers.HDNodeWallet.fromPhrase(mnemonic, "", `m/44'/9004'/0'/0/${index}`)
  const groundKey = ec.starkCurve.grindKey(node.privateKey)
  const privateKey = `0x${groundKey}` 
  console.log('private key: ', privateKey)

  const publicKey = ec.starkCurve.getStarkKey(privateKey)
  const constructorCallData = stark.compileCalldata({
    implementation: whash[1],
    selector: "0x2dd76e7ad84dbed81c314ffe5e7a7cacfb8f4836f01af4e913f275f89a3de1a", //hard code
    calldata: stark.compileCalldata({ signer: publicKey })
  })
  const contractAddress = hash.calculateContractAddressFromHash(publicKey, wproxy[1], constructorCallData, 0)
  console.log('address: ', contractAddress.replace('0x', '0x0'))
}

function main() {
  let mnemonic = process.argv[2]
  let type = process.argv[3]
  
  if (type == undefined || type == "argentx") {
    generate_address_for_argentx(mnemonic, 0)
  } else if (type == "braavos") {
    generate_address_for_braavos(mnemonic, 0)
  }
}

main()

//https://github.com/myBraavos/starknet.js