import { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

import "./App.css";

const expenseCategories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Education",
  "Entertainment",
  "Other",
];

const incomeCategories = [
  "Salary",
  "Freelance",
  "Investment",
  "Other",
];

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function App() {
  const [transactions, setTransactions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("transactions")) || [];
    } catch {
      return [];
    }
  });

  const [type, setType] = useState("Expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(getToday());
  const [description, setDescription] = useState("");

  const [filterCategory, setFilterCategory] = useState("All");

  // Save transactions in localStorage
  useEffect(() => {
    localStorage.setItem(
      "transactions",
      JSON.stringify(transactions)
    );
  }, [transactions]);

  // Current month transactions
  const monthlyTransactions = useMemo(() => {
    const currentMonth = getToday().slice(0, 7);

    return transactions.filter((item) =>
      item.date.startsWith(currentMonth)
    );
  }, [transactions]);

  // Monthly income
  const totalIncome = monthlyTransactions
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  // Monthly expenses
  const totalExpense = monthlyTransactions
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  // Monthly balance
  const balance = totalIncome - totalExpense;

  // Add transaction
  const handleAddTransaction = (e) => {
    e.preventDefault();

    if (Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      type,
      amount: Number(amount),
      category,
      date,
      description,
    };

    setTransactions((previous) => [
      newTransaction,
      ...previous,
    ]);

    setAmount("");
    setDescription("");
    setDate(getToday());

    alert("Transaction added successfully!");
  };

  // Delete transaction
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setTransactions((previous) =>
        previous.filter((item) => item.id !== id)
      );
    }
  };

  // Category filter
  const filteredTransactions =
    filterCategory === "All"
      ? transactions
      : transactions.filter(
          (item) => item.category === filterCategory
        );

  // Pie chart data
  const pieData = Object.values(
    monthlyTransactions
      .filter((item) => item.type === "Expense")
      .reduce((result, item) => {
        if (!result[item.category]) {
          result[item.category] = {
            name: item.category,
            value: 0,
          };
        }

        result[item.category].value += Number(item.amount);

        return result;
      }, {})
  );

  // Bar chart data
  const barData = [
    {
      name: "This Month",
      Income: totalIncome,
      Expense: totalExpense,
    },
  ];

  // Line chart data
  const dailyData = Object.values(
    monthlyTransactions
      .filter((item) => item.type === "Expense")
      .reduce((result, item) => {
        if (!result[item.date]) {
          result[item.date] = {
            date: item.date,
            expense: 0,
          };
        }

        result[item.date].expense += Number(item.amount);

        return result;
      }, {})
  ).sort((a, b) => a.date.localeCompare(b.date));

  // Export CSV
  const exportCSV = () => {
    if (transactions.length === 0) {
      alert("No transactions available to export.");
      return;
    }

    const headers = [
      "Type",
      "Amount",
      "Category",
      "Date",
      "Description",
    ];

    const rows = transactions.map((item) => [
      item.type,
      item.amount,
      item.category,
      item.date,
      item.description,
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "expense-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const availableCategories =
    type === "Expense"
      ? expenseCategories
      : incomeCategories;

  return (
    <div className="app-container">

      {/* Header */}
      <header className="header">
        <div>
          <h1>Expense Tracker</h1>
          <p>Manage your income and expenses easily.</p>
        </div>

        <button className="export-btn" onClick={exportCSV}>
          Export CSV
        </button>
      </header>

      {/* Monthly Summary */}
      <section className="summary-section">

        <div className="summary-card income-card">
          <h3>Total Income</h3>
          <h2>₹{totalIncome.toLocaleString("en-IN")}</h2>
        </div>

        <div className="summary-card expense-card">
          <h3>Total Expenses</h3>
          <h2>₹{totalExpense.toLocaleString("en-IN")}</h2>
        </div>

        <div className="summary-card balance-card">
          <h3>Monthly Balance</h3>
          <h2>₹{balance.toLocaleString("en-IN")}</h2>
        </div>

      </section>

      {/* Add Transaction */}
      <section className="form-section">

        <h2>Add Transaction</h2>

        <form onSubmit={handleAddTransaction}>

          <label>Transaction Type</label>

          <select
            value={type}
            onChange={(e) => {
              const newType = e.target.value;
              setType(newType);

              setCategory(
                newType === "Expense" ? "Food" : "Salary"
              );
            }}
          >
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>

          <label>Amount (₹)</label>

          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            required
          />

          <label>Category</label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {availableCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label>Date</label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label>Description</label>

          <input
            type="text"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button type="submit" className="add-btn">
            Add Transaction
          </button>

        </form>

      </section>

      {/* Charts */}
      <section className="charts-section">

        <div className="chart-card">
          <h2>Expenses by Category</h2>

          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={[
                        "#6366f1",
                        "#22c55e",
                        "#f59e0b",
                        "#ef4444",
                        "#06b6d4",
                        "#a855f7",
                        "#ec4899",
                        "#64748b",
                      ][index % 8]}
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-message">
              No expense data available.
            </p>
          )}
        </div>

        <div className="chart-card">
          <h2>Income vs Expense</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Bar dataKey="Income" fill="#22c55e" />
              <Bar dataKey="Expense" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-chart">
          <h2>Daily Expense Trend</h2>

          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#6366f1"
                  strokeWidth={3}
                  name="Daily Expense"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-message">
              No daily expense data available.
            </p>
          )}
        </div>

      </section>

      {/* Transaction History */}
      <section className="history-section">

        <div className="history-header">
          <h2>Transaction History</h2>

          <select
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value)
            }
          >
            <option value="All">All Categories</option>

            {[...new Set(
              transactions.map((item) => item.category)
            )].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="empty-message">
            No transactions available.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.type}</td>

                    <td>₹{Number(item.amount).toLocaleString("en-IN")}</td>

                    <td>{item.category}</td>

                    <td>{item.date}</td>

                    <td>{item.description || "-"}</td>

                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </section>

      <footer>
        <p>Expense Tracker | Built with React</p>
      </footer>

    </div>
  );
}

export default App;