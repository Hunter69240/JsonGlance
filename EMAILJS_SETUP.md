# EmailJS Setup Guide for JsonGlance Feedback Form

## Step 1: Create an EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/)
2. Click "Sign Up" (it's free!)
3. Create your account

## Step 2: Add an Email Service

1. In your EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended for personal projects)
   - **Outlook/Office 365**
   - **Yahoo**
   - Or any other provider
4. Click **"Connect Account"** and follow the authentication steps
5. **Copy your Service ID** (looks like: `service_abc123`)

## Step 3: Create an Email Template

### Detailed Template Creation Steps:

1. **Navigate to Email Templates**
   - In your EmailJS dashboard, click on **"Email Templates"** in the left sidebar
   - Click the **"Create New Template"** button (big blue button)

2. **Select Template Type**
   - You'll see several template options:
     - **Contact Form** ← **SELECT THIS ONE** (Best match for feedback)
     - Auto-Reply
     - Welcome
     - Password Reset
     - OTP
     - Order Confirmation
     - Feedback Request
   - Click on **"Contact Form"** (or you can choose "Start from Scratch" if you prefer)

3. **Configure Template Settings**
   - You'll now see the template editor with multiple fields
   - Give your template a name (e.g., "JsonGlance Feedback")
   - The Contact Form template already has some variables set up - we'll customize them

4. **Set up the "From" Section**
   - **From Name**: Change it to `{{from_name}}` (this will show the user's name)
   - **From Email**: This will use your connected email service automatically
   - If the Contact Form template has different variables, replace them with `{{from_name}}`

5. **Set up the "To" Section**
   - **To Email**: Enter YOUR email address where you want to receive feedback
     - Example: `your.email@gmail.com`
   - **To Name**: Enter `{{to_name}}` or just your name

6. **Configure the Subject Line**
   - Click on the **"Subject"** field
   - Replace the default subject with: `New JsonGlance Feedback from {{from_name}} - {{feedback_type}}`
   - This will create subjects like: "New JsonGlance Feedback from John Doe - Bug Report"

7. **Create the Email Body/Content**
   - The Contact Form template will have some default content
   - **REPLACE ALL THE CONTENT** in the message body
   - Click on the large **"Content"** text area
   - Copy and paste this template:

```
Hello JsonGlance Team,

You have received new feedback from your website!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FEEDBACK DETAILS:

Type: {{feedback_type}}
Name: {{from_name}}
Email: {{from_email}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MESSAGE:

{{message}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This feedback was automatically sent via the JsonGlance feedback form.
Reply directly to this email to contact the user.

Best regards,
JsonGlance Feedback System
```

8. **Configure Reply-To (Important!)**
   - Scroll down to find **"Reply To"** field
   - Enter: `{{from_email}}`
   - This allows you to reply directly to users by hitting "Reply" in your email

9. **Test Your Template**
   - Scroll to the bottom of the page
   - Click **"Test It"** button
   - Fill in test values:
     - `from_name`: Test User
     - `from_email`: test@example.com
     - `feedback_type`: Feature Request
     - `message`: This is a test message
     - `to_name`: JsonGlance Team
   - Click **"Send Test Email"**
   - Check your inbox to see how it looks!

10. **Save the Template**
   - Click the **"Save"** button at the top right
   - Your template is now active!

11. **Copy Your Template ID**
    - After saving, you'll see your **Template ID** at the top of the page
    - It looks like: `template_abc123xyz`
    - **COPY THIS ID** - you'll need it for step 5!

### Template Variables Explanation:

These are the dynamic variables that get replaced with actual data:

- `{{from_name}}` → User's name (e.g., "John Doe")
- `{{from_email}}` → User's email (e.g., "john@example.com")
- `{{feedback_type}}` → Type selected (e.g., "Bug Report", "Feature Request")
- `{{message}}` → The actual feedback message
- `{{to_name}}` → Your name or "JsonGlance Team"

### Pro Tips:

✅ **Use Reply-To**: Setting `{{from_email}}` in Reply-To lets you respond to users directly
✅ **Test First**: Always send a test email before going live
✅ **Format with line breaks**: Use empty lines to make emails more readable
✅ **Add context**: Include project name so you know which app the feedback is from
✅ **Keep it professional**: Your template represents your brand

### Example of What Users Will Receive (if you enable auto-reply):

If you want to send an automatic confirmation to users:
1. Create a SECOND template
2. Subject: `Thank you for your feedback - JsonGlance`
3. Content:
```
Hello {{from_name}},

Thank you for taking the time to send us your feedback!

We've received your {{feedback_type}} and will review it shortly.

Your message:
{{message}}

We appreciate your help in making JsonGlance better!

Best regards,
The JsonGlance Team
```
4. In your code, you can send TWO emails (one to you, one auto-reply to user)

## Step 4: Get Your Public Key

1. Go to **"Account"** → **"General"**
2. Find your **Public Key** (looks like: `abcd1234efgh5678`)
3. Copy it

## Step 5: Update Your Code

Open `src/screens/About.jsx` and replace these lines (around line 37-39):

```javascript
const SERVICE_ID = "YOUR_SERVICE_ID";  // Replace with your Service ID
const TEMPLATE_ID = "YOUR_TEMPLATE_ID"; // Replace with your Template ID
const PUBLIC_KEY = "YOUR_PUBLIC_KEY";   // Replace with your Public Key
```

Example:
```javascript
const SERVICE_ID = "service_abc123";
const TEMPLATE_ID = "template_xyz789";
const PUBLIC_KEY = "abcd1234efgh5678";
```

## Step 6: Test Your Form

1. Save the file
2. Refresh your app
3. Go to the About page
4. Fill out the feedback form
5. Click "Submit Feedback"
6. Check your email inbox!

## Template Variables Reference

Make sure your EmailJS template includes these variables:
- `{{from_name}}` - User's name
- `{{from_email}}` - User's email
- `{{feedback_type}}` - Type of feedback (feedback/bug/feature/question)
- `{{message}}` - The feedback message
- `{{to_name}}` - Will be "JsonGlance Team"

## Troubleshooting

### "Failed to send feedback" error:
1. Check that all three IDs are correct
2. Make sure your email service is connected in EmailJS dashboard
3. Check browser console for detailed error messages

### Not receiving emails:
1. Check your spam folder
2. Verify the template is published (not draft)
3. Make sure the "To Email" in your template is correct

### CORS errors:
- EmailJS handles CORS automatically, no configuration needed!

## Free Tier Limits

EmailJS free tier includes:
- 200 emails per month
- 2 email services
- 1 email template

This should be plenty for collecting user feedback!

## Need Help?

- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: https://www.emailjs.com/support/

---

Once configured, your feedback form will automatically send emails to your inbox whenever users submit feedback! 🎉
