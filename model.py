"""
model.py
--------
Trains a sentiment analysis model on Amazon-style product reviews.

Pipeline:
1. Load dataset (CSV with columns: review, sentiment)
2. Preprocess text: lowercase, remove punctuation, tokenize, remove stopwords, lemmatize
3. Convert to TF-IDF features
4. Train Logistic Regression and Multinomial Naive Bayes
5. Evaluate (accuracy, precision, recall, F1, confusion matrix)
6. Save the best model + vectorizer to saved_model.pkl
"""

import os
import re
import pickle
import string

import pandas as pd
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)


# -----------------------------
# 1. Make sure NLTK data is available
# -----------------------------
for resource in ["stopwords", "punkt", "punkt_tab", "wordnet", "omw-1.4"]:
    try:
        nltk.data.find(resource)
    except LookupError:
        nltk.download(resource, quiet=True)

STOPWORDS = set(stopwords.words("english"))
LEMMATIZER = WordNetLemmatizer()


# -----------------------------
# 2. Text preprocessing
# -----------------------------
def preprocess(text: str) -> str:
    """Lowercase, strip punctuation/digits, tokenize, remove stopwords, lemmatize."""
    if not isinstance(text, str):
        return ""

    text = text.lower()
    text = re.sub(r"<.*?>", " ", text)            # remove HTML tags
    text = re.sub(r"http\S+|www\.\S+", " ", text) # remove URLs
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\d+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    tokens = word_tokenize(text)
    tokens = [LEMMATIZER.lemmatize(t) for t in tokens if t not in STOPWORDS and len(t) > 1]
    return " ".join(tokens)


# -----------------------------
# 3. Train + evaluate
# -----------------------------
def evaluate(name, model, X_test, y_test):
    preds = model.predict(X_test)
    print(f"\n=== {name} ===")
    print(f"Accuracy : {accuracy_score(y_test, preds):.4f}")
    print(f"Precision: {precision_score(y_test, preds, pos_label='positive'):.4f}")
    print(f"Recall   : {recall_score(y_test, preds, pos_label='positive'):.4f}")
    print(f"F1 Score : {f1_score(y_test, preds, pos_label='positive'):.4f}")
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, preds, labels=['positive', 'negative']))
    print("Classification Report:")
    print(classification_report(y_test, preds))
    return accuracy_score(y_test, preds)


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(here, "amazon_reviews.csv")

    print(f"Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)

    if not {"review", "sentiment"}.issubset(df.columns):
        raise ValueError("CSV must contain 'review' and 'sentiment' columns")

    df = df.dropna(subset=["review", "sentiment"])
    df["sentiment"] = df["sentiment"].str.lower().str.strip()
    df = df[df["sentiment"].isin(["positive", "negative"])]

    print(f"Total samples: {len(df)}")
    print(df["sentiment"].value_counts())

    print("\nPreprocessing text...")
    df["clean"] = df["review"].apply(preprocess)

    X_train, X_test, y_train, y_test = train_test_split(
        df["clean"], df["sentiment"], test_size=0.2, random_state=42, stratify=df["sentiment"]
    )

    print("\nFitting TF-IDF vectorizer...")
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    print("\nTraining Logistic Regression...")
    lr = LogisticRegression(max_iter=1000)
    lr.fit(X_train_vec, y_train)
    lr_acc = evaluate("Logistic Regression", lr, X_test_vec, y_test)

    print("\nTraining Multinomial Naive Bayes...")
    nb = MultinomialNB()
    nb.fit(X_train_vec, y_train)
    nb_acc = evaluate("Naive Bayes", nb, X_test_vec, y_test)

    best_model, best_name = (lr, "Logistic Regression") if lr_acc >= nb_acc else (nb, "Naive Bayes")
    print(f"\nBest model: {best_name}")

    out_path = os.path.join(here, "saved_model.pkl")
    with open(out_path, "wb") as f:
        pickle.dump({"model": best_model, "vectorizer": vectorizer, "name": best_name}, f)
    print(f"Saved trained model to: {out_path}")


if __name__ == "__main__":
    main()
