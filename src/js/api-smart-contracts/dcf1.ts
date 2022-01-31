import { Idl, Program, BN, web3, utils } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getSolanaProvider } from "../services/solana";
import idl from '../idl_dcf.json';
import { LAMPORTS_PER_SOL, SYSVAR_INSTRUCTIONS_PUBKEY } from '@solana/web3.js';
import { finalizeCoinFlip, flipCoin, log, startCoinFlip } from '../api/degen.service';
import { getDegenCoinFlipDegenerateAccount, getDegenCoinFlipHouseState, getDegenCoinFlipHouseTreasury, getDegenCoinFlipRewardsAccount } from '../utils/accounts';
import { INITIALIZER_ID, AUTHORITY_ID } from '../utils/program-constants';
import moize from 'moize';

// const TREASURY_ADDRESS = "EJBt5hxFPShAiuS3K2njkWo8n5ubQqQccbFoVFeHAL9K";
// const DEGEN_ACCOUNT_ADDRESS = "g24ZfYtEFro2VZH1x6XZyiqATYKd3dDcBET15Z1PiDQ"; // prod
// const DEGEN_ACCOUNT_ADDRESS = "CEvrobqc1akuJTJBE6RkkkGFApZqFSdbKK4ga3ZxTa3L"; //dev

const {
  SystemProgram,
  Keypair,
  SYSVAR_RENT_PUBKEY,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY
} = web3;

let programID: any;
let program: any;
let provider: any;

const init = moize((wallet: any = null, commitment = "confirmed") => {
  if (program) return;
  programID = new PublicKey(idl.metadata.address);
  provider = getSolanaProvider(wallet, commitment);
  program = new Program(idl as Idl, programID, provider);
});

const getProvider = moize(() => {
  if ("solana" in window) {
    const anyWindow: any = window;
    const provider = anyWindow.solana;
    if (provider.isPhantom && provider.isConnected) {
      return provider;
    }
  }
  if ("solflare" in window) {
    const anyWindow: any = window;
    const provider = anyWindow.solflare;
    if (provider.isSolflare && provider.isConnected) {
      return provider;
    }
  }
  window.open("https://phantom.app/", "_blank", "noopener,noreferrer");
});

export const signMessage = async (nonce: string) => {
  const message = `I am signing my one-time nonce: ${nonce}`;
  const provider = getProvider();
  const data = new TextEncoder().encode(message);
  try {
    const signedMessage = await provider?.signMessage(data);
    return signedMessage;
  } catch (err) {
    console.warn(err);
  }
};

export const initDegeneracy = async (wallet: any = null, amount: any) => {
  init(wallet);

  const [_house_treasury_account_pda, _house_treasury_account_bump] = await getDegenCoinFlipHouseTreasury(
    INITIALIZER_ID, AUTHORITY_ID
  );


  const [_house_state_account_pda, _house_state_account_bump] = await getDegenCoinFlipHouseState(
    INITIALIZER_ID, AUTHORITY_ID
  );

  await program.rpc.initializeDegeneracy(
    _house_treasury_account_bump,
    _house_state_account_bump,
    new BN(amount* LAMPORTS_PER_SOL),
    {
      accounts: {
        initializer: provider.wallet.publicKey,
        authority: AUTHORITY_ID, 
        houseTreasury: _house_treasury_account_pda,
        houseState: _house_state_account_pda,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY
      }
    }
  );
  
  const houseAmount = await provider.connection.getBalance(_house_treasury_account_pda);
  return houseAmount;
};

export const goDegen = async (side: any, amount: number, wallet: any = null, token: any) => {
  init(wallet);

  const coinFlip = {
    walletId: provider.wallet.publicKey.toString(),
    side,
    amount
  };

  const { payload } = await startCoinFlip(coinFlip, token);
  const [_house_treasury_account_pda, _house_treasury_account_bump] = await getDegenCoinFlipHouseTreasury(
    INITIALIZER_ID, AUTHORITY_ID
  );

  const [_house_state_account_pda, _house_state_account_bump] = await getDegenCoinFlipHouseState(
    INITIALIZER_ID, AUTHORITY_ID
  );

  const [_degenerate_account_pda, _degenerate_account_bump] = await getDegenCoinFlipDegenerateAccount(
    provider.wallet.publicKey, INITIALIZER_ID, AUTHORITY_ID
  );

  const [_rewards_account_pda, _rewards_account_bump] = await getDegenCoinFlipRewardsAccount(
    provider.wallet.publicKey, INITIALIZER_ID, AUTHORITY_ID
  );

  await program.rpc.goDegen(
    _house_treasury_account_bump,
    _house_state_account_bump,
    _degenerate_account_bump,
    _rewards_account_bump,
      new BN(amount * LAMPORTS_PER_SOL),
    {
      accounts: {
        degenerate: provider.wallet.publicKey,
        initializer:  INITIALIZER_ID,
        authority:  AUTHORITY_ID,
        houseTreasury: _house_treasury_account_pda,
        houseState: _house_state_account_pda,
        degenerateAccount: _degenerate_account_pda,
        rewardsAccount: _rewards_account_pda,
        systemProgram: SystemProgram.programId,
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY
      }
    }
  );
  return payload;
};


export const getRewards = async (wallet: any = null) => {
  init(wallet, "processed");

  const [_house_state_account_pda, _house_state_account_bump] = await getDegenCoinFlipHouseState(
    INITIALIZER_ID, AUTHORITY_ID
  );

  const [_rewards_account_pda, _rewards_account_bump] = await getDegenCoinFlipRewardsAccount(
    provider.wallet.publicKey, INITIALIZER_ID, AUTHORITY_ID
  );

  await program.rpc.sendRewards(
    _house_state_account_bump,
    _rewards_account_bump,
    {
      accounts: {
        degenerate: provider.wallet.publicKey,
        initializer:  INITIALIZER_ID,
        authority:  AUTHORITY_ID,
        houseState: _house_state_account_pda,
        rewardsAccount: _rewards_account_pda,
        systemProgram: SystemProgram.programId,
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY
      }
    }
  );

};

export const flipExists = async (wallet: any) => {
  init(wallet);
  const [_degenerate_account_pda, _degenerate_account_bump] = await getDegenCoinFlipDegenerateAccount(
    provider.wallet.publicKey, INITIALIZER_ID, AUTHORITY_ID
  );
  const degenerateAmount = await provider.connection.getBalance(_degenerate_account_pda, "processed");
  return degenerateAmount > 0;
}


export const rewardExists = async (wallet: any) => {
  init(wallet);

  const [_rewards_account_pda, _rewards_account_bump] = await getDegenCoinFlipRewardsAccount(
    provider.wallet.publicKey, INITIALIZER_ID, AUTHORITY_ID
  );
  const rewardsAmount = await provider.connection.getBalance(_rewards_account_pda, "processed");
  return rewardsAmount > 0;
}

export const getDegenAccount = async (degenInstance: any) => {
  const [vault_account_pda, vault_account_bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from(utils.bytes.utf8.encode("house"))
    ],
    program.programId
  );
  const houseAmount = await provider.connection.getBalance(vault_account_pda);
  let _degenInstance = await program.account.degenInstance.fetch(degenInstance.publicKey, "processed");
  return {
    instance: degenInstance,
    id: degenInstance.publicKey,
    degenerateKey: _degenInstance.degenerateKey.toString(),
    degenerateAmount: _degenInstance.degenerateAmount.toNumber(),
    degenerateChoice: _degenInstance.degenerateChoice,
    degenerateWon: _degenInstance.degenerateWon,
    flipResult: _degenInstance.flipResult,
    houseAmount
  };
}

export const getDegenAccountById = async (degenInstanceId: any, wallet: any) => {
  init(wallet);
  const [vault_account_pda, vault_account_bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from(utils.bytes.utf8.encode("house"))
    ],
    program.programId
  );
  const houseAmount = await provider.connection.getBalance(vault_account_pda);
  let _degenInstance = await program.account.degenInstance.fetch(degenInstanceId, "processed");


  return {
    id: degenInstanceId,
    degenerateKey: _degenInstance.degenerateKey.toString(),
    degenerateAmount: _degenInstance.degenerateAmount.toNumber(),
    degenerateChoice: _degenInstance.degenerateChoice,
    degenerateWon: _degenInstance.degenerateWon,
    flipResult: _degenInstance.flipResult,
    houseAmount
  };
}

export const enableMoreDegeneracy = async (wallet: any = null, amount: any) => {
  init(wallet);

  const [_house_treasury_account_pda, _house_treasury_account_bump] = await getDegenCoinFlipHouseTreasury(
    INITIALIZER_ID, AUTHORITY_ID
  );

  const [_house_state_account_pda, _house_state_account_bump] = await getDegenCoinFlipHouseState(
    INITIALIZER_ID, AUTHORITY_ID
  );

  const [_degenerate_account_pda, _degenerate_account_bump] = await getDegenCoinFlipDegenerateAccount(
    provider.wallet.publicKey, INITIALIZER_ID, AUTHORITY_ID
  );

  await program.rpc.enableMoreDegeneracy(
    _house_treasury_account_bump,
    _house_state_account_bump,
    new BN(amount* LAMPORTS_PER_SOL),
    {
      accounts: {
        initializer: INITIALIZER_ID,
        authority: AUTHORITY_ID,
        payer: provider?.wallet?.publicKey,
        houseTreasury: _house_treasury_account_pda,
        houseState: _house_state_account_pda,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY
      }
    }
  )
};

export const getCurrentBalance =  async (wallet: any) => {
  init(wallet);
  const balance =  await provider.connection.getBalance(provider.wallet.publicKey, "processed");
  return balance / LAMPORTS_PER_SOL;
}