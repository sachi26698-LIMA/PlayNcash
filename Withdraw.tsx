import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export default function Withdraw() {
  const [amount, setAmount] = useState('20');
  const [upi, setUpi] = useState('demo@upi');
  const [name, setName] = useState('Demo');
  const submit = async () => {
    try {
      const fn = httpsCallable(functions, 'requestWithdraw');
      const res:any = await fn({ amount: Number(amount), upi, name });
      alert('Requested ID: '+res.data.id);
    } catch(e:any){ alert(e.message); }
  };
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text>Withdraw (Manual UPI)</Text>
      <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Amount (₹)" style={{ borderWidth:1, padding:12, marginVertical:8 }} />
      <TextInput value={upi} onChangeText={setUpi} placeholder="UPI ID" style={{ borderWidth:1, padding:12, marginVertical:8 }} />
      <TextInput value={name} onChangeText={setName} placeholder="Name" style={{ borderWidth:1, padding:12, marginVertical:8 }} />
      <Button title="Submit" onPress={submit} />
    </View>
  );
}
