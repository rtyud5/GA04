import { useEffect, useState } from "react";

const API_URL = "https://jsonplaceholder.typicode.com/todos";

function App() {
  const [page, setPage] = useState("home");
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================================
  // 1. Fetch todo when load page
  // ================================
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL + "?_limit=10");
      const data = await res.json();

      const mapped = data.map((item) => ({
        id: item.id,
        text: item.title,
        completed: item.completed,
      }));

      setTodos(mapped);
    } catch (err) {
      console.error(err);
      setError("Không tải được dữ liệu từ API");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // 2. Add new task
  // ================================
  const handleAddTodo = async () => {
    const text = inputValue.trim();
    if (!text) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: text, completed: false }),
      });

      const data = await res.json();

      const newTodo = {
        id: data.id ?? Date.now(),
        text: data.title,
        completed: data.completed,
      };

      setTodos((prev) => [...prev, newTodo]);
      setInputValue("");
    } catch (err) {
      console.error(err);
      setError("Không thêm được việc mới");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAddTodo();
  };

  // ================================
  // 3. Toggle completed
  // ================================
  const handleToggleTodo = async (todo) => {
    try {
      const res = await fetch(`${API_URL}/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: todo.text,
          completed: !todo.completed,
        }),
      });

      const data = await res.json();

      const updated = {
        id: data.id ?? todo.id,
        text: data.title,
        completed: data.completed,
      };

      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? updated : t))
      );
    } catch (err) {
      console.error(err);
      setError("Không cập nhật được công việc");
    }
  };

  // ================================
  // 4. Delete task
  // ================================
  const handleDeleteTodo = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });

      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      setError("Không xoá được công việc");
    }
  };

  // ================================
  // Render pages
  // ================================
  const HomePage = () => (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Homepage</h1>
      <p className="text-sm">
        Đây là demo ứng dụng TODO dành cho bài GA04.
      </p>
      <ul className="list-disc list-inside text-sm space-y-1">
        <li>React + Vite</li>
        <li>useState, useEffect</li>
        <li>Gọi API (JSONPlaceholder)</li>
        <li>Thêm / Đánh dấu / Xoá</li>
      </ul>
      <p className="text-sm text-slate-600">
        Bấm <b>Todo List</b> ở trên để bắt đầu.
      </p>
    </div>
  );

  const TodoPage = () => (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Todo List</h1>

      {/* Input + buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Nhập việc cần làm..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
        />
        <button
          onClick={handleAddTodo}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded"
        >
          Thêm
        </button>
        <button
          onClick={fetchTodos}
          className="px-4 py-2 bg-slate-300 text-sm rounded"
        >
          Tải lại
        </button>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Todo list */}
      {todos.length === 0 ? (
        <p>Chưa có công việc nào.</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-2 bg-white border rounded px-3 py-2"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo)}
              />

              <span
                className={`flex-1 text-sm ${
                  todo.completed ? "line-through text-slate-400" : ""
                }`}
              >
                {todo.text}
              </span>

              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Xoá
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // ================================
  // UI layout
  // ================================
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-blue-500 text-white shadow">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between">
          <span className="font-semibold">GA04 TODO App</span>

          <nav className="flex gap-2 text-sm">
            <button
              onClick={() => setPage("home")}
              className={`px-3 py-1 rounded ${
                page === "home" ? "bg-blue-700" : "bg-blue-400"
              }`}
            >
              Homepage
            </button>

            <button
              onClick={() => setPage("todo")}
              className={`px-3 py-1 rounded ${
                page === "todo" ? "bg-blue-700" : "bg-blue-400"
              }`}
            >
              Todo List
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {page === "home" ? <HomePage /> : <TodoPage />}
      </main>
    </div>
  );
}

export default App;
