# DEX - Decentralized Exchange

## Overview

Welcome to DEX, a decentralized exchange (DEX) with an Automated Market Maker (AMM) model. This platform allows users to swap ETH for TOKEN and vice versa with a 1% fee. Liquidity providers can supply liquidity and receive LP tokens, which can be burned to withdraw ETH and TOKEN.

## Features

- **Automated Market Maker (AMM)**: Facilitates ETH <> TOKEN swaps.
- **1% Swap Fee**: Charged on all swaps, distributed to liquidity providers.
- **Liquidity Provision**: Users can supply liquidity and receive LP tokens.
- **Withdraw Liquidity**: Burn LP tokens to withdraw ETH and TOKEN.
- **Secure and Transparent**: Built with Foundry, Wagmi, and Next.js for a robust and user-friendly experience.

## Tech Stack

- **Solidity**: Smart contracts for the AMM and LP functionalities.
- **Foundry**: Development environment for Solidity.
- **Wagmi**: React hooks library for Ethereum.
- **Next.js**: Framework for the frontend.

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/akhil888binoy/Decentralized-Exchange.git
    cd dex
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**:
    Create a `.env` file in the root directory and add the necessary environment variables.

    ```plaintext
    PRIVATE_KEY="..."
    RPC_URL="..."
    ETHERSCAN_API_KEY="..."

    ```

4. **Compile contracts**:
    ```bash
    forge build
    ```

5. **Deploy contracts**:
    Update `scripts/deploy.js` with your deployment logic and run:
    ```bash
    forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY --constructor-args 0x584FB53d1309625112de608567B00f474E7E4172  --etherscan-api-key $ETHERSCAN_API_KEY --verify src/Exchange.sol:Exchange

    ```

6. **Run the development server**:
    ```bash
    npm run dev
    ```

## Usage

### Adding Liquidity

1. **Connect your wallet**.
2. **Navigate to the "Add Liquidity" section**.
3. **Input the amount of ETH and TOKEN** you want to add.
4. **Approve TOKEN transfer**.
5. **Add liquidity**.

### Swapping ETH <> TOKEN

1. **Connect your wallet**.
2. **Navigate to the "Swap" section**.
3. **Select the amount of ETH or TOKEN** you want to swap.
4. **Approve TOKEN transfer** if swapping TOKEN.
5. **Confirm the swap**.

### Withdrawing Liquidity

1. **Connect your wallet**.
2. **Navigate to the "Withdraw Liquidity" section**.
3. **Select the amount of LP tokens** to burn.
4. **Confirm the withdrawal**.

## Contract Addresses

- **DEX Contract**: `0xC739AfadE19BB21b5BBc9750f00ecf85bbD4fE61`
- **TOKEN Contract**: `0x584FB53d1309625112de608567B00f474E7E4172`

## License

This project is licensed under the MIT License.
