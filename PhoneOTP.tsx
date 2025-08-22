import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { PhoneAuthProvider, signInWithCredential, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../firebase';

export default function PhoneOTP() {
  const [phone, setPhone] = useState('+91');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<any>(null);

  const send = async () => {
    try {
      // Web reCAPTCHA (native opens safety-net/recaptcha automatically)
      // @ts-ignore
      if (!window.recaptchaVerifier) {
        // @ts-ignore
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      }
    } catch {}
    const conf = await signInWithPhoneNumber(auth, phone);
    setConfirmation(conf);
  };

  const verify = async () => {
    if (!confirmation) return;
    await confirmation.confirm(code);
  };

  return (
    <View style={{ flex:1, padding:16, justifyContent:'center' }}>
      <View id="recaptcha-container" />
      {!confirmation ? (
        <>
          <Text style={{ fontSize:18, marginBottom:8 }}>Enter phone</Text>
          <TextInput value={phone} onChangeText={setPhone} placeholder="+91xxxxxxxxxx" style={{ borderWidth:1, padding:12, marginBottom:8 }} keyboardType="phone-pad" />
          <Button title="Send OTP" onPress={send} />
        </>
      ) : (
        <>
          <Text style={{ fontSize:18, marginBottom:8 }}>Enter OTP</Text>
          <TextInput value={code} onChangeText={setCode} placeholder="123456" style={{ borderWidth:1, padding:12, marginBottom:8 }} keyboardType="number-pad" />
          <Button title="Verify" onPress={verify} />
        </>
      )}
    </View>
  );
}
