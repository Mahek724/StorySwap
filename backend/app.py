from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify, send_from_directory
import firebase_admin
from firebase_admin import credentials, firestore
import os
from flask_cors import CORS
from routes.razorpay_order import razorpay_order

cred = credentials.Certificate("serviceAccount.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
print("🔥 Firebase connection successful!")

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')
print("🔑 Flask secret key loaded:", bool(app.config['SECRET_KEY']))


app.register_blueprint(razorpay_order, url_prefix="/api/payment")


@app.route('/api/save-payment', methods=['POST'])
def save_payment():
    data = request.json

    try:
        
        db.collection("payments").add({
            "paymentId": data.get("paymentId"),
            "orderId": data.get("orderId"),
            "signature": data.get("signature"),
            "bookId": data.get("bookId"),
            "amount": data.get("amount"),
            "lenderId": data.get("lenderId"),
            "borrowerId": data.get("borrowerId"),
            "timestamp": firestore.SERVER_TIMESTAMP
        })

        
        db.collection("borrowings").add({
            "bookId": data.get("bookId"),
            "bookTitle": data.get("bookTitle"),
             "bookImage": data.get("bookImage"), 
            "borrowerId": data.get("borrowerId"),
            "lenderId": data.get("lenderId"),
            "deliveryInfo": data.get("deliveryInfo"),
            "paymentId": data.get("paymentId"),
            "amount": data.get("amount"),
            "timestamp": firestore.SERVER_TIMESTAMP
        })


        return jsonify({"success": True, "message": "Payment and borrow info stored successfully"}), 200

    except Exception as e:
        print("❌ Error storing payment:", str(e))
        return jsonify({"success": False, "message": str(e)}), 500


# Serve React frontend (for production)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    return send_from_directory('../frontend/build', 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
