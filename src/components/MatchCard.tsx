import { StyleSheet, Text, View } from 'react-native';
import type { Match, MatchStatus } from '../types/matches';

type Props = {
  match: Match;
};

const STATUS_LABELS: Record<MatchStatus, string> = {
  finished: 'Завершён',
  live: 'Идёт',
  scheduled: 'Запланирован',
  postponed: 'Перенесён',
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatStartDate(startsAt: string | null) {
  if (startsAt === null) {
    return 'Дата уточняется';
  }

  const date = new Date(startsAt);
  return Number.isNaN(date.getTime()) ? 'Дата уточняется' : dateFormatter.format(date);
}

export function MatchCard({ match }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
        <View style={styles.teams}>
          <Text style={styles.teamName}>{match.home.name}</Text>
          <Text style={styles.teamName}>{match.away.name}</Text>
        </View>

        {match.score !== null && (
          <Text style={styles.score}>
            {match.score.home} : {match.score.away}
          </Text>
        )}
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.date}>{formatStartDate(match.startsAt)}</Text>
        <Text style={styles.status}>{STATUS_LABELS[match.status]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teams: {
    flex: 1,
    gap: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  score: {
    minWidth: 64,
    marginLeft: 16,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'right',
    color: '#111827',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 14,
  },
  date: {
    fontSize: 13,
    color: '#6b7280',
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef3124',
  },
});
