import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const ReportsScreen = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch('https://your-backend-url.com/reports/monthly-sales')
      .then((res) => res.json())
      .then((data) => setReports(data.data))
      .catch((error) => console.error('Error fetching reports:', error));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reporte de Ventas Mensuales</Text>
      <FlatList
        data={reports}
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

export default ReportsScreen;
