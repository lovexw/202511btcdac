import csv
from datetime import datetime, timedelta
import calendar
import json

# Read CSV file
prices = {}
with open('btc-price2025.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        date_str = row['date']
        price = float(row['btc price'])
        prices[date_str] = price

# Calculate investment dates and amounts
investment_amount = 100  # USD per day
end_date = datetime(2025, 11, 15)
start_date = datetime(2025, 1, 1)

purchases = []
total_investment = 0
total_btc = 0

# Generate all purchase dates
current_date = datetime(2025, 1, 1)
for month in range(1, 12):  # January to November
    # Determine the number of days in this month
    days_in_month = calendar.monthrange(2025, month)[1]
    
    # If this is November, only go up to the 15th
    if month == 11:
        days_in_month = 15
    
    # For each day from 1 to days_in_month, create a purchase
    for day in range(1, days_in_month + 1):
        purchase_date = datetime(2025, month, day)
        date_str = purchase_date.strftime('%Y/%m/%d')
        
        # Check if this date has price data
        if date_str in prices:
            price = prices[date_str]
            btc_amount = investment_amount / price
            
            purchases.append({
                'date': date_str,
                'price': price,
                'usd_invested': investment_amount,
                'btc_amount': btc_amount
            })
            
            total_investment += investment_amount
            total_btc += btc_amount

# Get the price on November 15, 2025
end_date_str = '2025/11/15'
if end_date_str in prices:
    final_price = prices[end_date_str]
    final_value = total_btc * final_price
    profit = final_value - total_investment
    profit_rate = (profit / total_investment * 100) if total_investment > 0 else 0
else:
    final_price = 0
    final_value = 0
    profit = 0
    profit_rate = 0

# Prepare summary data
summary = {
    'total_investment': round(total_investment, 2),
    'total_btc': round(total_btc, 8),
    'final_price': round(final_price, 2),
    'final_value': round(final_value, 2),
    'profit': round(profit, 2),
    'profit_rate': round(profit_rate, 2),
    'purchase_count': len(purchases),
    'purchases': purchases
}

# Output summary
print(f"Total Investment: ${summary['total_investment']:.2f}")
print(f"Total BTC Purchased: {summary['total_btc']:.8f}")
print(f"Final Price (2025/11/15): ${summary['final_price']:.2f}")
print(f"Final Value: ${summary['final_value']:.2f}")
print(f"Profit: ${summary['profit']:.2f}")
print(f"Profit Rate: {summary['profit_rate']:.2f}%")
print(f"Total Purchases: {summary['purchase_count']}")

# Save to JSON
with open('investment_data.json', 'w') as f:
    json.dump(summary, f, indent=2)
