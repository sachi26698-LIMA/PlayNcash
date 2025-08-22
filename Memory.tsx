import React, { useState } from 'react';
import { View, Text, Button, Switch } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export default function Memory() {
  const [won, setWon] = useState(true); // demo toggle
  const submit = async () => {
    try {
      const fn = httpsCallable(functions, 'awardMemory');
      const res:any = await fn({ won });
      alert('Award +'+res.data.reward);
    } catch(e:any){ alert(e.message); }
  };
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:18 }}>Won?</Text>
      <Switch value={won} onValueChange={setWon} />
      <View style={{ height:8 }} />
      <Button title="Submit Result" onPress={submit} />
    </View>
  );
}
