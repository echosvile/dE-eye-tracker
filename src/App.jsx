import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [teammates, setTeammates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    package: "",
    accounts: "",
    upline: "",
    validated: false,
    addedToGroups: false,
    attendedIPO: false,
    productCollected: false,
    stage: "Incubator",
    regDate: "",
    websiteCreated: false,
    accountLinked: false,
    idNumber: "",
    username: "",
    password: ""
  });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchTeammates = async () => {
      const querySnapshot = await getDocs(collection(db, "teammates"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeammates(data);
    };
    fetchTeammates();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const addTeammate = async () => {
    try {
      await addDoc(collection(db, "teammates"), { ...formData, updatedAt: new Date() });
      setTeammates([...teammates, { ...formData, updatedAt: new Date() }]);
      setFormData({
        name: "",
        package: "",
        accounts: "",
        upline: "",
        validated: false,
        addedToGroups: false,
        attendedIPO: false,
        productCollected: false,
        stage: "Incubator",
        regDate: "",
        websiteCreated: false,
        accountLinked: false,
        idNumber: "",
        username: "",
        password: ""
      });
    } catch (error) {
      console.error("Error adding teammate: ", error);
    }
  };

  const filteredTeammates = teammates
    .filter(tm => {
      if (filter === "unvalidated") return !tm.validated;
      if (filter === "products") return !tm.productCollected;
      if (filter === "groups") return !tm.addedToGroups;
      return true;
    })
    .filter(tm => {
      const lower = searchTerm.toLowerCase();
      return Object.values(tm).some(val =>
        typeof val === "string" && val.toLowerCase().includes(lower)
      );
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const unvalidatedCount = teammates.filter(t => !t.validated).length;
  const productCount = teammates.filter(t => !t.productCollected).length;
  const groupCount = teammates.filter(t => !t.addedToGroups).length;

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-teal-800">dE-eye Tracker</h1>
        <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Logout</button>
      </div>

      <input
        className="w-full p-2 mb-3 rounded border"
        placeholder="Search teammate, ID, package..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="flex gap-2 mb-4 text-sm">
        <button onClick={() => setFilter("all")} className="bg-teal-600 text-white px-2 py-1 rounded">All</button>
        <button onClick={() => setFilter("unvalidated")} className="bg-yellow-400 px-2 py-1 rounded">Unvalidated {unvalidatedCount}</button>
        <button onClick={() => setFilter("products")} className="bg-blue-400 px-2 py-1 rounded">Products {productCount}</button>
        <button onClick={() => setFilter("groups")} className="bg-purple-400 px-2 py-1 rounded">Groups {groupCount}</button>
      </div>

      <h2 className="text-lg font-bold text-teal-800 mb-2">Team Tracker</h2>
      <div className="space-y-3">
        {filteredTeammates.map((tm, idx) => (
          <div
            key={idx}
            className={`p-4 rounded shadow cursor-pointer ${!tm.validated || !tm.productCollected || !tm.addedToGroups ? 'bg-yellow-100 border-l-4 border-yellow-500' : 'bg-white border-l-4 border-green-500'}`}
            onClick={() => navigate(`/teammate/${tm.id}`)}
          >
            <p className="font-semibold text-teal-900">{tm.name}</p>
            <p className="text-sm text-gray-800">{tm.stage} Stage · {tm.package} · {tm.regDate}</p>
            <p className="text-xs text-gray-600">Upline: {tm.upline}</p>
            <p className="text-xs text-gray-600">Website: {tm.websiteCreated ? '✅' : '❌'} | Linked: {tm.accountLinked ? '✅' : '❌'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
