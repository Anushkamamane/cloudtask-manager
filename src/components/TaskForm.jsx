import React, { useState } from 'react';
import { db } from '../firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './TaskForm.css';

function TaskForm({ user, onTaskAdded }) {
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', category: 'Work' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }
    
    setLoading(true);
    try {
      const taskData = {
        title: newTask.title,
        completed: false,
        priority: newTask.priority,
        category: newTask.category,
        userId: user.uid,
        createdAt: serverTimestamp()
      };
      
      console.log("➕ Adding task:", taskData);
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      console.log("✅ Task added with ID:", docRef.id);
      
      setNewTask({ title: '', priority: 'medium', category: 'Work' });
      onTaskAdded();
    } catch (error) {
      console.error('❌ Error adding task:', error);
      alert('Failed to add task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          className="task-input"
          placeholder="What needs to be done? 📝"
          value={newTask.title}
          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
          disabled={loading}
        />
        <select 
          className="priority-select"
          value={newTask.priority}
          onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
          disabled={loading}
        >
          <option value="high">🔥 High Priority</option>
          <option value="medium">⭐ Medium Priority</option>
          <option value="low">💚 Low Priority</option>
        </select>
        <select 
          className="category-select"
          value={newTask.category}
          onChange={(e) => setNewTask({...newTask, category: e.target.value})}
          disabled={loading}
        >
          <option>💼 Work</option>
          <option>🏠 Personal</option>
          <option>📚 Learning</option>
          <option>💪 Health</option>
          <option>💰 Finance</option>
          <option>🎨 Other</option>
        </select>
        <button type="submit" className="add-btn" disabled={loading}>
          <i className="fas fa-plus"></i> {loading ? 'Adding...' : 'Add Task'}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;