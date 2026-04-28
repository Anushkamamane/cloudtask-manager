import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from './firebase-config';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  useEffect(() => {
    console.log("Setting up auth listener...");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser?.email);
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        console.log("✅ User logged in:", currentUser.email);
        console.log("User UID:", currentUser.uid);
        
        // Create query for user's tasks
        const q = query(
          collection(db, 'tasks'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        console.log("Setting up real-time listener for tasks...");
        
        // Set up real-time listener
        const unsubscribeTasks = onSnapshot(q, 
          (snapshot) => {
            const tasksData = [];
            snapshot.forEach((doc) => {
              tasksData.push({
                id: doc.id,
                ...doc.data()
              });
            });
            console.log("📋 Tasks loaded from Firestore:", tasksData.length);
            console.log("Tasks data:", tasksData);
            setTasks(tasksData);
          },
          (error) => {
            console.error('Error loading tasks:', error);
            showMessage('Error loading tasks: ' + error.message, 'error');
          }
        );
        
        // Cleanup listener on unmount
        return () => {
          console.log("Cleaning up tasks listener");
          unsubscribeTasks();
        };
      } else {
        console.log("No user logged in");
        setTasks([]);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log("Attempting Google sign in...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("✅ Signed in:", result.user.email);
      showMessage(`Welcome ${result.user.displayName || result.user.email}!`);
    } catch (error) {
      console.error('Sign-in error:', error);
      showMessage('Sign-in failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setTasks([]);
      showMessage('Signed out successfully!');
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <i className="fas fa-spinner fa-spin"></i> Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        <div className="auth-container">
          <div className="auth-card">
            <i className="fas fa-cloud" style={{ fontSize: "3rem", color: "#667eea", marginBottom: "1rem" }}></i>
            <h2>CloudTask Manager</h2>
            <p>Sign in to access your tasks from anywhere</p>
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
            <button className="btn-google" onClick={handleGoogleSignIn}>
              <i className="fab fa-google"></i> Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
      
      <div className="app-container">
        <div className="header">
          <h1>
            <i className="fas fa-tasks"></i> CloudTask Manager
          </h1>
          <p>Your tasks are safely stored in the cloud</p>
          <div className="user-info">
            <div className="user-details">
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <span>{user.email}</span>
            </div>
            <button className="logout-btn" onClick={handleSignOut}>
              <i className="fas fa-sign-out-alt"></i> Sign Out
            </button>
          </div>
        </div>
        
        <TaskForm 
          user={user} 
          onTaskAdded={() => {
            showMessage('Task added successfully!');
            console.log("Task added, UI should update automatically");
          }} 
        />
        
        <TaskList 
          tasks={tasks} 
          user={user} 
          showMessage={showMessage}
        />
      </div>
    </div>
  );
}

export default App;