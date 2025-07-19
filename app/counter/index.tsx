import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { theme } from '../../theme';
import { registerForPushNotificationsAsync } from '../../utils/registerForPushNotificationAsync';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Duration, isBefore, intervalToDuration } from 'date-fns';
import { TimeSegment } from '../../components/TimeSegment';
import { getFromStorage, saveToStorage } from '../../utils/storage';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';

// 10 seconds from now
// const frequency = 14 * 60 * 60 * 1000;
const frequency = 10 * 1000;

export const countdownStorageKey = 'taskly-countdown';

export type PersistedCountdownState = {
  currentNotificationId: string | undefined;
  completedAtTimestamp: number[];
};

type CountdownStatus = {
  isOverDue: boolean;
  distance: Duration;
};

export default function CounterScreen() {
  const { width } = useWindowDimensions();
  const confettiRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coundownState, setCoundownState] = useState<PersistedCountdownState>();

  const [status, setStateus] = useState<CountdownStatus>({
    isOverDue: false,
    distance: {},
  });

  const lastCompletedTimestamp = coundownState?.completedAtTimestamp[0];

  useEffect(() => {
    const init = async () => {
      const value = await getFromStorage(countdownStorageKey);
      setCoundownState(value);
    };
    init();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const timestamp = lastCompletedTimestamp
        ? lastCompletedTimestamp + frequency
        : Date.now();
      if (lastCompletedTimestamp) {
        setIsLoading(false);
      }
      const isOverDue = isBefore(timestamp, Date.now());
      const distance = intervalToDuration(
        isOverDue
          ? { start: timestamp, end: Date.now() }
          : {
              start: Date.now(),
              end: timestamp,
            },
      );

      setStateus({ isOverDue, distance });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [lastCompletedTimestamp]);

  const scheduleNotification = async () => {
    confettiRef.current?.start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    let pushNotificationId;
    const result = await registerForPushNotificationsAsync();
    if (result === 'granted') {
      pushNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to wash the car! 🚗',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: frequency / 1000,
        },
      });
    } else {
      if (Device.isDevice) {
        Alert.alert(
          'Unable to schedule notification',
          'Enable the notification permission for schedule',
        );
      }
    }
    if (coundownState?.currentNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(
        coundownState.currentNotificationId,
      );
    }
    const newCoundownState: PersistedCountdownState = {
      currentNotificationId: pushNotificationId,
      completedAtTimestamp: coundownState
        ? [Date.now(), ...coundownState.completedAtTimestamp]
        : [Date.now()],
    };
    setCoundownState(newCoundownState);
    await saveToStorage(countdownStorageKey, newCoundownState);
  };

  if (isLoading) {
    return (
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        status.isOverDue ? styles.containerLate : undefined,
      ]}
    >
      {status.isOverDue ? (
        <Text style={[styles.heading, styles.whiteText]}>
          Car wash overdue by
        </Text>
      ) : (
        <Text style={styles.heading}>Car wash due in ...</Text>
      )}
      <View style={styles.row}>
        <TimeSegment
          number={status.distance.days ?? 0}
          unit="days"
          textStyle={status.isOverDue ? styles.whiteText : undefined}
        />
        <TimeSegment
          number={status.distance.hours ?? 0}
          unit="hours"
          textStyle={status.isOverDue ? styles.whiteText : undefined}
        />
        <TimeSegment
          number={status.distance.minutes ?? 0}
          unit="minutes"
          textStyle={status.isOverDue ? styles.whiteText : undefined}
        />
        <TimeSegment
          number={status.distance.seconds ?? 0}
          unit="seconds"
          textStyle={status.isOverDue ? styles.whiteText : undefined}
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={scheduleNotification}
      >
        <Text style={styles.buttonText}>I&apos;ve washed the car!</Text>
      </TouchableOpacity>
      <ConfettiCannon
        ref={confettiRef}
        count={50}
        origin={{ x: width / 2, y: -20 }}
        autoStart={false}
        fadeOut={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  containerLate: {
    backgroundColor: theme.colorRed,
  },
  button: {
    backgroundColor: theme.colorBlack,
    padding: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: theme.colorWhite,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  whiteText: {
    color: theme.colorWhite,
  },

  activityIndicatorContainer: {
    backgroundColor: theme.colorWhite,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});
