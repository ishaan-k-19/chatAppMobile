import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useGetMessagesQuery } from '../../redux/api/api';
import { fileFormat, transformImage } from '../../lib/features';
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from '../../lib/themeContext'; 

const truncateMessage = (message, limit = 30) => {
  const singleLineMessage = message.replace(/\n/g, ' '); 
  return singleLineMessage.length > limit 
    ? singleLineMessage.substring(0, limit) + '...' 
    : singleLineMessage;
};


const ChatItem = ({ navigation, avatar = [], name, _id, groupChat = false, isOnline, newMessageAlert }) => {

  const { data: messagesData } = useGetMessagesQuery({ chatId: _id }, { refetchOnMountOrArgChange: true });
  const messages = messagesData?.messages || [];
  const last = messages[messages?.length - 1];

  const { theme } = useTheme(); 

  const renderLastMessage = () => {
    if (last?.attachments?.length > 0) {
      const item = last?.attachments[last?.attachments?.length - 1]?.url;
      const type = fileFormat(item);

      switch (type) {
        case 'image':
          return (
            <View style={styles.attachmentContainer}>
              <Icon name="image" size={18} color={theme.lastMessage} />
              <Text style={[styles.lastMessage, { color: theme.lastMessage }]}> Image</Text>
            </View>
          );
        case 'video':
          return (
            <View style={styles.attachmentContainer}>
              <Icon name="videocam" size={18} color={themelastMessaget} />
              <Text style={[styles.lastMessage, { color: theme.lastMessage }]}> Video</Text>
            </View>
          );
        case 'audio':
          return (
            <View style={styles.attachmentContainer}>
              <Icon name="musical-notes" size={18} color={theme.lastMessage} />
              <Text style={[styles.lastMessage, { color: theme.lastMessage }]}> Audio</Text>
            </View>
          );
          case 'document':
            return (
              <View style={styles.attachmentContainer}>
              <Icon name="document" size={18} color={theme.lastMessage} />
              <Text style={[styles.lastMessage, { color: theme.lastMessage }]}> Document</Text>
            </View>
          );
        default:
          return "Unknown attachment";
      }
    }

    return last?.content ? truncateMessage(last.content) : "Send a message";
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.background }]}
        onPress={() => navigation.navigate("chat", { chatId: _id })}
      >
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={50}
            source={{ uri: transformImage(avatar[0], 50)}}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
          {newMessageAlert ? (
            <Text style={[styles.newMessageAlert, { color: theme.lastMessage }]}>
              {newMessageAlert.count} New Message
            </Text>
          ) : (
            <Text style={[styles.lastMessage, { color: theme.lastMessage }]}>{renderLastMessage()}</Text>
          )}
        </View>
        {!groupChat && isOnline && (
          <View style={styles.onlineIndicator} />
        )}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 8,
    position: 'relative',
  },
  separator: {
    width: "84%",
    alignSelf: "flex-end",
    backgroundColor: '#ccc',
  },
  avatarContainer: {
    marginRight: 10,
  },
  textContainer: {
    height: "100%",
    paddingVertical: 4,
    flex: 1,
    flexDirection: 'column',
    gap: 2,
  },
  name: {
    fontSize: 18,
  },
  newMessageAlert: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'green',
    position: 'absolute',
    top: '50%',
    right: 16,
    transform: [{ translateY: -5 }],
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ChatItem;
