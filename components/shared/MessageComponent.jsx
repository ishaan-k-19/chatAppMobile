import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import ImageViewing from 'react-native-image-viewing';
import AttachmentHandler from './AttachmentHandler'; 
import { fileFormat, transformImage } from '../../lib/features';
import { useTheme } from '../../lib/themeContext'; 
import Icon from 'react-native-vector-icons/Ionicons';


const MessageComponent = ({ message, user, group, nextMessage }) => {
  const { sender, content, attachments = [], createdAt } = message;
  const [isImageViewVisible, setImageViewVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const currentMessageDate = moment(createdAt).format("YYYY-MM-DD");
  const nextMessageDate = nextMessage ? moment(nextMessage.createdAt).format("YYYY-MM-DD") : null;
  const showDateHeading = currentMessageDate !== nextMessageDate;
  const formattedDateHeading = moment(createdAt).format("ddd, MMM D YYYY");
  const sameSender = sender?._id === user?._id;
  const timeAgo = moment(createdAt).format('h:mm A');

  const { theme } = useTheme(); 

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setImageViewVisible(true);
  };
  
  const handleDocumentClick = (url) => {
    Linking.openURL(url).catch(err => console.error("Failed to open document:", err));
  };

  return (
    <>
      <View style={[styles.messageContainer, sameSender ? styles.messageRight : styles.messageLeft]}>
        {!sameSender && (
          <TouchableOpacity>
            <Image
              style={styles.avatar}
              source={{ uri: transformImage(sender?.avatar?.url, 50) }}
              />
          </TouchableOpacity>
        )}
        <View style={[
          attachments.length > 0 
          ? styles.messageBubbleWithAttachment 
          : styles.messageBubble, 
          sameSender ? styles.rightBubble : [styles.leftBubble, { backgroundColor: theme.leftBubble }] 
        ]}>
          {!sameSender && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: -3
            }}>
            { group && <Icon name="at" size={15} color={theme.name}/>}
            <Text style={[styles.senderName, {color: theme.name}]}>
              {group ? sender?.username : sender?.name}
            </Text>
            </View>
          )}

          {attachments.length > 0 && (
            <AttachmentHandler
            attachments={attachments}
            handleImageClick={handleImageClick}
            handleDocumentClick={handleDocumentClick}
            max={4}
            maxcol={2}
            />
          )}

          {content && <Text style={[styles.messageContent, sameSender ? styles.RightMessageText : [styles.LeftMessageText, {color: theme.text}]]}>{content}</Text>}

          <View style={[styles.timeContainer, sameSender ? styles.timeRight : styles.timeLeft]}>
            <Text style={[styles.timeText, sameSender ? {color: '#e5e5e5'} : {color: theme.timetext}]}>{timeAgo}</Text>
          </View>
        </View>
      </View>

      <ImageViewing
        images={attachments.filter(att => fileFormat(att.url) === 'image').map(att => ({ uri: att.url }))}
        imageIndex={selectedImageIndex}
        visible={isImageViewVisible}
        onRequestClose={() => setImageViewVisible(false)}
        />
        {showDateHeading && (
          <View style={[styles.dateHeadingContainer]}>
            <View style={[styles.dateHeading, {backgroundColor: theme.datebg}]}>
              <Text style={[styles.dateHeadingText, {color: theme.datetext}]}>{formattedDateHeading}</Text>
            </View>
          </View>
        )}

    </>
  );
};

const styles = StyleSheet.create({
  dateHeadingContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  dateHeading: {
    backgroundColor: '#e0e0e0', 
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  dateHeadingText: {
    color: '#606060',
    fontSize: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    paddingHorizontal: 5,
  },
  messageLeft: {
    justifyContent: 'flex-start',
  },
  messageRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: 20,
    marginTop: -15,
    marginRight: 8,
    marginLeft: 3,
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    maxWidth: '70%',
  },
  messageBubbleWithAttachment: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    maxWidth: '53%',
  },
  leftBubble: {
    backgroundColor: '#f0f0f0', 
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  rightBubble: {
    backgroundColor: '#6d28d9', 
    borderBottomLeftRadius: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignSelf: 'flex-end',
  },
  senderName: {
    fontWeight: 'bold',
    color: '#6d28d9', 
    marginBottom: 5,
  },
  LeftMessageText: {
    color: "#000", 
  },
  RightMessageText: {
    color: "#fff", 
  },
  messageContent: {
    fontSize: 14,
    flexWrap: 'wrap',
  },
  timeContainer: {
    marginTop: 5,
  },
  timeLeft: {
    alignSelf: 'flex-start',
  },
  timeRight: {
    alignSelf: 'flex-end',
  },
  timeText: {
    fontSize: 10,
  },
});

export default MessageComponent;
