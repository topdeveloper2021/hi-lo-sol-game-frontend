import cardBackImg from '../../assets/back.png';

function CardwithRate(element) {
    const rand = element.element[0].rand;
    const index = element.element[0].index;
    const rate = element.element[0].rate;

    return(
            <div className="history_rand_card">    
                    <img 
                    className="animation_front_card front"
                    src={`cards/${rand}.png`}                 
                    />
                    <img  className="animation_back_card"
                    src={cardBackImg}              
                    />
                    <div className="multiple_number">
                        { index == 1 ? "startcard" : `${rate} x` }
                    </div>
            </div>
    
    );
}
export default CardwithRate;