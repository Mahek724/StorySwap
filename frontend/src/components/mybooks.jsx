import { useState, useEffect } from 'react';
import BookCard from '.././components/BookCard';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import BookUploadForm from './components/BookUploadForm';
import '../../static/home/my-books.css';
import Navbar from './components/Navbar';

export default function MyBooks() {
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchBooks = async () => {
    if (auth.currentUser) {
      const q = query(collection(db, 'books'), where('ownerId', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddBook = async (bookData) => {
    try {
      await addDoc(collection(db, 'books'), {
        title: bookData.title,
        author: bookData.author,
        condition: bookData.condition,
        genre: bookData.genre,
        price: bookData.price,
        coverBase64: bookData.coverBase64,
        ownerId: auth.currentUser.uid,
        createdAt: new Date(),
      });

      fetchBooks();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  return (
    <div className="my-books-page">
      <Navbar />
      <div className="my-books-header">
        <h1>My Books</h1>
        <button onClick={() => setShowForm(true)} className="add-book-button">
          + Add Book
        </button>
      </div>

      {showForm && (
        <BookUploadForm onClose={() => setShowForm(false)} onAddBook={handleAddBook} />
      )}

      <div className="books-grid-container">
        {books.length > 0 ? (
          books.map(book => (
            <BookCard key={book.id} book={book} />
          ))
        ) : (
          <div className="empty-state">
            <p>You haven't listed any books yet</p>
            <button onClick={() => setShowForm(true)}>List Your First Book</button>
          </div>
        )}
      </div>
    </div>
  );
}

