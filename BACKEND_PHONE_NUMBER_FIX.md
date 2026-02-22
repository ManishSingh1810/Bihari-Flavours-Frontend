# Backend Phone Number Update Guide

## Issue
Phone number in auto-generated emails needs to be updated from `85211 754329` to `8521754329`.

---

## Files to Update in Backend

### 1. **Order Confirmation Email Template**

Search for any email templates that include the phone number. Common locations:

```
backend/utils/emailTemplates.js
backend/services/emailService.js
backend/controllers/orderController.js
```

### 2. **Find and Replace**

Search for these patterns in your backend codebase:

```bash
# Search for old phone number
grep -r "85211 754329" .
grep -r "85211754329" .
grep -r "9185211754329" .
```

### 3. **Update Email Templates**

**Old Phone Number Formats:**
- `+91 85211 754329`
- `85211754329`
- `9185211754329`
- `+9185211754329`

**New Phone Number (Correct):**
- `+91 8521754329`
- `8521754329`
- `918521754329`
- `+918521754329`

---

## Common Email Template Locations

### Example: Order Confirmation Email

```javascript
// ❌ OLD
const orderConfirmationEmail = `
  <p>Contact us:</p>
  <p>Phone: +91 85211 754329</p>
  <p>WhatsApp: https://wa.me/9185211754329</p>
`;

// ✅ NEW
const orderConfirmationEmail = `
  <p>Contact us:</p>
  <p>Phone: +91 8521754329</p>
  <p>WhatsApp: https://wa.me/918521754329</p>
`;
```

### Example: Order Status Update Email

```javascript
// ❌ OLD
const statusUpdateEmail = `
  <footer>
    <p>Need help? Call us at +91 85211 754329</p>
  </footer>
`;

// ✅ NEW
const statusUpdateEmail = `
  <footer>
    <p>Need help? Call us at +91 8521754329</p>
  </footer>
`;
```

---

## Steps to Fix

### 1. **Find All Occurrences**

```bash
cd /path/to/backend
grep -r "85211" . --include="*.js"
```

### 2. **Update Each File**

Replace all instances with the correct number: `8521754329`

### 3. **Common Files to Check**

- `utils/emailTemplates.js` or `utils/email.js`
- `services/emailService.js`
- `controllers/orderController.js`
- `config/constants.js` (if phone is stored as constant)
- `.env` file (if phone is environment variable)

### 4. **Test Emails**

After updating:
1. Place a test order
2. Check the confirmation email
3. Update order status
4. Check status update email
5. Verify phone number is correct

---

## If Phone is in Environment Variable

### `.env` file

```bash
# ❌ OLD
SUPPORT_PHONE=85211754329
WHATSAPP_NUMBER=9185211754329

# ✅ NEW
SUPPORT_PHONE=8521754329
WHATSAPP_NUMBER=918521754329
```

---

## If Phone is in Constants

### `config/constants.js`

```javascript
// ❌ OLD
module.exports = {
  SUPPORT_PHONE: '+91 85211 754329',
  WHATSAPP_LINK: 'https://wa.me/9185211754329',
};

// ✅ NEW
module.exports = {
  SUPPORT_PHONE: '+91 8521754329',
  WHATSAPP_LINK: 'https://wa.me/918521754329',
};
```

---

## Verification Checklist

- [ ] Order confirmation email
- [ ] Order status update email
- [ ] Shipping notification email
- [ ] Delivery confirmation email
- [ ] Support/Contact emails
- [ ] Email footer/signature
- [ ] WhatsApp links in emails
- [ ] Test all email types

---

## Frontend Status
✅ **Already Fixed:**
- Footer contact section
- Privacy Policy page
- Terms page
- WhatsApp button link

---

## Deploy
After updating backend files:
1. Commit changes
2. Push to repository
3. Deploy to production
4. Test by placing order and checking email

---

## Quick Search Commands

```bash
# Find all files with old phone
grep -r "85211 754329" .
grep -r "9185211754329" .

# Find email template files
find . -name "*email*" -type f
find . -name "*mail*" -type f
find . -name "*template*" -type f
```
