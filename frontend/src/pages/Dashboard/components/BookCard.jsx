import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BookCard = ({ book,  showSwap = false}) => {
  const { id, title, author, condition, price, coverBase64} = book;
  const location = useLocation();
  const navigate = useNavigate();

  const handleRequestSwap = () => {
    navigate("/checkout", { state: { book } });
  };

  return (
    <div className="book-card">
      <img src={coverBase64 || "/static/images/default-book.jpg"} alt={title} />
      <div className="book-card-content">
        <h3>{title}</h3>
        <p>{author}</p>
        <span className="condition">{condition}</span>
        {price && <p className="price">₹{price}/month</p>}
        {showSwap && (
        <button onClick={handleRequestSwap}>Request Swap</button>
        )}

      </div>
    </div>
  );
};

export default BookCard;
