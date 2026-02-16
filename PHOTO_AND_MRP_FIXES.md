# Photo Deletion & MRP Display Fixes

## ✅ Issues Fixed

### 1. **Delete Existing Photos When Editing Products**

**Problem:** When editing a product, you could only see new photos being uploaded, but couldn't delete existing photos from the server.

**Solution:**
- ✅ Existing photos now display with a **red border** and "Saved" badge
- ✅ New photos display with a **green border** and "New" badge
- ✅ Each photo has a delete button (red X)
- ✅ Frontend sends `existingPhotos` array to backend with only the photos you want to KEEP
- ✅ Backend needs to handle the `existingPhotos` field to delete unwanted photos

### 2. **MRP Shows on Home Page Product Cards**

**Problem:** You wanted the crossed-out MRP to show on the home page, not just product detail pages.

**Solution:**
- ✅ ProductCard component already has the logic implemented
- ✅ If MRP > Sale Price: Shows crossed MRP + discount badge
- ✅ If no MRP or MRP ≤ Sale Price: Shows only sale price
- ✅ Works for products with and without variants

---

## 🎯 How to Use

### Editing Product Photos:

1. Go to **Admin Panel → Product Manager**
2. Click **Edit** on any product
3. You'll see:
   - **Existing photos** (red border, "Saved" badge)
   - **New photos** you're uploading (green border, "New" badge)
4. Click the **red X button** on any photo to delete it
5. Click **Save changes** - the backend will:
   - Keep photos in `existingPhotos` array
   - Delete photos NOT in `existingPhotos` array
   - Add new photos from the file upload

### Setting MRP Prices:

1. Go to **Admin Panel → Product Manager**
2. When adding/editing a product:
   - **Sale Price**: The price customer pays (e.g., ₹399)
   - **MRP**: The original/crossed price (e.g., ₹599) - **Optional**
3. For products with variants:
   - Each variant can have its own MRP
   - You can also set product-level MRP as fallback

### Frontend Display:

**Home Page & Product Listing:**
- If MRP is set and > Sale Price:
  ```
  ₹599 (crossed out, muted)
  ₹399 (bold, red)
  [20% OFF badge]
  ```
- If no MRP or MRP ≤ Sale Price:
  ```
  ₹399 (bold, black)
  ```

---

## ⚠️ Backend Changes Required

The backend needs to handle the `existingPhotos` field in the product update endpoint:

```javascript
// Example backend logic needed:
app.put('/products/:id', async (req, res) => {
  const { existingPhotos } = req.body;
  
  // Parse existingPhotos if it's a string
  const photosToKeep = typeof existingPhotos === 'string' 
    ? JSON.parse(existingPhotos) 
    : (existingPhotos || []);
  
  // Get current product photos
  const product = await Product.findById(req.params.id);
  const currentPhotos = product.photos || [];
  
  // Find photos to delete (photos in DB but NOT in existingPhotos)
  const photosToDelete = currentPhotos.filter(
    photo => !photosToKeep.includes(photo)
  );
  
  // Delete files from storage (Cloudinary/S3/filesystem)
  for (const photoUrl of photosToDelete) {
    await deletePhotoFromStorage(photoUrl);
  }
  
  // Combine existing photos + new uploaded photos
  const newPhotos = req.files?.photos || [];
  const finalPhotos = [...photosToKeep, ...newPhotos.map(f => f.path)];
  
  // Update product
  product.photos = finalPhotos;
  await product.save();
});
```

---

## 🧪 Testing Checklist

### Photo Deletion:
- [ ] Edit a product with 3 photos
- [ ] Delete 1 existing photo
- [ ] Upload 1 new photo
- [ ] Save → Should have 3 photos total (2 old + 1 new)
- [ ] Refresh page → Verify deleted photo is gone

### MRP Display on Home Page:
- [ ] Create a product with Sale Price = ₹399, MRP = ₹599
- [ ] Go to home page
- [ ] Product card should show:
  - ₹599 (small, gray, crossed)
  - ₹399 (large, bold, red)
  - "33% OFF" badge
- [ ] Create a product with only Sale Price (no MRP)
- [ ] Product card should show only ₹399 (bold, black)

### MRP Display on Product Detail Page:
- [ ] Click on a product with MRP
- [ ] Should show same MRP display as home page
- [ ] Select different variant → MRP should update

---

## 📝 Files Changed

1. **src/components/admin/ProductManager.jsx**
   - Added `existingPhotos` state
   - Added `removeExistingPhoto` handler
   - Updated `openEdit` to load existing photos
   - Updated `onEditSubmit` to send `existingPhotos` to backend
   - Updated `EditProductModal` to show existing + new photos

2. **src/components/user/product/ProductCard.jsx**
   - Already has MRP display logic (no changes needed)
   - Uses `getDisplayMRP()` and `calculateDiscount()` from utils

3. **src/utils/variants.js**
   - Already has helper functions (no changes needed)
   - `getDisplayMRP()` - gets MRP for any product type
   - `calculateDiscount()` - calculates discount percentage

---

## 🚀 Deployment

Changes pushed to GitHub → Should auto-deploy to Vercel.

Check Vercel Dashboard: https://vercel.com/dashboard
- Look for deployment with commit: "feat: Enable deleting existing photos when editing products"

---

## ❓ Troubleshooting

### MRP not showing on home page?
1. Check if MRP is actually saved in database
2. Open browser console → Check if product has `mrp` field
3. Verify MRP > Sale Price (otherwise won't show)
4. Hard refresh page (Cmd+Shift+R / Ctrl+Shift+R)

### Can't delete photos?
1. Check backend logs - is `existingPhotos` being received?
2. Backend needs to implement photo deletion logic (see above)
3. Check if backend is handling multipart form data correctly

### Photos not uploading?
1. Check file size limits (frontend + backend)
2. Check backend file upload middleware (multer/busboy)
3. Check storage service (Cloudinary/S3) credentials
