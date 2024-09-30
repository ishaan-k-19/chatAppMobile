import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    notificationCount: 0,
    newMessagesAlert: [
        {
            chatId: '',
            count: 0,
        },
    ],
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        incrementNotification: (state) => {
            state.notificationCount += 1;
        },
        decrementNotification: (state) => {
            state.notificationCount -= 1;
            if (state.notificationCount < 0) {
                state.notificationCount = 0;
            }
        },
        resetNotificationCount: (state) => {
            state.notificationCount = 0;
        },
        setNewMessagesAlert: (state, action) => {
            const chatId = action.payload.chatId;
            const index = state.newMessagesAlert.findIndex(
                (item) => item.chatId === chatId
            );
            if (index !== -1) {
                state.newMessagesAlert[index].count += 1;
            } else {
                state.newMessagesAlert.push({
                    chatId,
                    count: 1,
                });
            }
        },
        removeNewMessagesAlert: (state, action) => {
            state.newMessagesAlert = state.newMessagesAlert.filter(
                (item) => item.chatId !== action.payload
            );
        },
        setInitialNewMessagesAlert: (state, action) => {
            state.newMessagesAlert = action.payload.alerts || [];
            state.notificationCount = action.payload.notificationCount || 0;
        },
    },
});

export default chatSlice;
export const {
    incrementNotification,
    resetNotificationCount,
    decrementNotification,
    setNewMessagesAlert,
    removeNewMessagesAlert,
    setInitialNewMessagesAlert,
} = chatSlice.actions;



