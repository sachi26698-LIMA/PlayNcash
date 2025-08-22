import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export default function Redeem() {
  const [code, setCode] = useState('WELCOME');
  const apply = async () => {
    try { const fn = httpsCallable(functions, 'applyRedeemCode'); await fn({ code }); alert('Redeemed'); }
    catch(e:any){ alert(e.message); }
  };
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text>Enter Redeem Code</Text>
      <TextInput value={code} onChangeText={setCode} style={{ borderWidth:1, padding:12, marginVertical:8 }} />
      <Button title="Apply" onPress={apply} />
    </View>
  );
}
