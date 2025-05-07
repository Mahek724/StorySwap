import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebase';
import Welcome from './pages/Welcome';
import Signup from './pages/Auth/Signup';
import Login from './pages/Auth/Login';
import Home from './pages/Dashboard/Home';
import MyBooks from './pages/Dashboard/MyBooks';
import ProfilePage from "./components/Profile/ProfilePage";
import CheckoutPage from "./components/Payment/CheckoutPage";
import CategoryBooks from './pages/Dashboard/CategoryBooks';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Home /> : <Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={user ? <Home /> : <Navigate to="/" />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/welcome" />} />
        <Route path="/my-books" element={user ? <MyBooks /> : <Navigate to="/" />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/category/:category" element={<CategoryBooks />} />



      </Routes>
    </Router>
  );
}

export default App;