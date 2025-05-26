# SFMC Email Campaign Action Items Tracker

A comprehensive web application for tracking email campaign action items with secure authentication and automated email notifications.

## Features

### 🤖 **AI-Powered Checklist Import (NEW!)**
- **Kluster AI Integration**: Uses Mistral Nemo model for intelligent parsing
- **Smart Text Recognition**: Automatically extracts sections, statuses, and actions
- **One-Click Import**: Paste raw checklist text and let AI structure it
- **Format Flexibility**: Works with various checklist formats and structures

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
- **AI-powered checklist import** with Mistral Nemo
- Keyboard shortcuts (Ctrl+E export, Ctrl+R reset, **Ctrl+I AI import**)
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
- **AI Integration**: Kluster AI with Mistral Nemo Instruct 2407
- **Styling**: Custom CSS with glassmorphism effects
- **Storage**: localStorage for state persistence
- **Email**: mailto: protocol for notifications
- **Security**: Multi-layer credential protection

## Installation

1. Clone this repository
2. Open `index.html` in a web browser
3. Login with the provided credentials
4. Start tracking your email campaign action items!

## 🤖 AI-Powered Checklist Import

### How to Use AI Import:
1. **Click the "🤖 AI Import Checklist" button** or press `Ctrl+I`
2. **Paste your raw checklist** in any format
3. **Let AI parse it automatically** using Mistral Nemo
4. **Review and start tracking** the imported actions

### Supported Formats:
The AI can parse various checklist formats, including:

```
1. Newsletter Confirmation / Newsletter Subscription
Status:
Cathie: NO-GO (Issue: Space between texts)
Malaurie: NO-GO

Actions Required:
□ Adjust spacing between text blocks
□ Change all uppercase text to lowercase
□ Fix Outlook rendering to ensure link appears in black (not blue)
□ Update footer to "Votre fidélité est récompensée"

2. Welcome / Create an Account
Status:
Cathie: GO (No action needed)
Malaurie: NO-GO (Spacing issue)

Actions Required:
□ Adjust text spacing
□ Change all uppercase text to lowercase
```

### AI Configuration:
- **Model**: Mistral Nemo Instruct 2407 via Kluster AI
- **Temperature**: 0.2 (optimized for consistent parsing)
- **Max Tokens**: 4000
- **Features**: Smart section detection, status extraction, action item parsing

### Benefits:
- ✅ **Save Time**: No manual data entry
- ✅ **Reduce Errors**: AI ensures consistent formatting
- ✅ **Flexible Input**: Works with various text formats
- ✅ **Smart Parsing**: Automatically detects sections and actions

## Security Notes

- Credentials are obfuscated and protected with multiple security layers
- See `SECURITY.md` for detailed security implementation
- Environment variables template provided in `.env.example`
- Sensitive files are excluded via `.gitignore`

## Development

For backend authentication server setup, see `auth-server.js` for Node.js implementation example.

## License

This project is created for L'Oréal email campaign management.
