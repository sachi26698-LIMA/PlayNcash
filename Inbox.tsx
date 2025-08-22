import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { auth, db } from '../firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

export default function Inbox() {
  const uid = auth.currentUser?.uid;
  const [rows, setRows] = useState<any[]>([]);
  useEffect(()=>{
    if(!uid) return;
    const q = query(collection(db,'inbox',uid,'msgs'), orderBy('createdAt','desc'));
    return onSnapshot(q, (snap)=> setRows(snap.docs.map(d=>({id:d.id, ...d.data()}))));
  },[uid]);
  return (
    <View style={{ flex:1, padding:16 }}>
      <FlatList data={rows} keyExtractor={i=>i.id} renderItem={({item})=> (
        <View style={{ padding:12, borderBottomWidth:1, borderColor:'#eee' }}>
          <Text style={{ fontWeight:'bold' }}>{item.title}</Text>
          <Text>{item.body}</Text>
        </View>
      )} />
    </View>
  );
}
