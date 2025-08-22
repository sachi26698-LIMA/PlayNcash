import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export default function Quiz() {
  const [correct, setCorrect] = useState(7); // demo: replace with real quiz UI later
  const submit = async () => {
    try {
      const fn = httpsCallable(functions, 'awardQuiz');
      const res:any = await fn({ correct });
      alert('Award +'+res.data.reward);
    } catch(e:any){ alert(e.message); }
  };
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:18, marginBottom:8 }}>Demo Quiz Result: correct = {correct}</Text>
      <Button title="Submit Score" onPress={submit} />
    </View>
  );
}
