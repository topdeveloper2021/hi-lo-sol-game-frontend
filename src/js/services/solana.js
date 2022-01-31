import { Provider } from '@project-serum/anchor';
import { Commitment, ConfirmOptions, Connection, clusterApiUrl, ConnectionConfig } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { RPC_URL } from '../utils/constants';

const URL = RPC_URL;
// const URL = clusterApiUrl("mainnet-beta");
const DEFAULT_TIMEOUT_IN_MS = 60000;

const opts = {
  preflightCommitment: "processed",
  commitment: "confirmed"
};

export function getSolanaProvider(wallet: any, commitment: any = opts.commitment, preflightCommitment: any = opts.preflightCommitment) {
  const options = {
    preflightCommitment,
    commitment,
    confirmTransactionInitialTimeout: DEFAULT_TIMEOUT_IN_MS
  };

  const connection = new Connection(URL, options as ConnectionConfig);
  return new Provider(connection, wallet, options as ConfirmOptions);
}