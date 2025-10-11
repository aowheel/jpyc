# JPYC EC Demo

Gas-free EC site demo using JPYC EIP-3009 `receiveWithAuthorization` functionality.

## Features

- 🛒 Product catalog with shopping cart
- 💳 MetaMask wallet connection
- ⛽ Gas-free transactions (operator pays gas fees)
- 🔐 EIP-712 signature-based authorization
- 💰 JPYC token payments

## How it works

1. **Customer Experience**: Users can browse products, add them to cart, and purchase using only JPYC tokens without worrying about gas fees
2. **Gas-free Transactions**: The shop operator runs a relayer service that pays for gas fees
3. **Secure Authorization**: Uses EIP-3009 `receiveWithAuthorization` with EIP-712 signatures for secure, off-chain authorization
4. **Instant Settlement**: Transactions are executed immediately when customers sign the authorization

## Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and set:
   ```
   RELAYER_PRIVATE_KEY=0x... # Private key for the shop operator/relayer account
   RPC_ENDPOINT=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   ```

3. **Prepare Accounts**:
   - **Relayer Account**: Fund with ETH for gas fees (acts as shop operator)
   - **Customer Account**: Fund with JPYC tokens for purchases

4. **Run the application**:
   ```bash
   npm run dev
   ```

5. **Test the flow**:
   - Open http://localhost:3000
   - Connect MetaMask wallet (make sure you're on Sepolia testnet)
   - Add products to cart
   - Click "Purchase with JPYC"
   - Sign the authorization message
   - Transaction will be executed by the relayer

## Architecture

```
Customer (MetaMask) -> Frontend -> Backend API -> Blockchain
                    |          |                      ^
                    |          v                      |
                    |    EIP-712 Signature            |
                    |          |                      |
                    |          v                      |
                    |    receiveWithAuthorization     |
                    |          |                      |
                    |          v                      |
                    |    Relayer Account -------------|
                              (pays gas)
```

## Contract Information

- **JPYC Contract**: `0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB` (Sepolia)
- **Chain**: Sepolia Testnet (Chain ID: 11155111)

## Key Components

- **Frontend**: Next.js with wagmi for wallet interaction
- **Backend**: Next.js API route for relayer service
- **Wallet**: MetaMask for signing authorizations
- **Blockchain**: Sepolia testnet with JPYC contract

## Security Features

- EIP-712 typed data signatures prevent replay attacks
- Nonce-based authorization prevents double spending
- Time-limited authorization (1 hour validity)
- Amount validation on both frontend and backend
