import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { Button } from 'react-native-paper';
import { setIsSearch } from '../../redux/reducers/misc';
import ChatItem from '../shared/ChatItem';

const ChatList = ({
  chats = [],
  chatId,
  onlineUsers = [],
  newMessagesAlert = [],
  handleDeleteChat,
}) => {
  const dispatch = useDispatch();


  if (chats.length === 0) {
    return (
      <View style={styles.noChatsContainer}>
        <Text style={styles.noChatsText}>No chats found</Text>
        <Button
          mode="contained"
          onPress={() => dispatch(setIsSearch(true))}
          style={styles.addButton}
        >
          Add Friends
        </Button>
      </View>
    );
  }

  return (
    <View style={{
        flex: 1,
    }}>
    <ScrollView contentContainerStyle={styles.container}>
      {chats.map((data, index) => {
          const { avatar, _id, name, groupChat, members } = data;
          
        const newMessageAlert = newMessagesAlert.find(
          (alert) => alert.chatId === _id
        );

        const isOnline = members?.some((member) => onlineUsers.includes(member));

        return (
          <View key={_id} style={styles.chatItem}>
            <ChatItem
              avatar={avatar}
              name={name}
              _id={_id}
              groupChat={groupChat}
              sameSender={chatId === _id}
              isOnline={isOnline}
              newMessageAlert={newMessageAlert}
              handleDeleteChat={handleDeleteChat}
            />
          </View>
        );
      })}
    </ScrollView>
    </View>

  );
};

export default ChatList;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  chatItem: {
    marginVertical: 5,
  },
  noChatsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChatsText: {
    fontSize: 18,
    color: 'gray',
  },
  addButton: {
    marginTop: 20,
  },
});