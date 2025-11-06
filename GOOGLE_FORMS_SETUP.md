# Google Forms Setup Guide for JsonGlance Feedback

## Much Simpler Than EmailJS! 🎉

This method is way easier - just 5 minutes to set up!

---

## Step 1: Create Your Google Form

1. Go to [Google Forms](https://forms.google.com/)
2. Click **"+ Blank"** to create a new form
3. Give it a title: **"JsonGlance Feedback"**
4. Add a description (optional): "Help us improve JsonGlance!"

---

## Step 2: Add Form Fields

Add these 4 fields in order:

### Field 1: Name
- Click **"+"** to add a question
- Question: **"Name"**
- Type: **Short answer**
- Toggle **"Required"** ON

### Field 2: Email
- Click **"+"** to add another question
- Question: **"Email"**
- Type: **Short answer**
- Click the three dots (⋮) → **"Response validation"**
  - Select: **"Text"** → **"Email"**
- Toggle **"Required"** ON

### Field 3: Feedback Type
- Click **"+"** to add another question
- Question: **"Type"**
- Type: **Multiple choice**
- Add these options:
  - General Feedback
  - Bug Report
  - Feature Request
  - Question
- Toggle **"Required"** ON

### Field 4: Message
- Click **"+"** to add another question
- Question: **"Message"**
- Type: **Paragraph**
- Toggle **"Required"** ON

---

## Step 3: Get Your Form URL and Entry IDs

### 3a. Get the Form Action URL

1. Click the **"Send"** button (top right)
2. Click the **link icon** (🔗)
3. **Copy the URL** (looks like: `https://docs.google.com/forms/d/e/1FAIp.../viewform`)
4. **IMPORTANT**: Replace `/viewform` with `/formResponse`
5. Your final URL should look like: `https://docs.google.com/forms/d/e/1FAIp.../formResponse`

### 3b. Get Entry IDs for Each Field

1. Open your form in **edit mode**
2. Click **"Preview"** (eye icon at top)
3. Right-click anywhere on the preview page → **"View Page Source"** or press `Ctrl+U` (Windows) / `Cmd+Option+U` (Mac)
4. Press `Ctrl+F` (Windows) / `Cmd+F` (Mac) to search
5. Search for: **"entry."**
6. You'll see entries like:
   ```
   entry.123456789    ← This is for your Name field
   entry.987654321    ← This is for your Email field
   entry.555555555    ← This is for your Type field
   entry.111111111    ← This is for your Message field
   ```
7. **Write down all 4 entry IDs** - you'll need them in the next step!

**Pro Tip**: The entry IDs appear in the same order as your form fields.

---

## Step 4: Update Your Code

Open `src/screens/About.jsx` and find these lines (around line 36-45):

### Replace This:
```javascript
const GOOGLE_FORM_ACTION_URL = "YOUR_GOOGLE_FORM_URL_HERE";

const ENTRY_NAME = "entry.123456789";
const ENTRY_EMAIL = "entry.987654321";
const ENTRY_TYPE = "entry.555555555";
const ENTRY_MESSAGE = "entry.111111111";
```

### With Your Actual Values:
```javascript
const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/d/e/YOUR_ACTUAL_FORM_ID/formResponse";

const ENTRY_NAME = "entry.YOUR_ACTUAL_NAME_ENTRY_ID";
const ENTRY_EMAIL = "entry.YOUR_ACTUAL_EMAIL_ENTRY_ID";
const ENTRY_TYPE = "entry.YOUR_ACTUAL_TYPE_ENTRY_ID";
const ENTRY_MESSAGE = "entry.YOUR_ACTUAL_MESSAGE_ENTRY_ID";
```

**Example with real values**:
```javascript
const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc_ABC123xyz/formResponse";

const ENTRY_NAME = "entry.742532194";
const ENTRY_EMAIL = "entry.158394756";
const ENTRY_TYPE = "entry.923847561";
const ENTRY_MESSAGE = "entry.384756192";
```

---

## Step 5: Test It!

1. Save your `About.jsx` file
2. Refresh your JsonGlance app
3. Go to the About page
4. Fill out the feedback form
5. Click "Submit Feedback"
6. Go back to your Google Form → Click **"Responses"** tab
7. You should see your test submission! 🎉

---

## Viewing Feedback Submissions

### In Google Forms:
1. Open your form
2. Click the **"Responses"** tab
3. View all submissions in:
   - **Summary** - Charts and stats
   - **Individual** - One response at a time
   - **Spreadsheet** - Export to Google Sheets

### Get Email Notifications (Optional):
1. In your Google Form, click **"Responses"** tab
2. Click the three dots (⋮) → **"Get email notifications for new responses"**
3. You'll receive an email every time someone submits feedback!

---

## Troubleshooting

### "Failed to send feedback" message:
- ✅ Double-check your form URL ends with `/formResponse` (not `/viewform`)
- ✅ Make sure all entry IDs are correct
- ✅ Verify all 4 fields in your Google Form are marked as "Required"

### Submissions not showing up:
- ✅ Check your Google Form's "Responses" tab
- ✅ Make sure you're using the correct form URL
- ✅ Try submitting directly through the Google Form preview to test

### Need to change field order:
- Edit your Google Form and drag fields to reorder
- The entry IDs stay the same, so no code changes needed!

---

## Advantages of Google Forms

✅ **Super Easy Setup** - No API keys, no authentication, no complicated configuration
✅ **Free Forever** - Unlimited submissions
✅ **Automatic Storage** - All feedback saved in Google Forms
✅ **Export to Sheets** - One click to view in Google Sheets
✅ **Email Notifications** - Get notified of new submissions
✅ **No Backend Needed** - Works entirely from your React app
✅ **Reliable** - Google's infrastructure handles everything

---

## That's It! 🎉

Your feedback form is now connected to Google Forms. Every submission will appear in your Google Form responses, and you can optionally get email notifications for each one.

**Questions?** Open an issue on GitHub or check Google Forms help documentation.
