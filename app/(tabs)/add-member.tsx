import DateTimePicker from "@react-native-community/datetimepicker";
import Checkbox from "expo-checkbox"; // or you can use react-native's CheckBox for Android
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzI7C6UNouJEqfty4KH7sUYwBUVkpZ4VxmEECCGvi6SEypEbXix4gwNN_uYkV-x6mb-/exec";

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

  const [loading, setLoading] = useState(false);
  

 







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


   
    const message = await res.text(); // Get plain text from server


  if (message === "Success") {
     setName("");
    setMobile("");
     setJob("");
    setLocation("");
     setAmount("");
       Alert.alert("Success", "Expense saved to your Google Sheet!");
  }
 else 
 {
  Alert.alert("Success",message);
 }

  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to save expense.");
  } finally {
    setLoading(false); // stop loading
  }
  };


return (
  
  <ScrollView
    style={{ flex: 1 }}
    contentContainerStyle={{ padding: 16 }}
    keyboardShouldPersistTaps="handled"
  >
   
<View style={styles.headerContainer}>
      <Text style={styles.title}>BMYB Members</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/show-member")} // Path to Add Member page
      >
        <Text style={styles.addButtonText}>+ Show Member</Text>
      </TouchableOpacity>
    </View>
    <Text>Date:</Text>
    <Button title={dob.toDateString()} onPress={() => setShowPicker(true)} />
    {showPicker && (
      <DateTimePicker
        value={dob}
        mode="date"
        display={Platform.OS === "ios" ? "spinner" : "default"}
        onChange={(event, selectedDate) => {
          setShowPicker(false);
          if (selectedDate) setDob(selectedDate);
        }}
      />
    )}

    <Text>Name:</Text>
    <TextInput style={styles.input} placeholder="e.g. Nirdesh" value={name} onChangeText={setName} />

    <Text>Mobile:</Text>
   <TextInput
  style={styles.input}
  placeholder="e.g. xxxxxxxxxx"
  value={mobile}
  onChangeText={(text) => {
    // Allow only numbers
    const cleanedText = text.replace(/[^0-9]/g, '');
    // Limit to 10 digits
    setMobile(cleanedText);
  }}
  keyboardType="numeric"
  maxLength={10}
/>
    <Text>Job:</Text>
    <TextInput style={styles.input} placeholder="e.g. Delhi Police" value={job} onChangeText={setJob} />

    <Text>Location:</Text>
    <TextInput style={styles.input} placeholder="e.g. Bali" value={location} onChangeText={setLocation} />

    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 8 }}>
      <Checkbox value={ismonthly} onValueChange={setIsMonthly} style={styles.checkbox} />
      <Text style={styles.label}>Is Monthly?</Text>
    </View>

    {ismonthly && (
      <>
        <Text style={styles.label}>Amount:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 500"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
      </>
    )}

    {loading ? (
      <ActivityIndicator size="large" color="#007AFF" />
    ) : (
      <Button title="Submit" onPress={handleSubmit} disabled={loading} />
    )}

  </ScrollView>
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
