# tiller-custom-expense-tracker
Custom Split Expense Tracker for Couples using Tiller Money

## How to use
1. Create a Google Sheets spreadsheet using Tiller Money
    - Make sure your categories are set up correctly, with expenses categorized appropriately
2. Set up you and your partner's accounts to sync
3. Create a new column in the transactions spreadsheet called 'Person'
    - Optionally, set these up using Data Validation for easy selecting
    - I prefer right between Amount and Account
4. In your spreadsheet navigate to Extensions -> Apps Script
    - You may have to install an Extension, but this should be default now
    - What we're doing is creating [custom functions](https://developers.google.com/workspace/add-ons/editors/sheets#custom_functions)
5. Paste this code into that editor and hit Save Project
    - **IMPORTANT**: Add your names to the script and customize any account logic
6. Create a new sheet in your main Tiller Spreadsheet, say called Monthly Breakdown
7. Specify your split percents somewhere toward the top
8. Call the first custom function somewhere like:
    - `=buildExpenseTracker(Transactions!A1:R7021, Categories!A1:C66, B3, 2023)`
    - Where `B3` is A's split percent
9. The other custom function can live in it's own spreadsheet, specifications / inputs needed are a start date and an end date. You can call like:
    - `=buildCategoryBreakdown(Transactions!$A$1:$R$6021, Categories!$A$2:$C$84, B2, B3)`
10. Optionally, add charts if you'd like!