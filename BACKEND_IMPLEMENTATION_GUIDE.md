# Backend Implementation Requirements for Bihari Flavours

## ⚠️ CRITICAL ISSUE - MRP Not Showing on Home Page

**Problem:** 
- Product detail page shows MRP and discount (Rs. 349 crossed, 37% OFF) ✅
- Home page does NOT show MRP and discount ❌

**Root Cause:** 
The `GET /products` endpoint (used by home page) is **not returning the `mrp` field** in the response.

**Impact:**
Users see discounts only when they click on a product, not on the home page. This reduces conversion rates.

---

## 🎯 Fix Priority

### **FIX THIS FIRST (5 minutes):**
1. ✅ GET /products endpoint - Include `mrp` field in response
2. ✅ GET /products/:id endpoint - Include `mrp` field in response
3. ✅ Test: Visit home page → products should show crossed MRP + discount badge

### **FIX THIS SECOND (30 minutes):**
1. ✅ PUT /products/:id endpoint - Handle photo deletion with `existingPhotos` field
2. ✅ Delete removed photos from Cloudinary/S3
3. ✅ Test: Edit product → delete photo → verify it's gone from cloud storage

---

## 📊 Quick Comparison

| Endpoint | Current Behavior | Expected Behavior |
|----------|------------------|-------------------|
| `GET /products` | Returns products **without** `mrp` ❌ | Should return products **with** `mrp` ✅ |
| `GET /products/:id` | Returns product **with** `mrp` ✅ | Keep as is ✅ |
| `PUT /products/:id` | Doesn't delete photos from cloud ❌ | Should delete removed photos ✅ |

---

## 🔍 How to Verify the Issue

**Test in Postman/Browser:**
```bash
# 1. Get all products (home page uses this)
GET http://your-backend.com/products

# Response should include mrp:
{
  "products": [
    {
      "name": "Jaljeera Chana Sattu",
      "price": 220,
      "mrp": 349,  // ← Check if this exists!
      ...
    }
  ]
}

# 2. Get single product (detail page uses this)
GET http://your-backend.com/products/PRODUCT_ID

# Response should include mrp:
{
  "product": {
    "name": "Jaljeera Chana Sattu",
    "price": 220,
    "mrp": 349,  // ← This probably works already
    ...
  }
}
```

---

## Overview
The frontend needs two backend fixes:
1. **GET /products endpoint must include `mrp` field** (for discount display on home page)
2. **PUT /products/:id must handle photo deletion** (when products are edited)

---

## 🔧 Required Backend Changes

### 1. **CRITICAL FIX: GET /products Endpoint - Include MRP Field**

**Current Issue:** The home page products don't show MRP/discount because GET /products is not returning the `mrp` field.

**Required Change:** Ensure `mrp` is included in the response.

**One-Line Fix (if using `.select()`):**
```javascript
// BEFORE (missing mrp):
.select('name description price photos quantity ...')

// AFTER (includes mrp):
.select('name description price mrp photos quantity ...')
//                          ^^^ Add this!
```

**Full Implementation:**

```javascript
// GET /products (List all products)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find()
      .select('name description price mrp photos quantity netQuantity shelfLife ingredients storage displayOrder productType showInCombosSection comboPriceMode comboDiscount comboItems variants')  // ← Include mrp here
      .sort({ displayOrder: 1, createdAt: -1 });
    
    // IMPORTANT: Make sure mrp is in the response
    res.json({ 
      success: true, 
      products: products 
    });
    
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products' 
    });
  }
});

// GET /products/:id (Single product)
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // IMPORTANT: Make sure mrp is in the response
    // (Mongoose returns all fields by default, but if you're using .select(), include mrp)
    res.json({ 
      success: true, 
      product: product 
    });
    
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch product' 
    });
  }
});
```

**Debug Check:**
```javascript
// After fetching products, log to verify mrp is present
const products = await Product.find();
console.log('Sample product:', {
  name: products[0]?.name,
  price: products[0]?.price,
  mrp: products[0]?.mrp,  // ← Should show the MRP value, not undefined
  variants: products[0]?.variants?.map(v => ({ 
    label: v.label, 
    price: v.price, 
    mrp: v.mrp 
  }))
});
```

---

### 2. Product Update Endpoint (PUT /products/:id)

**Current Issue:** When photos are deleted via the Edit Product modal, the backend doesn't delete them from cloud storage.

**Required Change:** Handle the `existingPhotos` field to determine which photos to delete.

---

## 📝 Implementation Code

### Node.js/Express Example:

```javascript
// PUT /products/:id
router.put('/products/:id', upload.array('photos', 10), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // ============================================
    // PHOTO DELETION LOGIC (NEW)
    // ============================================
    
    // Parse existingPhotos from request body
    let existingPhotos = [];
    if (req.body.existingPhotos) {
      try {
        existingPhotos = JSON.parse(req.body.existingPhotos);
      } catch (err) {
        console.error('Error parsing existingPhotos:', err);
      }
    }
    
    console.log('Existing photos to keep:', existingPhotos);
    
    // Get current photos from database
    const currentPhotos = product.photos || [];
    console.log('Current photos in DB:', currentPhotos);
    
    // Find photos to delete (photos in DB but NOT in existingPhotos array)
    const photosToDelete = currentPhotos.filter(
      photoUrl => !existingPhotos.includes(photoUrl)
    );
    
    console.log('Photos to delete:', photosToDelete);
    
    // Delete photos from cloud storage
    if (photosToDelete.length > 0) {
      for (const photoUrl of photosToDelete) {
        try {
          // CLOUDINARY EXAMPLE:
          // Extract public_id from URL
          // Example URL: https://res.cloudinary.com/yourcloud/image/upload/v123456/products/abc123.jpg
          const publicId = extractPublicId(photoUrl); // See helper function below
          await cloudinary.uploader.destroy(publicId);
          console.log('Deleted from Cloudinary:', publicId);
          
          // AWS S3 EXAMPLE:
          // const key = photoUrl.split('.com/')[1]; // Extract key from URL
          // await s3.deleteObject({ Bucket: 'your-bucket', Key: key }).promise();
          // console.log('Deleted from S3:', key);
          
        } catch (deleteErr) {
          console.error('Error deleting photo:', photoUrl, deleteErr);
          // Continue deleting other photos even if one fails
        }
      }
    }
    
    // Get new uploaded photo URLs
    const newPhotoUrls = req.files ? req.files.map(file => file.path) : [];
    console.log('New uploaded photos:', newPhotoUrls);
    
    // Combine: existing photos (kept) + new uploads
    product.photos = [...existingPhotos, ...newPhotoUrls];
    console.log('Final photos array:', product.photos);
    
    // ============================================
    // UPDATE OTHER FIELDS (EXISTING CODE)
    // ============================================
    
    if (req.body.name) product.name = req.body.name;
    if (req.body.desc) product.description = req.body.desc;
    if (req.body.price) product.price = req.body.price;
    
    // MRP field (IMPORTANT FOR DISCOUNT DISPLAY)
    if (req.body.mrp !== undefined) {
      product.mrp = req.body.mrp;
    }
    
    if (req.body.quantity) product.quantity = req.body.quantity;
    if (req.body.netQuantity) product.netQuantity = req.body.netQuantity;
    if (req.body.shelfLife) product.shelfLife = req.body.shelfLife;
    if (req.body.ingredients) product.ingredients = req.body.ingredients;
    if (req.body.storage) product.storage = req.body.storage;
    if (req.body.displayOrder) product.displayOrder = req.body.displayOrder;
    if (req.body.productType) product.productType = req.body.productType;
    if (req.body.showInCombosSection) product.showInCombosSection = req.body.showInCombosSection === 'true';
    if (req.body.comboPriceMode) product.comboPriceMode = req.body.comboPriceMode;
    if (req.body.comboDiscount) product.comboDiscount = req.body.comboDiscount;
    
    // Variants (IMPORTANT: Each variant can have its own MRP)
    if (req.body.variants) {
      try {
        const variants = JSON.parse(req.body.variants);
        // Make sure each variant has price, mrp, stock, label fields
        product.variants = variants.map(v => ({
          label: v.label,
          price: v.price,
          mrp: v.mrp || 0,  // IMPORTANT: Store MRP for each variant
          stock: v.stock,
          isDefault: v.isDefault || false
        }));
      } catch (err) {
        console.error('Error parsing variants:', err);
      }
    }
    
    // Combo items
    if (req.body.comboItems) {
      try {
        product.comboItems = JSON.parse(req.body.comboItems);
      } catch (err) {
        console.error('Error parsing comboItems:', err);
      }
    }
    
    await product.save();
    
    res.json({ 
      success: true, 
      message: 'Product updated successfully',
      product: product 
    });
    
  } catch (err) {
    console.error('Product update error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to update product' 
    });
  }
});
```

---

### Helper Function for Cloudinary:

```javascript
// Helper function to extract public_id from Cloudinary URL
function extractPublicId(cloudinaryUrl) {
  try {
    // Example URL: https://res.cloudinary.com/yourcloud/image/upload/v123456/products/abc123.jpg
    // We need: products/abc123
    
    const parts = cloudinaryUrl.split('/upload/');
    if (parts.length < 2) return null;
    
    const pathWithVersion = parts[1];
    // Remove version number (v123456/)
    const pathParts = pathWithVersion.split('/');
    pathParts.shift(); // Remove version
    
    // Join remaining parts and remove extension
    const publicId = pathParts.join('/').replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (err) {
    console.error('Error extracting public_id:', err);
    return null;
  }
}
```

---

### Alternative: Using Cloudinary's Helper

```javascript
const cloudinary = require('cloudinary').v2;

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Delete photo function
async function deletePhotoFromCloudinary(photoUrl) {
  try {
    // Extract public_id from URL
    const urlParts = photoUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.split('.')[0];
    
    // Delete from cloudinary
    const result = await cloudinary.uploader.destroy(`products/${publicId}`);
    console.log('Cloudinary delete result:', result);
    
    return result;
  } catch (err) {
    console.error('Cloudinary delete error:', err);
    throw err;
  }
}
```

---

### AWS S3 Example:

```javascript
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function deletePhotoFromS3(photoUrl) {
  try {
    // Extract key from URL
    // Example: https://your-bucket.s3.amazonaws.com/products/abc123.jpg
    // We need: products/abc123.jpg
    
    const key = photoUrl.split('.com/')[1];
    
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    };
    
    const result = await s3.deleteObject(params).promise();
    console.log('S3 delete result:', result);
    
    return result;
  } catch (err) {
    console.error('S3 delete error:', err);
    throw err;
  }
}
```

---

## 🗄️ Database Schema Requirements

### Product Model (Mongoose Example):

```javascript
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  mrp: { type: Number, default: 0 },  // ← IMPORTANT: Add this field for discounts
  photos: [String],  // Array of photo URLs
  quantity: { 
    type: String, 
    enum: ['instock', 'outofstock'], 
    default: 'instock' 
  },
  netQuantity: String,
  shelfLife: String,
  ingredients: String,
  storage: String,
  displayOrder: { type: Number, default: 9999 },
  productType: { 
    type: String, 
    enum: ['single', 'combo'], 
    default: 'single' 
  },
  showInCombosSection: { type: Boolean, default: false },
  comboPriceMode: String,
  comboDiscount: Number,
  comboItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    variantLabel: String,
    quantity: Number
  }],
  variants: [{
    label: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, default: 0 },  // ← IMPORTANT: Add this field for variant discounts
    stock: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
```

---

## 🧪 Testing the Implementation

### Test Case 0: MRP Field in GET /products (MOST IMPORTANT)

**Test this FIRST before anything else!**

**Request:**
```
GET /products
```

**Expected Response:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "65abc123",
      "name": "Jaljeera Chana Sattu",
      "price": 220,
      "mrp": 349,  // ← MUST BE HERE!
      "photos": ["https://..."],
      "variants": [
        {
          "label": "500g",
          "price": 220,
          "mrp": 349,  // ← MUST BE HERE for variants too!
          "stock": 100,
          "isDefault": true
        }
      ]
    }
  ]
}
```

**If MRP is missing (undefined or null):**
1. Check Product model has `mrp` field
2. Check `.select()` includes `mrp` (if using select)
3. Add console.log to see what database is returning
4. Re-save a product with MRP value to test

**Quick Test in Postman:**
```
GET http://your-backend.com/products

Check response → products[0].mrp should NOT be undefined
```

---

### Test Case 1: Delete a Photo

**Request:**
```
PUT /products/65abc123def456789
Content-Type: multipart/form-data

existingPhotos: ["https://cloudinary.com/photo1.jpg", "https://cloudinary.com/photo3.jpg"]
(photo2.jpg removed from list)
```

**Expected Backend Behavior:**
1. ✅ Parse `existingPhotos` array
2. ✅ Compare with current photos in DB
3. ✅ Identify photo2.jpg needs to be deleted
4. ✅ Delete photo2.jpg from Cloudinary/S3
5. ✅ Update product.photos to only include photo1.jpg and photo3.jpg
6. ✅ Save to database

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "photos": [
      "https://cloudinary.com/photo1.jpg",
      "https://cloudinary.com/photo3.jpg"
    ]
  }
}
```

### Test Case 2: Add New Photo + Keep Old Ones

**Request:**
```
PUT /products/65abc123def456789
Content-Type: multipart/form-data

existingPhotos: ["https://cloudinary.com/photo1.jpg", "https://cloudinary.com/photo2.jpg"]
photos: [newPhoto.jpg]  // New file upload
```

**Expected Backend Behavior:**
1. ✅ Keep existing photos (photo1, photo2)
2. ✅ Upload new photo → get URL (photo3.jpg)
3. ✅ Combine: [photo1, photo2, photo3]
4. ✅ Save to database

**Response:**
```json
{
  "success": true,
  "product": {
    "photos": [
      "https://cloudinary.com/photo1.jpg",
      "https://cloudinary.com/photo2.jpg",
      "https://cloudinary.com/photo3.jpg"
    ]
  }
}
```

### Test Case 3: Delete All Photos

**Request:**
```
PUT /products/65abc123def456789
Content-Type: multipart/form-data

existingPhotos: []  // Empty array = delete all
```

**Expected Backend Behavior:**
1. ✅ Identify all current photos need to be deleted
2. ✅ Delete all photos from cloud storage
3. ✅ Update product.photos to []
4. ✅ Save to database

---

## ✅ Checklist for Backend Developer

- [ ] Add `mrp` field to Product model (Number, default: 0)
- [ ] Add `mrp` field to Variant schema (Number, default: 0)
- [ ] **CRITICAL: Include `mrp` field in GET /products endpoint response** (home page products)
- [ ] **CRITICAL: Include `mrp` field in GET /products/:id endpoint response** (single product)
- [ ] **CRITICAL: Include variant `mrp` in both endpoints**
- [ ] Parse `existingPhotos` from req.body in PUT /products/:id
- [ ] Compare `existingPhotos` with current photos in database
- [ ] Delete removed photos from cloud storage (Cloudinary/S3)
- [ ] Combine `existingPhotos` + new uploads
- [ ] Save final photos array to database
- [ ] Add console.log statements for debugging
- [ ] Test photo deletion with Postman/curl
- [ ] Test with empty `existingPhotos` array
- [ ] Verify deleted photos are removed from cloud storage
- [ ] Verify MRP field is being saved correctly

---

## 🐛 Debugging Tips

### Log Everything:
```javascript
console.log('Request body:', req.body);
console.log('Existing photos from frontend:', existingPhotos);
console.log('Current photos in DB:', currentPhotos);
console.log('Photos to delete:', photosToDelete);
console.log('New uploaded photos:', newPhotoUrls);
console.log('Final photos array:', product.photos);
```

### Check Frontend Request:
Open browser DevTools → Network tab → Find PUT request → Check Form Data:
```
existingPhotos: ["photo1.jpg", "photo3.jpg"]
```

### Common Issues:

1. **`existingPhotos` is undefined**
   - Frontend isn't sending it
   - Check Content-Type is multipart/form-data

2. **Photos not deleting from cloud**
   - Check public_id extraction logic
   - Verify Cloudinary/S3 credentials
   - Check cloud storage logs/dashboard

3. **MRP not saving**
   - Check Product schema has `mrp` field
   - Check `req.body.mrp` is being read
   - Verify it's not being overwritten later

---

## 📦 Required npm Packages

```bash
# For Cloudinary
npm install cloudinary multer multer-storage-cloudinary

# For AWS S3
npm install aws-sdk multer multer-s3

# For MongoDB
npm install mongoose
```

---

## 🚀 Quick Implementation Steps

1. **Add MRP field to your Product model**
2. **Update PUT /products/:id endpoint** with photo deletion logic
3. **Test with Postman** - send existingPhotos as empty array
4. **Check cloud storage** - verify photos are deleted
5. **Deploy to production**
6. **Test from frontend** - delete a photo and verify it's gone

---

## 📞 Questions?

If you encounter any issues:
1. Check backend logs for errors
2. Verify `existingPhotos` is being received
3. Check cloud storage credentials
4. Test photo deletion manually in cloud dashboard
5. Verify Product model has `mrp` field

---

## ✨ Result After Implementation

- ✅ Deleting photos in Edit Product modal will remove them from cloud storage
- ✅ MRP values will be saved correctly
- ✅ Discounts will show on home page when MRP > Sale Price
- ✅ Old photos + new photos can coexist
- ✅ No orphaned files in cloud storage
