import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { MATCHES_URL } from '../config';
import type { Match, MatchesResponse } from '../types/matches';

// Экран «Матчи тура» — задание в README.md, часть 1.
export function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadMatches() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(MATCHES_URL);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: MatchesResponse = await response.json();
        if (!Array.isArray(data.matches)) {
          throw new Error('Некорректный формат данных');
        }

        if (isActive) {
          setMatches(data.matches);
        }
      } catch {
        if (isActive) {
          setMatches([]);
          setError('Не удалось загрузить матчи. Проверьте подключение и попробуйте снова.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadMatches();

    return () => {
      isActive = false;
    };
  }, [requestId]);

  const retry = () => {
    setRequestId((currentRequestId) => currentRequestId + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Матчи тура</Text>

      {isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#ef3124" />
          <Text style={styles.stateText}>Загружаем матчи...</Text>
        </View>
      ) : error !== null ? (
        <View style={styles.stateContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={retry}
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          >
            <Text style={styles.retryButtonText}>Повторить</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(match) => match.id}
          renderItem={({ item }) => <MatchCard match={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={[
            styles.listContent,
            matches.length === 0 && styles.emptyListContent,
          ]}
          ListEmptyComponent={<Text style={styles.stateText}>Матчей пока нет</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: 12,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stateText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    color: '#4b5563',
  },
  errorText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#b91c1c',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ef3124',
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
