// utils/useGoogleAuth.ts
//import * as Google from 'expo-auth-session/providers/google';
//import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
//import { auth } from '../firebaseConfig';
//import * as WebBrowser from 'expo-web-browser';
//import React from 'react';

//WebBrowser.maybeCompleteAuthSession();

//export const useGoogleAuth = () => {
  //const [request, response, promptAsync] = Google.useAuthRequest({
    //clientId: '751274556385-ldeboi9kq1rh5phk7rgtq9h6415oagl1.apps.googleusercontent.com', // ✅ Your Expo client ID
  //});

  //React.useEffect(() => {
    //if (response?.type === 'success') {
      //const { authentication } = response;
      //const credential = GoogleAuthProvider.credential(null, authentication?.accessToken);
      //signInWithCredential(auth, credential).catch((err) =>
        //console.error('Firebase sign-in error:', err)
      //);
    //}
  //}, [response]);

  //return { request, promptAsync };
//};
