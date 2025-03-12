import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  Alert, ActivityIndicator, SafeAreaView, Image
} from "react-native";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const RightPage = () => {
  const [selectedFilter, setSelectedFilter] = useState("Today"); // Today | Week | Month
  const [sortBy, setSortBy] = useState("walkedTime"); // walkedTime | steps
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRankingData = async () => {
    setLoading(true);
    try {
      let startDate;
      const today = new Date();
      if (selectedFilter === "Today") {
        startDate = new Date(today.setHours(0, 0, 0, 0));
      } else if (selectedFilter === "Week") {
        startDate = new Date(today.setDate(today.getDate() - 7));
      } else if (selectedFilter === "Month") {
        startDate = new Date(today.setDate(1));
      }
      const activityCollectionRef = collection(db, "users_activity");
      const q = query(
        activityCollectionRef,
        where("timestamp", ">=", startDate),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          username: docData.username || "Unknown User",
          dogName: docData.dogName || "Unknown Dog",
          steps: docData.steps || 0,
          walkedTime: parseFloat(docData.walkedTime) || 0,
          image: docData.image || null, // ✅ 강아지 이미지 추가
          date: docData.timestamp ? docData.timestamp.toDate().toISOString().split("T")[0] : "N/A",
        };
      });
      const sortedData = [...data].sort((a, b) => b[sortBy] - a[sortBy]);
      setRankingData(sortedData);
    } catch (error) {
      console.error("🚨 데이터 불러오기 오류:", error);
      Alert.alert("Error", "랭킹 데이터를 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankingData();
  }, [selectedFilter, sortBy]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Text style={styles.title}>Ranking</Text>
      <View style={styles.container}>
        <View style={styles.filterContainer}>
          {["Today", "Week", "Month"].map((filter) => (
            <TouchableOpacity 
              key={filter} 
              style={[styles.filterButton, selectedFilter === filter && styles.activeFilter]} 
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterButtonText, selectedFilter === filter && styles.activeFilterText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sortContainer}>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === "walkedTime" && styles.activeSort]} 
            onPress={() => setSortBy("walkedTime")}
          >
            <Text style={[styles.sortButtonText, sortBy === "walkedTime" && styles.activeSortText]}>Walk Time</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.sortButton, sortBy === "steps" && styles.activeSort]} 
            onPress={() => setSortBy("steps")}
          >
            <Text style={[styles.sortButtonText, sortBy === "steps" && styles.activeSortText]}>Step Count</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={rankingData}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={styles.rankingItem}>
                <Text style={styles.rank}>{index + 1}</Text>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.dogImage} />
                ) : (
                  <Text style={styles.defaultIcon}>🐾</Text>
                )}
                <Text style={styles.dogName}>{item.dogName}</Text>
                <Text style={styles.statsText}>{sortBy === "walkedTime" ? `${item.walkedTime} min` : `${item.steps} steps`}</Text>
                <Text style={styles.username}>{item.username}</Text>
              </View>
            )}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "rgb(238,117,11)",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 90,
  },
  container: { 
    width: "90%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: "rgb(238,117,11)",
    marginTop: 10,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    marginTop: 40,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderRadius: 25,
    borderColor: "rgb(237,152,74)",
  },
  activeFilter: {
    backgroundColor: "rgb(237,152,74)",
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgb(237,152,74)",
  },
  activeFilterText: {
    color: "#fff",
  },
  sortContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#28a745",
  },
  activeSort: {
    backgroundColor: "#28a745",
  },
  sortButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
  },
  activeSortText: {
    color: "#fff",
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgb(238,117,11)",
  },
  dogInfoContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  rank: {
    fontSize: 18,
    fontWeight: "bold",
    width: 30,
  },
  dogName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statsText: {
    fontSize: 14,
    color: "#333",
  },
  username: {
    fontSize: 14,
    color: "#666",
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgb(238,117,11)",
  },
  dogImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10, // ✅ 이미지와 텍스트 사이 간격 추가
  },
  defaultIcon: {
    fontSize: 30,
    marginHorizontal: 10,
  },
  rank: {
    fontSize: 18,
    fontWeight: "bold",
    color: "rgb(238,117,11)",
    width: 30,
    textAlign: "center",
  },
  dogName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "left",
  },
  statsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    flex: 1,
  },
  username: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
    fontWeight: "bold",
    color: "black",
    flex: 1,
  },
});

export default RightPage;
