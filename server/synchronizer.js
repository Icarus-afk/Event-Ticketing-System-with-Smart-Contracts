import ethers from 'ethers';
import mongoose from 'mongoose';
import Wallet from './models/wallet.js';
import dotenv from 'dotenv';
import { setInterval } from 'timers';

dotenv.config();

const MONGO_STRING = process.env.MONGO_STRING;
const ETHEREUM_NODE_URL = process.env.ETHEREUM_NODE_URL;

async function connectToMongoDB() {
  // TODO: Add error handling and reconnection logic
  await mongoose.connect(MONGO_STRING);
  console.log('Connected to MongoDB');
}

async function createEthereumProvider() {
  // TODO: Add error handling and reconnection logic
  const provider = new ethers.providers.WebSocketProvider('HTTP://127.0.0.1:7545');
  console.log('Connected to Ethereum node');
  return provider;
}

async function syncBalances(provider) {
  const wallets = await Wallet.find({});
  console.log(`Found ${wallets.length} wallets`);

  wallets.forEach((wallet) => {
    setInterval(async () => {
      const newBalance = await provider.getBalance(wallet.address);
      const balanceInEther = ethers.utils.formatEther(newBalance);
      const balanceInEtherNumber = parseFloat(balanceInEther);

      if (wallet.balance !== balanceInEtherNumber) {
        wallet.balance = balanceInEther;
        await wallet.save();
        console.log(`Updated balance for ${wallet.address} to ${balanceInEther}`);
      }
    }, 1000);  

    console.log(`Subscribed to balance changes for ${wallet.address}`);
  });
}

async function main() {
  await connectToMongoDB();
  const provider = await createEthereumProvider();
  await syncBalances(provider);
  setInterval(() => {}, 1000);  // Keep the script running
}

main().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});