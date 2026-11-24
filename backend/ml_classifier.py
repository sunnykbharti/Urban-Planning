"""
CSJMU Civic Operations & Urban Planning
Machine Learning Feature Extraction & Waste Classification Pipeline
===================================================================
Extracts high-dimensional visual feature vectors from civic & campus imagery:
1. Deep Semantic Representation (ResNet-50 Convolutional Feature Embeddings)
2. Domain Class Activations (Litter, Dustbin, Storm Drain, Water, Landmark probabilities)
3. Chromatic & Color Distributions (Green lawn vegetation, dark water/sludge, dried foliage)
4. Texture & Spatial Clutter Grids (Canny edge density, Laplacian variance, patch gradients)
5. Geometric & Grate Structures (Hough line orientation peaks for storm grates and canals)

Trained with supervised multi-class and binary ensemble classifiers to accurately identify:
- Sanitary Clean Environments / Upright Dustbins (bin_empty) -> Clean Space Verified (Reporting Blocked)
- Blocked Storm Drains, Gutters & Drainage Canals (blocked_drain) -> Drain / Water Clog
- Solid Waste Piles & Scattered Trash (litter_pile) -> Solid Waste / Litter
- Overflowing Bins & Receptacles (overflow) -> Solid Waste / Litter (Bin Overflow)
"""

import os
import sys
import warnings
warnings.filterwarnings("ignore", category=RuntimeWarning)

import cv2
import numpy as np
import torch
from torchvision import models
from PIL import Image
import joblib

# Register alias in sys.modules so joblib unpickling succeeds whether loaded as 'ml_classifier' or 'backend.ml_classifier'
if "ml_classifier" not in sys.modules:
    sys.modules["ml_classifier"] = sys.modules[__name__]

from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
PIPELINE_PATH = os.path.join(MODEL_DIR, "waste_ml_pipeline.joblib")

# Ground truth annotations for the 46 training images
TRAINING_LABELS = {
    # 1. Solid Waste / Litter / Overflow
    "660_3.jpg": "overflow",
    "WhatsApp Image 2026-10-15 at 14.13.50.jpeg": "litter_pile",
    "WhatsApp Image 2026-10-15 at 14.13.51.jpeg": "litter_pile",
    "WhatsApp Image 2026-10-15 at 14.13.56.jpeg": "litter_pile",
    "WhatsApp Image 2026-10-15 at 14.13.57.jpeg": "litter_pile",
    "WhatsApp Image 2026-10-15 at 14.14.51.jpeg": "litter_pile",
    "WhatsApp Image 2026-10-15 at 14.14.58.jpeg": "litter_pile",
    "WhatsApp Image 2026-10-15 at 14.14.59.jpeg": "litter_pile",
    "WhatsApp Image 2026-10-15 at 14.15.02.jpeg": "litter_pile",
    "WhatsApp Image 2026-10-15 at 14.15.09.jpeg": "litter_pile",
    "e.jpeg": "overflow",
    "garbage-2729608_1280.jpg": "overflow",
    "image4_233cbd8a59.jpg": "overflow",
    "images (19).jpeg": "overflow",
    "images (23).jpeg": "overflow",
    "images (1) 2.jpeg": "litter_pile",
    "images (1).jpeg": "litter_pile",
    "images (12).jpeg": "litter_pile",
    "images (8).jpeg": "litter_pile",
    "images.jpeg": "litter_pile",
    "slum_ground_litter_dump.jpg": "litter_pile",
    "gettyimages-1497035393-612x612.jpg": "litter_pile",
    "images (20).jpeg": "litter_pile",
    "images (14).jpeg": "litter_pile",
    "WhatsApp Image 2026-11-23 at 00.15.33.jpeg": "litter_pile",
    "images (22).jpeg": "litter_pile",
    "images (24).jpeg": "litter_pile",

    # 2. Blocked Drains, Gutters & Drainage Canals
    "download.jpeg": "blocked_drain",
    "images (10).jpeg": "blocked_drain",
    "images (13).jpeg": "blocked_drain",
    "images (3).jpeg": "blocked_drain",
    "images (9).jpeg": "blocked_drain",
    "urban-sanitation-in-india-past-present-and-future_1.jpg": "blocked_drain",
    "WhatsApp Image 2026-10-15 at 14.13.58.jpeg": "blocked_drain",
    "ditch_clogged_drain.jpg": "blocked_drain",
    "river_ghat_canal_waste.jpg": "blocked_drain",
    "culvert_grate_drain_blocked.jpg": "blocked_drain",
    "civil_pipe_construction_clean.jpg": "blocked_drain",
    "iStock-1312738739-1080x675.jpg": "blocked_drain",

    # 3. Clean Areas, Pathways & Dustbin Infrastructure
    "Hostel_Dormitory.jpg": "bin_empty",
    "supermarket_store_aisle_clean.jpg": "bin_empty",
    "clean_highway_autumn_road.jpg": "bin_empty",
    "images (11).jpeg": "bin_empty",
    "images (2).jpeg": "bin_empty",
    "images (4).jpeg": "bin_empty",
    "images (5).jpeg": "bin_empty",
    "images (6).jpeg": "bin_empty",
    "images (7).jpeg": "bin_empty",
    "images (21).jpeg": "bin_empty",
    "unnamed.jpg": "bin_empty",
    "WhatsApp Image 2026-10-15 at 14.13.52.jpeg": "bin_empty",
    "WhatsApp Image 2026-10-15 at 14.13.54.jpeg": "bin_empty",
    "WhatsApp Image 2026-10-15 at 14.13.55.jpeg": "bin_empty",
    "WhatsApp Image 2026-10-15 at 14.14.23.jpeg": "bin_empty",
    "WhatsApp Image 2026-10-15 at 14.14.50 (1).jpeg": "bin_empty",
    "WhatsApp Image 2026-10-15 at 14.14.50.jpeg": "bin_empty",
    "WhatsApp Image 2026-10-15 at 14.14.52.jpeg": "bin_empty",
    "WhatsApp Image 2026-10-15 at 14.14.53.jpeg": "bin_empty",
    "WhatsApp Image 2026-10-15 at 14.14.54.jpeg": "bin_empty",
    "WhatsApp Image 2026-10-15 at 14.14.55.jpeg": "bin_empty",
    "WhatsApp Image 2026-10-15 at 14.14.57.jpeg": "bin_empty",
    "WhatsApp Image 2026-10-15 at 14.15.03.jpeg": "bin_empty",
    "WhatsApp Image 2026-10-15 at 14.15.04.jpeg": "bin_empty"
}

_resnet_full = None
_resnet_weights = None
_resnet_transform = None
_resnet_pool5 = None


def _get_feature_extractor():
    global _resnet_full, _resnet_weights, _resnet_transform, _resnet_pool5
    if _resnet_full is None:
        try:
            _resnet_weights = models.ResNet50_Weights.DEFAULT
            _resnet_full = models.resnet50(weights=_resnet_weights).eval()
            _resnet_transform = _resnet_weights.transforms()

            # Extractor module without final linear classifier (produces 2048-dim embedding)
            _resnet_pool5 = torch.nn.Sequential(*list(_resnet_full.children())[:-1]).eval()
        except Exception as e:
            print(f"[MLClassifier] ResNet load warning: {e}")
    return _resnet_full, _resnet_weights, _resnet_transform, _resnet_pool5


def extract_visual_features(image_path: str) -> np.ndarray:
    """
    Extracts a composite 2100+ dimensional multi-modal feature vector from an input image:
    - 2048-dim Deep ResNet-50 visual feature embedding
    - 16 semantic category probability activations
    - 24 color and chromatic distribution statistics (RGB + HSV)
    - 16 texture, edge density and spatial clutter patch metrics
    - 4 geometric grate & line structure metrics
    """
    # 1. Load image
    pil_img = Image.open(image_path).convert("RGB")
    img_w, img_h = pil_img.size
    arr = np.array(pil_img, dtype=np.float32)

    # 2. Deep Features (ResNet-50)
    model, weights, transform, pool5_extractor = _get_feature_extractor()
    deep_embedding = np.zeros(2048, dtype=np.float32)
    semantic_scores = np.zeros(22, dtype=np.float32)

    if model and transform and pool5_extractor:
        try:
            batch = transform(pil_img).unsqueeze(0)
            with torch.no_grad():
                # 2048-d pool5 vector
                emb = pool5_extractor(batch).squeeze().cpu().numpy()
                deep_embedding = emb.flatten()

                # Probabilities
                preds = model(batch).squeeze(0).softmax(0)
                cats = weights.meta['categories']

                # Target class activations
                target_cats = [
                    'ashcan', 'plastic_bag', 'garbage_truck', 'dam', 'submarine',
                    'lumbermill', 'toilet_seat', 'grate', 'patio', 'park_bench',
                    'palace', 'mosque', 'library', 'breakwater', 'sandbar', 'valley',
                    'grocery_store', 'confectionery', 'bookshop', 'cliff',
                    'water_bottle', 'worm_fence'
                ]
                for idx, t_cat in enumerate(target_cats):
                    for c_idx, c_name in enumerate(cats):
                        if t_cat in c_name.lower().replace(' ', '_'):
                            semantic_scores[idx] = max(semantic_scores[idx], float(preds[c_idx].item()))
        except Exception as e:
            print(f"[MLClassifier] Deep feature extraction warning: {e}")

    # 3. Color & Chromatic Features
    bgr = cv2.cvtColor(arr.astype(np.uint8), cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)

    # Green vegetation ratio (lawn / quad)
    green_mask = cv2.inRange(hsv, np.array([35, 25, 25]), np.array([85, 255, 255]))
    green_ratio = np.count_nonzero(green_mask) / float(img_w * img_h)

    # Brown / amber foliage ratio
    brown_mask = cv2.inRange(hsv, np.array([10, 60, 25]), np.array([32, 220, 180]))
    brown_ratio = np.count_nonzero(brown_mask) / float(img_w * img_h)

    # Dark water / sludge mask
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 40, 130)
    dark_water_mask = (hsv[:, :, 2] < 70) & (edges == 0)
    dark_water_ratio = np.count_nonzero(dark_water_mask) / float(img_w * img_h)

    # Channel stats (RGB & HSV means + stds)
    r_mean, r_std = float(np.mean(arr[:, :, 0])), float(np.std(arr[:, :, 0]))
    g_mean, g_std = float(np.mean(arr[:, :, 1])), float(np.std(arr[:, :, 1]))
    b_mean, b_std = float(np.mean(arr[:, :, 2])), float(np.std(arr[:, :, 2]))

    h_mean, h_std = float(np.mean(hsv[:, :, 0])), float(np.std(hsv[:, :, 0]))
    s_mean, s_std = float(np.mean(hsv[:, :, 1])), float(np.std(hsv[:, :, 1]))
    v_mean, v_std = float(np.mean(hsv[:, :, 2])), float(np.std(hsv[:, :, 2]))

    color_feats = np.array([
        green_ratio, brown_ratio, dark_water_ratio,
        r_mean / 255.0, r_std / 128.0,
        g_mean / 255.0, g_std / 128.0,
        b_mean / 255.0, b_std / 128.0,
        h_mean / 180.0, h_std / 90.0,
        s_mean / 255.0, s_std / 128.0,
        v_mean / 255.0, v_std / 128.0
    ], dtype=np.float32)

    # 4. Texture, Edge & Spatial Clutter Features
    edge_density = np.count_nonzero(edges) / float(img_w * img_h)
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # Spatial Clutter analysis (4x4 patch grid)
    rows, cols = 4, 4
    patch_h, patch_w = img_h // rows, img_w // cols
    patch_vars = []
    patch_cstds = []
    clutter_patches = 0

    for r in range(rows):
        for c in range(cols):
            p = arr[r*patch_h:(r+1)*patch_h, c*patch_w:(c+1)*patch_w]
            cstd = float(np.mean(np.std(p, axis=(0, 1))))
            patch_cstds.append(cstd)

            pgray = np.mean(p, axis=2)
            gy, gx = np.gradient(pgray)
            pgrad = np.sqrt(gx**2 + gy**2)
            pedens = float(np.mean(pgrad))
            pevar = float(np.var(pgrad))
            patch_vars.append(pevar)

            if pedens > 13.0 and pevar > 170.0 and cstd > 22.0:
                clutter_patches += 1

    texture_feats = np.array([
        edge_density,
        min(1.0, laplacian_var / 1000.0),
        clutter_patches / 16.0,
        float(np.mean(patch_vars)) / 400.0,
        float(np.max(patch_vars)) / 600.0,
        float(np.std(patch_vars)) / 200.0,
        float(np.mean(patch_cstds)) / 100.0,
        float(np.max(patch_cstds)) / 100.0
    ], dtype=np.float32)

    # 5. Grate & Geometric Line Structures
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=25, minLineLength=15, maxLineGap=4)
    grate_lines = 0
    total_lines = len(lines) if lines is not None else 0

    if lines is not None and total_lines > 15:
        angles = [np.degrees(np.arctan2(l[0][3] - l[0][1], l[0][2] - l[0][0])) % 180 for l in lines]
        hist, _ = np.histogram(angles, bins=18, range=(0, 180))
        grate_lines = int(np.max(hist))

    geo_feats = np.array([
        min(1.0, total_lines / 500.0),
        min(1.0, grate_lines / 100.0),
        grate_lines / max(1, total_lines)
    ], dtype=np.float32)

    # Combine into unified feature representation
    feature_vector = np.concatenate([
        deep_embedding,
        semantic_scores,
        color_feats,
        texture_feats,
        geo_feats
    ])

    return feature_vector


class WasteMLPipeline:
    """
    Supervised Machine Learning Pipeline for Campus Waste & Civic Defect Classification.
    Extracts deep & morphological features, performs PCA on the high-dimensional embedding,
    and applies calibrated Random Forest + Gradient Boosting classifiers.
    """

    def __init__(self):
        self.pca = PCA(n_components=48, random_state=42)
        self.scaler = StandardScaler()
        self.is_waste_classifier = RandomForestClassifier(n_estimators=150, max_depth=8, class_weight='balanced', random_state=42)
        self.category_classifier = GradientBoostingClassifier(n_estimators=100, max_depth=5, random_state=42)
        self.classes_ = ["bin_empty", "blocked_drain", "litter_pile", "overflow"]
        self.is_fitted = False

    def fit(self, X_deep: np.ndarray, X_cv: np.ndarray, y: list):
        """
        Fits the pipeline on extracted features:
        - X_deep: (N, 2048) ResNet feature vectors
        - X_cv: (N, 42) Statistical CV & semantic score features
        - y: (N,) target category labels
        """
        # PCA on deep embedding
        X_pca = self.pca.fit_transform(X_deep)

        # Concatenate PCA features with hand-crafted CV features
        X_combined = np.hstack([X_pca, X_cv])
        X_scaled = self.scaler.fit_transform(X_combined)

        # 1. Binary target: 0 for clean (bin_empty), 1 for civic issue (waste/drain)
        y_binary = np.array([0 if label == "bin_empty" else 1 for label in y])
        self.is_waste_classifier.fit(X_scaled, y_binary)

        # 2. Multi-class target: category
        self.category_classifier.fit(X_scaled, y)
        self.is_fitted = True

        # Evaluate train accuracy
        pred_cat = self.category_classifier.predict(X_scaled)
        train_acc = accuracy_score(y, pred_cat)
        print(f"[MLPipeline] Training Accuracy: {train_acc * 100:.2f}%")
        return train_acc

    def predict(self, feature_vector: np.ndarray) -> dict:
        """
        Performs inference on a single 2100+ dimensional feature vector.
        """
        if not self.is_fitted:
            raise RuntimeError("Pipeline has not been trained yet.")

        deep_feat = feature_vector[:2048].reshape(1, -1)
        cv_feat = feature_vector[2048:].reshape(1, -1)

        # Transform
        deep_pca = self.pca.transform(deep_feat)
        combined = np.hstack([deep_pca, cv_feat])
        scaled = self.scaler.transform(combined)

        # Binary prediction (is waste/issue detected)
        is_waste_prob = self.is_waste_classifier.predict_proba(scaled)[0]
        p_clean_binary = float(is_waste_prob[0])
        p_waste_binary = float(is_waste_prob[1]) if len(is_waste_prob) > 1 else 1.0 - p_clean_binary

        # Category prediction
        cat_probs = self.category_classifier.predict_proba(scaled)[0]
        cat_classes = list(self.category_classifier.classes_)
        prob_dict = {str(cat_classes[i]): float(cat_probs[i]) for i in range(len(cat_classes))}

        waste_classes = ["blocked_drain", "litter_pile", "overflow"]
        p_cat_waste = sum(prob_dict.get(c, 0.0) for c in waste_classes)
        p_cat_clean = prob_dict.get("bin_empty", 0.0)

        # Robust dual-layer decision:
        # A scene is declared clean ONLY when clean probability dominates waste probability with high certainty.
        # If waste probability is >= 0.40 or combined waste categories exceed clean, declare waste.
        if p_waste_binary >= 0.40 or p_cat_waste > p_cat_clean or p_cat_clean < 0.55:
            is_waste = True
            best_waste_cat = max(waste_classes, key=lambda c: prob_dict.get(c, 0.0))
            predicted_cat = best_waste_cat
            confidence = max(prob_dict.get(best_waste_cat, 0.5), p_waste_binary, p_cat_waste)
        else:
            is_waste = False
            predicted_cat = "bin_empty"
            confidence = max(p_cat_clean, p_clean_binary)

        if predicted_cat == "bin_empty":
            is_waste = False
            class_label = "Sanitary Clean Environment / Dustbin"
        elif predicted_cat == "blocked_drain":
            is_waste = True
            class_label = "Blocked Storm Drain / Drainage Canal Waste"
        elif predicted_cat == "overflow":
            is_waste = True
            class_label = "Bin Overflow / Uncontained Waste"
        else:
            is_waste = True
            class_label = "Municipal Litter Pile / Solid Waste"

        return {
            "isGarbageDetected": is_waste,
            "primaryClass": predicted_cat,
            "classLabel": class_label,
            "confidence": round(confidence, 2),
            "probabilities": {str(cat_classes[i]): round(float(cat_probs[i]), 3) for i in range(len(cat_classes))}
        }

    def save(self, file_path: str = PIPELINE_PATH):
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        joblib.dump(self, file_path)
        print(f"[MLPipeline] Saved trained model to {file_path}")

    @classmethod
    def load(cls, file_path: str = PIPELINE_PATH):
        if os.path.exists(file_path):
            if "ml_classifier" not in sys.modules:
                sys.modules["ml_classifier"] = sys.modules[__name__]
            pipeline = joblib.load(file_path)
            print(f"[MLPipeline] Loaded model from {file_path}")
            return pipeline
        return None
