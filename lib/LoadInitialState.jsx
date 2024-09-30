import { useDispatch } from 'react-redux';
import { setInitialNewMessagesAlert } from '../redux/reducers/chat'; 
import { NEW_MESSAGE_ALERT, NEW_REQUEST } from '../constants/events';
import { getOrSaveFromStorage } from './features';
import { useEffect } from 'react';

const LoadInitialState = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const loadInitialState = async () => {
            const storedAlerts = await getOrSaveFromStorage({
                key: NEW_MESSAGE_ALERT,
                get: true,
            });

            const storedNotificationCount = await getOrSaveFromStorage({
                key: NEW_REQUEST,
                get: true,
            });

            dispatch(
                setInitialNewMessagesAlert({
                    alerts: storedAlerts || [],
                    notificationCount: storedNotificationCount || 0,
                })
            );
        };

        loadInitialState();
    }, [dispatch]);

    return null;
};

export default LoadInitialState;
