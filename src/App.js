import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getPhantomWallet } from '@solana/wallet-adapter-wallets';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

import Cardsection from './js/components/CardSection';
import Betsection from './js/components/BetSection';
import Navbar from './js/components/Navbar';
import Loading from './js/components/Loading';
import {Program, Provider, web3 } from '@project-serum/anchor';
import idl from './json/idl.json';
import adminWallet from './env.json';
import game_kp from './gamekeypair.json';
import kp from './Keypair.json';
const bs58 = require('bs58');
require('@solana/wallet-adapter-react-ui/styles.css');


const { SystemProgram, Keypair, LAMPORTS_PER_SOL } = web3;
const admin_arr = Object.values(game_kp._keypair.secretKey);
const admin_secret = new Uint8Array(admin_arr);

const base_arr = Object.values(kp._keypair.secretKey);
const base_secret = new Uint8Array(base_arr);
const baseAccount = Keypair.generate();
const poolAccount = web3.Keypair.fromSecretKey(admin_secret);
const companyWallet = new PublicKey(adminWallet.COMPANY_WALLET_ADDRESS);

// const network = clusterApiUrl('devnet');
// const network = "https://api.devnet.solana.com";
const wallets = [getPhantomWallet()];

window.Buffer = window.Buffer || require('buffer').Buffer;
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

const programID = new PublicKey("H5siyy2c3JJ5TJ8TppQtEKgEH9QJTR8Vg2zCdmscWjVY");

function App() {
 
  const wallet =useWallet();
  const [active, setActive] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [comProfitRate, setComRate] = useState(1.00);
  const [cashOutFlag, setCashOutFlag] = useState(false);
  const [lostFlag, setLostFlag] = useState(false);
  const [betAmount, setBetAmount] = useState(0.1);
  const [cardHistoryArray, setCardHistory] = useState([]);
  const [index, setIndex] = useState(0);
  const [walletAddress, setWalletAddress] = useState(null);
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(connection, wallet, opts.preflightCommitment);
    return provider;
  }

  const init = async() => {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    let tx =  await program.rpc.startStuffOff({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });
    setIndex(0);
  }

  const generateRand = async() =>{
    const provider =  getProvider();
    const program = new Program(idl, programID, provider);
    let tx = await program.rpc.generateRand({
        accounts: {
         baseAccount: baseAccount.publicKey,
        },
    });

    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    return account.currentRand;
  }

  const getNewRand =async() => {
    const provider =  getProvider();
    const program = new Program(idl, programID, provider);
    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    return account.currentRand;
  }

  return (
      <div className="App">
        <Loading/>   
        <Navbar setWalletAddress = {setWalletAddress} init={init} />        
        <div className="row px-5 py-5 main-game-section">
            {   cashOutFlag &&
                <div className='cashout-modal'>
                    <div className='cash-rate'>
                        {comProfitRate.toFixed(2)} X
                    </div>
                    <div className='profit-sol'>
                         {(betAmount*comProfitRate).toFixed(3)} sol
                    </div>
                </div>
            }
            {
              lostFlag &&
              <div className='cashout-modal'>
                  <div className='lost-text'>
                      You lost your sol
                  </div>
                  <div className='lost-text'>
                      Good luck next time
                  </div>
              </div>
            }
            {
                showAlertModal &&
                <div className='cashout-modal'>
                  <div className='lost-text'>
                      Please bet SOL to game
                  </div>
              </div>
            }
          <div className='col-12'>
            <div className='row'>
              <div className="col-sm-12 col-md-8">
                {walletAddress && <Cardsection setShowAlertModal={setShowAlertModal} active={active} setActive={setActive} init={init} getNewRand={getNewRand} generateRand={generateRand}  baseAccount={baseAccount} poolAccount={poolAccount} companyWallet={companyWallet}  lostFlag={lostFlag} setLostFlag={setLostFlag} rate={comProfitRate} setComRate={setComRate} cardHistoryArray={cardHistoryArray} setCardHistory={setCardHistory} index={index} setIndex={setIndex} />}
              </div>
              <div className="col-sm-12 col-md-4  right-section">
                  { walletAddress &&
                    <Betsection active={active} setActive={setActive} cardHistoryArray={cardHistoryArray} setCardHistory={setCardHistory} index={index} setIndex={setIndex} rate={comProfitRate} setComRate={setComRate} betAmount ={betAmount} setBetAmount={setBetAmount} cashOutFlag={cashOutFlag} setCashOutFlag={setCashOutFlag} baseAccount={baseAccount} />
                  }
              </div>
            </div>         
          </div>                                
        </div>        
      </div>
  );
}

const AppWithProvider = () => (
  <ConnectionProvider endpoint={network} >
    <WalletProvider wallets={wallets}>
      <WalletModalProvider>
          <App />  
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
)

export default AppWithProvider;
