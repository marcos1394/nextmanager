import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import io from 'socket.io-client';

const MonitorScreen = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const socket = io('https://your-backend-url.com');

    socket.on('update-data', (newData) => {
      setData(newData);
    });

    socket.emit('get-real-time-data');

    return () => socket.disconnect();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitor en Tiempo Real</Text>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.mesero}: ${item.total}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default MonitorScreen;
