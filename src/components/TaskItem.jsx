import React, { useState } from 'react';
import { db } from '../firebase-config';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import './TaskItem.css';

function TaskItem({ task, user, showMessage }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: !task.completed
      });
      showMessage(`Task marked as ${!task.completed ? 'completed ✅' : 'pending ⏳'}`);
    } catch (error) {
      console.error('Error toggling task:', error);
      showMessage('Failed to update task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'tasks', task.id));
        showMessage(`"${task.title}" deleted successfully!`);
      } catch (error) {
        console.error('Error deleting task:', error);
        showMessage('Failed to delete task', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = async () => {
    if (!editTitle.trim()) {
      showMessage('Task title cannot be empty', 'error');
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        title: editTitle
      });
      setIsEditing(false);
      showMessage('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      showMessage('Failed to update task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityLabel = () => {
    switch(task.priority) {
      case 'high': return '🔥 High';
      case 'medium': return '⭐ Medium';
      default: return '💚 Low';
    }
  };

  const getPriorityClass = () => {
    return `priority-badge priority-${task.priority || 'medium'}`;
  };

  if (isEditing) {
    return (
      <div className="task-item">
        <div className="edit-container">
          <input
            type="text"
            className="edit-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
            autoFocus
            disabled={loading}
          />
          <button className="save-btn" onClick={handleEdit} disabled={loading}>
            <i className="fas fa-save"></i> Save
          </button>
          <button className="cancel-btn" onClick={() => setIsEditing(false)} disabled={loading}>
            <i className="fas fa-times"></i> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-item ${task.completed ? 'completed-task' : ''}`}>
      <div className="task-content">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.completed === true}
          onChange={handleToggle}
          disabled={loading}
        />
        <span className={`task-title ${task.completed ? 'completed' : ''}`}>
          {task.title}
        </span>
        <span className={getPriorityClass()}>
          {getPriorityLabel()}
        </span>
        <span className="category-badge">
          <i className="fas fa-tag"></i> {task.category || 'General'}
        </span>
        <div className="task-actions">
          <button className="edit-btn" onClick={() => setIsEditing(true)} disabled={loading}>
            <i className="fas fa-edit"></i>
          </button>
          <button className="delete-btn" onClick={handleDelete} disabled={loading}>
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskItem;