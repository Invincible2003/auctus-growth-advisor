import pandas as pd
import numpy as np
import json
from typing import Tuple, List, Dict, Any

class CleaningService:
    @staticmethod
    def clean_sales_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[Dict[str, Any]]]:
        """
        Cleans sales dataframe automatically.
        Detects and resolves:
        1. Duplicate records
        2. Missing values (amount, quantity, category, product_name)
        3. Statistical outliers in revenue/amount
        
        Returns:
            Tuple of (cleaned_dataframe, logs_of_changes)
        """
        logs = []
        df_clean = df.copy()
        
        # 1. Handle Duplicates
        initial_rows = len(df_clean)
        df_clean = df_clean.drop_duplicates()
        removed_duplicates = initial_rows - len(df_clean)
        if removed_duplicates > 0:
            logs.append({
                "issue": "Duplicate Records",
                "action": "Removed duplicate rows",
                "count": removed_duplicates
            })

        # 2. Validate/Format Dates
        # Standardize date column names
        date_candidates = ['orderdate', 'order_date', 'transactiondate', 'transaction_date', 'salesdate', 'sales_date', 'sale_date']
        for cand in date_candidates:
            if cand in df_clean.columns:
                # If there's already a 'date' column but it is homogeneous (all values same) and the candidate has multiple distinct dates, prioritize candidate
                if 'date' in df_clean.columns:
                    if df_clean['date'].nunique() <= 1 and df_clean[cand].nunique() > 1:
                        df_clean['date'] = df_clean[cand]
                        logs.append({
                            "issue": "Homogeneous Date Column",
                            "action": f"Replaced 'date' with historic transaction dates from '{cand}'",
                            "count": len(df_clean)
                        })
                        break
                else:
                    df_clean['date'] = df_clean[cand]
                    logs.append({
                        "issue": "Mapped Date Column",
                        "action": f"Mapped '{cand}' to standard 'date' column",
                        "count": len(df_clean)
                    })
                    break

        if 'date' in df_clean.columns:
            # Coerce dates, drop unparseable dates
            original_date_count = df_clean['date'].isna().sum()
            df_clean['date'] = pd.to_datetime(df_clean['date'], format='mixed', errors='coerce')
            unparseable = df_clean['date'].isna().sum() - original_date_count
            if unparseable > 0:
                df_clean = df_clean.dropna(subset=['date'])
                logs.append({
                    "issue": "Invalid Dates",
                    "action": "Removed rows with unparseable dates",
                    "count": int(unparseable)
                })
        else:
            # If no date column, create current date
            df_clean['date'] = pd.Timestamp.now().normalize()
            logs.append({
                "issue": "Missing Date Column",
                "action": "Generated default current date column",
                "count": len(df_clean)
            })

        # 3. Handle Missing Values
        # Product Name
        if 'product_name' not in df_clean.columns:
            df_clean['product_name'] = 'General Item'
            logs.append({
                "issue": "Missing Product Name Column",
                "action": "Created default product name column",
                "count": len(df_clean)
            })
        else:
            missing_products = df_clean['product_name'].isna().sum()
            if missing_products > 0:
                df_clean['product_name'] = df_clean['product_name'].fillna('Unknown Product')
                logs.append({
                    "issue": "Missing Product Names",
                    "action": "Replaced missing product names with 'Unknown Product'",
                    "count": int(missing_products)
                })

        # Category
        if 'category' not in df_clean.columns:
            df_clean['category'] = 'Uncategorized'
        else:
            missing_cats = df_clean['category'].isna().sum()
            if missing_cats > 0:
                df_clean['category'] = df_clean['category'].fillna('Miscellaneous')
                logs.append({
                    "issue": "Missing Categories",
                    "action": "Replaced missing categories with 'Miscellaneous'",
                    "count": int(missing_cats)
                })

        # Quantity
        if 'quantity' not in df_clean.columns:
            df_clean['quantity'] = 1
        else:
            missing_qty = df_clean['quantity'].isna().sum()
            # Convert to numeric, replace NaNs or zeros with 1
            df_clean['quantity'] = pd.to_numeric(df_clean['quantity'], errors='coerce').fillna(1)
            df_clean.loc[df_clean['quantity'] <= 0, 'quantity'] = 1
            df_clean['quantity'] = df_clean['quantity'].astype(int)
            total_qty_fixes = missing_qty + (df['quantity'] <= 0).sum() if 'quantity' in df.columns else 0
            if total_qty_fixes > 0:
                logs.append({
                    "issue": "Invalid Quantities",
                    "action": "Replaced negative, missing, or zero quantities with 1",
                    "count": int(total_qty_fixes)
                })

        # Amount/Price
        if 'amount' not in df_clean.columns:
            # Try to calculate from quantity if unit price exists, else default to 10.0
            df_clean['amount'] = 10.0
            logs.append({
                "issue": "Missing Sales Amount Column",
                "action": "Created default sales amount column ($10.0 per record)",
                "count": len(df_clean)
            })
        else:
            df_clean['amount'] = pd.to_numeric(df_clean['amount'], errors='coerce')
            missing_amount = df_clean['amount'].isna().sum()
            if missing_amount > 0:
                median_amount = float(df_clean['amount'].median())
                if pd.isna(median_amount):
                    median_amount = 25.0
                df_clean['amount'] = df_clean['amount'].fillna(median_amount)
                logs.append({
                    "issue": "Missing Sales Amounts",
                    "column": "amount",
                    "action": f"Replaced missing sales amounts with median value (${median_amount:.2f})",
                    "count": int(missing_amount)
                })

        # 4. Outlier Detection (using 3 standard deviations in Amount)
        if len(df_clean) > 3:
            mean = df_clean['amount'].mean()
            std = df_clean['amount'].std()
            if std > 0:
                upper_limit = mean + 3 * std
                outliers_mask = df_clean['amount'] > upper_limit
                outliers_count = outliers_mask.sum()
                if outliers_count > 0:
                    # Cap outliers at the 3rd standard deviation limit
                    df_clean.loc[outliers_mask, 'amount'] = upper_limit
                    logs.append({
                        "issue": "Extreme Outliers Detected",
                        "column": "amount",
                        "action": f"Capped extreme outliers (amounts exceeding 3σ: ${upper_limit:.2f})",
                        "count": int(outliers_count)
                    })

        return df_clean, logs

    @staticmethod
    def clean_reviews_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[Dict[str, Any]]]:
        """Cleans review/feedback dataframe."""
        logs = []
        df_clean = df.copy()
        
        # Duplicates
        initial_rows = len(df_clean)
        df_clean = df_clean.drop_duplicates()
        removed_duplicates = initial_rows - len(df_clean)
        if removed_duplicates > 0:
            logs.append({
                "issue": "Duplicate Reviews",
                "action": "Removed duplicate review entries",
                "count": removed_duplicates
            })

        # Missing review text
        if 'review_text' not in df_clean.columns:
            # Try to rename common review text headers
            text_cols = [c for c in df_clean.columns if 'review' in c.lower() or 'text' in c.lower() or 'comment' in c.lower() or 'feedback' in c.lower()]
            if text_cols:
                df_clean = df_clean.rename(columns={text_cols[0]: 'review_text'})
            else:
                df_clean['review_text'] = 'No review content provided.'
                logs.append({
                    "issue": "Missing Review Text Column",
                    "action": "Generated default placeholder review text column",
                    "count": len(df_clean)
                })
        
        # Replace NaN in reviews
        missing_text = df_clean['review_text'].isna().sum()
        if missing_text > 0:
            df_clean['review_text'] = df_clean['review_text'].fillna('No comment provided.')
            logs.append({
                "issue": "Missing Review Contents",
                "action": "Replaced missing review contents with placeholder text",
                "count": int(missing_text)
            })

        # Clean/Validate Ratings
        if 'rating' in df_clean.columns:
            df_clean['rating'] = pd.to_numeric(df_clean['rating'], errors='coerce')
            missing_ratings = df_clean['rating'].isna().sum()
            # If rating is empty, default to 4 stars (positive/neutral bias)
            if missing_ratings > 0:
                df_clean['rating'] = df_clean['rating'].fillna(4).astype(int)
                logs.append({
                    "issue": "Missing Ratings",
                    "action": "Replaced missing ratings with 4-star default",
                    "count": int(missing_ratings)
                })
            # Ensure ratings are between 1 and 5
            out_of_bounds = ((df_clean['rating'] < 1) | (df_clean['rating'] > 5)).sum()
            if out_of_bounds > 0:
                df_clean.loc[df_clean['rating'] < 1, 'rating'] = 1
                df_clean.loc[df_clean['rating'] > 5, 'rating'] = 5
                logs.append({
                    "issue": "Invalid Rating Scale",
                    "action": "Bounded ratings to standard 1-5 scale",
                    "count": int(out_of_bounds)
                })
        else:
            df_clean['rating'] = 5
            logs.append({
                "issue": "Missing Rating Column",
                "action": "Generated default 5-star rating scale column",
                "count": len(df_clean)
            })
            
        # Reviewer Name
        if 'reviewer_name' not in df_clean.columns:
            df_clean['reviewer_name'] = 'Anonymous'
        else:
            df_clean['reviewer_name'] = df_clean['reviewer_name'].fillna('Anonymous')

        return df_clean, logs
