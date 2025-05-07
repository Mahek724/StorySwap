import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import HeroCarousel from "../Dashboard/components/HeroCarousel";
import Navbar from "../Dashboard/components/Navbar";
import { collection, query, getDocs, limit, orderBy } from "firebase/firestore";
import BookCard from "./components/BookCard";
import "../../static/home/Home.css"; 

export default function Home() {
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const trendingSnap = await getDocs(
          query(collection(db, "books"), orderBy("createdAt", "desc"), limit(10))
        );
        const trendingData = trendingSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrendingBooks(trendingData);

        const topSnap = await getDocs(
          query(collection(db, "books"), orderBy("rentalCount", "desc"), limit(10))
        );
        const topData = topSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTopBooks(topData);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <HeroCarousel />

      <section className="home-section">
        <h2 className="section-title">🔥 Trending Books</h2>
        {loading ? (
          <p className="loading">Loading trending books...</p>
        ) : (
          <div className="book-grid">
            {trendingBooks.length > 0 ? (
              trendingBooks.map((book) => (
                <BookCard key={book.id} book={book} showSwap={true}/>
              ))
            ) : (
              <p className="no-books">No trending books available.</p>
            )}
          </div>
        )}
      </section>

      <section className="home-section">
        <h2 className="section-title">⭐ Top 10 Books</h2>
        {loading ? (
          <p className="loading">Loading top books...</p>
        ) : (
          <div className="book-grid">
            {topBooks.length > 0 ? (
              topBooks.map((book) => (
                <BookCard key={book.id} book={book} showSwap={true}/>
              ))
            ) : (
              <p className="no-books">No top books available.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
