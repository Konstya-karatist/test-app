import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { MATCHES_URL } from '../config';
import { useFavorites } from '../hooks/useFavorites';
import type { Match, MatchesResponse } from '../types/matches';

type MatchFilter = 'all' | 'upcoming' | 'completed';

const FILTERS: { value: MatchFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'upcoming', label: 'Предстоящие' },
  { value: 'completed', label: 'Завершённые' },
];

// Экран «Матчи тура» — задание в README.md, часть 1.
export function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const [filter, setFilter] = useState<MatchFilter>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { favorites, isFavorite, toggle } = useFavorites();

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
          setLastUpdated(new Date());
        }
      } catch {
        if (isActive) {
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

  const filteredMatches = matches.filter((match) => {
    if (filter === 'upcoming') {
      return match.status === 'scheduled' || match.status === 'postponed';
    }
    if (filter === 'completed') {
      return match.status === 'finished';
    }
    return true;
  });

  const emptyMessage =
    matches.length === 0 ? 'Матчей пока нет' : 'В этой категории матчей нет';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Матчи тура</Text>

      {isLoading && lastUpdated === null ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#ef3124" />
          <Text style={styles.stateText}>Загружаем матчи...</Text>
        </View>
      ) : error !== null && lastUpdated === null ? (
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
        <>
          <View style={styles.filters}>
            {FILTERS.map((item) => {
              const isActive = filter === item.value;
              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  onPress={() => setFilter(item.value)}
                  style={({ pressed }) => [
                    styles.filterButton,
                    isActive && styles.filterButtonActive,
                    pressed && styles.filterButtonPressed,
                  ]}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.updateRow}>
            {lastUpdated !== null && <UpdatedAgo since={lastUpdated} />}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading }}
              disabled={isLoading}
              onPress={retry}
              style={({ pressed }) => [
                styles.updateButton,
                isLoading && styles.updateButtonDisabled,
                pressed && styles.updateButtonPressed,
              ]}
            >
              <Text style={styles.updateButtonText}>
                {isLoading ? 'Обновляем...' : 'Обновить'}
              </Text>
            </Pressable>
          </View>

          {error !== null && <Text style={styles.inlineError}>{error}</Text>}

          <FlatList
            style={styles.list}
            data={filteredMatches}
            extraData={favorites}
            keyExtractor={(match) => match.id}
            renderItem={({ item }) => (
              <MatchCard
                match={item}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={() => toggle(item.id)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={[
              styles.listContent,
              filteredMatches.length === 0 && styles.emptyListContent,
            ]}
            ListEmptyComponent={<Text style={styles.stateText}>{emptyMessage}</Text>}
          />
        </>
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
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    borderColor: '#ef3124',
    backgroundColor: '#fff1f0',
  },
  filterButtonPressed: {
    opacity: 0.8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#4b5563',
  },
  filterTextActive: {
    color: '#ef3124',
  },
  updateRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  updateButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ef3124',
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonPressed: {
    opacity: 0.8,
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  inlineError: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#b91c1c',
  },
  list: {
    flex: 1,
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
