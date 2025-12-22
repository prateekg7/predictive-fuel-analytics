import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load the dataset
df = pd.read_csv("train.csv")  # Replace with your actual path if needed

# Identify column groups
blend_cols = [col for col in df.columns if "fraction" in col]
component_cols = [col for col in df.columns if "Property" in col and "Blend" not in col]
target_cols = [col for col in df.columns if "BlendProperty" in col]

# Combine all features and target columns
X = df[blend_cols + component_cols]
y = df[target_cols]

# Concatenate features and targets for correlation
corr_matrix = pd.concat([X, y], axis=1).corr()

# Extract correlation between features (rows) and targets (columns)
target_corr = corr_matrix.loc[X.columns, y.columns]

# Plotting the heatmap
plt.figure(figsize=(16, 10))
sns.heatmap(target_corr, cmap="coolwarm", center=0, annot=False, linewidths=0.5, cbar_kws={"label": "Correlation"})
plt.title("Feature-Target Correlation Heatmap", fontsize=16)
plt.xticks(rotation=45, ha='right')
plt.yticks(fontsize=9)
plt.tight_layout()
plt.show()
