import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export default function Dice() {
  const [roll, setRoll] = useState<number | null>(null);
  const play = async () => {
    try {
      const fn = httpsCallable(functions, 'playDice');
      const res:any = await fn({});
      setRoll(res.data.roll);
      if (res.data.reward) alert('Win +'+res.data.reward);
    } catch(e:any) { alert(e.message); }
  };
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
      <Text style={{ fontSize:48, marginBottom:16 }}>{roll ?? '-'}</Text>
      <Button title="Roll" onPress={play} />
    </View>
  );
}
