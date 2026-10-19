import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

type Props = {
  // Момент последней успешной загрузки данных.
  since: Date;
};

function getElapsedSeconds(sinceTimestamp: number) {
  if (!Number.isFinite(sinceTimestamp)) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - sinceTimestamp) / 1000));
}

// Подпись «Обновлено N сек назад».
export function UpdatedAgo({ since }: Props) {
  const sinceTimestamp = since.getTime();
  const [seconds, setSeconds] = useState(() => getElapsedSeconds(sinceTimestamp));

  useEffect(() => {
    const updateSeconds = () => {
      setSeconds(getElapsedSeconds(sinceTimestamp));
    };

    updateSeconds();
    const intervalId = setInterval(updateSeconds, 1000);

    return () => clearInterval(intervalId);
  }, [sinceTimestamp]);

  return <Text style={styles.text}>Обновлено {seconds} сек назад</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    color: '#6b7280',
  },
});
