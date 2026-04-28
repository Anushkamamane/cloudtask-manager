import React, { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import './TaskList.css';

function TaskList({ tasks, user, showMessage }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [filteredTasks, setFilteredTasks] = useState([]);

  console.log("TaskList received tasks:", tasks.length);

  // Update filtered tasks whenever tasks, search, or filter changes
  useEffect(() => {
    let filtered = [...tasks];
    
    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter(task => 
        task.title && task.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply status/priority filter
    switch(filter) {
      case 'completed':
        filtered = filtered.filter(task => task.completed === true);
        break;
      case 'pending':
        filtered = filtered.filter(task => task.completed === false);
        break;
      case 'high':
        filtered = filtered.filter(task => task.priority === 'high');
        break;
      case 'medium':
        filtered = filtered.filter(task => task.priority === 'medium');
        break;
      case 'low':
        filtered = filtered.filter(task => task.priority === 'low');
        break;
      default:
        break;
    }
    
    setFilteredTasks(filtered);
    console.log("Filtered tasks:", filtered.length);
  }, [tasks, search, filter]);

  // Calculate stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed === true).length,
    pending: tasks.filter(t => t.completed === false).length,
    high: tasks.filter(t => t.priority === 'high').length
  };

  return (
    <div>
      <div className="stats-dashboard">
        <div className="stat-card" onClick={() => setFilter('all')}>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('pending')}>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('completed')}>
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('high')}>
          <div className="stat-value">{stats.high}</div>
          <div className="stat-label">High Priority</div>
        </div>
      </div>

      <div className="controls">
        <input
          type="text"
          className="search-box"
          placeholder="🔍 Search your tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">📋 All Tasks</option>
          <option value="pending">⏳ Pending</option>
          <option value="completed">✅ Completed</option>
          <option value="high">🔥 High Priority</option>
          <option value="medium">⭐ Medium Priority</option>
          <option value="low">💚 Low Priority</option>
        </select>
      </div>

      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-check-circle" style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}></i>
            <p>No tasks found. Add your first task above! 🚀</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              user={user} 
              showMessage={showMessage}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TaskList;