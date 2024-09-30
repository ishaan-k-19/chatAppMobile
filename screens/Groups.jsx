import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useState, memo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyGroupsQuery } from '../redux/api/api';
import { Avatar } from 'react-native-paper';
import { transformImage } from '../lib/features';
import { useTheme } from '../lib/themeContext';

const Groups = ({ navigation }) => {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false); // State to track refreshing
  const { data, refetch } = useMyGroupsQuery(""); // Destructure refetch from query

  const myGroups = data?.groups;

  const onRefresh = () => {
    setRefreshing(true);
    refetch() // Trigger refetch when pulled down
      .finally(() => setRefreshing(false)); // Stop the refreshing indicator after refetch
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.appBar}>
          <Text style={[styles.titleText, { color: theme.titleTxt }]}>Groups</Text>
        </View>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          {myGroups?.length > 0 ? (
            <ScrollView
              style={{ padding: 10 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // Add RefreshControl
              }
            >
              {myGroups.map((group) => (
                <GroupListItem
                  key={group._id}
                  group={group}
                  chatId={group._id}
                  navigation={navigation}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={{ textAlign: 'center', fontSize: 24, marginTop: 80, color: theme.text }}>
              No Groups
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const GroupListItem = memo(({ group, navigation }) => {
  const { _id, name, avatar } = group;
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={{
        borderRadius: 10,
        marginVertical: 5,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      onPress={() => {
        navigation.navigate('groupmanagement', { chatId: _id });
      }}
    >
      <View style={{ marginRight: 15 }}>
        <Avatar.Image
          source={{ uri: transformImage(avatar, 50) }}
          size={40}
        />
      </View>
      <Text
        style={{
          fontSize: 20,
          color: theme.text
        }}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 3,
    justifyContent: 'space-between',
  },
  titleText: {
    color: '#6d28d9',
    fontSize: 30,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  scrollView: {
    flex: 1,
  },
});

export default Groups;
