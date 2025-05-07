import { useEffect, useState } from 'react'; 
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import BookCard from './components/BookCard';
import Navbar from './components/Navbar';
import '../../static/home/CategoryBook.css';

const genreMap = {
  fiction: 'Fiction',
  fantasy: 'Fantasy',
  horror: 'Horror',
  romance: 'Romance',
  'sci-fi': 'Sci-Fi',
  mystery: 'Mystery',
  biography: 'Biography',
  'non-fiction': 'Non-Fiction'
};

export default function CategoryBooks() {
  const { category } = useParams();
  const formattedGenre = genreMap[category.toLowerCase()] || category;
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const q = query(collection(db, 'books'), where('genre', '==', formattedGenre));
        const snapshot = await getDocs(q);
        const fetchedBooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBooks(fetchedBooks);
      } catch (error) {
        console.error('Error fetching category books:', error);
      }
    };

    fetchBooks();
  }, [formattedGenre]);

  return (
    <>
      <Navbar />
      <div className="category-books">
        <h2>{formattedGenre} Books</h2>
        <div className="books-grid-container">
          {books.length > 0 ? (
            books.map(book => (
              <BookCard key={book.id} book={book} showSwap={true} />
            ))
          ) : (
            <p>No books found in this category.</p>
          )}
        </div>
      </div>
    </>
  );
}
