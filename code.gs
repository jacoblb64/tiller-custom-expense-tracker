function main() {
  // const sheet = SpreadsheetApp.getActiveSheet();
  // const transactions = readTransactions(sheet);
  // writeTest(sheet, transactions);
}

function writeTest(sheet, transactions) {
  Logger.log(transactions[0][0]);
  sheet.appendRow(transactions[0]);
}

function readTransactions(sheet) {
  return transactions = sheet.getDataRange().getValues();
}

/**
 * Returns whether a given categorization is an expense
 * @customfunction
 */
function isExpense(categorization, expense_list) {
  return !!expense_list.includes(categorization);
}

// REPLACE THESE WITH YOUR NAMES
const A_NAME = "";
const B_NAME = "";

/**
 * Build our Custom Expense Tracker
 * @param transactionSheet The entire transaction sheet, all rows and columns
 * @param categories Columns A-C of the categories sheet, all rows
 * @param {number} splitPercent The percentage of G's split, as a decimal
 * @return A set of rows and columns tracking our expenses, with months as rows and dimensions by column
 * 
 * @customfunction
 */
function buildExpenseTracker(transactionSheet, categories, splitPercent, startYear) {
  let output = [];
  const outHeaderRow = [
  'Month',
  'Total Income',
  'Total Expenses',
  'Split Expenses',
  'A\'s Expenses',
  'B\'s Expenses',
  'A Total',
  'B Total',
  'A->B Payback',
  'Total Saved'
  ];
  output.push(outHeaderRow);

  const expenses = categories.map(r => r[2] == 'Expense' ? r[0] : null).filter(r => r != null);
  const incomes = categories.map(r => r[2] == 'Income' ? r[0] : null).filter(r => r != null);

  const today = new Date();
  const curMonth = today.getMonth() + 1;
  const curYear = today.getFullYear();

  const totalMonths = (curYear-startYear)*12 + curMonth;

  let tracker = [];

  // 0 is January of start year, then incrementing upwards
  for (let i = 0; i <= totalMonths; i++) {
    tracker.push({
      name: getMonthName(i, startYear),
      income: 0,
      total: 0,
      split: 0,
      a_amount: 0,
      b_amount: 0,
      aOwsB: 0, // positive is money G owns to J, negative is the opposite
      saved: 0,
    });
  }

  const headers = transactionSheet[0];

  for (const t of transactionSheet) {
    const amount = t[headers.indexOf('Amount')];
    const date = new Date(t[headers.indexOf('Date')])
    const category = t[headers.indexOf('Category')];
    const isExpense = expenses.includes(category);
    const isIncome = incomes.includes(category);
    const person = t[headers.indexOf('Person')].toLowerCase();
    const inst = t[headers.indexOf('Institution')].toLowerCase();

    // skip any data before the start year
    if (date.getFullYear() < startYear) {
      continue;
    }

    let yearOffset = date.getFullYear() - startYear;
    let trackerIndex = yearOffset*12 + date.getMonth();

    let month = tracker[trackerIndex];
    
    if (isIncome) {
      month.income += amount;
      continue;
    }

    if (!isExpense) {
      continue;
    }

    month.total += amount;
    month[person] += amount;

    
    if (inst == 'td bank') {
      // A pays for TD accounts
      if (person == 'split') {
        // if A paid for a split, B owes their split percentage
        month.aOwsB -= amount * (1-splitPercent);
      }
      else if (person == B_NAME) {
        // if A paid for something for B, they owe the full amount
        month.aOwsB -= amount;
      }
    }
    else {
      // all other accounts are paid by B
      if (person == 'split') {
        // if B paid for a split, A owes their split percentage
        month.aOwsB += amount * splitPercent;
      }
      else if (person == B_NAME) {
        // if B paid for something for A, they owe the full amount
        month.gOwsJ += amount;
      }
    }
    // When A pays for their own accounts, or B pays for their own accounts, ignore
  }

  for (const m of tracker) {
    let aTotal = m.split*splitPercent + m.a_amount;
    let bTotal = m.split*(1-splitPercent) + m.b_amount;
    let saved = m.income + m.total;

    if (m.total) {
      // skip next month if empty
      output.push([
        m.name,
        m.income,
        m.total*-1,
        m.split*-1,
        m.a_amount*-1,
        m.b_amount*-1,
        aTotal*-1,
        bTotal*-1,
        m.aOwsB*-1,
        saved
      ]);
    }
  }

  return output;
}

function getMonthName(monthNumber, startyear) {
  const date = new Date("1/15/" + startyear);
  date.setMonth(monthNumber); // increments by X months

  return date.toLocaleString('en-US', { month: 'long', year: '2-digit'});
}

/**
 * Build the category breakdown page.
 * Totals expenses by category over the period of time, inclusive.
 * 
 * @param transactionSheet The entire transaction sheet, all rows and columns
 * @param categories Columns A-C of the categories sheet, all rows
 * @param {Date} startDate
 * @param {Date} endDate
 * 
 * @return A set of rows of Categories, and their total amount between the start and end date
 * 
 * @customfunction
 */
function buildCategoryBreakdown(transactionSheet, categories, startDate, endDate) {
  const expenses = categories.map(r => r[2] == 'Expense' ? r[0] : null).filter(r => r != null);

  let tracker = {};
  expenses.forEach(e => tracker[e] = 0);

  const headers = transactionSheet[0];

  for (const t of transactionSheet) {
    const amount = t[headers.indexOf('Amount')];
    const date = new Date(t[headers.indexOf('Date')]);
    const category = t[headers.indexOf('Category')];
    const isExpense = expenses.includes(category);

    if (!isExpense || date > endDate || date < startDate) {
      continue;
    }

    tracker[category] += amount;
  }

  let output = Object.entries(tracker).map(([k,v]) => [k, -v]);
  return output;
}

