# 🎨 Backend: Hero Image Implementation Guide

**Date:** February 20, 2026  
**API Endpoint:** `GET /api/homepage`

---

## 🎯 What Frontend Expects

The frontend now shows **1 hero image by default** (no carousel) for better mobile UX and faster loading.

---

## 📡 Required API Response Format

### **Option 1: Single Hero Image (Recommended)**
```json
GET /api/homepage

{
  "success": true,
  "homepage": {
    "heroSlides": [
      {
        "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1/hero-main.jpg",
        "imageUrlMobile": "https://res.cloudinary.com/your-cloud/image/upload/w_768,h_1024,c_fill,q_80/v1/hero-main.jpg",
        "title": "BIHAR KE KHANE KA SWAD",
        "subtitle": "",
        "link": ""
      }
    ],
    "storyImageUrl": "https://..."
  }
}
```

**Result:** Shows 1 static image (no carousel, no arrows, no dots)

---

### **Option 2: Multiple Images (Carousel)**
```json
{
  "success": true,
  "homepage": {
    "heroSlides": [
      {
        "imageUrl": "https://.../hero1-desktop.jpg",
        "imageUrlMobile": "https://.../hero1-mobile.jpg",
        "title": "Slide 1"
      },
      {
        "imageUrl": "https://.../hero2-desktop.jpg",
        "imageUrlMobile": "https://.../hero2-mobile.jpg",
        "title": "Slide 2"
      },
      {
        "imageUrl": "https://.../hero3-desktop.jpg",
        "imageUrlMobile": "https://.../hero3-mobile.jpg",
        "title": "Slide 3"
      }
    ]
  }
}
```

**Result:** Shows carousel with autoplay, arrows, and pagination dots

---

## 🔧 Database Schema

### **MongoDB/Mongoose Example:**

```javascript
const heroSlideSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
    description: "Desktop hero image URL (1920x600px recommended)"
  },
  imageUrlMobile: {
    type: String,
    default: null,
    description: "Mobile-optimized hero image URL (768x1024px recommended)"
  },
  title: {
    type: String,
    default: "",
    description: "Hero slide title (optional, for future use)"
  },
  subtitle: {
    type: String,
    default: "",
    description: "Hero slide subtitle (optional, for future use)"
  },
  link: {
    type: String,
    default: "",
    description: "Click-through URL (optional, for future use)"
  },
  order: {
    type: Number,
    default: 0,
    description: "Display order (lowest first)"
  },
  isActive: {
    type: Boolean,
    default: true,
    description: "Show/hide slide"
  }
});

const homepageSchema = new mongoose.Schema({
  heroSlides: [heroSlideSchema],
  storyImageUrl: String,
  updatedAt: { type: Date, default: Date.now }
});
```

---

## 🚀 API Implementation

### **GET /api/homepage - Retrieve Homepage Data**

```javascript
// Example: Node.js + Express + MongoDB
router.get('/homepage', async (req, res) => {
  try {
    const homepage = await Homepage.findOne()
      .select('heroSlides storyImageUrl')
      .lean();

    if (!homepage) {
      return res.json({
        success: true,
        homepage: {
          heroSlides: [],
          storyImageUrl: null
        }
      });
    }

    // Filter active slides and sort by order
    const activeSlides = (homepage.heroSlides || [])
      .filter(slide => slide.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({
      success: true,
      homepage: {
        heroSlides: activeSlides,
        storyImageUrl: homepage.storyImageUrl
      }
    });
  } catch (error) {
    console.error('Error fetching homepage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch homepage data'
    });
  }
});
```

---

## 🎨 Auto-Generate Mobile Images (Cloudinary)

### **Option A: Generate URL on-the-fly**

```javascript
function generateMobileUrl(desktopUrl) {
  if (!desktopUrl) return null;
  
  // Example: Cloudinary transformation
  // https://res.cloudinary.com/demo/image/upload/v1/hero.jpg
  // becomes
  // https://res.cloudinary.com/demo/image/upload/w_768,h_1024,c_fill,q_80/v1/hero.jpg
  
  if (desktopUrl.includes('cloudinary.com')) {
    return desktopUrl.replace(
      '/upload/',
      '/upload/w_768,h_1024,c_fill,q_80/'
    );
  }
  
  return null; // Return null if not Cloudinary (frontend will fallback to desktop)
}

router.get('/homepage', async (req, res) => {
  const homepage = await Homepage.findOne();
  
  const heroSlides = homepage.heroSlides.map(slide => ({
    imageUrl: slide.imageUrl,
    imageUrlMobile: slide.imageUrlMobile || generateMobileUrl(slide.imageUrl),
    title: slide.title,
    subtitle: slide.subtitle,
    link: slide.link
  }));
  
  res.json({ success: true, homepage: { heroSlides } });
});
```

---

### **Option B: Generate and Store on Upload**

```javascript
// When admin uploads hero image
const cloudinary = require('cloudinary').v2;

async function uploadHeroImage(file) {
  // Upload desktop version (original)
  const desktopUpload = await cloudinary.uploader.upload(file.path, {
    folder: 'hero-images',
    transformation: [
      { width: 1920, height: 600, crop: 'fill', quality: 85 }
    ]
  });
  
  // Upload mobile version (automatically resized)
  const mobileUpload = await cloudinary.uploader.upload(file.path, {
    folder: 'hero-images-mobile',
    transformation: [
      { width: 768, height: 1024, crop: 'fill', quality: 80 }
    ]
  });
  
  return {
    imageUrl: desktopUpload.secure_url,
    imageUrlMobile: mobileUpload.secure_url
  };
}

// In your admin upload route
router.post('/admin/homepage/hero', upload.single('heroImage'), async (req, res) => {
  try {
    const { imageUrl, imageUrlMobile } = await uploadHeroImage(req.file);
    
    const homepage = await Homepage.findOne();
    homepage.heroSlides.push({
      imageUrl,
      imageUrlMobile,
      title: req.body.title || '',
      order: homepage.heroSlides.length
    });
    
    await homepage.save();
    
    res.json({ success: true, message: 'Hero image uploaded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

---

## 🛠️ Admin Panel API Endpoints

### **1. Add Hero Slide**
```javascript
POST /api/admin/homepage/hero
Content-Type: multipart/form-data

Body:
- heroImage: File (required)
- title: String (optional)
- subtitle: String (optional)
- link: String (optional)

Response:
{
  "success": true,
  "message": "Hero slide added",
  "heroSlide": {
    "imageUrl": "...",
    "imageUrlMobile": "...",
    "title": "..."
  }
}
```

---

### **2. Update Hero Slide**
```javascript
PUT /api/admin/homepage/hero/:slideId

Body:
{
  "imageUrl": "...",
  "imageUrlMobile": "...",
  "title": "Updated title",
  "order": 1,
  "isActive": true
}

Response:
{
  "success": true,
  "message": "Hero slide updated"
}
```

---

### **3. Delete Hero Slide**
```javascript
DELETE /api/admin/homepage/hero/:slideId

Response:
{
  "success": true,
  "message": "Hero slide deleted"
}
```

---

### **4. Reorder Hero Slides**
```javascript
PUT /api/admin/homepage/hero/reorder

Body:
{
  "slideIds": ["id1", "id2", "id3"]  // New order
}

Response:
{
  "success": true,
  "message": "Hero slides reordered"
}
```

---

## 📊 Image Specifications

### **Desktop Images:**
```
Dimensions: 1920 x 600 px (3.2:1 ratio)
Format: JPEG (progressive) or WebP
Quality: 80-85%
Max file size: 500 KB
```

### **Mobile Images:**
```
Dimensions: 768 x 1024 px (3:4 ratio) or 768 x 400 px (landscape)
Format: JPEG (progressive) or WebP
Quality: 75-80%
Max file size: 250 KB
```

---

## 🎯 Frontend Behavior

### **Current Setup:**
- ✅ **Default:** Shows 1 hero image (no carousel)
- ✅ **If backend returns 1 slide:** Shows static image
- ✅ **If backend returns 2+ slides:** Shows carousel with autoplay
- ✅ **If backend unavailable:** Falls back to local default image
- ✅ **Image display:** `object-contain` (shows full image, no cropping)

### **CSS Applied:**
```css
.hero-image {
  object-fit: contain;  /* ✅ Shows full image without cropping */
  object-position: center;
  width: 100%;
  height: 100%;
}
```

**Before (object-cover):** Image was cropped to fill container  
**After (object-contain):** Full image visible, may have letterboxing

---

## ✅ Testing Checklist

### **Backend Tests:**
- [ ] `GET /api/homepage` returns correct structure
- [ ] `heroSlides` is an array (even if empty)
- [ ] `imageUrl` is always present for each slide
- [ ] `imageUrlMobile` can be null (optional)
- [ ] API returns 200 status even when no slides exist
- [ ] CORS headers allow frontend domain

### **Mobile Image Tests:**
- [ ] Mobile URLs are properly generated (Cloudinary transformation)
- [ ] Mobile images are smaller file size than desktop (40-60% reduction)
- [ ] Mobile images maintain aspect ratio (768x1024 or 768x400)
- [ ] Mobile URLs are accessible (not 404)

### **Admin Panel Tests:**
- [ ] Upload single hero image
- [ ] Upload multiple hero images
- [ ] Delete hero image
- [ ] Reorder hero images
- [ ] Toggle slide active/inactive
- [ ] Preview before saving

---

## 🐛 Common Issues & Fixes

### **Issue 1: Images Not Loading**
```javascript
// ❌ Wrong: Missing protocol
"imageUrl": "cloudinary.com/hero.jpg"

// ✅ Correct: Full URL with https
"imageUrl": "https://res.cloudinary.com/demo/image/upload/hero.jpg"
```

---

### **Issue 2: CORS Errors**
```javascript
// Add CORS headers to /api/homepage
app.use('/api/homepage', cors({
  origin: ['https://bihariflavours.in', 'http://localhost:5173'],
  credentials: true
}));
```

---

### **Issue 3: Empty heroSlides Array**
```javascript
// ✅ Always return an array (never null/undefined)
res.json({
  success: true,
  homepage: {
    heroSlides: homepage?.heroSlides || [],  // Default to empty array
    storyImageUrl: homepage?.storyImageUrl || null
  }
});
```

---

## 📝 Summary

### **What You Need to Do:**

1. **Database:**
   - Add `heroSlides` array to homepage collection
   - Each slide needs: `imageUrl`, optional `imageUrlMobile`

2. **API Endpoint:**
   - `GET /api/homepage` returns `{ heroSlides: [...] }`
   - Filter active slides, sort by order

3. **Image Generation:**
   - Option A: Auto-generate mobile URLs from desktop (Cloudinary)
   - Option B: Admin uploads 2 versions (desktop + mobile)

4. **Admin Panel:**
   - Add UI to upload/manage hero images
   - Allow uploading 1 or multiple images
   - Provide preview before saving

---

**Frontend Status:** ✅ Ready (waiting for backend data)  
**Default Behavior:** Shows 1 local image until backend provides data  
**Backward Compatible:** Yes (works without `imageUrlMobile`)  

---

Let me know if you need help implementing any of these endpoints!
