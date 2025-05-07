import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { FaComments } from "react-icons/fa";
import ChatBox from "../../components/Chat/ChatBox.jsx";
import "../../pages/PaymentPages/CheckoutPage.css";
import { toast } from "react-hot-toast";


const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const book = location.state?.book;

  const [showChat, setShowChat] = useState(false);
  const [lenderName, setLenderName] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchLenderName = async () => {
      if (!book?.ownerId) return;
      try {
        const userRef = doc(db, "users", book.ownerId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setLenderName(userSnap.data().username);
        } else {
          setLenderName("Unknown");
        }
      } catch (error) {
        console.error("Error fetching lender name:", error);
        setLenderName("Error");
      }
    };
    fetchLenderName();
  }, [book]);

  const bookPrice = useMemo(() => Number(book?.price || 0), [book]);
  const deliveryFee = 40;
  const tax = useMemo(() => 0.18 * bookPrice, [bookPrice]);
  const total = useMemo(
    () => bookPrice + deliveryFee + tax - discount,
    [bookPrice, deliveryFee, tax, discount]
  );

  const handleInputChange = (e) => {
    setDeliveryInfo({ ...deliveryInfo, [e.target.name]: e.target.value });
  };

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "BOOKLOVER10") {
      setDiscount(0.1 * bookPrice);
    } else {
      alert("Invalid promo code");
      setDiscount(0);
    }
  };

  const handleRazorpayPayment = async () => {
    const response = await fetch("http://localhost:5000/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: total,
        receipt: `receipt_${Date.now()}`,
      }),
    });
  
    const data = await response.json();
  
    const options = {
      key: "rzp_test_SQZeyUmNlaLYDa",
      amount: data.amount,
      currency: data.currency,
      name: "StorySwap",
      description: "Book Rental Payment",
      order_id: data.order_id,
      handler: async function (response) {
        const paymentData = {
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          bookId: book.id,
          amount: total,
          lenderId: book.ownerId,
          borrowerId: currentUser?.uid,
          bookTitle: book.title,
          bookImage: book.image || book.coverBase64,
          deliveryInfo: deliveryInfo,
          timestamp: new Date().toISOString(),
        };
  
        try {
          
          const res = await fetch("http://localhost:5000/api/save-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentData),
          });
  
          const result = await res.json();
  
          if (result.success) {
            toast.success("✅ Payment successful!");
  
            await addDoc(collection(db, "borrowings"), {
              bookId: book.id,
              borrowerId: currentUser?.uid,
              lenderId: book.ownerId,
              bookTitle: book.title,
              bookImage: book.image, 
              rentalDuration: book.duration || 30,
              deliveryDetails: deliveryInfo,
              timestamp: new Date(),
            });
  
            toast.success("📚 Borrowing recorded!");
            navigate("/profile");
          } else {
            toast.error("⚠️ Payment saved failed: " + result.message);
          }
        } catch (err) {
          console.error("❌ Error saving payment or borrowing:", err);
          toast.error("❌ Error during payment or borrowing storage.");
        }
      },
      prefill: {
        name: deliveryInfo.name,
        email: deliveryInfo.email,
        contact: deliveryInfo.phone,
      },
      theme: { color: "#4f46e5" },
    };
  
    const rzp = new window.Razorpay(options);
    rzp.open();
    navigate("/");
  };
  

  if (!book) {
    return (
      <div className="checkout-container">
        <h2 className="error-heading">Book information not available.</h2>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="main-checkout">
        <h2 className="section-title">Checkout</h2>

        <div className="section">
          <h3 className="section-subtitle">Book & Rental Details</h3>
          <div className="detail-item">
            <span>Title:</span> <strong>{book.title}</strong>
          </div>
          <div className="detail-item">
            <span>Author:</span> <strong>{book.author}</strong>
          </div>
          <div className="detail-item">
            <span>Rental Duration:</span>{" "}
            <strong>{book.duration || 30} days</strong>
          </div>
          <div className="detail-item">
            <span>Price:</span> <strong>₹{bookPrice}</strong>
          </div>
          <div className="detail-item">
            <span>Lender:</span> <strong>{lenderName}</strong>
          </div>
        </div>

        <div className="section">
          <h3 className="section-subtitle">Delivery Information</h3>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={deliveryInfo.name}
            onChange={handleInputChange}
            className="input-field"
          />
          <input
            type="text"
            name="address"
            placeholder="Delivery Address"
            value={deliveryInfo.address}
            onChange={handleInputChange}
            className="input-field"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={deliveryInfo.phone}
            onChange={handleInputChange}
            className="input-field"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={deliveryInfo.email}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>

        <div className="section">
          <h3 className="section-subtitle">Payment Method</h3>
          <div className="payment-options">
            <label className="payment-label">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Credit/Debit Card</span>
            </label>
            <label className="payment-label">
              <input
                type="radio"
                value="upi"
                checked={paymentMethod === "upi"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>UPI / Wallet</span>
            </label>
          </div>
          {paymentMethod === "upi" && (
            <div className="qr-code">
              <img src="/QR.png" alt="QR Code" />
              <p>Scan QR to Pay</p>
            </div>
          )}
        </div>

        <div className="section">
          <h3 className="section-subtitle">Promo Code</h3>
          <div className="promo-container">
            <input
              type="text"
              value={promoCode}
              placeholder="Enter promo code"
              onChange={(e) => setPromoCode(e.target.value)}
              className="input-field promo-input"
            />
            <button className="apply-btn" onClick={applyPromo}>
              Apply
            </button>
          </div>
          {discount > 0 && (
            <p className="discount">Discount Applied: ₹{discount.toFixed(2)}</p>
          )}
        </div>

        <div className="buttons">
          <button className="primary-btn" onClick={handleRazorpayPayment}>
            Confirm & Pay
          </button>
          <button
            className="secondary-btn"
            onClick={() => navigate("/dashboard")}
          >
            Cancel / Back
          </button>
          <button className="chat-btn" onClick={() => setShowChat(!showChat)}>
            <FaComments /> Chat with Lender
          </button>
        </div>
      </div>

      <div className="right-panel">
        <div className="order-summary">
          <h3 className="section-subtitle">Order Summary</h3>
          <div className="summary-item">
            <span>Book:</span> <strong>{book.title}</strong>
          </div>
          <div className="summary-item">
            <span>Rental Price:</span> <strong>₹{bookPrice}</strong>
          </div>
          <div className="summary-item">
            <span>Tax (18%):</span> <strong>₹{tax.toFixed(2)}</strong>
          </div>
          <div className="summary-item">
            <span>Delivery Fee:</span> <strong>₹{deliveryFee}</strong>
          </div>
          {discount > 0 && (
            <div className="summary-item discount">
              <span>Discount:</span> <strong>-₹{discount.toFixed(2)}</strong>
            </div>
          )}
          <hr />
          <div className="summary-item total">
            <span>Total:</span> <strong>₹{total.toFixed(2)}</strong>
          </div>
        </div>

        {showChat && (
          <div className="chatbox-wrapper">
            <ChatBox bookId={book.id} lenderId={book.ownerId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
