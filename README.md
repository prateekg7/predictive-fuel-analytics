# Shell.ai Hackathon 2025: Fuel Blends

This repository contains the solution for the Shell.ai Hackathon 2025, focusing on predictive modeling for fuel blending properties.

Website : [Predictive Fuel Blend Analysis](https://predictive-fuel-analytics.vercel.app/)
## Project Structure

- model.py: The main script containing the Stacking Regressor model (LightGBM, CatBoost, XGBoost with RidgeCV meta-learner).
- corr_heatmap.py: Utility script for generating correlation heatmaps of the data/predictions.
- final.csv: The generated output file matches the target blend properties with high accuracy.

## Setup & Usage

1. Ensure you have the required Python libraries installed (pandas, numpy, sklearn, lightgbm, catboost, xgboost).
2. Place `train.csv` and `test.csv` in the root directory.
3. Run the model:
   
   python model.py

   This will process the data, train the stacked models, and generate `final.csv`.

## Methodology

The solution employs a stacking ensemble approach:
1. Feature Engineering: Weighted averages of component properties, outlier removal, and quantile transformation.
2. Base Models: LightGBM, CatBoost, and XGBoost regressing on 10 target blend properties.
3. Meta Learner: RidgeCV (Ridge Regression with cross-validation) to combine base model predictions.
