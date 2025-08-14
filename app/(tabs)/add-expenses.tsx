import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
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
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    
  }, []);






  const handleSubmit = async () => {
    if (!expense || !amount || isNaN(Number(amount))) {
      Alert.alert("Validation Error", "Please enter valid expense and amount.");
      return;
    }

    const formattedDate = date.toISOString().split("T")[0];
    const expenseObj = { date: formattedDate, expense: expense.trim(), amount: amount.trim() };

  try {
    const res = await fetch(SHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseObj),
    });

  setLoading(true); // start loading

    await res.text();

    setAmount("");
    setExpense("");
    Alert.alert("Success", "Expense saved to your Google Sheet!");

  setLoading(false); // start loading

  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to save expense.");
  } finally {
    setLoading(false); // stop loading
  }
  };



 return (
  <View style={styles.container}>

    {/* Header */}
    <View style={styles.headerRow}>
      <Text style={styles.title}>BMYB Members</Text>
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.push("/show-expenses")}
      >
        <Text style={styles.linkButtonText}>+ Show Expenses</Text>
      </TouchableOpacity>
    </View>

    {/* Date Picker */}
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Date</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateButtonText}>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}
    </View>

    {/* Expense Input */}
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Expense</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Groceries"
        value={expense}
        onChangeText={setExpense}
      />
    </View>

    {/* Amount Input */}
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 500"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
    </View>

    {/* Submit Button */}
    {loading ? (
      <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 24 }} />
    ) : (
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    )}
  </View>
);


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7f9fc",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },

  linkButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  linkButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#444",
  },

  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  dateButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
  },

  dateButtonText: {
    fontSize: 16,
    color: "#555",
  },

  submitButton: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
