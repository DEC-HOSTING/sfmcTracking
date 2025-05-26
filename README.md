# SFMC Email Campaign Action Items Tracker

## ⚠️ SECURITY NOTICE

**This application uses client-side authentication for demonstration purposes only.** While multiple layers of obfuscation protect credentials, this approach is **NOT suitable for production use** without proper server-side security implementation.

For production deployment, please:
1. Implement server-side authentication (see `auth-server.js` example)
2. Use environment variables for all sensitive data
3. Review the comprehensive [Security Guide](SECURITY.md)

---

A comprehensive web application for tracking email campaign action items with secure authentication and automated email notifications.

## Features

### 🤖 **AI-Powered Checklist Import (NEW!)**
- **Kluster AI Integration**: Uses Mistral Nemo model for intelligent parsing
- **Smart Text Recognition**: Automatically extracts sections, statuses, and actions
- **One-Click Import**: Paste raw checklist text and let AI structure it
- **Format Flexibility**: Works with various checklist formats and structures

#### Testing the AI Import
You can test the AI import functionality by pasting this sample checklist:

```
Email Campaign Launch Checklist

1. Pre-Launch Planning
Cathie Status: GO - All approvals received
Malaurie Status: GO - Creative assets ready
- Review campaign objectives and KPIs
- Finalize target audience segmentation
- Approve email creative and copy
- Set up tracking parameters

2. Technical Setup
Cathie Status: IN PROGRESS - Testing required
Malaurie Status: GO - Systems configured
- Configure email service provider settings
- Set up A/B testing parameters
- Validate email templates across devices
- Test email deliverability

3. Launch Execution
Cathie Status: PENDING - Awaiting pre-launch completion
Malaurie Status: PENDING - Ready for deployment
- Schedule email deployment
- Monitor initial delivery metrics
- Prepare post-launch analysis
```

**How to use**: Click the AI Import button (or press Ctrl+I), paste the checklist above, and click "Import with AI" to see the magic happen!

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

#### 📋 Test Checklist Example:
```
Email Campaign Launch Checklist

1. Pre-Launch Preparation
   Cathie Status: GO - All systems ready
   Malaurie Status: GO - Content approved
   - Finalize email content and subject lines
   - Set up tracking pixels and UTM parameters
   - Verify sender authentication (SPF, DKIM, DMARC)
   - Test email rendering across different clients

2. Audience Management
   Cathie Status: PENDING - Review needed
   Malaurie Status: GO - Segments confirmed
   - Import and clean subscriber lists
   - Set up dynamic segmentation rules
   - Configure suppression lists
   - Validate email addresses

3. Technical Setup
   Cathie Status: GO - Infrastructure ready
   Malaurie Status: NO-GO - Need final approval
   - Configure sending infrastructure
   - Set up delivery time zones
   - Test automation workflows
   - Prepare fallback scenarios
```

**Try copying the above checklist and importing it using the AI function!**

### AI Configuration:
- **Model**: Mistral Nemo Instruct 2407 via Kluster AI
- **Max Tokens**: 4000
- **Temperature**: 2.0 (creative parsing)
- **Processing**: Intelligent JSON structure extraction

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
