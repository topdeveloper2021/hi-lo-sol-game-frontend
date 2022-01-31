
import { getSolanaProvider } from "../services/solana";
import { LAMPORTS_PER_SOL, SYSVAR_INSTRUCTIONS_PUBKEY } from '@solana/web3.js';
import moize from 'moize';

// const TREASURY_ADDRESS = "EJBt5hxFPShAiuS3K2njkWo8n5ubQqQccbFoVFeHAL9K";
// const DEGEN_ACCOUNT_ADDRESS = "g24ZfYtEFro2VZH1x6XZyiqATYKd3dDcBET15Z1PiDQ"; // prod
// const DEGEN_ACCOUNT_ADDRESS = "CEvrobqc1akuJTJBE6RkkkGFApZqFSdbKK4ga3ZxTa3L"; //dev

let programID: any;
let program: any;
let provider: any;

const init = moize((wallet: any = null, commitment = "confirmed") => { 
  provider = getSolanaProvider(wallet, commitment);
});

export const getCurrentBalance =  async (wallet: any) => {
  init(wallet);
  const balance =  await provider.connection.getBalance(provider.wallet.publicKey, "processed");
  return balance / LAMPORTS_PER_SOL;
}