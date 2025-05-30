# 🚀 HOW TO RUN TASKMASTER APPLICATION

## Quick Start Guide

### Method 1: Using Python Script (Recommended)
```bash
python start_taskmaster.py
```

### Method 2: Using Batch File (Windows)
```bash
start_taskmaster.bat
```

### Method 3: Using Original Runner
```bash
python run.py
```

---

## 📋 Step-by-Step Instructions

### 1. **Ensure Dependencies are Installed**
```bash
pip install -r requirements.txt
```

### 2. **Check Database is Ready**
The database should already exist at `instance/taskmaster.db`. If not:
```bash
python init_db.py
```

### 3. **Start the Application**
```bash
python start_taskmaster.py
```

You should see output like:
```
🚀 Starting TaskMaster Application...
✅ App imported successfully
✅ App created successfully
🌐 Starting server on http://127.0.0.1:5000
🔧 Debug mode: False
📱 Open your browser and go to the URL above
🛑 Press Ctrl+C to stop the server
--------------------------------------------------
```

### 4. **Open Your Browser**
Navigate to: **http://127.0.0.1:5000**

### 5. **Test the Application**
Run the API test script in a new terminal:
```bash
python test_api_complete.py
```

---

## 🧪 Testing the Application

### Manual Testing Steps:
1. **Register a new user** or login with existing credentials
2. **Create categories** for organizing tasks
3. **Add tasks** to different categories
4. **Use the AI chat** to generate tasks automatically
5. **Mark tasks as complete** and test the UI updates

### Automated Testing:
```bash
# Test API endpoints
python test_api_complete.py

# Test database connection
python test_db_direct.py

# Run comprehensive tests
python comprehensive_test.py
```

---

## 🎯 Default Test Credentials

**Email:** See .env.example file  
**Password:** See .env.example file

*Note: You can register new users or use these default credentials for testing.*

---

## 🔧 Troubleshooting

### If the server won't start:
1. Check if port 5000 is available
2. Ensure all dependencies are installed
3. Check the database file exists: `instance/taskmaster.db`
4. Look for error messages in the terminal

### If API tests fail:
1. Make sure the server is running first
2. Check the browser at http://127.0.0.1:5000
3. Verify database has data: `python test_db_direct.py`

### Common Issues:
- **Port already in use**: Change port in `.env` file or stop other Flask apps
- **Database locked**: Close any database browser tools
- **Import errors**: Run `pip install -r requirements.txt`

---

## 🌟 Application Features

Once running, you can:
- ✅ **User Authentication** - Register/Login securely
- ✅ **Task Management** - Create, edit, delete tasks
- ✅ **Categories** - Organize tasks by category
- ✅ **AI Chat** - Generate tasks using AI assistant
- ✅ **Dashboard** - Modern UI for task overview
- ✅ **Responsive Design** - Works on desktop and mobile

---

## 🎉 Success!

If everything is working, you should see:
- TaskMaster dashboard loads in browser
- You can register/login users
- Tasks and categories can be created
- AI chat responds (if configured)
- All API endpoints return proper responses

**TaskMaster is now ready for use!** 🚀
