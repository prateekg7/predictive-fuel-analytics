import pandas as pd
import numpy as np

def compare_files():
    try:
        ans = pd.read_csv("ans.csv")
        final = pd.read_csv("final.csv")
    except Exception as e:
        print(f"Error reading files: {e}")
        return

    # Check if columns match
    if list(ans.columns) != list(final.columns):
        print("❌ Column mismatch!")
        print(f"ans.csv cols: {list(ans.columns)}")
        print(f"final.csv cols: {list(final.columns)}")
        return

    # Helper to check numeric columns only (excluding ID)
    cols = [c for c in ans.columns if c != "ID"]
    
    # Calculate differences
    diffs = np.abs(ans[cols] - final[cols])
    mae = diffs.mean()
    mean_mae = mae.mean()
    
    # Calculate correlation per target
    correlations = {}
    for col in cols:
        correlations[col] = ans[col].corr(final[col])
    
    avg_corr = np.mean(list(correlations.values()))

    print(f"📊 Comparison Summary:")
    print(f" - Identical: {ans.equals(final)}")
    print(f" - Average Mean Absolute Error (MAE): {mean_mae:.5f}")
    print(f" - Average Correlation: {avg_corr:.5f}")
    
    print("\n🔍 Detailed Metrics per Column:")
    for col in cols:
        print(f"   {col}: MAE={mae[col]:.4f}, Corr={correlations[col]:.4f}")

if __name__ == "__main__":
    compare_files()
