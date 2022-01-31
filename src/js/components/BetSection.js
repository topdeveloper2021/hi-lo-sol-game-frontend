import {useEffect, useState} from 'react'
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';

import { useSelector, connect } from 'react-redux'; 

import { isPropertySignature } from 'typescript';
// const BN = require('bn.js');

import {Program, Provider, web3 } from '@project-serum/anchor';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

import idl from '../../json/idl.json';
import kp from '../../Keypair.json';
import game_kp from '../../gamekeypair.json';
import adminWallet from '../../env.json';

const { SystemProgram, Keypair, LAMPORTS_PER_SOL } = web3;

const base_arr = Object.values(kp._keypair.secretKey);
const base_secret = new Uint8Array(base_arr);
// const baseAccount = Keypair.fromSecretKey(base_secret);

const game_arr = Object.values(game_kp._keypair.secretKey);
const game_secret = new Uint8Array(game_arr);
const gameAccount = Keypair.fromSecretKey(game_secret);

const companyWallet = adminWallet.COMPANY_WALLET_ADDRESS;
const companyWalletAccount = new PublicKey(companyWallet);


const network = clusterApiUrl('devnet');
// const network = "https://api.devnet.solana.com";
const opts = {
    preflightCommitment: "processed"
}
const programID = new PublicKey("H5siyy2c3JJ5TJ8TppQtEKgEH9QJTR8Vg2zCdmscWjVY");
function Betsection(props){
    const wallet = useWallet();
    const [profitRate, setProfitRate] = useState(1.00);

    const  getProvider = async()  =>{
        /* create the provider and return it to the caller */
        /* network set to local network for now */
        const network = clusterApiUrl("devnet");
        const connection = new Connection(network, opts.preflightCommitment);
    
        const provider = new Provider(
          connection, wallet, opts.preflightCommitment,
        );
        return provider;
    }

    const initializeBet = async () => {

        const provider = await getProvider();
        const transferAmount = props.betAmount*web3.LAMPORTS_PER_SOL;
        const program = new Program(idl, programID, provider);
        const tx =  await program.rpc.placeBet(transferAmount.toString(), {
          accounts: {
            baseAccount: props.baseAccount.publicKey,
            poolWallet: gameAccount.publicKey,
            companyWallet: companyWalletAccount,
            user: provider.wallet.publicKey,        
            systemProgram: SystemProgram.programId
          },
        });
        props.setActive(true);
        props.setIndex(1);
    }

    const changeBetAmount = (e) => {
        if(e.target.value!= null){
            let betAmount = parseFloat(e.target.value);
            if(betAmount>=1)
               props.setBetAmount(1);
            else props.setBetAmount(betAmount);
        }
        else {
            props.setBetAmount(0);
        }       
    }
    const setHalfAmount = (e) => {
        let half = props.betAmount/2;
        if (half<=0.1)
            props.setBetAmount(0.1);
        else if(half>=1)
            props.setBetAmount(1);
        else props.setBetAmount(half);
    }
    const setDoubleAmount = (e) => {
        let double = props.betAmount*2;
        if(double>=1)
               props.setBetAmount(1);
        else props.setBetAmount(double);
    }

    const cashOut = async() => {
        props.setCashOutFlag(true);
        const provider = await getProvider();
        const program = new Program(idl, programID, provider);
        let account = await program.account.baseAccount.fetch(props.baseAccount.publicKey);
        try {
            await program.rpc.cashOut({
                accounts: {
                  baseAccount: props.baseAccount.publicKey,
                  poolWallet: gameAccount.publicKey,
                  user: provider.wallet.publicKey,        
                  systemProgram: SystemProgram.programId
                },
                signers:[gameAccount]
              });
        }catch(exception){
            
        }
        setTimeout(()=> {
            props.setCashOutFlag(false);
            props.setCardHistory([]);
            props.setIndex(0);
            props.setActive(false);
        }, 2000);
    }
    return(
        
        <div className="">    
            <div className='profit_section'>
                <div className='profit_rate'>Total Profit ({props.rate.toFixed(3)}x)</div>
                <div className='profit_amount_section'>
                    <div className='profit_amount'>{(props.betAmount*props.rate).toFixed(3)}</div>
                    <div className='money_ico'>sol</div>
                </div>
            </div>
            <div className="bet_section">
                <div className="bet_amount_section">
                    <div className="bet_top_section">
                        <div className="">Bet Amount</div>
                        <div className=""> {props.betAmount} SOL</div>
                    </div>
                    <div className="bet_set_row">
                        <div className="bet_number_section">
                            <input className="bet_profit_amount" type="number" name="bet_amount" id="bet_amount" value={props.betAmount} onChange={changeBetAmount} />
                            <div className='money_ico'>sol</div>
                        </div>
                        <button className='half_btn' onClick={setHalfAmount}>1/2</button>
                        <span className='black_color'>|</span>
                        <button className='double_btn' onClick={setDoubleAmount}>2x</button>
                    </div>
                </div>
                <div className="bet_button_section">
                    {
                        props.rate > 1 ? <button className="bet_btn" onClick={cashOut}>CashOut</button> : <button className="bet_btn" onClick={initializeBet}>Bet</button>
                    }
                </div>
            </div>
        </div>
        
    );
}


const mapStateToProps = state => ({
    profit_rate: state.profit_rate_reducer.profit_rate,
});

export default connect(mapStateToProps)(Betsection);