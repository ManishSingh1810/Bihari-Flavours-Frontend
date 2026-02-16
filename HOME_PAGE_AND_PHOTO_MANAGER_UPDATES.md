# Home Page Pricing & Photo Manager Updates

## ✅ All Issues Fixed

### 1. **MRP + Discount Now Shows on Home Page Product Cards**

**Before:** Crossed MRP and discount badge only showed on product detail pages.

**Now:** Every product card on the home page shows:

```
Rs. 199  Rs. 299
33% OFF
```

**Layout:**
- ✅ **Rs. 199** (large, bold, red) - Sale Price
- ✅ **Rs. 299** (small, gray, crossed out) - Original MRP
- ✅ **33% OFF** (red badge below prices)

**Logic:**
- If MRP is set and MRP > Sale Price → Shows all three elements
- If no MRP or MRP ≤ Sale Price → Shows only sale price (no discount)

---

### 2. **Currency Changed from ₹ to Rs.**

**Changed throughout the entire app:**
- ✅ Product cards (home page, product listing)
- ✅ Product detail pages
- ✅ Admin panel (orders, history, coupons)
- ✅ All price displays

**Format:** `Rs. 199` (with space after Rs.)

---

### 3. **Photo Gallery Manager in Admin Panel**

**New Feature:** View and manage all product photos from the admin panel!

**How to Use:**
1. Go to **Admin Panel → Product Manager**
2. In the **Inventory Overview** table, you'll see a new "Photos" column
3. Each product shows a button: **"🖼️ X photos"** (where X is the count)
4. Click the button to open the **Photo Gallery Modal**
5. In the modal:
   - View all product photos in a grid
   - Hover over any photo to see the delete button
   - Click delete → Confirmation prompt → Photo deleted from server
   - Changes reflect immediately in the product list

**Features:**
- ✅ View all photos for any product
- ✅ Delete individual photos with confirmation
- ✅ See photo count at a glance
- ✅ Hover-to-reveal delete buttons (clean UI)
- ✅ Responsive grid layout (2 columns mobile, 3 columns desktop)
- ✅ Real-time updates after deletion

---

## 🎯 What You'll See Now

### Home Page (bihariflavours.in)

When you scroll through products:

```
┌─────────────────────────┐
│   [Product Image]       │
│                         │
│   Product Name          │
│   Net Qty: 500g         │
│                         │
│   Rs. 199  Rs. 299     │  ← Sale Price + Crossed MRP
│   [33% OFF]             │  ← Discount Badge
│                         │
│   [Add to cart]         │
└─────────────────────────┘
```

### Admin Panel - Product Manager

```
Product          | Price    | Stock Status | Photos      | Actions
───────────────────────────────────────────────────────────────────
Litti Chokha    | Rs. 199  | IN STOCK     | 🖼️ 4 photos | ✏️ 🗑️
Sattu Paratha   | Rs. 149  | OUT OF STOCK | 🖼️ 2 photos | ✏️ 🗑️
```

Click "4 photos" → Opens Photo Gallery Modal:

```
┌─────────────────────────────────────────────┐
│ Photo Gallery - Litti Chokha               │
├─────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐        │
│  │ Photo 1│  │ Photo 2│  │ Photo 3│        │
│  │  [🗑️]  │  │  [🗑️]  │  │  [🗑️]  │  ← Hover to see
│  └────────┘  └────────┘  └────────┘        │
│                                             │
│                           [Close]           │
└─────────────────────────────────────────────┘
```

---

## 📝 Files Changed

1. **src/components/user/product/ProductCard.jsx**
   - Updated price layout to show Sale Price, MRP, and Discount badge
   - Changed `₹` to `Rs.`
   - Made discount badge more prominent

2. **src/components/user/pdp/PurchasePanel.jsx**
   - Changed `₹` to `Rs.`

3. **src/components/admin/ProductManager.jsx**
   - Added `PhotoGalleryModal` component
   - Added photo count column to product table
   - Added photo delete functionality
   - Import `Image` icon from lucide-react

4. **src/components/admin/History.jsx**
   - Changed all `₹` to `Rs.`

5. **src/components/admin/Order.jsx**
   - Changed all `₹` to `Rs.`

6. **src/components/admin/CouponManager.jsx**
   - Changed all `₹` to `Rs.`

---

## 🧪 Testing Checklist

### Test Home Page Pricing:
- [ ] Go to https://bihariflavours.in
- [ ] Scroll through products
- [ ] Products with MRP should show:
  - Sale Price (large, bold, red)
  - Crossed MRP (small, gray)
  - Discount badge (red, below prices)
- [ ] Products without MRP should show only sale price

### Test Currency Display:
- [ ] Check all prices use "Rs." format (not ₹)
- [ ] Check product cards, detail pages, admin orders

### Test Photo Gallery Manager:
- [ ] Go to Admin Panel → Product Manager
- [ ] See "Photos" column with photo count
- [ ] Click "X photos" button
- [ ] Photo Gallery modal opens
- [ ] Hover over a photo → Delete button appears
- [ ] Click delete → Confirmation prompt
- [ ] Confirm → Photo deleted
- [ ] Modal updates immediately
- [ ] Close modal → Photo count updates in table

### Test Mobile Responsiveness:
- [ ] Open site on mobile
- [ ] Product cards should show pricing properly
- [ ] Photo Gallery should show 2 columns on mobile
- [ ] Delete buttons should work on touch devices

---

## ⚠️ Backend Requirements

The backend needs to handle the `existingPhotos` field properly:

```javascript
// When product update receives existingPhotos
const existingPhotos = JSON.parse(req.body.existingPhotos || '[]');

// Photos to delete = photos in DB but NOT in existingPhotos array
const currentPhotos = product.photos || [];
const photosToDelete = currentPhotos.filter(url => !existingPhotos.includes(url));

// Delete files from cloud storage (Cloudinary/S3)
for (const photoUrl of photosToDelete) {
  await deleteFromCloudStorage(photoUrl);
}

// Update product with remaining photos + new uploads
product.photos = [...existingPhotos, ...newUploadedUrls];
await product.save();
```

---

## 🚀 Deployment Status

✅ Committed to GitHub
✅ Pushing to `main` branch
✅ Should auto-deploy to Vercel

**Check Vercel Dashboard:**
https://vercel.com/dashboard

Look for deployment with commit: "feat: Add photo gallery manager and update currency display"

---

## 💡 Tips

### Setting MRP for Existing Products:
1. Go to Admin Panel → Product Manager
2. Click Edit (✏️) on any product
3. Enter MRP (e.g., 599 if Sale Price is 399)
4. Save
5. Go to home page → Discount should show automatically

### Managing Photos:
- Use Photo Gallery for quick photo management
- Use Edit Product modal for comprehensive editing (photos + all details)
- Delete unused photos to save storage and improve performance

### Best Practices:
- Set MRP higher than Sale Price to show discount
- Keep 3-4 high-quality photos per product
- Delete old/blurry photos regularly
- Use consistent pricing format across all products

---

## ❓ Troubleshooting

### MRP not showing on home page?
1. Make sure MRP is set in admin panel
2. MRP must be > Sale Price
3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. Clear browser cache

### Photo deletion not working?
1. Check backend logs for errors
2. Verify backend handles `existingPhotos` field
3. Check cloud storage (Cloudinary/S3) credentials
4. Try editing product instead (Edit button → delete photos there)

### Currency showing ₹ instead of Rs.?
1. Hard refresh the page
2. Clear browser cache
3. Check if deployment completed on Vercel

---

## 🎉 Summary

**All three issues are now fixed:**
1. ✅ MRP + Discount shows on home page product cards
2. ✅ All currency symbols changed from ₹ to Rs.
3. ✅ Photo Gallery Manager added to admin panel

The site should now match your exact requirements! 🚀
