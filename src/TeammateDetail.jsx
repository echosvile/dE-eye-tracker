import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";

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

export default function TeammateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teammate, setTeammate] = useState(null);

  useEffect(() => {
    const fetchTeammate = async () => {
      const docRef = doc(db, "teammates", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTeammate({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.error("No such document!");
      }
    };
    fetchTeammate();
  }, [id]);

  const toggleField = async (field) => {
    const updated = { ...teammate, [field]: !teammate[field] };
    setTeammate(updated);
    await updateDoc(doc(db, "teammates", id), {
      [field]: updated[field],
      updatedAt: new Date()
    });
  };

  if (!teammate) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-md mx-auto bg-white min-h-screen">
      <button onClick={() => navigate(-1)} className="text-sm text-blue-600 mb-3">&larr; Back</button>
      <h2 className="text-xl font-bold mb-2 text-teal-700">{teammate.name}</h2>
      <p className="text-sm text-gray-600">Package: {teammate.package} ({teammate.accounts} accounts)</p>
      <p className="text-sm text-gray-600">Stage: {teammate.stage}</p>
      <p className="text-sm text-gray-600">Reg. Date: {teammate.regDate}</p>
      <p className="text-sm text-gray-600">Upline: {teammate.upline}</p>

      <hr className="my-3" />

      <div className="space-y-2 text-sm">
        {[
          "validated",
          "addedToGroups",
          "attendedIPO",
          "productCollected",
          "websiteCreated",
          "accountLinked"
        ].map((key) => (
          <label key={key} className="block">
            <input
              type="checkbox"
              checked={teammate[key]}
              onChange={() => toggleField(key)}
              className="mr-2"
            />
            {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
          </label>
        ))}
      </div>

      <hr className="my-3" />

      <div className="text-sm space-y-1">
        <p><strong>ID Number:</strong> {teammate.idNumber || "Not added yet"}</p>
        <p><strong>Username:</strong> {teammate.username || "Not added yet"}</p>
        <p><strong>Password:</strong> {teammate.password || "Not added yet"}</p>
      </div>
    </div>
  );
}
