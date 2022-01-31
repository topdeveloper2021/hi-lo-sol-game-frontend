import React, { useEffect, useState } from 'react';
import { useWallet} from '@solana/wallet-adapter-react';
import {WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getProfile } from '../api/profiles.service';
import profileImg from '../../assets/user.png';
const DEFAULT_PFP = "https://i.imgur.com/E3aJ7TP.jpg";
function Navbar(props) {
    const wallet = useWallet();
    const [profile, setProfile] = useState();
    useEffect(() => {
        (async () => {
          if (
            !wallet ||
            !wallet.publicKey
          ) {
            return;
          }
          const publicKey = wallet.publicKey.toString();
          props.init();
          props.setWalletAddress(publicKey);          
          const profile = await getProfile(publicKey);
          setProfile(profile);
          
        })();
      }, [wallet]);
    return(
        <div className="col-md-12 navbar">
            {
                  !wallet.connected &&
                  <WalletMultiButton style={{ marginLeft: 'auto', marginRight: 'auto' }} />
            }
            {
                wallet?.publicKey?.toString() != null &&
                <>
                  <div className="ms-3 profile-picture-md">
                    <img className={`image rounded-circle cursor-pointer border border-2`}
                      src={profileImg}
                      alt={''}
                    />
                  </div>
                </>
            }
        </div>
    );
}
export default Navbar;