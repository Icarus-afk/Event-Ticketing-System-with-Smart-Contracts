import Web3 from 'web3';

export const initContract = (url, contractABI, contractAddress) => {
  const web3Instance = new Web3(url);
  const contract = new web3Instance.eth.Contract(contractABI, contractAddress);
  return { web3Instance, contract };
};