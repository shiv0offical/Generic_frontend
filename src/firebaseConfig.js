import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Replace with your actual Firebase config
// const firebaseConfig = {
//     apiKey: "AIzaSyD9yvl-X2wDgG8dI1kPwGmtPr-WPebx-wU",
//     authDomain: "up-work-9e902.firebaseapp.com",
//     projectId: "up-work-9e902",
//     storageBucket: "up-work-9e902.firebasestorage.app",
//     messagingSenderId: "489135240545",
//     appId: "1:489135240545:web:7e941c708a28c9d2570120",
//     measurementId: "G-2P139XD8KD"
//   };


  // healthcaer firebawe
  // const firebaseConfig = {
  //   apiKey: "AIzaSyAGGGlXiccogprTyeX8umishjykQneEtPs",
  //   authDomain: "healthcare-test-9161a.firebaseapp.com",
  //   projectId: "healthcare-test-9161a",
  //   storageBucket: "healthcare-test-9161a.firebasestorage.app",
  //   messagingSenderId: "683595748433",
  //   appId: "1:683595748433:web:fadf1807b425917cc21470",
  //   measurementId: "G-Y50BJZDM6H"
  // };
  


  // const firebaseConfig = {
  //   apiKey: 'AIzaSyAoKsKfKBLz2n5m1fNririayeXXRCCKuv4',
  //   authDomain: 'unite-dev-india.firebaseapp.com',
  //   projectId: 'unite-dev-india',
  //   storageBucket: 'unite-dev-india.firebasestorage.app',
  //   messagingSenderId: '758556477512',
  //   appId: '1:758556477512:web:da69b61caa589b90e0f07d',
  //   measurementId: 'G-444509MWJ3',
  // };


  const firebaseConfig ={
    apiKey: "AIzaSyD9My0x-mgjHAkvULxGdgMrR9pjhCzNkiA",
    authDomain: "samsung-generic.firebaseapp.com",
    projectId: "samsung-generic",
    storageBucket: "samsung-generic.firebasestorage.app",
    messagingSenderId: "490356922935",
    appId: "1:490356922935:web:38f47ed3592b63041c3db2",
    measurementId: "G-6GXPGLVPHG"
  };


  // const firebaseConfig = {
  //   apiKey: "AIzaSyCvqh_bhzCp24rHMccr1aaURd6xcQWU3kE",
  //   authDomain: "hirelink-dev-test.firebaseapp.com",
  //   projectId: "hirelink-dev-test",
  //   storageBucket: "hirelink-dev-test.firebasestorage.app",
  //   messagingSenderId: "721050146079",
  //   appId: "1:721050146079:web:a70661c255162f6060cc2a",
  //   measurementId: "G-DLGBEHSJCN"
  // };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);