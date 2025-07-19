// /utils/getUserProfile.js
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // import Firestore

export async function getUserProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
