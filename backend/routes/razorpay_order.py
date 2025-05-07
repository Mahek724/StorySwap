from flask import Blueprint, request, jsonify
import razorpay
from dotenv import load_dotenv
import os

load_dotenv()

razorpay_order = Blueprint("razorpay_order", __name__)

razorpay_client = razorpay.Client(
    auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET"))
)

@razorpay_order.route("/create-order", methods=["POST"])
def create_order():
    try:
        data = request.json
        amount = data.get("amount")
        currency = "INR"
        receipt = data.get("receipt", "receipt#1")

        order_data = {
            "amount": int(amount) * 100,  
            "currency": currency,
            "receipt": receipt,
            "payment_capture": 1,
        }

        order = razorpay_client.order.create(data=order_data)
        return jsonify({"order_id": order["id"], "amount": order["amount"], "currency": order["currency"]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
