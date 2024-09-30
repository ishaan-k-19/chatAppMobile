import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import { server } from '../constants/config';
import axios from 'axios';
import { userExists, userNotExists } from '../redux/reducers/auth';
import { transformImage } from '../lib/features';
import { useTheme } from '../lib/themeContext';
import { getSocket } from '../socket';
import ImageViewing from 'react-native-image-viewing';


const Profile = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const socket = getSocket();


  const {theme} = useTheme()

  const [isProfilePicVisible, setProfilePicVisible] = useState(false)



  const details = [
    { icon: 'reader', text: user?.bio, disabled: false },
    { icon: 'mail', text: user?.email, disabled: true },
    { icon: 'calendar', text: `Joined ${moment(user?.createdAt).format("D MMM, YYYY")}`, disabled: true },
  ];

  const handleProfilePicClick = () => {
    setProfilePicVisible(true);
  };

  const logoutHandler = async () => {
    try {
       await axios.get(`${server}/api/v1/user/logout`, {
        withCredentials: true,
      })
      dispatch(userNotExists());
      Toast.show({
bottomOffset: 100,
        type: 'success',
        text1: 'User Logged Out',
        position: 'bottom',
      });
      socket.disconnect();
      navigation.navigate('login');
    } catch (error) {
      Toast.show({
bottomOffset: 100,
        type: 'error',
        text1: 'Something went wrong!',
        position: 'bottom',
      });
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
        <View style={styles.appBar}>
          <Text style={[styles.titleText, {color:theme.text}]}>Profile</Text>
        <TouchableOpacity onPress={()=>(navigation.navigate('editprofile'))}>
            <Icon name="create-outline" size={30} color={theme.icon}/>
          </TouchableOpacity>
        </View>

        <View style={styles.profileContainer}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleProfilePicClick}>
            <Avatar.Image
              size={130}
              style={styles.avatarStyle}
              source={{ uri: transformImage(user?.avatar?.url) }}
            />
          </TouchableOpacity>
          <View >
            <Text style={[styles.nameText, {color: theme.text}]}>{user?.name}</Text>
            <View style={styles.usernameContainer}>
              <Icon name="at-outline" color="#777" />
              <Text style={styles.usernameText}>{user?.username}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsCard}>
          {details.map((detail, index) => (
            <View
              key={index}
              style={[
                styles.detailRow,
                { backgroundColor: index % 2 === 0 ? theme.even : theme.odd },
                { borderTopLeftRadius: index === 0 ? 12 : 0 },
                { borderTopRightRadius: index === 0 ? 12 : 0 },
                { borderBottomLeftRadius: index === details.length - 1 ? 12 : 0 },
                { borderBottomRightRadius: index === details.length - 1 ? 12 : 0 }
              ]}
            >
              <Icon name={detail.icon} size={22} color="#777" />
              <Text style={[styles.detailText, {color:theme.text}]}>{detail.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.btn} onPress={()=>navigation.navigate('changepassword')}>
            <Icon name="lock-closed" size={20} color="rgba(256,256, 256, 0.5)" style={[styles.iconStyle, {left:18}]} />
            <Text style={styles.btnTxt}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: theme.logoutbtn }]} onPress={logoutHandler}>
            <Icon name="log-out-outline" size={22} color={theme.icon} style={styles.iconStyle} />
            <Text style={[styles.btnTxt, { color: theme.icon }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <ImageViewing
              images={[{ uri: user?.avatar?.url }]} 
              imageIndex={0} 
              visible={isProfilePicVisible}
              onRequestClose={() => setProfilePicVisible(false)}
      />

        

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 3,
    justifyContent: 'space-between',
  },
  profileContainer: {
    alignItems: 'center',
    gap: 20,
    marginTop: 30,
  },
  avatarContainer: {
    alignSelf: 'center',
  },
  avatarStyle: {
    alignSelf: 'center',
  },
  titleText: {
    color: '#6d28d9',
    fontSize: 30,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  nameText: {
    fontWeight: '700',
    fontSize: 26,
    color: '#362d28',
    textAlign: 'center',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  usernameText: {
    fontSize: 18,
    color: '#777',
    marginLeft: 5,
  },
  detailsCard: {
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 20,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 0.1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 15,
    gap: 15,
  },
  detailText: {
    fontSize: 16,
    color: 'rgb(55 65 81)',
    marginLeft: 10,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#6d28d9',
    justifyContent: 'center',
    position: 'relative',
    width: "80%",
    alignSelf: 'center',
  },
  iconStyle: {
    position: 'absolute',
    left: 20,
  },
  btnTxt: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Profile;
