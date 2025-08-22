import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demopass');
  const onEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') await createUserWithEmailAndPassword(auth, email, password);
      else alert(e.message);
    }
  };
  return (
    <View style={{ flex:1, padding:16, justifyContent:'center' }}>
      <Text style={{ fontSize:22, fontWeight:'bold', marginBottom:8 }}>Welcome 👋</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={{ borderWidth:1, padding:12, marginBottom:8 }} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={{ borderWidth:1, padding:12, marginBottom:8 }} />
      <Button title="Login / Sign up" onPress={onEmailLogin} />
      <View style={{ height:12 }} />
      <Button title="Use Phone OTP" onPress={() => navigation.navigate('PhoneOTP')} />
    </View>
  );
}
