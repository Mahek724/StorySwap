import "../../pages/Profile.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/logo.PNG";
import { auth, db } from "../../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { FaCamera, FaUserCircle, FaCheckCircle } from "react-icons/fa";

const ProfilePage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [editing, setEditing] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [userId, setUserId] = useState("");
  const [borrowingHistory, setBorrowingHistory] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setEmail(user.email);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUsername(data.username || "");
        } else {
          await setDoc(userDocRef, {
            username: user.displayName || "",
            email: user.email,
          });
        }

        const q = query(
          collection(db, "borrowings"),
          where("borrowerId", "==", user.uid),
          
        );
        const querySnapshot = await getDocs(q);
        const history = querySnapshot.docs.map((doc) => doc.data());
        setBorrowingHistory(history);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleEditPic = () => {
    document.getElementById("uploadInput").click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("No image selected.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result);
      toast.success("Profile picture updated!");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      await updateDoc(doc(db, "users", userId), {
        username,
        email,
      });
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast.info("You have been logged out.");
    navigate("/");
  };

  return (
    
    
    <div className="profile-container">
      <ToastContainer />
      <div className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h1 className="title">Profile</h1>
      </div>

      <div className="profile-box">
        <div className="profile-pic-container">
          <div className="profile-pic-wrapper">
            {profilePic ? (
              <img
                className="profile-pic"
                src={profilePic}
                alt="Profile"
                onError={(e) => {
                  console.error("Image load error");
                  e.target.src = "";
                }}
              />
            ) : (
              <FaUserCircle className="profile-placeholder-icon" />
            )}
            <button className="edit-pic-btn" onClick={handleEditPic}>
              <FaCamera className="camera-icon" />
            </button>
          </div>
          <input
            id="uploadInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </div>

        <div className="form-section">
          <div className="form-group no-gap">
            <label id="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!editing}
              className="larger-input full-width"
            />
          </div>
          <div className="form-group no-gap reduced-gap">
            <label id="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!editing}
              className="larger-input full-width"
            />
          </div>

          <div className="button-group">
            {editing ? (
              <button className="form-button" onClick={handleSave}>
                Save
              </button>
            ) : (
              <button className="form-button" onClick={() => setEditing(true)}>
                Edit
              </button>
            )}
            <button className="form-button" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>

        <div className="history-section">
          <button
            className="history-toggle"
            onClick={() => setHistoryVisible(!historyVisible)}
          >
            {historyVisible ? "Hide" : "View"} Borrowing History
          </button>
          <div
            className={`history-list-wrapper ${
              historyVisible ? "visible" : "hidden"
            }`}
          >
            <ul className="history-list-updated">
              {borrowingHistory.length > 0 ? (
                borrowingHistory.map((item, index) => (
                  <li key={index} className="history-card">
  <div className="icon-wrapper">
    {item.bookImage ? (
      <img
        src={item.bookImage}
        alt="Book Cover"
        className="book-cover-image"
        onError={(e) => (e.target.style.display = "none")}
      />
    ) : (
      <FaCheckCircle className="check-icon" />
    )}
  </div>
  <div className="text-wrapper">
    <div className="title-text">{item.bookTitle || "Untitled Book"}</div>
    <div className="subtitle-text">
      Borrowed on{" "}
      {item.timestamp?.seconds
        ? new Date(item.timestamp.seconds * 1000).toLocaleDateString()
        : "Unknown"}
    </div>
  </div>
  <div className="arrow-wrapper">›</div>
</li>

                ))
              ) : (
                <li className="history-card no-history">No books borrowed yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default ProfilePage;
