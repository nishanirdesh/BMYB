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
import DropDownPicker from "react-native-dropdown-picker";

const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzI7C6UNouJEqfty4KH7sUYwBUVkpZ4VxmEECCGvi6SEypEbXix4gwNN_uYkV-x6mb-/exec";

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}
type Member = {
  Id: string | number;
  Name: string;
  Job: string;
  Location: string;
  Mobile: string;
  dob: string;
};

type MemberItem = {
  sno: string | number;
  name: string;
  mobile?: string | number;
  dob: string ;
  job: string;
  location: string;
    amount: string | number;
  ismonthly: number;
};

export default function TableExpenseScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState(new Date());
   const [job, setJob] = useState("");
    const [location, setLocation] = useState("");
     const [amount, setAmount] = useState("");
     const [ismonthly, setIsMonthly] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
 
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MemberItem | null>(null);
 const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
  const [allMembers, setAllMembers] =useState<MemberItem[]>([]);
const [filteredMembers, setFilteredMembers] = useState<MemberItem[]>([]);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    fetchExpenses();
       fetch("https://script.google.com/macros/s/AKfycbwzNoO_750155zjMbjqFJRS5IdnAhXJB06Ry4uIc7HWWJVWaTe4AEBYNfqYpAG5Hz8t/exec")
      .then((res) => res.json())
      .then((data: Member[]) => {
        
        const formatted = data.map((member) => ({
          
  label: member.Name,
  value: String(member.Id), // 👈 force value to be a string
}));
// Insert "All Members" at the top
const withAllOption = [
  { label: "All Members", value: "ALL" }, // 👈 special value
  ...formatted
];

        setItems(withAllOption);
 
      })
      .catch((error) => {
        console.error("Failed to load members:", error);
        Alert.alert("Error", "Unable to load member list.");
      });
  }, []);
 


  const fetchExpenses = async () => {
    try {
      const res = await fetch(SHEET_API_URL);
      const data = await res.json();
   setAllMembers(data);
  setFilteredMembers(data); // start by showing all
  
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


  const handleSubmit = async () => {
    if (!name || !mobile) {
      Alert.alert("Validation Error", "Please enter required data.");
      return;
    }

    const formattedDate = dob.toISOString().split("T")[0];
    const memberObj = { dob: formattedDate, name: name.trim(), mobile: mobile.trim() ,job: job.trim(),ismonthly: ismonthly ? 1 : 0, location: location.trim(),amount: amount.trim()};

  setLoading(true); // start loading

  try {
    const mobileRegex = /^[6-9]\d{9}$/; // Indian format
  if (!mobileRegex.test(mobile)) {
    Alert.alert("Invalid Mobile Number", "Please enter a valid 10-digit mobile number.");
    return;
  }
    const res = await fetch(SHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(memberObj),
    });

    await res.text();

    setName("");
    setMobile("");
     setJob("");
    setLocation("");
     setAmount("");
    
    Alert.alert("Success", "Expense saved to your Google Sheet!");
    fetchExpenses();
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to save expense.");
  } finally {
    setLoading(false); // stop loading
  }
  };

  const handleEdit = (item: MemberItem) => {
    setEditingItem(item);
    setEditModalVisible(true);
  };
const handleSelectMember = (selectedValue: string | null) => {
  if (!selectedValue || selectedValue === "ALL") {
    setFilteredMembers(allMembers); // Show all members
  } else {
    setFilteredMembers(allMembers.filter(m => String(m.sno) === selectedValue));
  }
};
  const mobileRegex = /^[6-9]\d{9}$/;

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      const mobileRegex = /^[6-9]\d{9}$/; // Indian format
 if (!mobileRegex.test((editingItem.mobile ?? '').toString())) 
    {
    Alert.alert("Invalid Mobile Number", "Please enter a valid 10-digit mobile number edit.");
    return;
  }
    setLoading(true); // ✅ Show loader
      const response = await fetch(SHEET_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });

      await response.text();
      setEditModalVisible(false);
      
       setLoading(false); // ✅ Hide loader after save

      Alert.alert("Success", "Data updated successfully!");
    await  fetchExpenses();
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };
return (
  <>
<View style={styles.headerContainer}>
      <Text style={styles.title}>BMYB Members</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add-member")} // Path to Add Member page
      >
        <Text style={styles.addButtonText}>+ Add Member</Text>
      </TouchableOpacity>
    </View>

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
      onChangeValue={handleSelectMember}
    />

    {loading ? (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    ) : (
      <FlatList
        data={filteredMembers}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.headerCell}>SNo</Text>
            <Text style={styles.headerCell}>Name</Text>
            <Text style={styles.headerCell}>Mobile</Text>
            <Text style={styles.headerCell}>Job</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const backgroundColor =
            item.ismonthly === 1 ? "#d4edda" : "#f8d7da";

          return (
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              style={[styles.row, { backgroundColor }]}
            >
              <Text style={styles.cell}>{item.sno}</Text>
              <Text style={styles.cell}>{item.name}</Text>
              <Text style={styles.cell}>{item.mobile}</Text>
              <Text style={styles.cell}>{item.job}</Text>
            </TouchableOpacity>
          );
        }}
      />
    )}

    {/* Modal */}
    <Modal visible={editModalVisible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Expense</Text>

          <TextInput
            style={styles.input}
            value={editingItem?.name}
            onChangeText={(text) =>
              setEditingItem((prev) => prev && { ...prev, name: text })
            }
          />

          <TextInput
            style={styles.input}
            value={editingItem?.mobile?.toString()}
            keyboardType="numeric"
            maxLength={10}
            onChangeText={(text) => {
              const cleanedText = text.replace(/[^0-9]/g, "");
              setEditingItem(
                (prev) => prev && { ...prev, mobile: cleanedText }
              );

              if (
                cleanedText.length === 10 &&
                !mobileRegex.test(cleanedText)
              ) {
                Alert.alert(
                  "Invalid Mobile Number",
                  "Must start with 6–9 and be 10 digits."
                );
              }
            }}
          />

          <TextInput
            style={styles.input}
            value={editingItem?.job}
            onChangeText={(text) =>
              setEditingItem((prev) => prev && { ...prev, job: text })
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
  </>
);


}

const styles = StyleSheet.create({
  headerContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
},


addButton: {
  backgroundColor: "#007bff",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 5,
},

addButtonText: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "bold",
},

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 5, backgroundColor: "#fff" },
  row: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderColor: "#ddd" },
  headerRow: { backgroundColor: "#007bff" },
  headerCell: { flex: 1, fontWeight: "bold", color: "#fff", textAlign: "center", fontSize: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  cell: { flex: 1, textAlign: "center", fontSize: 15, color: "#333" },
  filterContainer: { flexDirection: "row", justifyContent: "space-evenly", paddingVertical: 8, backgroundColor: "#f0f0f0" },
  picker: { flex: 1, height: 50 },
  modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  modalContent: { margin: 20, backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", marginVertical: 8, padding: 10, borderRadius: 5 },
  buttonRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 10 },
  button: { padding: 10, borderRadius: 5 },checkbox: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
  },
});
