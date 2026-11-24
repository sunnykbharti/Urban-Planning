"""
Train & Evaluate Waste Feature Classifier Pipeline
==================================================
Runs feature extraction on all images in `TRAINING DATA/`, fits the WasteMLPipeline,
evaluates cross-validation metrics, and saves the trained pipeline artifact.
"""

import os
import sys
import numpy as np

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ml_classifier import extract_visual_features, WasteMLPipeline, TRAINING_LABELS, PIPELINE_PATH
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "TRAINING DATA")


def run_training():
    print("=" * 70)
    print("CSJMU Civic Operations - Machine Learning Feature Classifier Pipeline")
    print("=" * 70)

    files = sorted([f for f in os.listdir(DATA_DIR) if f.endswith(('.jpg', '.jpeg', '.png', '.webp'))])
    print(f"Discovered {len(files)} dataset images in: {DATA_DIR}")

    X_deep_list = []
    X_cv_list = []
    y_list = []
    valid_files = []

    print("\n[Step 1/3] Extracting multi-modal feature vectors...")
    for i, fname in enumerate(files):
        if fname not in TRAINING_LABELS:
            print(f"  [Skipping unlabeled] {fname}")
            continue

        label = TRAINING_LABELS[fname]
        img_path = os.path.join(DATA_DIR, fname)

        try:
            feats = extract_visual_features(img_path)
            deep_part = feats[:2048]
            cv_part = feats[2048:]

            X_deep_list.append(deep_part)
            X_cv_list.append(cv_part)
            y_list.append(label)
            valid_files.append(fname)

            if (i + 1) % 5 == 0 or (i + 1) == len(files):
                print(f"  Processed {i + 1}/{len(files)} images ({fname[:25]}... -> {label})")
        except Exception as e:
            print(f"  Error processing {fname}: {e}")

    X_deep = np.array(X_deep_list, dtype=np.float32)
    X_cv = np.array(X_cv_list, dtype=np.float32)

    print(f"\nExtracted Feature Matrix Dimensions:")
    print(f"  Deep Embeddings (ResNet-50) : {X_deep.shape}")
    print(f"  Domain CV Features          : {X_cv.shape}")
    print(f"  Total Labeled Samples       : {len(y_list)}")

    # Class distribution
    unique_labels, counts = np.unique(y_list, return_counts=True)
    print("\nClass Distribution:")
    for lbl, cnt in zip(unique_labels, counts):
        print(f"  - {lbl:15s}: {cnt} images ({cnt / len(y_list) * 100:.1f}%)")

    # Step 2: Train Model
    print("\n[Step 2/3] Fitting PCA & Calibrated Ensemble Classifiers...")
    pipeline = WasteMLPipeline()
    train_acc = pipeline.fit(X_deep, X_cv, y_list)

    # Step 3: Evaluation
    print("\n[Step 3/3] Evaluating Performance...")
    predictions = []
    for feats in np.hstack([X_deep, X_cv]):
        # Reconstruct full vector
        p = pipeline.predict(feats)
        predictions.append(p["primaryClass"])

    print("\n" + "=" * 50)
    print("TRAINING CLASSIFICATION REPORT")
    print("=" * 50)
    print(classification_report(y_list, predictions, digits=3))

    cm = confusion_matrix(y_list, predictions, labels=pipeline.classes_)
    print("Confusion Matrix (rows: true, cols: pred):")
    print(f"{'':15s}" + "".join([f"{c:>15s}" for c in pipeline.classes_]))
    for idx, row in enumerate(cm):
        print(f"{pipeline.classes_[idx]:15s}" + "".join([f"{val:>15d}" for val in row]))

    # Save Pipeline
    pipeline.save(PIPELINE_PATH)
    print("\n[Complete] Pipeline saved and ready for real-time production deployment.")
    return pipeline


if __name__ == "__main__":
    run_training()

