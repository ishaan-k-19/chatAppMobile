
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Dialog, Paragraph } from 'react-native-paper';
import { useAsyncMutation } from '../../hooks/hooks';
import { useForgotPasswordMutation } from '../../redux/api/api';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../lib/themeContext';
import { setIsForget } from '../../redux/reducers/misc';
import { useNavigation } from '@react-navigation/native';

const ForgetPasswordDialog = () => {

  const navigation = useNavigation();

  const dispatch = useDispatch()

  const [email, setEmail] = useState('');

  const [ forgetPassword, isLoading, data] = useAsyncMutation(useForgotPasswordMutation)

  const submitHandler = async () => {
    await forgetPassword("Sending OTP...", {email: email})  
    
  };

  const {isForget} = useSelector((state)=> (state.misc))
  const {theme} = useTheme()

  useEffect(()=>{
    if(data){
        dispatch(setIsForget(false))
        navigation.navigate('reset')
        setEmail('')
    }
}, [data])


  const closeHandler = () =>{
    dispatch(setIsForget(false))
}


  return (
    <Dialog visible={isForget} onDismiss={() => {closeHandler}} style={{backgroundColor: theme.detailcont}}>
      <Dialog.Title style={{color: theme.text}}>Enter Your Email</Dialog.Title>
      <Dialog.Content>
        <Paragraph  style={{color: theme.text}}>
          Please enter your email to recive OTP for resetting your password.
        </Paragraph>
        <TextInput
          style={[styles.input, {backgroundColor: theme.srchbarbg, color: theme.text}]}
          value={email}
          onChangeText={setEmail}
          placeholder='Enter email'
          placeholderTextColor={theme.placeHolder}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType='email-address'
        />
      </Dialog.Content>
      <Dialog.Actions>
        {isLoading ? (
          <ActivityIndicator size="large" color="#6d28d9" />
        ) : (
          <View style={{
            justifyContent:'center',
            marginTop: 10,
            width: '100%',
            alignItems: 'center',
            gap: 5,
          }}>
          <TouchableOpacity style={styles.button} onPress={submitHandler}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{
            marginTop: 10,
            alignItems: 'center',
          }} onPress={closeHandler}>
            <Text style={[styles.buttonText, {color: theme.text}]}>Cancel</Text>
          </TouchableOpacity>
          </View>
        )}
      </Dialog.Actions>
    </Dialog>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6d28d9',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ForgetPasswordDialog