import React, { useEffect, useState } from 'react';
import splashImg from '../../assets/hilosplash.gif';

function Loading(){
    const [loadingFlag, setLoadingFlag] = useState(true);
    setTimeout(()=> {
      setLoadingFlag(false);
    }, 3000);
    return (
        <>
            {
                loadingFlag &&
                <>
                <div className="loadingPage">
                    <img src= {splashImg}  className="splash-image" />
                </div>
                </>
            }
        </>
        
    );

}
export default Loading;