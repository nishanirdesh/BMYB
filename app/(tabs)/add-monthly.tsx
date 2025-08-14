import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet, Text, TextInput,
  TouchableOpacity,
  View
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

type Member = {
  Id: string | number;
  Name: string;
  Job: string;
  Location: string;
  Mobile: string;
  dob: string;
};

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
type MonthlyDataItem = {
   sno: string;
      memberid: number;
      date: string;
      amount: string | number;
      extra:string;
 
};

 
export default function SubmitViewMonthlyScreen() {
      const router = useRouter();
const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
const [type, setType] = useState<'Monthly' | 'Special'>('Monthly');
  const [specialReason, setSpecialReason] = useState('');
   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
 const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
    //const [monthlyData, setMonthlyData] = useState<MonthlyDataItem[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyDataItem[]>([]); // original, untouched
const [filteredMonthlyData, setFilteredMonthlyData] = useState<MonthlyDataItem[]>([]); // shown in UI
 const [typeItems, setTypeItems] = useState([
    { label: "Monthly", value: "Monthly" },
    { label: "Special", value: "Special" },
  ]);
   const [typeOpen, setTypeOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
      const [editingItem, setEditingItem] = useState<MonthlyDataItem | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
      );
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
  const memberAPI="https://script.google.com/macros/s/AKfycbwzNoO_750155zjMbjqFJRS5IdnAhXJB06Ry4uIc7HWWJVWaTe4AEBYNfqYpAG5Hz8t/exec";
  const monthlyApi="https://script.google.com/macros/s/AKfycbzWVbPQIx2TTvQtm5R96XPGaBnt36r_4Nh9M-e-7QX2p7dOwQZ7we5IjHzcTcM_Cnd8VA/exec";
  // ✅ Fetch member list from Google Apps Script
  useEffect(() => {
    fetch(memberAPI)
      .then((res) => res.json())
      .then((data: Member[]) => {
        const formatted = data.map((member) => ({
  label: member.Name,
  value: String(member.Id), // 👈 force value to be a string
}));
        setItems(formatted);
   
      })
      .catch((error) => {
        console.error("Failed to load members:", error);
        Alert.alert("Error", "Unable to load member list.");
      });
  }, []);

  // ✅ Submit contribution
  const handleSubmit = async () => {

    debugger
    if (!value || !amount || isNaN(Number(amount))) {
      Alert.alert("Validation Error", "Please enter valid amount and select member.");
      return;
    }
 if (amount=="") {
      Alert.alert("Required", "Please enter an amount.");
      return;
    }
     if (value=="") {
      Alert.alert("Required", "Please enter an amount.");
      return;
    }
    const selectedMember = members.find((m) => m.Id === value);
    // if (!selectedMember) {
    //   Alert.alert("Error", "Selected member not found.");
    //   return;
    // }

  
      const selectedDate = new Date(selectedYear, selectedMonth - 1, 1);

  // Format it as YYYY-MM-DD
  const formattedDate = selectedDate.toISOString().split('T')[0];
    const payload = {
      memberid: value,
     entrydate:formattedDate,
      amount: parseFloat(amount),
      specialreason:specialReason,
    };
alert(payload)
    setLoading(true);
    try {
      const res = await fetch(monthlyApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setLoading(false);
      setAmount("");
      Alert.alert("Success", "Contribution saved successfully!");
    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert("Error", "Failed to submit contribution.");
    }
  };
const showDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
  return date
    .toLocaleDateString('en-US', options)
    .replace(' ', '-'); // Replace space with dash
};
useEffect(() => {
      fetchMonthlyData();
    }, []);
  
    const onRefresh = useCallback(() => {
      setRefreshing(true);
      fetchMonthlyData();
    }, []);

 const handleEdit = (item: MonthlyDataItem) => {
    setEditingItem(item);
    setEditModalVisible(true);
  };
   const handleSave = async () => {
      if (!editingItem) return;
  console.log(editingItem)
      try {
        if (!editingItem.memberid || !editingItem.sno ) {
      Alert.alert("Validation Error", "Please enter valid amount and select member.");
      return;
    }
//  if (amount=="") {
//       Alert.alert("Required", "Please enter an amount.");
//       return;
//     }
      setLoading(true); // ✅ Show loader
        const response = await fetch(monthlyApi, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingItem),
        });
  
        await response.text();
        setEditModalVisible(false);
        
         setLoading(false); // ✅ Hide loader after save
  
        Alert.alert("Success", "Data updated successfully!");
      await  fetchMonthlyData();
      } catch (error) {
        console.error("Failed to update:", error);
      }
    };
  const fetchMonthlyData = async () => {
    try {
      const res = await fetch(monthlyApi);
      const data = await res.json();
      
      setMonthlyData(data);
      setFilteredMonthlyData(data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
 const totalAmount = filteredMonthlyData.reduce((sum, item) => {
    const amt = typeof item.amount === "string" ? parseFloat(item.amount) : item.amount;
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

    return (
    <View style={styles.container}>
        {/* Header */}
                <View style={styles.headerBar}>
                  <Text style={styles.pageTitle}>Contribution Entry</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push("/show-monthly")}
                  >
                    <Text style={styles.addButtonText}>+ Contribution List</Text>
                  </TouchableOpacity>
                </View>

      <Text style={styles.label}>Select Member:</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        searchable={true}
        searchPlaceholder="Search member..."
        placeholder="Select a member"
        zIndex={3000}
        zIndexInverse={1000}
        onChangeValue={(selectedValue) => {
          setValue(selectedValue);
          if (!selectedValue) {
            setFilteredMonthlyData(monthlyData);
            return;
          }
          const filtered = monthlyData.filter(
            (item) => String(item.memberid) === String(selectedValue)
          );
          setFilteredMonthlyData(filtered);
        }}
      />

      <Text style={styles.label}>Select Fund Type:</Text>
      <DropDownPicker
        open={typeOpen}
        value={type}
        items={typeItems}
        setOpen={setTypeOpen}
        setValue={setType}
        setItems={setTypeItems}
        placeholder="Select Fund Type"
        zIndex={2000}
        zIndexInverse={2000}
      />

      {type === "Special" && (
        <>
          <Text style={styles.label}>What is this special for?</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter reason for special"
            value={specialReason}
            onChangeText={setSpecialReason}
          />
        </>
      )}

      <Text style={styles.label}>Amount:</Text>
       <TextInput style={styles.input} placeholder="e.g. 500" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Button title="Submit" onPress={handleSubmit} disabled={loading} />
      )}

      <FlatList
        data={filteredMonthlyData}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.headerCell}>SNo</Text>
            <Text style={styles.headerCell}>MemId</Text>
            <Text style={styles.headerCell}>Date</Text>
            <Text style={styles.headerCell}>Amount</Text>
            <Text style={styles.headerCell}>Extra</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={[
              styles.row,
              { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#e6f2ff" },
            ]}
          >
            <Text style={styles.cell}>{item.sno}</Text>
            <Text style={styles.cell}>{item.memberid}</Text>
            <Text style={styles.cell}>{showDate(item.date)}</Text>
            <Text style={styles.cell}>₹{item.amount}</Text>
            <Text style={styles.cell}>{item.extra}</Text>
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
       {/* Modal */}
            <Modal visible={editModalVisible} transparent={true} animationType="slide">
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Edit Monthly</Text>
        
               <TextInput style={styles.input} value={editingItem?.amount.toString()} keyboardType="numeric" onChangeText={(text) => setEditingItem((prev) => prev && { ...prev, amount: text })} />
                        
                 
        
                 
        
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
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },button: { padding: 10, borderRadius: 5 },
  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },  boldText: {
    fontWeight: "bold",
  }, modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  modalContent: { margin: 20, backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },totalRow: {
    flexDirection: "row",
    backgroundColor: "#d1ecf1",
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  addButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },  buttonRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 10 },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  container: {
    padding: 12,
    backgroundColor: "#fff",
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  row: {
    flexDirection: "row",
    padding: 10,
  },
  headerRow: {
    backgroundColor: "#007AFF",
  },
  headerCell: {
    flex: 1,
    color: "#fff",
    fontWeight: "bold",
  },
  cell: {
    flex: 1,
  },
});