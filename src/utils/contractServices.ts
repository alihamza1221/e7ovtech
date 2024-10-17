//@ts-nocheck
import E7OVPAY_ABI from "./E7OVPAY_ABI.json";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
// Module-level variables to store provider, signer, and contract
let provider;
let signer;
export let contract;

// Function to initialize the provider, signer, and contract
const initialize = async () => {
  if (typeof window.ethereum !== "undefined") {
    provider = new BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    contract = new Contract(CONTRACT_ADDRESS, E7OVPAY_ABI, signer);
  } else {
    console.log("Please install MetaMask!");
    return;
  }
};

// Function to request single account
export const requestAccount = async () => {
  // Initialize once when the module is loaded

  try {
    await initialize();
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0]; // Return the first account
  } catch (error) {
    console.log("Error requesting account:", error.message);
    return null;
  }
};
// Function to get contract balance in ETH
export const getContractBalanceInETH = async () => {
  const balanceWei = await provider.getBalance(CONTRACT_ADDRESS);
  const balanceEth = formatEther(balanceWei); // Convert Wei to ETH string
  return balanceEth; // Convert ETH string to number
};

// Function to deposit funds to the contract
export const depositFund = async (depositValue) => {
  const ethValue = parseEther(depositValue);
  const deposit = await contract.payment({ value: ethValue });
  await deposit.wait();

  console.log("Successful dep!");
};

// Function to withdraw funds from the contract
export const withdrawFund = async () => {
  const withdrawTx = await contract.withdraw();
  await withdrawTx.wait();
  console.log("Withdrawal successful!");
};
