import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {launchImageLibrary as _launchImageLibrary} from 'react-native-image-picker';
import {Avatar} from 'react-native-paper';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import DeleteChatMenu from '../components/dialog/DeleteChatMenu';
import MessageComponent from '../components/shared/MessageComponent';
import TypingBubble from '../components/shared/TypingBubble';
import {
  ALERT,
  CHAT_JOINED,
  CHAT_LEAVE,
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
} from '../constants/events';
import {useErrors, useSocketEvents} from '../hooks/hooks';
import {transformImage} from '../lib/features';
import {useTheme} from '../lib/themeContext'; // Import useTheme hook
import {
  useChatDetailsQuery,
  useGetMessagesQuery,
  useMyChatsQuery,
  useSendAttachmentsMutation,
} from '../redux/api/api';
import {removeNewMessagesAlert} from '../redux/reducers/chat';
import {setIsDeleteMenu, setUploadingLoader} from '../redux/reducers/misc';
import {getSocket} from '../socket';
let launchImageLibrary = _launchImageLibrary;

const groupMessagesByDate = messages => {
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return Object.keys(groupedMessages).map(date => ({
    title: date,
    data: groupedMessages[date],
  }));
};

const Chat = ({navigation, route}) => {
  const {user} = useSelector(state => state.auth);
  const [otherUser, setOtherUser] = useState();
  const socket = getSocket();

  const [IamTyping, setIamTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [senderTyping, setSenderTyping] = useState('');

  const typingTimeout = useRef(null);

  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [messages, setMessages] = useState([]);
  const [oldMessages, setOldMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const dispatch = useDispatch();
  const [fileResponse, setFileResponse] = useState([]);
  const {theme} = useTheme();
  const [inputHeight, setInputHeight] = useState(40);

  const chatId = route.params.chatId;

  const chatDetails = useChatDetailsQuery(
    {chatId, populate: true},
    {skip: !chatId},
  );
  const chatInfo = chatDetails?.data?.chat;
  const isGroup = chatDetails?.data?.chat?.groupChat;

  const {refetch} = useMyChatsQuery('');
  const oldMessagesChunk = useGetMessagesQuery({chatId, page});

  const errors = [
    {isError: chatDetails.isError, error: chatDetails.error},
    {isError: oldMessagesChunk.isError, error: oldMessagesChunk.error},
  ];

  const members = chatDetails?.data?.chat?.members?.map(member => member._id);

  const [sendAttachments] = useSendAttachmentsMutation();

  const fetchMessages = async page => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const res = await oldMessagesChunk.refetch({chatId, page});

      const newMessages = res?.data?.messages || [];

      if (newMessages.length > 0) {
        const sortedMessages = [...newMessages].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        setOldMessages(prev => [...prev, ...sortedMessages]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMessages = () => {
    if (!isLoading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  useEffect(() => {
    fetchMessages(page);
  }, [page]);

  const messageOnChange = e => {
    setMessage(e);
    if (!IamTyping) {
      const userData = user;
      socket.emit(START_TYPING, {members, chatId, user: userData});
      setIamTyping(true);
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, {members, chatId});
      setIamTyping(false);
    }, 3000);
  };

  const submitHandler = e => {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit(NEW_MESSAGE, {chatId, members, message});
    setMessage('');
    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, {members, chatId});
      setIamTyping(false);
    }, 0);
  };

  const newMessagesListener = useCallback(data => {
    if (data.chatId !== chatId) return;
    setMessages(prevMessages => [data.message, ...prevMessages]);
    refetch();
  }, []);

  const startTypingListener = useCallback(
    data => {
      if (data.chatId !== chatId) return;
      setUserTyping(true);
      setSenderTyping(data?.user);
    },
    [chatId],
  );

  const stopTypingListener = useCallback(
    data => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
      setSenderTyping('');
    },
    [chatId],
  );

  const navigateBack = () => {
    navigation.goBack();
  };

  const alertListener = useCallback(
    data => {
      if (data.chatId !== chatId) return;
      const messageForAlert = {
        content: data.message,
        sender: {
          _id: 'dsadasdasdasdasdas',
          name: 'Admin',
          avatar: 'https://example.com/admin-avatar.jpg',
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, messageForAlert]);
    },
    [chatId],
  );

  const eventHandler = {
    [ALERT]: alertListener,
    [NEW_MESSAGE]: newMessagesListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
  };

  useSocketEvents(socket, eventHandler);
  useErrors(errors);

  useEffect(() => {
    if (chatInfo && chatInfo.groupChat === false) {
      const otherMembers = chatInfo?.members?.filter(
        member => member?._id !== user?._id,
      );
      setOtherUser(otherMembers[0]);
    } else {
      setOtherUser(chatInfo);
    }
  }, [chatInfo, user]);

  const handleContentSizeChange = event => {
    setInputHeight(event.nativeEvent.contentSize.height);
  };

  const navigateProfileHandler = () => {
    navigation.navigate('userprofile', {chatId, otherUser, group: isGroup});
  };

  useEffect(() => {
    if (members) {
      socket.emit(CHAT_JOINED, {userId: user._id, members});
    }
    dispatch(removeNewMessagesAlert(chatId));

    return () => {
      setMessages([]);
      setMessage('');
      setOldMessages([]);
      setPage(1);
      setTimeout(() => {
        dispatch(removeNewMessagesAlert(chatId));
        socket.emit(CHAT_LEAVE, {userId: user._id, members});
      }, 2);
    };
  }, [chatId, CHAT_LEAVE, CHAT_JOINED]);

  const handleFileChange = async (files, key) => {
    const newFiles = [...fileResponse, ...files];

    if (newFiles.length > 5) {
      return Toast.show({
        type: 'error',
        text1: `You can only send 5 files in total`,
      });
    }

    setFileResponse(newFiles);

    dispatch(setUploadingLoader(true));

    const formData = new FormData();
    formData.append('chatId', chatId);

    files.forEach(file => {
      const fileUri = file.fileCopyUri || file.uri || file.fileCopyUri || null;
      const fileName =
        file.name || (fileUri ? fileUri.split('/').pop() : 'unknown_file');
      let fileType = file.type || 'application/octet-stream'; // Default to binary stream

      if (fileName.endsWith('.pdf')) {
        fileType = 'application/pdf';
      } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        fileType =
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        fileType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }

      if (fileUri) {
        formData.append('files', {
          uri: fileUri,
          name: fileName,
          type: fileType,
        });
      }
    });

    try {
      const res = await sendAttachments(formData);
      if (res.data) {
        Toast.show({type: 'success', text1: `${key} sent successfully`});
        setFileResponse([]);
      } else {
        Toast.show({type: 'error', text1: `Failed to send ${key}`});
      }
    } catch (error) {
      Toast.show({type: 'error', text1: error.message});
    } finally {
      dispatch(setUploadingLoader(false));
    }
  };

  const handleFileSelection = async (type, mediaType = 'allFiles') => {
    try {
      if (type === 'image' || type === 'video') {
        const options = {
          mediaType,
          includeBase64: false,
          selectionLimit: 5 - fileResponse.length,
        };
        launchImageLibrary(options, response => {
          const selectedFile = response.assets || [];
          handleFileChange(
            selectedFile,
            type === 'image' ? 'Images' : 'Videos',
          );
        });
      } else {
        const response = await DocumentPicker.pick({
          type: [DocumentPicker.types[mediaType]],
          allowMultiSelection: true,
        });
        handleFileChange(response, type === 'audio' ? 'Audios' : 'Files');
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('File selection canceled');
      } else {
        console.warn('Error selecting file:', err);
      }
    }
  };

  const allMessages = [...messages, ...oldMessages];
  const sections = groupMessagesByDate(allMessages);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'margin'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -20 : 0}>
      <View style={[styles.container, {backgroundColor: theme.background}]}>
        <SafeAreaView
          style={[styles.container, {backgroundColor: theme.background}]}>
          <View style={styles.appBar}>
            {chatDetails.isLoading ? (
              <ActivityIndicator size="large" color="#6d28d9" />
            ) : (
              <View style={styles.appBarContent}>
                <TouchableOpacity onPress={navigateBack}>
                  <Icon
                    name="chevron-back-outline"
                    size={25}
                    color={theme.icon}
                  />
                </TouchableOpacity>
                <Avatar.Image
                  size={40}
                  source={
                    otherUser?.avatar?.url
                      ? {uri: transformImage(otherUser.avatar.url, 50)}
                      : require('../images/default.png') 
                  }
                />
                <Text style={{fontSize: 16, color: theme.text}}>
                  {otherUser?.name}
                </Text>
              </View>
            )}

            <Menu>
              <MenuTrigger
                customStyles={{TriggerTouchableComponent: TouchableOpacity}}>
                <View>
                  <Icon name="ellipsis-vertical" size={22} color={theme.icon} />
                </View>
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionsContainer: [
                    styles.appBarMenuContainer,
                    {backgroundColor: theme.menubg},
                  ],
                }}>
                <MenuOption
                  style={styles.menuOpt}
                  onSelect={navigateProfileHandler}>
                  <Icon name="person" size={18} color={theme.menuIcon} />
                  <Text style={{color: theme.text}}>Profile</Text>
                </MenuOption>
                <View style={styles.separator} />

                <MenuOption
                  style={styles.menuOpt}
                  onSelect={() => dispatch(setIsDeleteMenu(true))}>
                  {isGroup ? (
                    <>
                      <Icon
                        name="log-out-outline"
                        size={18}
                        color="rgba(255,0,0,0.8)"
                      />
                      <Text style={{color: 'rgba(255,0,0,0.9)'}}>Leave</Text>
                    </>
                  ) : (
                    <>
                      <Icon name="trash" size={18} color="rgba(255,0,0,0.8)" />
                      <Text style={{color: 'rgba(255,0,0,0.9)'}}>Delete</Text>
                    </>
                  )}
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>

          <SectionList
            sections={sections}
            keyExtractor={item => item._id}
            inverted
            renderItem={({item, index, section}) => {
              const nextMessage =
                index < section.data.length - 1
                  ? section.data[index + 1]
                  : null;
              return (
                <MessageComponent
                  key={item._id}
                  message={item}
                  user={user}
                  group={isGroup}
                  nextMessage={nextMessage}
                />
              );
            }}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
              isLoading && <ActivityIndicator size="small" color={theme.text} />
            }
          />
          {userTyping && <TypingBubble user={senderTyping} group={isGroup} />}
          <View style={styles.inputContainer}>
            <Menu>
              <MenuTrigger
                customStyles={{TriggerTouchableComponent: TouchableOpacity}}>
                <View style={styles.menuTrigger}>
                  <Icon name="attach" size={30} color="white" />
                </View>
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionsContainer: [
                    styles.menuContainer,
                    {backgroundColor: theme.menubg},
                  ],
                }}>
                <MenuOption
                  style={styles.menuOpt}
                  onSelect={() => handleFileSelection('image', 'photo')}>
                  <Icon name="image" size={22} color={theme.menuIcon} />
                  <Text style={{color: theme.text}}>Image</Text>
                </MenuOption>
                <View style={styles.separator} />

                <MenuOption
                  style={styles.menuOpt}
                  onSelect={() => handleFileSelection('video', 'video')}>
                  <Icon name="videocam" size={22} color={theme.menuIcon} />
                  <Text style={{color: theme.text}}>Video</Text>
                </MenuOption>
                <View style={styles.separator} />

                <MenuOption
                  style={styles.menuOpt}
                  onSelect={() => handleFileSelection('audio', 'audio')}>
                  <Icon name="headset" size={22} color={theme.menuIcon} />
                  <Text style={{color: theme.text}}>Audio</Text>
                </MenuOption>
                <View style={styles.separator} />

                <MenuOption
                  style={styles.menuOpt}
                  onSelect={() => handleFileSelection('file', 'allFiles')}>
                  <Icon name="document" size={22} color={theme.menuIcon} />
                  <Text style={{color: theme.text}}>Document</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
            <TextInput
              placeholder="Type Something..."
              placeholderTextColor={theme.placeHolder}
              style={[
                styles.input,
                {
                  backgroundColor: theme.srchbarbg,
                  color: theme.text,
                  borderColor: theme.border,
                  height: Math.max(40, inputHeight),
                },
              ]}
              onChangeText={messageOnChange}
              value={message}
              multiline={true}
              returnKeyType="default"
              blurOnSubmit={false}
              onContentSizeChange={handleContentSizeChange}
              scrollEnabled={true}
            />

            <TouchableOpacity
              style={styles.iconContainer}
              onPress={submitHandler}>
              <Icon
                name="send"
                size={20}
                color="white"
                style={styles.sendIcon}
              />
            </TouchableOpacity>
          </View>
          <DeleteChatMenu chatId={chatId} isGroup={isGroup} />
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 5,
  },
  appBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    marginVertical: 20,
    marginBottom: Platform.OS === 'ios' && 0,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 11 : 0,
  },
  iconContainer: {
    backgroundColor: '#6d28d9',
    padding: 10,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    padding: 5,
  },
  menuTrigger: {
    backgroundColor: '#6d28d9',
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    borderRadius: 10,
    marginTop: -55,
    width: '35%',
    padding: 5,
    backgroundColor: 'rgba(256,256,256,0.8)',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#ccc',
    marginVertical: 2,
    width: '90%',
    alignSelf: 'center',
  },

  menuOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 9,
  },
  appBarMenuContainer: {
    borderRadius: 10,
    width: '30%',
    padding: 10,
    backgroundColor: 'rgba(256,256,256,0.8)',
  },
});

export default Chat;
