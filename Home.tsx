import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { auth, db, functions } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

export default function Home({ navigation }: any) {
  const [coins, setCoins] = useState<number>(0);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'wallets', uid), (d) => {
      setCoins((d.data() as any)?.coins || 0);
    });
    return () => unsub();
  }, [uid]);

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontWeight:'bold' }}>Coins: {coins}</Text>
      <View style={{ height:16 }} />
      <Button title="Daily Bonus" onPress={async () => {
        try { const fn = httpsCallable(functions, 'claimDailyBonus'); const res:any = await fn({}); alert('+'+res.data.amount+' coins'); }
        catch(e:any){ alert(e.message); }
      }} />
      <View style={{ height:8 }} />
      <Button title="Dice" onPress={()=>navigation.navigate('Dice')} />
      <View style={{ height:8 }} />
      <Button title="Quiz" onPress={()=>navigation.navigate('Quiz')} />
      <View style={{ height:8 }} />
      <Button title="Memory" onPress={()=>navigation.navigate('Memory')} />
      <View style={{ height:8 }} />
      <Button title="Redeem Code" onPress={()=>navigation.navigate('Redeem')} />
      <View style={{ height:8 }} />
      <Button title="Withdraw" onPress={()=>navigation.navigate('Withdraw')} />
      <View style={{ height:8 }} />
      <Button title="Inbox" onPress={()=>navigation.navigate('Inbox')} />
    </View>
  );
}
