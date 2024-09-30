import { View, Text, StyleSheet, TouchableOpacity, FlatList, Linking, BackHandler } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AttachmentHandler from '../components/shared/AttachmentHandler';
import ImageViewing from 'react-native-image-viewing';
import { fileFormat } from '../lib/features';
import { useTheme } from '../lib/themeContext';


const Attachments = ({ navigation, route }) => {
  const [attachments, setAttachments] = useState(route?.params?.attachments)
  const [isImageViewVisible, setImageViewVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const {theme} = useTheme()



  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setImageViewVisible(true);
  };

  const handleDocumentClick = (url) => {
    Linking.openURL(url).catch(err => console.error("Failed to open document:", err));
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
  
  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <SafeAreaView>
        <View style={styles.appBar}>
          <TouchableOpacity onPress={navigationHandler}>
            <Icon name="chevron-back-outline" size={25} color={theme.icon}/>
          </TouchableOpacity>
          <Text style={[styles.titleText, {color: theme.titleTxt}]}>Media</Text>
        </View>

      <View style={styles.attachmentList}>
        {attachments.length > 0 ? (
          <AttachmentHandler
          attachments={attachments}  
          handleImageClick={handleImageClick}  
          handleDocumentClick={handleDocumentClick}  
          max={attachments.length}
          maxcol={3}
          isList={true}
          />
        ) : (
          <View>
            <Text style={{
              textAlign: 'center',
              fontSize: 20,
              color: theme.text,
              marginTop: 20,
              marginBottom: 20,
              color: "gray"
            }}>No attachments found</Text>
          </View>
        )}
      </View>
      <ImageViewing
        images={attachments.filter(att => fileFormat(att.url) === 'image').map(att => ({ uri: att.url }))}
        imageIndex={selectedImageIndex}
        visible={isImageViewVisible}
        onRequestClose={() => setImageViewVisible(false)}
      />
      </SafeAreaView>
    </View>
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
  titleText: {
    color: '#6d28d9',
    fontSize: 30,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  attachmentList: {
    paddingHorizontal: 15,

  },
  noAttachmentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAttachmentsText: {
    fontSize: 18,
    color: 'gray',
  },
});

export default Attachments;
