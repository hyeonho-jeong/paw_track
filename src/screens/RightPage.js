import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  Alert, ActivityIndicator, SafeAreaView
} from "react-native";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { format, subDays, startOfMonth } from "date-fns";

const RightPage = () => {
  const [selectedFilter, setSelectedFilter] = useState("Today"); // Today | Week | Month
  const [sortBy, setSortBy] = useState("walkedTime"); // walkedTime | steps
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Firestore에서 데이터 가져오기
  const fetchRankingData = async () => {
    setLoading(true);
    
    try {
      let startDate;
      const today = new Date();
  
      if (selectedFilter === "Today") {
        startDate = new Date(today.setHours(0, 0, 0, 0)); // 오늘 자정부터
      } else if (selectedFilter === "Week") {
        startDate = new Date(today.setDate(today.getDate() - 7)); // 최근 7일
      } else if (selectedFilter === "Month") {
        startDate = new Date(today.setDate(1)); // 이번 달 1일부터
      }
  
      console.log(`📅 조회 기간: ${startDate.toISOString()}`);
  
      // ✅ users_activity 컬렉션에서 데이터 가져오기
      const activityCollectionRef = collection(db, "users_activity");
  
      // 🔍 특정 기간 이후의 데이터 가져오기
      const q = query(
        activityCollectionRef,
        where("timestamp", ">=", startDate),
        orderBy("timestamp", "desc") // ✅ 최신 데이터 우선 정렬
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
          date: docData.timestamp ? docData.timestamp.toDate().toISOString().split("T")[0] : "N/A",
        };
      });
  
      // 정렬 기준 적용 (walkedTime 또는 steps)
      const sortedData = [...data].sort((a, b) => b[sortBy] - a[sortBy]);
  
      setRankingData(sortedData);
    } catch (error) {
      console.error("🚨 데이터 불러오기 오류:", error);
      Alert.alert("Error", "랭킹 데이터를 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };
  

  // ✅ 필터 변경 시 데이터 다시 가져오기
  useEffect(() => {
    fetchRankingData();
  }, [selectedFilter, sortBy]);

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ 상단 필터 버튼 */}
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

      {/* ✅ 정렬 기준 버튼 */}
      <View style={styles.sortContainer}>
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === "walkedTime" && styles.activeSort]} 
          onPress={() => setSortBy("walkedTime")}
        >
          <Text style={styles.sortButtonText}>Walk Time</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.sortButton, sortBy === "steps" && styles.activeSort]} 
          onPress={() => setSortBy("steps")}
        >
          <Text style={styles.sortButtonText}>Step Count</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ 랭킹 목록 */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={rankingData}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.rankingItem}>
              <Text style={styles.rank}>{index + 1}</Text>
              <View style={styles.dogInfo}>
                <Text style={styles.dogName}>{item.dogName} ({item[sortBy]})</Text>
                <Text style={styles.username}>{item.username}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },

  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20, // ✅ 상태바와 겹치지 않도록 여백 추가
    marginBottom: 20,
  },

  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#007AFF",
  },

  activeFilter: {
    backgroundColor: "#007AFF",
  },

  filterButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
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
    borderRadius: 5,
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

  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  rank: {
    fontSize: 18,
    fontWeight: "bold",
    width: 30,
  },

  dogInfo: {
    flex: 1,
  },

  dogName: {
    fontSize: 16,
    fontWeight: "bold",
  },

  username: {
    fontSize: 14,
    color: "#666",
  },
});

export default RightPage;
