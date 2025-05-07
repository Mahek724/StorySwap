// src/pages/Dashboard/SearchResults.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import BookCard from "./components/BookCard";
import "../../static/home/Home.css";
import { useSearch } from "../../context/SearchContext";
import Navbar from "./components/Navbar";

export default function SearchResults() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm, setSearchTerm } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(location.search);
        const searchQuery = queryParams.get("q") || searchTerm || "";
        const booksSnap = await getDocs(collection(db, "books"));
        const booksData = booksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const filteredBooks = booksData.filter((book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setBooks(filteredBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [location.search, searchTerm]);

  const handleBack = () => {
    setSearchTerm("");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <section className="home-section">
        <h2 className="section-title">Search Results for "{searchTerm || location.search.split('q=')[1]}"</h2>
        {loading ? (
          <p className="loading">Loading search results...</p>
        ) : books.length > 0 ? (
          <div className="book-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div>
            <p className="no-books">No books found matching "{searchTerm || location.search.split('q=')[1]}".</p>
            <button onClick={handleBack} className="back-button">Back to Dashboard</button>
          </div>
        )}
      </section>
    </div>
  );
}

