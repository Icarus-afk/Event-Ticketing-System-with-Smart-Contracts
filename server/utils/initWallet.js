import { randomBytes, createCipheriv } from 'crypto';
import { Wallet } from 'ethers'
import dotenv from 'dotenv'
import walletSchema from '../models/wallet.js'
import Web3 from 'web3';
import logger from './consoleLogger.js'

dotenv.config()

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

const web3 = new Web3('http://localhost:7545'); 

function handleError(error) {
  logger.error(error);
}

export const createWallet = async (userId) => {
  try {
    const accountbef = await web3.eth.getAccounts();
    logger.info('Accounts ----> :', accountbef);
    logger.info('Creating wallet for user:', userId);

    const wallet = Wallet.createRandom();

    const privateKey = wallet.privateKey;
    const address = wallet.address;
    const publicKey = wallet.publicKey;

    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-ctr', ENCRYPTION_KEY, iv);
    let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex');
    encryptedPrivateKey += cipher.final('hex');


    const newWallet = new walletSchema({
      address: address,
      privateKey: encryptedPrivateKey,
      publicKey: publicKey,
      iv: iv.toString('hex'),
      userId: userId,
    });

    await newWallet.save();

    logger.info('Wallet saved successfully');

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    logger.info('Wallet connected to Ganache network');

    return newWallet;
  } catch (error) {
    handleError(error);
  }
};
