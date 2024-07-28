"use client";

import {
  EXCHANGEABI,
  TOKENABI,
  EXCHANGEADDRESS,
  TOKENADDRESS,
} from "@/constants";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import { useEffect, useState } from "react";
import { formatEther } from "viem/utils";
import { parseEther } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSendTransaction,
} from "wagmi";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: hash, writeContract } = useWriteContract();
  const [amountToken, setAmountToken] = useState(null);
  const [amountOfLpTokens, setAmountOfLpTokens] = useState(null);
  const [ethAmount, setEthAmount] = useState(null);
  const [minTokensToReceive, setMinTokensToReceive] = useState(null);
  const [minEthToReceive, setMinEthToReceive] = useState(null);
  const [tokensToSwap, setTokensToSwap] = useState(null);
  const { sendTransaction } = useSendTransaction();
  const [spender, setSpender] = useState("");
  const [value, setValue] = useState(null);
  const [amountswapToken, setAmountSwapToken] = useState(null);
  const [ethswapAmount, setEthSwapAmount] = useState(null);

  const { data: reserve } = useReadContract({
    abi: EXCHANGEABI,
    address: EXCHANGEADDRESS,
    functionName: "getReserve",
  });
  console.log("Reserve", Number(reserve));
  const { data: allowance } = useReadContract({
    abi: TOKENABI,
    address: TOKENADDRESS,
    functionName: "allowance",
    args: [address, EXCHANGEADDRESS],
  });

  console.log("Allowance", allowance);
  const { data: TokenAddress } = useReadContract({
    abi: EXCHANGEABI,
    address: EXCHANGEADDRESS,
    functionName: "tokenAddress",
  });
  console.log("tokenAddress", TokenAddress);

  const { data: LpTokensInPool } = useReadContract({
    abi: EXCHANGEABI,
    address: EXCHANGEADDRESS,
    functionName: "totalSupply",
  });

  console.log("LpTokensInPool", Number(LpTokensInPool));

  const { data: TokensMinted } = useReadContract({
    abi: TOKENABI,
    address: TOKENADDRESS,
    functionName: "totalSupply",
  });

  console.log("TokensMinted", Number(TokensMinted));

  async function addLiquidity() {
    setLoading(true);

    if (!isConnected) {
      window.alert("Please connect your wallet");
      setLoading(false);
      return;
    }

    if (!amountToken || !ethAmount) {
      window.alert("Please enter valid amounts for Token and ETH");
      setLoading(false);
      return;
    }

    try {
      // Approve the exchange to spend the specified amount of tokens
      await writeContract({
        abi: TOKENABI,
        address: TOKENADDRESS,
        functionName: "approve",
        args: [EXCHANGEADDRESS, parseEther(amountToken)],
      });

      // Add liquidity
      await writeContract({
        address: EXCHANGEADDRESS,
        abi: EXCHANGEABI,
        functionName: "addLiquidity",
        args: [parseEther(amountToken)],
        value: parseEther(ethAmount), // Pass the Ether value here
      });

      console.log("Liquidity added");
    } catch (error) {
      console.error(error);
      window.alert(error.message || "An error occurred while adding liquidity");
    }

    setLoading(false);
    setAmountToken("");
    setEthAmount("");
  }

  async function ethToTokenSwap() {
    setLoading(true);

    if (!isConnected) {
      window.alert("Please connect your wallet to create a proposal.");
      setLoading(false);
      return;
    }

    try {
      await writeContract({
        address: EXCHANGEADDRESS,
        abi: EXCHANGEABI,
        functionName: "ethToTokenSwap",
        args: [parseEther(minTokensToReceive)],
        value: parseEther(ethswapAmount), // Pass the Ether value here
      });
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
    setEthSwapAmount("");
    setMinTokensToReceive("");
  }

  async function removeLiquidity() {
    setLoading(true);
    try {
      await writeContract({
        abi: EXCHANGEABI,
        address: EXCHANGEADDRESS,
        functionName: "removeLiquidity",
        args: [amountOfLpTokens],
      });
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
    setAmountOfLpTokens("");
  }

  async function tokenToEthSwap() {
    setLoading(true);

    try {
      // Approve the exchange to spend the specified amount of tokens
      await writeContract({
        abi: TOKENABI,
        address: TOKENADDRESS,
        functionName: "approve",
        args: [EXCHANGEADDRESS, parseEther(amountswapToken)],
      });
      await writeContract({
        address: EXCHANGEADDRESS,
        abi: EXCHANGEABI,
        functionName: "tokenToEthSwap",
        args: [parseEther(amountswapToken), parseEther(minEthToReceive)],
        // value: parseEther(ethAmount), // Pass the Ether value here
      });
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
    setAmountSwapToken("");
    setMinEthToReceive("");
  }

  const { data: tokenBalanceOfUser } = useReadContract({
    abi: TOKENABI,
    address: TOKENADDRESS,
    functionName: "balanceOf",
    args: [address],
  });
  console.log("TKN held by user", tokenBalanceOfUser);

  const { data: lptokenBalanceOfUser } = useReadContract({
    abi: EXCHANGEABI,
    address: EXCHANGEADDRESS,
    functionName: "balanceOf",
    args: [address],
  });
  console.log("Lp Token held by user", Number(lptokenBalanceOfUser));

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  if (!isConnected)
    return (
      <div
        className={` bg-[url('/mainbackground.jpg')] bg-cover bg-center min-h-screen`}
      >
        <div className="container mx-auto p-4">
          <div className="text-center mb-8">
            <h1 className="text-9xl font-mono font-semibold text-white">DEX</h1>
          </div>
          <div className="flex justify-between items-center mt-10 bg-black bg-opacity-10 p-6 rounded-lg shadow-lg">
            <div className="w-3/5">
              <p className="text-white font-mono text-lg leading-relaxed">
                Welcome to Lockie – the decentralized solution for securely
                storing and retrieving question papers. Our platform leverages
                the power of IPFS and blockchain technology to ensure that your
                documents are safely stored and easily accessible. With Lockie,
                you can confidently upload your question papers, store their
                IPFS hashes on the blockchain, and retrieve them anytime using a
                unique index number. Embrace the future of secure academic
                storage and enjoy a seamless, tamper-proof experience with
                Lockie.
              </p>
              <div className="mt-5">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  return (
    <div
      className={`${inter.className} bg-[url('/mainbackground.jpg')] min-h-screen bg-cover bg-center text-white`}
    >
      <Head>
        <title>Dex</title>
        <meta name="description" content="Lockie Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-6xl md:text-9xl font-mono font-semibold text-white">
            Dex
          </h1>
        </div>

        <div className="bg-black bg-opacity-50 p-6 rounded-lg shadow-lg mb-6">
          <p>Reserve of Token TKN in pool: {Number(reserve)}</p>
          <p className="break-words">Address of Token: {TokenAddress}</p>
          <p>Total Lp Tokens Minted: {Number(LpTokensInPool)}</p>
          <p className="break-words">
            TKN held by {address}: {Number(tokenBalanceOfUser)}
          </p>
          <p className="break-words">
            LpToken held by {address}: {Number(lptokenBalanceOfUser)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-black bg-opacity-50 p-6 rounded-lg shadow-lg">
            <label className="block mb-2">Add Liquidity</label>
            <input
              className="text-black mb-2 p-2 w-full rounded"
              placeholder="Add Token"
              type="number"
              value={amountToken}
              onChange={(e) => setAmountToken(e.target.value)}
            />
            <input
              className="text-black mb-2 p-2 w-full rounded"
              placeholder="Add ETH"
              type="number"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
            />
            <button
              className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 w-full rounded transition duration-300"
              onClick={addLiquidity}
              disabled={loading}
            >
              {loading ? "Adding Liquidity..." : "Add Liquidity"}
            </button>
          </div>

          <div className="bg-black bg-opacity-50 p-6 rounded-lg shadow-lg">
            <label className="block mb-2">ETH to Token Swap</label>
            <input
              className="text-black mb-2 p-2 w-full rounded"
              placeholder="Min Token To Receive"
              type="number"
              value={minTokensToReceive}
              onChange={(e) => setMinTokensToReceive(e.target.value)}
            />
            <input
              className="text-black mb-2 p-2 w-full rounded"
              placeholder="ETH"
              type="number"
              value={ethswapAmount}
              onChange={(e) => setEthSwapAmount(e.target.value)}
            />
            <button
              className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 w-full rounded transition duration-300"
              onClick={ethToTokenSwap}
              disabled={loading}
            >
              {loading ? "Swapping..." : "ETH To Token Swap"}
            </button>
          </div>

          <div className="bg-black bg-opacity-50 p-6 rounded-lg shadow-lg">
            <label className="block mb-2">Token to ETH Swap</label>
            <input
              className="text-black mb-2 p-2 w-full rounded"
              placeholder="Min ETH To Receive"
              type="number"
              value={minEthToReceive}
              onChange={(e) => setMinEthToReceive(e.target.value)}
            />
            <input
              className="text-black mb-2 p-2 w-full rounded"
              placeholder="Token To Swap"
              type="number"
              value={amountswapToken}
              onChange={(e) => setAmountSwapToken(e.target.value)}
            />
            <button
              className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 w-full rounded transition duration-300"
              onClick={tokenToEthSwap}
              disabled={loading}
            >
              {loading ? "Swapping..." : "Token To ETH Swap"}
            </button>
          </div>

          <div className="bg-black bg-opacity-50 p-6 rounded-lg shadow-lg">
            <label className="block mb-2">Remove Liquidity</label>
            <input
              className="text-black mb-2 p-2 w-full rounded"
              placeholder="LP Tokens"
              type="number"
              value={amountOfLpTokens}
              onChange={(e) => setAmountOfLpTokens(e.target.value)}
            />
            <button
              className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 w-full rounded transition duration-300"
              onClick={removeLiquidity}
              disabled={loading}
            >
              {loading ? "Removing..." : "Remove Liquidity"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
