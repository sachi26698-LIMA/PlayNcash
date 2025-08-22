import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './screens/Login';
import PhoneOTP from './screens/PhoneOTP';
import Home from './screens/Home';
import Dice from './screens/Dice';
import Redeem from './screens/Redeem';
import Withdraw from './screens/Withdraw';
import Quiz from './screens/Quiz';
import Memory from './screens/Memory';
import Inbox from './screens/Inbox';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setReady(true); }), []);
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
            <Stack.Screen name="PhoneOTP" component={PhoneOTP} options={{ title: 'Phone OTP' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={Home} options={{ title: 'Dashboard' }} />
            <Stack.Screen name="Dice" component={Dice} />
            <Stack.Screen name="Quiz" component={Quiz} />
            <Stack.Screen name="Memory" component={Memory} />
            <Stack.Screen name="Redeem" component={Redeem} />
            <Stack.Screen name="Withdraw" component={Withdraw} />
            <Stack.Screen name="Inbox" component={Inbox} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
