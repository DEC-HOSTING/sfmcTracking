# SFMC Email Campaign Action Items Tracker

A comprehensive web application for tracking email campaign action items with secure authentication and automated email notifications.

## Features

### 🔐 Security
- Secure login system with obfuscated credentials
- Session management with 8-hour timeout
- Multiple hash rounds with salt-based protection
- Comprehensive security documentation

### 📧 Email Campaign Tracking
- 11 comprehensive email campaign sections
- Progress tracking with visual indicators
- Batch email notifications instead of individual popups
- Persistent state management with localStorage

### 🎨 User Interface
- Modern glassmorphism design
- Responsive layout for all devices
- Animated login interface with professional spinner
- Fun animated CTA button for email notifications
- Progress bars and statistics dashboard

### ⚡ Functionality
- Real-time progress tracking
- Keyboard shortcuts (Ctrl+E export, Ctrl+R reset)
- Export functionality for action items
- Automatic state persistence
- Session timeout warnings

## Login Credentials

- **Email**: camelia.ounesli@loreal.com
- **Password**: QueenCRM

## Email Notifications

When action items are checked, batch email notifications are sent to: thomas.nicoli@loreal.com

## Campaign Sections

1. Campaign Planning & Strategy
2. Audience Segmentation & Targeting
3. Content Creation & Design
4. Email Template Development
5. Personalization & Dynamic Content
6. Testing & Quality Assurance
7. Deployment & Scheduling
8. Performance Monitoring
9. Analytics & Reporting
10. Optimization & A/B Testing
11. Compliance & Deliverability

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with glassmorphism effects
- **Storage**: localStorage for state persistence
- **Email**: mailto: protocol for notifications
- **Security**: Multi-layer credential protection

## Installation

1. Clone this repository
2. Open `index.html` in a web browser
3. Login with the provided credentials
4. Start tracking your email campaign action items!

## Security Notes

- Credentials are obfuscated and protected with multiple security layers
- See `SECURITY.md` for detailed security implementation
- Environment variables template provided in `.env.example`
- Sensitive files are excluded via `.gitignore`

## Development

For backend authentication server setup, see `auth-server.js` for Node.js implementation example.

## License

This project is created for L'Oréal email campaign management.
