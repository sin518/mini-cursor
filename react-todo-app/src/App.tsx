import { useState, useEffect } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: string;
  createdAt: number;
}

const CATEGORIES = ['全部', '进行中', '已完成'];

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [category, setCategory] = useState('全部');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // 从 localStorage 加载数据
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (e) {
        console.error('解析 localStorage 数据失败:', e);
      }
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // 添加待办事项
  const addTodo = () => {
    if (inputValue.trim() === '') return;
    
    const newTodo: Todo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      category: '默认',
      createdAt: Date.now(),
    };
    
    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  // 删除待办事项
  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // 切换完成状态
  const toggleComplete = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // 开始编辑
  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingValue(todo.text);
  };

  // 保存编辑
  const saveEdit = (id: number) => {
    if (editingValue.trim() === '') return;
    
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, text: editingValue.trim() } : todo
      )
    );
    setEditingId(null);
    setEditingValue('');
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  // 过滤待办事项
  const filteredTodos = todos.filter(todo => {
    if (category === '全部') return true;
    if (category === '进行中') return !todo.completed;
    if (category === '已完成') return todo.completed;
    return true;
  });

  // 统计信息
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 标题卡片 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            📝 我的待办事项
          </h1>
          <p className="text-center text-gray-600">
            管理你的任务，提高效率
          </p>
        </div>

        {/* 统计信息卡片 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-blue-600">{totalTodos}</div>
              <div className="text-sm text-gray-600">总数</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-600">{completedTodos}</div>
              <div className="text-sm text-gray-600">已完成</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-orange-600">{pendingTodos}</div>
              <div className="text-sm text-gray-600">待完成</div>
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">完成进度</span>
              <span className="text-sm font-medium text-gray-700">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 添加待办事项卡片 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="添加新的待办事项..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all duration-300"
            />
            <button
              onClick={addTodo}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              添加
            </button>
          </div>
        </div>

        {/* 筛选和列表卡片 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          {/* 筛选按钮 */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                  category === cat
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 待办事项列表 */}
          <div className="space-y-3">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-xl">暂无待办事项</p>
                <p className="text-sm mt-2">添加一些任务开始吧！</p>
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`group flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                    todo.completed
                      ? 'bg-gray-50 opacity-75'
                      : 'bg-white hover:shadow-lg hover:scale-[1.02]'
                  }`}
                >
                  {/* 复选框 */}
                  <button
                    onClick={() => toggleComplete(todo.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      todo.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    {todo.completed && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* 待办事项内容 */}
                  {editingId === todo.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-purple-400 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(todo.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        保存
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`flex-1 transition-all duration-300 ${
                        todo.completed
                          ? 'line-through text-gray-400'
                          : 'text-gray-800'
                      }`}
                    >
                      {todo.text}
                    </span>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => startEditing(todo)}
                      className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      title="删除"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="text-center mt-6 text-white/80 text-sm">
          <p>双击编辑，点击复选框完成任务</p>
        </div>
      </div>
    </div>
  );
}

export default App;
