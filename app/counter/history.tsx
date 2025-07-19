import { Text, View, StyleSheet, FlatList } from 'react-native';
import { countdownStorageKey, PersistedCountdownState } from './index';
import { getFromStorage } from '../../utils/storage';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { theme } from '../../theme';

const fullDateFormat = 'LLL d yyyy, h:mm aaa';

export default function HistoryScreen() {
  const [countdownState, setCountdownState] =
    useState<PersistedCountdownState>();

  useEffect(() => {
    const init = async () => {
      const value = await getFromStorage(countdownStorageKey);
      setCountdownState(value);
    };
    init();
  }, []);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.contentContainer}
      data={countdownState?.completedAtTimestamp}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <Text>No history</Text>
        </View>
      }
      renderItem={({ item }) => {
        return (
          <View style={styles.listItem}>
            <Text style={styles.text}>{format(item, fullDateFormat)}</Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: theme.colorWhite,
  },
  contentContainer: {
    paddingTop: 8,
  },
  listItem: {
    backgroundColor: theme.colorLightGrey,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  text: {
    fontSize: 18,
  },
  listEmptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 18,
  },
});
