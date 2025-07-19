import { Stack, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { theme } from '../../theme';
import { Pressable } from 'react-native';

export default function Layout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Counter',
          headerRight: () => {
            return (
              <Pressable
                style={{
                  paddingVertical: 8,
                  paddingRight: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                hitSlop={20}
                onPress={() => {
                  router.push('/counter/history');
                }}
              >
                <MaterialIcons
                  name="history"
                  size={24}
                  color={theme.colorGrey}
                />
              </Pressable>
            );
          },
        }}
      />
    </Stack>
  );
}
