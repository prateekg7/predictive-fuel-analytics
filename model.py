import os
import warnings
import pandas as pd
import numpy as np
from sklearn.model_selection import KFold
from sklearn.multioutput import MultiOutputRegressor
from sklearn.linear_model import RidgeCV
from sklearn.preprocessing import QuantileTransformer
from lightgbm import LGBMRegressor
from catboost import CatBoostRegressor
from xgboost import XGBRegressor

# avoiding lock hangs on mac
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
os.environ['OMP_NUM_THREADS'] = '1'

warnings.filterwarnings("ignore")

# load up the datasets
train = pd.read_csv("train.csv")
test = pd.read_csv("test.csv")

# grab column names
frac_cols = [c for c in train.columns if "fraction" in c]
prop_cols = [c for c in train.columns if "Property" in c and "Blend" not in c]
targets = [c for c in train.columns if "BlendProperty" in c]

# weighted averages for properties
for i in range(1, 11):
    col = f"WA_Property{i}"
    # sum product of fractions and atomic properties
    train[col] = sum(train[f"Component{c}_fraction"] * train[f"Component{c}_Property{i}"] for c in range(1, 6))
    test[col] = sum(test[f"Component{c}_fraction"] * test[f"Component{c}_Property{i}"] for c in range(1, 6))

wa_cols = [f"WA_Property{i}" for i in range(1, 11)]

# cleanup columns
features = list(set(frac_cols + prop_cols + wa_cols))

X = train[features].copy()
y = train[targets].copy()
X_test = test[features].copy()

# cleaning up outliers in the target
for t in targets:
    q25 = y[t].quantile(0.25)
    q75 = y[t].quantile(0.75)
    iqr = q75 - q25
    keep = (y[t] >= q25 - 1.5 * iqr) & (y[t] <= q75 + 1.5 * iqr)
    X = X[keep]
    y = y[keep]

# normalize targets before training
qt = QuantileTransformer(n_quantiles=100, output_distribution='normal', random_state=42)
X_scaled = pd.DataFrame(qt.fit_transform(X), columns=X.columns)
X_test_scaled = pd.DataFrame(qt.transform(X_test), columns=X.columns)

# defining the stack
models = {
    "lgbm": MultiOutputRegressor(LGBMRegressor(n_estimators=400, learning_rate=0.03, max_depth=7, subsample=0.9, colsample_bytree=0.9, random_state=42)),
    "catboost": MultiOutputRegressor(CatBoostRegressor(verbose=0, iterations=400, learning_rate=0.03, depth=7, random_state=42)),
    "xgb": MultiOutputRegressor(XGBRegressor(n_estimators=400, learning_rate=0.03, max_depth=7, subsample=0.9, colsample_bytree=0.9, verbosity=0, random_state=42))
}

# stacking setup
kf = KFold(n_splits=5, shuffle=True, random_state=42)
meta_X = np.zeros((len(X_scaled), len(targets) * len(models)))
test_preds_folds = np.zeros((5, len(X_test_scaled), len(targets) * len(models)))

print("training base models...")

for fold_idx, (train_idx, val_idx) in enumerate(kf.split(X_scaled)):
    x_t, x_v = X_scaled.iloc[train_idx], X_scaled.iloc[val_idx]
    y_t, y_v = y.iloc[train_idx], y.iloc[val_idx]

    for i, (name, model) in enumerate(models.items()):
        model.fit(x_t, y_t)
        
        # predictions for meta learner
        val_pred = model.predict(x_v)
        test_pred = model.predict(X_test_scaled)

        start = i * len(targets)
        end = start + len(targets)

        meta_X[val_idx, start:end] = val_pred
        test_preds_folds[fold_idx, :, start:end] = test_pred

# average test predictions across folds
meta_X_test = np.mean(test_preds_folds, axis=0)

print("training meta learner...")
# ridge seems to work best as meta learner here
meta = MultiOutputRegressor(RidgeCV(alphas=np.logspace(-2, 2, 10), cv=5))
meta.fit(meta_X, y)
final_preds = meta.predict(meta_X_test)

# save it
sub = pd.DataFrame(final_preds, columns=targets)
sub.insert(0, "ID", test["ID"])
sub.to_csv("final.csv", index=False)
print("done! saved to final.csv")