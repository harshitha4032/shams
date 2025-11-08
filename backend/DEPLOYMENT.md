# Backend Deployment Guide

## Deployment Options

### 1. Render.com (Recommended for Free Tier)
1. Create an account at [Render](https://render.com/)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure settings:
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables:
     - PORT: 5000 (or let Render auto-assign)
     - MONGO_URI: Your MongoDB connection string
     - JWT_SECRET: Your JWT secret key
     - CLIENT_URL: Your frontend URL (e.g., https://your-app.netlify.app)
     - Other environment variables as needed

### 2. Railway.app
1. Create an account at [Railway](https://railway.app/)
2. Create a new project
3. Connect your GitHub repository or deploy from source
4. Add environment variables in the dashboard
5. Configure the start command to `npm start`

### 3. Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set MONGO_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set CLIENT_URL=https://your-frontend-url
   ```
5. Deploy: `git push heroku main`

## Environment Variables Required

Make sure to set all environment variables from [.env.example](file:///c%3A/Users/gudet/OneDrive/Desktop/shams/backend/.env.example):
- PORT
- MONGO_URI (update to your MongoDB Atlas or other MongoDB service)
- JWT_SECRET
- CLIENT_URL (set to your frontend URL after deployment)
- Other optional variables as needed

## MongoDB Configuration

For production, it's recommended to use MongoDB Atlas:
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Add database user
4. Add IP whitelist (0.0.0.0/0 for testing)
5. Get connection string and update MONGO_URI

## Seeding Initial Data

After deployment, you may need to seed initial data:
1. SSH into your deployed instance or use a one-off dyno/command
2. Run the seed scripts:
   ```bash
   npm run seed:admin
   npm run seed:hostels
   ```

## Notes

- Make sure your frontend's API base URL points to your deployed backend URL
- Update CORS settings in [server.js](file:///c%3A/Users/gudet/OneDrive/Desktop/shams/backend/server.js) if needed
- For production, ensure proper security measures are in place