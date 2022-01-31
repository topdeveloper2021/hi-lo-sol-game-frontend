import {useEffect, useState} from 'react';
import cardBackImg from '../../assets/back.png';

function Card(props){
    const initialIndex = props.index;
    const [rotationY, setRotateY] = useState(1);
    const [faceDown, setFaceDown] = useState(false);
    const [card, setCard] = useState(initialIndex);
    const [upPercent, setUpPercent] = useState(50.0);
    const [downPercent, setDownPercent] = useState(50.0);
    const getCardNumberFromIndex = (index) => {
        let number=0;
        number = index % 13;
        if(number ==0) {
            return 13;
        } else {
            return number;
        }
        
    }
    useEffect(()=> {
        setCard(initialIndex);
        if(initialIndex){
            let number = getCardNumberFromIndex(initialIndex);
            let upPossibility = parseFloat((14 - number)/13*100).toFixed(2);
            let downPossibility = parseFloat(number/13*100).toFixed(2);
            setUpPercent(upPossibility);
            setDownPercent(downPossibility);
        }
        

    }, [initialIndex]);
    return(
        <div className="col-12 main_section">
            <div className="rand_card_section col-sm-3">
                <div id="card" style={{ transform: `rotateY(${rotationY}deg)` }}>
                    <img
                        className="top_back_card_img"
                        src={cardBackImg}                   
                    />
                    
                    {   card &&
                        <img
                        className={faceDown === true ? "top_front_card_img back" : "top_front_card_img front"}
                        src={`cards/${card}.png`} />
                    }                                       
                    
                </div>
            </div>
            <div className="btn_section col-sm-3">
                <div className="up_btn" onClick={props.doUpPrediction} >
                    <div className="up_section">
                        Higher or <br/> Same <br/> {upPercent} %
                    </div>
                </div>
                <div className='down_btn' onClick={props.doDownPrediction}>
                    <div className="down_section">
                        Lower or <br/> Same <br/> {downPercent} %
                    </div>
                </div>
            </div>
            
            
        </div>
    );
}
export default Card;