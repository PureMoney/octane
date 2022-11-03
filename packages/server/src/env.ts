import { Cluster, clusterApiUrl, Keypair } from "@solana/web3.js";

// DEV mode or not
const devMode = process.env.REACT_APP_DEV_MODE === "1";

// Octane secret key (private key for the fee payer account) for prod, change if dev
let OCTANE_SECRET_KEY = process.env.OCTANE_SECRET_KEY_PROD || "";

// Solana cluster for prod, change this if dev
let SOLANA_CLUSTER = process.env.REACT_APP_SOL_CLUSTER_PROD || "mainnet";

// ROKS mint address. Added default if not changed
let ROKS_MINT_ADDRESS = process.env.ROKS_MINT_ADDRESS_PROD || "roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8";

// The fee payer account
let FEE_PAYER = process.env.OCTANE_FEE_PAYER_ADDRESS_PROD || "";

if (devMode) {
  OCTANE_SECRET_KEY = process.env.OCTANE_SECRET_KEY_DEV || "";
  SOLANA_CLUSTER = process.env.REACT_APP_SOL_CLUSTER_DEV || "devnet";
  ROKS_MINT_ADDRESS = process.env.ROKS_MINT_ADDRESS_DEV || "roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8";
  FEE_PAYER = process.env.OCTANE_FEE_PAYER_ADDRESS_DEV || "";
}

export const ENV_SECRET_KEYPAIR = Keypair.fromSecretKey(Uint8Array.from(OCTANE_SECRET_KEY.split(",").map(Number)));
export const ENV_FEE_PAYER = ENV_SECRET_KEYPAIR.publicKey;
export const ENV_RATE_LIMIT = Number(process.env.OCTANE_RATE_LIMIT) || undefined;
export const ENV_RATE_LIMIT_INTERVAL = Number(process.env.OCTANE_RATE_LIMIT_INTERVAL) || undefined;

export const ENV_SOLANA_CLUSTER = clusterApiUrl(SOLANA_CLUSTER as Cluster);

export const config = {
  rpcUrl: ENV_SOLANA_CLUSTER,
  maxSignatures: 2,
  lamportsPerSignature: 5000,
  corsOrigin: true,
  endpoints: {
    transfer: {
      tokens: [
        {
          mint: ROKS_MINT_ADDRESS,
          account: FEE_PAYER,
          decimals: 9,
          fee: 10000000,
        },
      ],
    },
    createAssociatedTokenAccount: {
      tokens: [
        {
          mint: ROKS_MINT_ADDRESS,
          account: FEE_PAYER,
          decimals: 9,
          fee: 10000000,
        },
      ],
    },
    whirlpoolsSwap: {
      tokens: [
        {
          mint: "__PLACEHOLDER__",
          account: "__PLACEHOLDER__",
          decimals: 9,
          fee: 10000000,
        },
      ],
    },
  },
};
