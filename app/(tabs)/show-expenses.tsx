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
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

const SHEET_API_URL =
  "https://script.google.com/macros/s/AKfycbzWVbPQIx2TTvQtm5R96XPGaBnt36r_4Nh9M-e-7QX2p7dOwQZ7we5IjHzcTcM_Cnd8VA/exec";

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}`;
}

type ExpenseItem = {
  sno: string;
  date: string;
  expense: string;
  amount: string | number;
};

export default function TableExpenseScreen() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);

  // Month/Year dropdown state
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    new Date().getMonth() + 1
  );
  const [monthOpen, setMonthOpen] = useState(false);
  const [monthItems, setMonthItems] = useState(
    monthNames.map((name, i) => ({ label: name, value: i + 1 }))
  );

  const [selectedYear, setSelectedYear] = useState<number | null>(
    new Date().getFullYear()
  );
  const [yearOpen, setYearOpen] = useState(false);
  const [yearItems, setYearItems] = useState(
    [2023, 2024, 2025].map((year) => ({ label: `${year}`, value: year }))
  );

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch(SHEET_API_URL);
      const data = await res.json();
      setExpenses(data);
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
    return (
      (!selectedMonth || itemDate.getMonth() + 1 === selectedMonth) &&
      (!selectedYear || itemDate.getFullYear() === selectedYear)
    );
  });

  const totalAmount = filteredExpenses.reduce((sum, item) => {
    const amt =
      typeof item.amount === "string" ? parseFloat(item.amount) : item.amount;
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const handleEdit = (item: ExpenseItem) => {
    setEditingItem(item);
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      setLoading(true);
      const response = await fetch(SHEET_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });
      await response.text();
      setEditModalVisible(false);
      fetchExpenses();
      Alert.alert("Success", "Data updated successfully!");
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.pageTitle}>BMYB Members</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/add-monthly")}
        >
          <Text style={styles.addButtonText}>+ Add Expenses</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Card */}
      <View style={styles.filterCard}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.filterLabel}>Month</Text>
          <DropDownPicker
            open={monthOpen}
            value={selectedMonth}
            items={monthItems}
            setOpen={setMonthOpen}
            setValue={setSelectedMonth}
            setItems={setMonthItems}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            placeholder="Select Month"
          />
        </View>

        <View style={styles.pickerWrapper}>
          <Text style={styles.filterLabel}>Year</Text>
          <DropDownPicker
            open={yearOpen}
            value={selectedYear}
            items={yearItems}
            setOpen={setYearOpen}
            setValue={setSelectedYear}
            setItems={setYearItems}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            placeholder="Select Year"
          />
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

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Expense</Text>
            <TextInput
              style={styles.input}
              value={editingItem?.date}
              onChangeText={(text) =>
                setEditingItem((prev) => prev && { ...prev, date: text })
              }
            />
            <TextInput
              style={styles.input}
              value={editingItem?.expense}
              onChangeText={(text) =>
                setEditingItem((prev) => prev && { ...prev, expense: text })
              }
            />
            <TextInput
              style={styles.input}
              value={editingItem?.amount.toString()}
              keyboardType="numeric"
              onChangeText={(text) =>
                setEditingItem((prev) => prev && { ...prev, amount: text })
              }
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={[styles.button, { backgroundColor: "#ccc" }]}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
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
  page: { flex: 1, backgroundColor: "#f4f6f8", padding: 12 },
  headerBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  pageTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  addButton: { backgroundColor: "#007bff", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  addButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  filterCard: { backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", elevation: 2 },
  pickerWrapper: { flex: 1, marginHorizontal: 5, zIndex: 1000 },
  filterLabel: { fontSize: 12, color: "#555", marginBottom: 4 },
  dropdown: { borderColor: "#ccc" },
  dropdownContainer: { borderColor: "#ccc" },
  listContainer: { backgroundColor: "#fff", borderRadius: 8, overflow: "hidden" },
  tableHeader: { flexDirection: "row", backgroundColor: "#007bff", paddingVertical: 10, paddingHorizontal: 6 },
  headerCell: { flex: 1, color: "#fff", fontWeight: "bold", fontSize: 13, textAlign: "center" },
  tableRow: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 6 },
  cell: { flex: 1, fontSize: 13, textAlign: "center", color: "#333" },
  totalRow: { flexDirection: "row", backgroundColor: "#d1ecf1", paddingVertical: 10, paddingHorizontal: 6 },
  boldText: { fontWeight: "bold" },
  center: { alignItems: "center", justifyContent: "center", flex: 1 },
});
