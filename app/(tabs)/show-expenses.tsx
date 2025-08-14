import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const SHEET_API_URL = "https://script.google.com/macros/s/AKfycby5gAEj7hjTYmPwO66uSPgNWnovT9y_HZbqmVSG9Cz2Ity1Zdn8Gk3jCwalcHBpHfP2/exec";

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

type ExpenseItem = {
  sno: string;
  date: string;
  expense: string;
  amount: string | number;
};

export default function TableExpenseScreen() {
    const router = useRouter();
  const [expense, setExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
        setLoading(true);
      const res = await fetch(SHEET_API_URL);
      const data = await res.json();
      setExpenses(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate.getMonth() + 1 === selectedMonth && itemDate.getFullYear() === selectedYear;
  });

  const totalAmount = filteredExpenses.reduce((sum, item) => {
    const amt = typeof item.amount === "string" ? parseFloat(item.amount) : item.amount;
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);


  const handleEdit = (item: ExpenseItem) => {
    setEditingItem(item);
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      

      const response = await fetch(SHEET_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });
    setLoading(true); // ✅ Show loader
      await response.text();
      setEditModalVisible(false);
      fetchExpenses();
       setLoading(false); // ✅ Hide loader after save

      Alert.alert("Success", "Data updated successfully!");
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };

return (
  <View style={styles.page}>

    {/* Header */}
    <View style={styles.headerBar}>
      <Text style={styles.pageTitle}>BMYB Members</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add-expenses")}
      >
        <Text style={styles.addButtonText}>+ Add Expenses</Text>
      </TouchableOpacity>
    </View>

   

    {/* Filter Card */}
    <View style={styles.filterCard}>
      <View style={styles.pickerWrapper}>
        <Text style={styles.filterLabel}>Month</Text>
        <Picker
          selectedValue={selectedMonth}
          style={styles.picker}
          onValueChange={(val) => setSelectedMonth(Number(val))}
        >
          {monthNames.map((name, i) => (
            <Picker.Item key={i} label={name} value={i + 1} />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerWrapper}>
        <Text style={styles.filterLabel}>Year</Text>
        <Picker
          selectedValue={selectedYear}
          style={styles.picker}
          onValueChange={(val) => setSelectedYear(Number(val))}
        >
          {[2023, 2024, 2025].map((year) => (
            <Picker.Item key={year} label={`${year}`} value={year} />
          ))}
        </Picker>
      </View>
    </View>

    {/* Expenses List */}
    {loading ? (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    ) : (
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>SNo</Text>
            <Text style={styles.headerCell}>Date</Text>
            <Text style={styles.headerCell}>Expense</Text>
            <Text style={styles.headerCell}>Amount</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={[
              styles.tableRow,
              { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#eef6ff" },
            ]}
          >
            <Text style={styles.cell}>{item.sno}</Text>
            <Text style={styles.cell}>{formatDate(item.date)}</Text>
            <Text style={styles.cell}>{item.expense}</Text>
            <Text style={styles.cell}>₹ {item.amount}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View style={styles.totalRow}>
            <Text style={[styles.cell, styles.boldText]}>Total</Text>
            <Text style={styles.cell}></Text>
            <Text style={styles.cell}></Text>
            <Text style={[styles.cell, styles.boldText]}>
              ₹ {totalAmount.toFixed(2)}
            </Text>
          </View>
        }
      />
    )}
    <Modal visible={editModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Expense</Text>
            <TextInput style={styles.input} value={editingItem?.date} onChangeText={(text) => setEditingItem((prev) => prev && { ...prev, date: text })} />
            <TextInput style={styles.input} value={editingItem?.expense} onChangeText={(text) => setEditingItem((prev) => prev && { ...prev, expense: text })} />
            <TextInput style={styles.input} value={editingItem?.amount.toString()} keyboardType="numeric" onChangeText={(text) => setEditingItem((prev) => prev && { ...prev, amount: text })} />
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={[styles.button, { backgroundColor: "#ccc" }]}>
  <Text>Cancel</Text>
</TouchableOpacity>

            {/* ✅ Save button or loading indicator */}
          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <Button title="Save" onPress={handleSave} />
          )}
            </View>
          </View>
        </View>
      </Modal>
  </View>
);

}

const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  modalContent: { margin: 20, backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
     input: { borderWidth: 1, borderColor: "#ccc", marginVertical: 8, padding: 10, borderRadius: 5 },
  buttonRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 10 },
  button: { padding: 10, borderRadius: 5 },
  page: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    padding: 12,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  filterCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
  },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  filterLabel: {
    fontSize: 12,
    color: "#555",
    marginBottom: -4,
  },
  picker: {
    height: 54,
    width: "100%",
  },
  listContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  headerCell: {
    flex: 1,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  cell: {
    flex: 1,
    fontSize: 13,
    textAlign: "center",
    color: "#333",
  },
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#d1ecf1",
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  boldText: {
    fontWeight: "bold",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});

