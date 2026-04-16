import { useState, useEffect, useRef } from 'react'

interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: number
}

type FilterType = 'all' | 'active' | 'completed'

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('react-todo-app-data')
    return saved ? JSON.parse(saved) : []
  })
  const [inputText, setInputText] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [deletingIds, setDeletingIds] = useState<number[]>([])
  const [addingAnimation, setAddingAnimation] = useState<number | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem('react-todo-app-data', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingId])

  const addTodo = () => {
    if (!inputText.trim()) return
    const newId = Date.now()
    const newTodo: Todo = {
      id: newId,
      text: inputText.trim(),
      completed: false,
      createdAt: newId,
    }
    setTodos([newTodo, ...todos])
    setInputText('')
    setAddingAnimation(newId)
    setTimeout(() => setAddingAnimation(null), 500)
  }

  const deleteTodo = (id: number) => {
    setDeletingIds([...deletingIds, id])
    setTimeout(() => {
      setTodos(todos.filter(t => t.id !== id))
      setDeletingIds(deletingIds.filter(did => did !== id))
    }, 300)
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const startEdit = (id: number, text: string) => {
    setEditingId(id)
    setEditText(text)
  }

  const saveEdit = (id: number) => {
    if (!editText.trim()) {
      setEditingId(null)
      return
    }
    setTodos(todos.map(t => t.id === id ? { ...t, text: editText.trim() } : t))
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const clearCompleted = () => {
    const completedIds = todos.filter(t => t.completed).map(t => t.id)
    setDeletingIds(completedIds)
    setTimeout(() => {
      setTodos(todos.filter(t => !t.completed))
      setDeletingIds([])
    }, 300)
  }

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const totalCount = todos.length
  const activeCount = todos.filter(t => !t.completed).length
  const completedCount = todos.filter(t => t.completed).length

  return (
    <div className="app-container">
      <div className="todo-card">
        <h1 className="todo-title">✨ Todo List</h1>
        <p className="todo-subtitle">管理你的日常任务</p>

        <div className="input-group">
          <input
            type="text"
            className="todo-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="输入新的任务..."
          />
          <button className="add-btn" onClick={addTodo} disabled={!inputText.trim()}>
            ➕ 添加
          </button>
        </div>

        <div className="filter-group">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部 ({totalCount})
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            进行中 ({activeCount})
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            已完成 ({completedCount})
          </button>
        </div>

        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">{totalCount}</span>
            <span className="stat-label">总任务</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number stat-active">{activeCount}</span>
            <span className="stat-label">进行中</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number stat-completed">{completedCount}</span>
            <span className="stat-label">已完成</span>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        )}

        <ul className="todo-list">
          {filteredTodos.length === 0 && (
            <li className="empty-state">
              {filter === 'all' ? '🎉 暂无任务，添加一个吧！' : 
               filter === 'active' ? '✅ 没有进行中的任务' : 
               '📝 还没有已完成的任务'}
            </li>
          )}
          {filteredTodos.map(todo => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''} ${
                deletingIds.includes(todo.id) ? 'deleting' : ''
              } ${addingAnimation === todo.id ? 'adding' : ''}`}
            >
              <input
                type="checkbox"
                className="todo-checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />

              {editingId === todo.id ? (
                <div className="edit-group">
                  <input
                    ref={editInputRef}
                    type="text"
                    className="edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(todo.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <button className="save-btn" onClick={() => saveEdit(todo.id)}>✅</button>
                  <button className="cancel-btn" onClick={cancelEdit}>❌</button>
                </div>
              ) : (
                <span
                  className={`todo-text ${todo.completed ? 'completed-text' : ''}`}
                  onDoubleClick={() => startEdit(todo.id, todo.text)}
                >
                  {todo.text}
                </span>
              )}

              {editingId !== todo.id && (
                <div className="action-btns">
                  <button
                    className="edit-btn"
                    onClick={() => startEdit(todo.id, todo.text)}
                    title="编辑"
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteTodo(todo.id)}
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {completedCount > 0 && (
          <button className="clear-btn" onClick={clearCompleted}>
            🧹 清除已完成 ({completedCount})
          </button>
        )}
      </div>

      <p className="hint-text">💡 双击任务文本可编辑</p>
    </div>
  )
}

export default App