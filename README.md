# TaskMaster - AI-Powered Task Management Application

## 🚀 Overview

TaskMaster is a modern Flask-based task management application with integrated AI capabilities. It provides an intuitive interface for managing tasks and categories while leveraging AI to help users organize and create tasks through natural language interaction.

## ✨ Features

### Core Functionality
- **User Authentication**: Secure session-based authentication with password hashing
- **Task Management**: Create, edit, delete, and organize tasks
- **Category System**: Color-coded categories for task organization
- **AI Chat Integration**: Natural language task generation via Kluster AI
- **Responsive Design**: Modern, mobile-first UI with smooth animations

### Technical Features
- **RESTful API**: Complete API endpoints for all operations
- **Database Migrations**: Proper schema versioning with Flask-Migrate
- **Security**: CSRF protection, input validation, session management
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Real-time UI**: Instant feedback with animations and notifications

## 🛠️ Tech Stack

### Backend
- **Flask 2.3.3** - Web framework
- **SQLAlchemy** - ORM and database management
- **Flask-Login** - User session management
- **Flask-Migrate** - Database migrations
- **bcrypt** - Password hashing
- **SQLite** - Database

### Frontend
- **Vanilla JavaScript (ES6+)** - No frameworks, pure performance
- **CSS3** - Modern styling with Flexbox/Grid
- **Fetch API** - Asynchronous HTTP requests

### AI Integration
- **Kluster AI** - Task generation and chat functionality
- **OpenAI Client** - API communication

## 📦 Installation

### Prerequisites
- Python 3.8+
- pip (Python package manager)
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/DEC-HOSTING/sfmcTracking.git
   cd sfmcTracking
   git checkout taskMaster
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

5. **Initialize database**
   ```bash
   python init_db.py
   ```

6. **Run the application**
   ```bash
   python run.py
   ```

7. **Access the application**
   - Open browser to `http://127.0.0.1:5000`
   - Login with credentials from `.env.example` file

## 🔧 Configuration

### Environment Variables (.env)
```env
# AI Service Configuration
KLUSTER_AI_API_KEY=your_api_key_here
KLUSTER_AI_BASE_URL=https://api.kluster.ai/v1
KLUSTER_AI_MODEL=mistralai/Mistral-Nemo-Instruct-2407

# Flask Configuration
FLASK_SECRET_KEY=your_secret_key_here
FLASK_ENV=development
DATABASE_URL=sqlite:///instance/taskmaster.db
```

## 📁 Project Structure

```
app/
├── __init__.py              # App factory and configuration
├── blueprints/              # Route handlers
│   ├── auth.py             # Authentication routes
│   ├── api.py              # API endpoints
│   └── main.py             # Main dashboard routes
├── models/                  # Database models
│   ├── user.py             # User model
│   ├── category.py         # Category model
│   ├── task.py             # Task model
│   └── message.py          # Chat message model
├── services/                # Business logic
│   └── ai_service.py       # AI integration service
├── static/                  # Frontend assets
│   ├── css/                # Stylesheets
│   └── js/                 # JavaScript files
└── templates/               # HTML templates
    ├── dashboard.html      # Main application
    └── index.html          # Authentication page
```

## 🔗 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/check` - Session validation
- `POST /auth/logout` - User logout

### Categories
- `GET /api/categories` - List user categories
- `POST /api/categories` - Create category
- `PUT /api/categories/<id>` - Update category
- `DELETE /api/categories/<id>` - Delete category

### Tasks
- `GET /api/tasks` - List user tasks
- `GET /api/tasks?category=<id>` - Filter by category
- `POST /api/tasks` - Create task
- `PUT /api/tasks/<id>` - Update task
- `DELETE /api/tasks/<id>` - Delete task

### AI Services
- `POST /api/chat` - AI chat and task generation

## 🎨 UI/UX Features

### Design Philosophy
- **Minimalist**: Clean black and white design with accent colors
- **Responsive**: Mobile-first approach with fluid layouts
- **Accessible**: Semantic HTML and ARIA labels
- **Performance**: Optimized animations and efficient DOM updates

### Key UI Components
- **Sidebar Navigation**: Collapsible category management
- **Task Board**: Drag-and-drop task organization
- **AI Chat**: Floating chat interface
- **Modal Dialogs**: Confirmation and editing modals
- **Toast Notifications**: User feedback system

## 🔒 Security Features

- **Session Management**: Secure Flask-Login implementation
- **Password Security**: bcrypt hashing with salt
- **CSRF Protection**: Built-in Flask security
- **Input Validation**: Frontend and backend validation
- **SQL Injection Prevention**: SQLAlchemy ORM protection
- **XSS Protection**: Jinja2 template escaping

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Task creation, editing, deletion
- [ ] Category management
- [ ] AI chat functionality
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### Automated Testing (Future)
- Unit tests for models and services
- Integration tests for API endpoints
- Frontend testing with Jest
- End-to-end testing with Selenium

## 🚀 Deployment

### Development
```bash
python run.py
```

### Production (with Gunicorn)
```bash
gunicorn -w 4 -b 0.0.0.0:8000 "app:create_app()"
```

### Docker (Future)
```dockerfile
# Dockerfile configuration for containerized deployment
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is part of the DEC-HOSTING organization. Please refer to the organization's licensing terms.

## 🆘 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Contact the development team
- Review the troubleshooting guide below

## 🔍 Troubleshooting

### Common Issues

**Database Issues**
```bash
# Reset database
rm instance/taskmaster.db
python init_db.py
```

**AI Service Timeout**
```bash
# Check API key configuration in .env
# Verify network connectivity
# Review app.log for detailed errors
```

**Authentication Problems**
```bash
# Clear browser cookies
# Check session configuration
# Verify user exists in database
```

## 📊 Current Status

**Development Progress**: 85% Complete
- ✅ Core functionality implemented
- ✅ AI integration working
- ✅ Frontend/backend communication
- 🔄 Final debugging and testing

**Known Issues**
- Database session management under refinement
- AI timeout handling being optimized
- Frontend error messaging improvements

---

**Last Updated**: May 30, 2025
**Version**: 1.0.0-beta
**Branch**: taskMaster
