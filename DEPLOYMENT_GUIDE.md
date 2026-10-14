# PRIME ELITE - Production Deployment Guide (1-Click & Free Tier)

या प्रोजेक्टमध्ये कोणतेही **Hardcoded paths** ठेवलेले नाहीत. सर्व API Calls आपोआप (`/api`) रिलेटिव्ह पाथ वापरतात. त्यामुळे तुम्ही हा प्रोजेक्ट कोणत्याही क्लाउडवर (Render, Vercel, Railway, Render+Vercel) थेट डिप्लॉय करू शकता.

---

## पर्याय १: All-in-One Deployment on Render / Railway (सर्वात सोपा - एकाच क्लिकवर)
*येथे Frontend आणि Backend एकाच सर्व्हरवरून चालतात. त्यामुळे CORS किंवा URL बदलण्याची अजिबात गरज पडत नाही.*

1. **GitHub** वर संपूर्ण `PrimeElite` रिपॉझिटरी पुश (Push) करा.
2. [Render.com](https://render.com) वर जाऊन **New Web Service** निवडा आणि तुमचे GitHub Repo कनेक्ट करा.
3. खालील सेटिंग्स भरा:
   - **Root Directory**: रिकामी ठेवा (किंवा `.`)
   - **Build Command**: 
     ```bash
     npm install && cd client && npm install && npm run build && cd ../server && npm install
     ```
   - **Start Command**: 
     ```bash
     cd server && npm start
     ```
4. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: तुमचा MongoDB Atlas Connection String (उदा. `mongodb+srv://user:pass@cluster0.mongodb.net/prime_elite?retryWrites=true&w=majority`)
   - `JWT_SECRET`: कोणताही लांब यादृच्छिक पासवर्ड (उदा. `my_super_secret_production_key_32_chars!`)
   - `ADMIN_EMAIL`: तुमचा ॲडमिन ईमेल (उदा. `admin@primeelite.local`)
   - `ADMIN_PASSWORD`: तुमचा ॲडमिन पासवर्ड (उदा. `Admin@PrimeElite2026`)

Render वरील Build पूर्ण होताच मिळालेल्या लाइव्ह लिंकवर (उदा. `https://prime-elite.onrender.com`) तुमचे Frontend आणि Backend दोन्ही एकाच लिंकवर विनासायास चालू होतील!

---

## पर्याय २: Frontend on Vercel + Backend on Render (Separated)

### पायरी १: Backend (Render वर)
1. **Root Directory**: `server`
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. **Environment Variables**:
   - `MONGODB_URI`: Atlas Connection String
   - `JWT_SECRET`: Random 32+ character key
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: Vercel ची लिंक (उदा. `https://prime-elite.vercel.app`)

### पायरी २: Frontend (Vercel वर)
1. **Root Directory**: `client`
2. **Framework Preset**: Vite
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variable**:
   - `VITE_API_URL`: Render ची बॅकएंड लिंक + `/api` (उदा. `https://prime-elite-api.onrender.com/api`)

*टीप: `client/vercel.json` फाईल आधीच कॉन्फिगर केली आहे, ज्यामुळे सर्व SPA राउट्स (`/admin`, `/book/:slug`) रीलोड केल्यावर ४०४ एरर येत नाही.*

---

## महत्त्वाचे: MongoDB Atlas सेटअप (५ मिनिटे)
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) वर मोफत क्लस्टर (M0 Free Tier) तयार करा.
2. **Network Access** मध्ये जाऊन **Allow Access from Anywhere (`0.0.0.0/0`)** सेव्ह करा.
3. **Database Access** मध्ये युझरनेम आणि पासवर्ड तयार करा.
4. **Connect** वर क्लिक करून `Driver: Node.js` निवडून कनेक्शन स्ट्रिंग कॉपी करा आणि `MONGODB_URI` मध्ये पेस्ट करा.
