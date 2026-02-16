# Quick Fix Guide - MRP Display & Photo Deletion

## 🔧 Issue 1: MRP Not Showing on Home Page

### Why It's Not Showing
Your products **don't have MRP values saved in the database yet**. The code is working correctly, but the products need MRP to be set first.

### How to Fix (Step by Step):

#### For Products with Variants (like "Chana Sattu" with 500g):

1. **Go to Admin Panel → Product Manager**
2. **Click Edit (✏️)** on "Chana Sattu"
3. **Check the "Has variants" checkbox** (should already be checked)
4. **You'll see:**
   ```
   LABEL    SALE PRICE    MRP (Optional)    STOCK
   500g     199           299               10000
   ```
5. **Enter MRP = 299** in the MRP column (currently showing blank)
6. **Click "Save changes"**
7. **Go to home page** → You should now see:
   ```
   Rs. 199  Rs. 299
   33% OFF
   ```

#### For Products without Variants:

1. **Go to Admin Panel → Product Manager**
2. **Click Edit (✏️)** on any product
3. **Look for the "MRP - Original Price" field** (near the top)
4. **Enter MRP** (must be higher than Sale Price)
   - Example: Sale Price = 199, MRP = 299
5. **Click "Save changes"**
6. **Go to home page** → Discount should show!

### Quick Visual Check in Admin:

I've added a **visual indicator** in the Product Manager table:

```
Product          | Price            | Stock Status
─────────────────────────────────────────────────
Chana Sattu     | Rs. 199          | IN STOCK
                | MRP: Rs. 299 ✓   |
                
Thekua          | Rs. 249          | IN STOCK
                | No MRP set       |  ← NEEDS MRP!
```

**Green text "MRP: Rs. 299 ✓"** = Discount will show on homepage ✅
**Gray text "No MRP set"** = Only sale price shows (no discount) ❌

---

## 🔧 Issue 2: Photos Not Deleting

### What I Fixed:

**Problem:** The code wasn't sending `existingPhotos` when the array was empty, so the backend didn't know to delete photos.

**Solution:** Now it ALWAYS sends the `existingPhotos` array (even if empty) so the backend knows exactly which photos to keep and which to delete.

### How It Works Now:

1. **Open Edit Product modal**
2. **You see existing photos with red border and "Saved" badge**
3. **Click the X button** on any photo → Photo removed from list
4. **Click "Save changes"**
5. **Backend receives:**
   ```json
   {
     "existingPhotos": ["photo1.jpg", "photo3.jpg"],  // photo2.jpg removed!
     "photos": [newPhoto.jpg]  // New uploads
   }
   ```
6. **Backend should:**
   - Keep photo1.jpg and photo3.jpg
   - Delete photo2.jpg from cloud storage
   - Add newPhoto.jpg

### Debug Console Logs:

Open browser console (F12) when editing products to see:
- `Removing photo from state: [photoUrl]`
- `Updated existingPhotos: [array]`
- `Sending existingPhotos: [array]`

---

## 🧪 Testing Steps

### Test 1: Add MRP to "Chana Sattu"

1. ✅ Go to Admin → Edit "Chana Sattu"
2. ✅ In variants section, set MRP = 299 (Sale Price = 199)
3. ✅ Save
4. ✅ Go to home page
5. ✅ Should see:
   ```
   Rs. 199  Rs. 299
   33% OFF
   ```

### Test 2: Delete a Photo

1. ✅ Go to Admin → Edit any product
2. ✅ You should see existing photos with red border + "Saved" badge
3. ✅ Click X on one photo
4. ✅ Photo disappears from list immediately
5. ✅ Click "Save changes"
6. ✅ Check browser console for logs
7. ✅ Refresh page → Edit product again
8. ✅ Deleted photo should be gone permanently

### Test 3: Add New Photo + Keep Old Ones

1. ✅ Go to Admin → Edit product
2. ✅ Keep existing photos (don't delete)
3. ✅ Upload 1 new photo
4. ✅ Save
5. ✅ Edit again → Should have old photos + new photo

---

## ⚠️ Important Backend Requirements

Your backend MUST handle the `existingPhotos` field:

```javascript
// Example backend code (Node.js/Express):
router.put('/products/:id', upload.array('photos'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    // Parse existingPhotos from request
    const existingPhotos = req.body.existingPhotos 
      ? JSON.parse(req.body.existingPhotos) 
      : [];
    
    // Get current photos from database
    const currentPhotos = product.photos || [];
    
    // Find photos to delete (in DB but NOT in existingPhotos)
    const photosToDelete = currentPhotos.filter(
      photoUrl => !existingPhotos.includes(photoUrl)
    );
    
    // Delete from cloud storage (Cloudinary/S3/etc)
    for (const photoUrl of photosToDelete) {
      await deleteFromCloudStorage(photoUrl);
      console.log('Deleted:', photoUrl);
    }
    
    // Get new uploaded photo URLs
    const newPhotoUrls = req.files.map(file => file.path);
    
    // Final photos = existing (kept) + new uploads
    product.photos = [...existingPhotos, ...newPhotoUrls];
    
    await product.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```

---

## 📊 Expected Results

### Home Page - BEFORE Setting MRP:
```
┌─────────────────────────┐
│   [Product Image]       │
│   Chana Sattu          │
│   Rs. 199              │  ← Only sale price
│   [Add to cart]        │
└─────────────────────────┘
```

### Home Page - AFTER Setting MRP:
```
┌─────────────────────────┐
│   [Product Image]       │
│   Chana Sattu          │
│   Rs. 199  Rs. 299     │  ← Sale + Crossed MRP
│   [33% OFF]            │  ← Discount badge
│   [Add to cart]        │
└─────────────────────────┘
```

---

## 🎯 Summary of Changes

### What I Fixed:

1. ✅ **Always send `existingPhotos` array** (even if empty)
2. ✅ **Added console logging** for debugging photo deletion
3. ✅ **Added visual MRP indicator** in admin product table
4. ✅ **Added debug logging** in ProductCard to see MRP values

### What You Need to Do:

1. **Set MRP for your products** (see steps above)
2. **Check backend handles `existingPhotos`** (see code example above)
3. **Test photo deletion** with console open (F12)
4. **Refresh home page** to see discounts

---

## ❓ Still Not Working?

### MRP Not Showing:
1. Open browser console (F12)
2. Go to home page
3. Look for logs: `Product: Chana Sattu { price: 199, mrp: 299, ... }`
4. If `mrp: 0` → MRP not saved in database
5. If `hasDiscount: false` → MRP must be > Sale Price

### Photos Not Deleting:
1. Open browser console (F12)
2. Edit product → Delete photo
3. Look for logs:
   - `Removing photo from state: ...`
   - `Updated existingPhotos: ...`
   - `Sending existingPhotos: ...`
4. Check Network tab → PUT request → Form Data → `existingPhotos` field
5. If backend error → Check backend logs

---

## 🚀 Next Steps

1. **Deploy these fixes** (already pushed to GitHub)
2. **Check Vercel deployment** completes
3. **Set MRP for all products** via admin panel
4. **Test photo deletion** with 1-2 products
5. **Verify home page shows discounts** for products with MRP

Let me know if you see the discounts after setting MRP! 🎉
