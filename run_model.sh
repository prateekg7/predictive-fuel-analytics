#!/bin/bash
# Prevent OpenMP / TensorFlow conflict on macOS
export KMP_DUPLICATE_LIB_OK=True
export OMP_NUM_THREADS=1
export MKL_NUM_THREADS=1
export VECLIB_MAXIMUM_THREADS=1
export NUMEXPR_NUM_THREADS=1
export TF_ENABLE_ONEDNN_OPTS=0

# Limit TensorFlow threads
export TF_NUM_INTEROP_THREADS=1
export TF_NUM_INTRAOP_THREADS=1

echo "Running model.py with single-threaded constraints..."
python3 model.py
