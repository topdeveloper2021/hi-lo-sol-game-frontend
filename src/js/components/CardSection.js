import {useState, useEffect} from 'react'
import Card from './Card';
import CardwithRate from './CardwithRate';
import { bindActionCreators } from 'redux';
import { useSelector, connect } from 'react-redux'; 
import { userActions } from '../../redux/actions/ProfitRateAction';
import {Program, Provider, web3 } from '@project-serum/anchor';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

import idl from '../../json/idl.json';
import kp from '../../Keypair.json';
require('@solana/wallet-adapter-react-ui/styles.css');
const { SystemProgram, Keypair, LAMPORTS_PER_SOL } = web3;

const base_arr = Object.values(kp._keypair.secretKey);
const base_secret = new Uint8Array(base_arr);

const network = clusterApiUrl('devnet');
const opts = {
    preflightCommitment: "processed"
}

const programID = new PublicKey("H5siyy2c3JJ5TJ8TppQtEKgEH9QJTR8Vg2zCdmscWjVY");

function Cardsection(props){
    const [faceDown, setFaceDown] = useState(false);
    // const [index, setIndex] = useState(1);
    const [rand, setRand] = useState();
    const [prevRand, setPrevRand] = useState(0);
    var elements = [];
    useEffect(async () => {
        if(props.index==1){
            if(props.active){
                let initialRand = await props.getNewRand();
                let initialRandCard = [
                      {   index: props.index,
                          rate: 0,                     
                          rand: initialRand,
                          faceDown: false
                      }
                ];   
                props.setComRate(1);               
                setRand(initialRand);
                let number = isK(initialRand);
                setPrevRand(number);
                props.setCardHistory([...props.cardHistoryArray, initialRandCard]);
            } 
        }
        if(props.index ==0){
            props.setComRate(1);
            props.setShowAlertModal(true);
            setTimeout(()=>{              
                props.setShowAlertModal(false);
            }, 2000);
        }
          
      }, [props.index]);
    const isK = (k) => {
        if(k%13==0) return 13;
        else return k%13;
    }
    const getProvider = () => {
        const connection = new Connection(network, opts.preflightCommitment);
        const provider = new Provider(connection, window.solana, opts.preflightCommitment,);
        return provider;
    }

    const compareBet = async(bet) => {
        const provider =  getProvider();
        const program = new Program(idl, programID, provider);
        await program.rpc.compareBet( bet, {
            accounts: {
            baseAccount: props.baseAccount.publicKey,
            },
        });
    }
    
    const renderCards = () => {
        props.cardHistoryArray.map((element, i) => {
            elements.push(<CardwithRate element = {element} key={i} />); 
         });
         return(
             <div className="history_cards" id="history_cards">
                   {elements} 
             </div>
         )
    }

    const doUpPrediction = async() => {
        if(props.active){
            await compareBet("up");
            let newRand = await props.getNewRand();         
            setRand(newRand); 
            let nextIndex = props.index+1; 
            props.setIndex(nextIndex);
           if(isK(newRand)>=prevRand){
               let profitRate = 2 - parseFloat((14 - isK(prevRand))/13).toFixed(2);
               
               props.setComRate(props.rate*profitRate);
               let newHistoryCard = [
                   {   index: nextIndex,
                       rate: profitRate,
                       rand: newRand,
                       faceDown: false
                   }
               ];
               props.setCardHistory([...props.cardHistoryArray, newHistoryCard]);
               document.getElementById("history_cards").scrollLeft = document.getElementById("history_cards").scrollWidth+250;
               setPrevRand(isK(newRand));
           } else {
   
               let newHistoryCard = [
                   {   index: nextIndex,
                       rate: 0.00,
                       rand: newRand,
                       faceDown: false
                   }
               ];
               props.setComRate(0);
               props.setCardHistory([...props.cardHistoryArray, newHistoryCard]);
               document.getElementById("history_cards").scrollLeft = document.getElementById("history_cards").scrollWidth+ 250;
               props.setLostFlag(true);
               setTimeout(() => {
                   props.setLostFlag(false);
                   props.setCardHistory([]);
                   props.setActive(false);
                   props.setIndex(0);
               }, 2000);
           }
        } else {
            props.setShowAlertModal(true);
            setTimeout(()=>{
                props.setShowAlertModal(false);
            }, 2000);
        }
    }

    const doDownPrediction = async() => {
        if(props.active){
            await compareBet("down");
            let newRand = await props.getNewRand();   
    
            setRand(newRand);        
            let nextIndex = props.index+1; 
            props.setIndex(nextIndex);
            if(isK(newRand)<=prevRand){
    
                let profitRate =2 - parseFloat(isK(prevRand)/13).toFixed(2);
                
                props.setComRate(props.rate*profitRate);
                let newHistoryCard = [
                    {   index: nextIndex,
                        rate: profitRate,
                        rand: newRand,
                        faceDown: false
                    }
                ];
                props.setCardHistory([...props.cardHistoryArray, newHistoryCard]);
                document.getElementById("history_cards").scrollLeft = document.getElementById("history_cards").scrollWidth + 250;
                setPrevRand(isK(newRand));
            } else {
                let newHistoryCard = [
                    {   index: nextIndex,
                        rate: 0.00,
                        rand: newRand,
                        faceDown: false
                    }
                ];
                props.setComRate(0);
                props.setCardHistory([...props.cardHistoryArray, newHistoryCard]);
                document.getElementById("history_cards").scrollLeft = document.getElementById("history_cards").scrollWidth+ 250;
                props.setLostFlag(true);
                setTimeout(() => {
                    props.setLostFlag(false);
                    props.setCardHistory([]);
                    props.setActive(false);
                    props.setIndex(0);
                }, 2000);
            }    
        } else {
            props.setShowAlertModal(true);
            setTimeout(()=>{
                props.setShowAlertModal(false);
            }, 2000);
        }
        
    }
        
    return(
        <div className="">
            <div className='card_section'>
                <Card index={rand} doUpPrediction={doUpPrediction} doDownPrediction = {doDownPrediction}  />            
                <div className='history_section'>
                    {
                        renderCards()
                    }
                </div>
            </div>
        </div>
        
    );
}

const mapDispatchToProps = () => bindActionCreators({
    setProfitRate: userActions.setProfitRate,
});

export default connect(mapDispatchToProps)(Cardsection);