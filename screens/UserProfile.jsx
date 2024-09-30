import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ScrollView, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Avatar, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useGetMessagesQuery } from '../redux/api/api';
import AttachmentHandler from '../components/shared/AttachmentHandler'; 
import {fileFormat, transformImage} from '../lib/features';
import ImageViewing from 'react-native-image-viewing';
import moment from 'moment';
import { useTheme } from '../lib/themeContext';


const UserProfile = ({ navigation, route }) => {
  const chatId = route?.params?.chatId;
  const otherUser = route?.params?.otherUser;
  const isGroup = route?.params?.group;

  const {theme} = useTheme()

  const { user } = useSelector((state) => state.auth);
  const { data, refetch } = useGetMessagesQuery({ chatId, page: 1 });

  const mainUser = otherUser || user;

  const [attachments, setAttachments] = useState([]);


  useEffect(() => {
    if (data?.totalPages) {
      fetchAllMessages(data.totalPages); 
    }
  }, [data]);

  const fetchAllMessages = async (totalPages) => {
    setLoading(true);
    let allAttachments = [];

    for (let page = 1; page <= totalPages; page++) {
      const response = await refetch({ chatId, page });
      const pageAttachments = response.data?.messages.flatMap((message) => message.attachments) || [];
      allAttachments = [...allAttachments, ...pageAttachments]; 
    }

    setAttachments(allAttachments); 
    setLoading(false);
  };

  console.log(attachments)

  const [isImageViewVisible, setImageViewVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isProfilePicVisible, setProfilePicVisible] = useState(false)

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setImageViewVisible(true);
  };

  const handleProfilePicClick = () => {
    setProfilePicVisible(true);
  };

  const navigationHandler = () => {
    setAttachments([])
    setTimeout(() => {
      navigation.goBack();
    }, 100);
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigationHandler()
        return true;
      }
    );
  
    return () => backHandler.remove(); 
  }, []);

  useEffect(() => {
    if (data?.messages) {
      setAttachments(data.messages.flatMap(message => message.attachments));
    }
  }, [data]);
  

  const handleDocumentClick = (url) => {
    Linking.openURL(url).catch(err => console.error("Failed to open document:", err));
  };

  return (
    isGroup ?( <View style={[styles.container, {backgroundColor: theme.background}]}>
      <SafeAreaView style={{ flex: 1 , backgroundColor: theme.background}}>
        <View style={styles.appBar}>
          <TouchableOpacity onPress={navigationHandler}>
            <Icon name="chevron-back-outline" size={25} color={theme.icon}/>
          </TouchableOpacity>
          <Text style={[styles.titleText,{color: theme.titleTxt}]}>Profile</Text>
        </View>

        <View style={styles.profileContainer}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleProfilePicClick}>
            <Avatar.Image
              size={130}
              style={styles.avatarStyle}
              source={{ uri: transformImage(mainUser.avatar.url, 100)}}
              />
          </TouchableOpacity>
          <View>
            <Text style={[styles.nameText, {color: theme.text}]}>{mainUser.name}</Text>
            <View style={[styles.usernameContainer, {background: theme.detailcont}]}>
              <Text style={[styles.usernameText, {color: theme.text}]}>{mainUser.username}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.bioContainer, {backgroundColor: theme.detailcont}]}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap:10,
          }}>
        <Icon name="people" size={20} color={theme.text}/>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            paddingVertical: 5,
            color: theme.text
          }}>{mainUser?.members?.length} Members</Text>
          </View>
        </View>
        <View style={[styles.bioContainer, {backgroundColor: theme.detailcont}]}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap:5,
          }}>
          <Avatar.Image
            size={25}
            source={{ uri: transformImage(mainUser?.creator?.avatar?.url, 50)}}
          />
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.text
          }}>@{mainUser?.creator?.username}</Text>
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap:5,
          }}>
            <Text style={styles.tag}>Creator</Text>
          </View>
        </View>
        <View style={[styles.mediaContainer, {backgroundColor: theme.detailcont}]}>
          <View style={styles.mediaHeader}>
        <Text style={[styles.mediaTxt, {color: theme.text}]}>Media</Text>
        <TouchableOpacity onPress={()=>navigation.navigate('attachments', {attachments})}>
        <Icon name="chevron-forward-outline" size={24} color={theme.icon}/>
        </TouchableOpacity>
          </View>
        <AttachmentHandler
          attachments={attachments}
          handleImageClick={handleImageClick}
          handleDocumentClick={handleDocumentClick}
          max= {6}
          maxcol={3}
          isList={true}

          />
          </View>
        <Text style={{
          fontSize: 14,
          color: '#777',
          marginTop: 15,
          marginBottom: 20,
          textAlign: 'center',

        }}> Created on {moment(user?.createdAt).format("D MMM, YYYY")} </Text>
          <ImageViewing
        images={attachments.filter(att => fileFormat(att.url) === 'image').map(att => ({ uri: att.url }))}
        imageIndex={selectedImageIndex}
        visible={isImageViewVisible}
        onRequestClose={() => setImageViewVisible(false)}
      />
      <ImageViewing
              images={[{ uri: mainUser.avatar.url }]} 
              imageIndex={0} 
              visible={isProfilePicVisible}
              onRequestClose={() => setProfilePicVisible(false)}
      />

      </SafeAreaView>
    </View> 
    ):(

    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.appBar}>
          <TouchableOpacity onPress={navigationHandler}>
            <Icon name="chevron-back-outline" size={25} color={theme.icon}/>
          </TouchableOpacity>
          <Text style={[styles.titleText,{color: theme.titleTxt}]}>Profile</Text>
        </View>
        <View style={styles.profileContainer}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleProfilePicClick}>
            <Avatar.Image
              size={130}
              style={styles.avatarStyle}
              source={{ uri: transformImage(mainUser.avatar.url, 100) }}
            />
          </TouchableOpacity>
          <View>
            <Text style={[styles.nameText, {color: theme.text}]}>{mainUser.name}</Text>
            <View style={styles.usernameContainer}>
              <Icon name='at-outline' color="#777" />
              <Text style={styles.usernameText}>{mainUser.username}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.bioContainer, {backgroundColor: theme.detailcont}]}>
            <Text style={[styles.bioText, {color: theme.text}]}>{mainUser.bio}</Text>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap:5,
            }}>
            <Icon name="person" size={14} color="#777" />
            <Text style={styles.tag}>Bio</Text>

            </View>
        </View>
        <View style={[styles.mediaContainer, {backgroundColor: theme.detailcont}]}>
          <View style={styles.mediaHeader}>
        <Text style={[styles.mediaTxt, {color: theme.text}]}>Media</Text>
        <TouchableOpacity onPress={()=>navigation.navigate('attachments', {attachments})}>
        <Icon name="chevron-forward-outline" size={24} color={theme.icon}/>
        </TouchableOpacity>
          </View>
        <AttachmentHandler
          attachments={attachments}
          handleImageClick={handleImageClick}
          handleDocumentClick={handleDocumentClick}
          max= {6}
          maxcol={3}
          isList={true}

          />
          </View>
        <Text style={{
          fontSize: 14,
          color: '#777',
          marginTop: 15,
          marginBottom: 20,
          textAlign: 'center',

        }}> Joined {moment(user?.createdAt).format("D MMM, YYYY")} </Text>
          <ImageViewing
        images={attachments.filter(att => fileFormat(att.url) === 'image').map(att => ({ uri: att.url }))}
        imageIndex={selectedImageIndex}
        visible={isImageViewVisible}
        onRequestClose={() => setImageViewVisible(false)}
      />
      <ImageViewing
              images={[{ uri: mainUser.avatar.url }]} 
              imageIndex={0} 
              visible={isProfilePicVisible}
              onRequestClose={() => setProfilePicVisible(false)}
      />
      </SafeAreaView>
    </View>
    ) 
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 50,
    borderRadius: 3,
  },
  profileContainer: {
    alignItems: "center",
    gap: 60,
  },
  avatarContainer: {
    borderRadius: 50,
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginTop: 20,
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
    fontSize: 24,
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
    fontSize: 16,
    color: '#777',
    marginTop: -3,
  },
  iconContainer: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 25,
    justifyContent: 'center',
  },
  icnbtn:{
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 50,
    justifyContent: 'center',
  },
  bioContainer: {
    marginTop: 5,
    alignItems: 'center',
    width: "95%",
    alignSelf: 'center',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  bioText: {
    fontSize: 18,
    color: '#362d28',
    fontWeight: '500',
    paddingVertical: 3,
  },
  mediaContainer:{
    flexDirection: 'column',
    justifyContent: 'center',
    width: "95%",
    alignSelf: 'center',
    backgroundColor: "#fff",
    paddingHorizontal: 5,
    paddingTop: 20,
    paddingBottom: 10,
    paddingLeft: 10,
    borderRadius: 15,
    marginTop: 10,
  },
  mediaHeader: {
    flexDirection: 'row',
    justifyContent:'space-between',
    alignItems: 'center',
    marginBottom: 15,
    alignItems: 'center',
    width: "95%",
    alignSelf: 'center',
  },
  mediaTxt:{
    fontSize: 20,
    fontWeight: 'bold',
    color: '#362d28',
  },
  tag:{
    color: '#777',
    fontSize: 14,
  }
});

export default UserProfile;
