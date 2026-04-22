"""
app.py
------
Flask web app that loads the trained sentiment model and serves a simple
web page where users can paste a review and get a Positive / Negative result.
"""

import os
import pickle
from flask import Flask, render_template, request, jsonify

from model import preprocess  # reuse the same preprocessing as training

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "saved_model.pkl")

app = Flask(__name__)

# Load the trained model + vectorizer once at startup
with open(MODEL_PATH, "rb") as f:
    bundle = pickle.load(f)

model = bundle["model"]
vectorizer = bundle["vectorizer"]
model_name = bundle.get("name", "Model")


def predict_sentiment(text: str):
    cleaned = preprocess(text)
    vec = vectorizer.transform([cleaned])
    label = model.predict(vec)[0]

    confidence = None
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(vec)[0]
        classes = list(model.classes_)
        confidence = float(proba[classes.index(label)])

    return label, confidence


@app.route("/", methods=["GET", "POST"])
def index():
    prediction = None
    confidence = None
    review = ""

    if request.method == "POST":
        review = request.form.get("review", "").strip()
        if review:
            prediction, confidence = predict_sentiment(review)

    return render_template(
        "index.html",
        prediction=prediction,
        confidence=confidence,
        review=review,
        model_name=model_name,
    )


@app.route("/api/predict", methods=["POST"])
def api_predict():
    data = request.get_json(silent=True) or {}
    review = (data.get("review") or "").strip()
    if not review:
        return jsonify({"error": "review is required"}), 400

    label, confidence = predict_sentiment(review)
    return jsonify({"sentiment": label, "confidence": confidence})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
