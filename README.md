# Nordic + Iceland Summer Travel App 🌍

A full-stack web application for planning and tracking a 17-day Nordic and Iceland summer trip (June 20 - July 6, 2025).

## Features

- **Interactive Timeline**: Visual calendar showing daily activities with country-themed styling
- **Planning Checklists**: Track flights, accommodations, and tours with persistent checkbox states
- **Daily Itinerary**: Detailed day-by-day breakdown of activities
- **Reference Information**: Currency, weather, and highlight information for each destination
- **Responsive Design**: Mobile-friendly interface
- **RESTful API**: Backend API for data management

## Tech Stack

### Backend
- **Node.js** with Express.js
- **RESTful API** endpoints
- **CORS** enabled for cross-origin requests
- **Helmet** for security headers
- **Morgan** for request logging

### Frontend
- **Vanilla JavaScript** (ES6+ classes)
- **CSS3** with responsive design
- **Fetch API** for backend communication
- **Local state management** for UI interactions

## Project Structure

```
nordic-iceland-travel-app/
├── server.js              # Express server and API routes
├── package.json           # Dependencies and scripts
├── public/                # Frontend static files
│   ├── index.html        # Main HTML page
│   ├── styles.css        # Comprehensive styling
│   └── script.js         # Frontend JavaScript application
└── README.md             # This file
```

## API Endpoints

- `GET /api/trip/overview` - Trip overview information
- `GET /api/trip/timeline` - Day-by-day timeline data
- `GET /api/trip/checklists` - Planning checklists
- `GET /api/trip/itinerary` - Detailed daily itinerary
- `GET /api/trip/reference` - Reference information (currency, weather, etc.)
- `GET /api/trip/complete` - All trip data in one response
- `GET /api/checklist-states` - Current checkbox states
- `POST /api/checklist-states/:id` - Update checkbox state

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nordic-iceland-travel-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Trip Overview

- **Duration**: 17 days (June 20 - July 6, 2025)
- **Countries**: 6 (USA, France, Sweden, Norway, Denmark, Iceland)
- **Cities**: Boston, Paris, Stockholm, Oslo, Copenhagen, Bergen, Reykjavik

### Highlights
- 🌅 White nights throughout Scandinavia
- 🌸 Peak lupine flower season in Iceland
- 🏔️ Norway in a Nutshell fjord experience
- ♨️ Blue Lagoon geothermal spa
- 🏛️ Historic Nordic capitals and museums

## Development

### Adding New Features

1. **Backend**: Add new routes in `server.js`
2. **Frontend**: Extend the `TravelApp` class in `public/script.js`
3. **Styling**: Add CSS to `public/styles.css`

### Data Structure

The trip data is currently stored in-memory in the server. For production, consider:
- Database integration (MongoDB, PostgreSQL, etc.)
- User authentication and personal trip management
- Data persistence for checklist states

## Deployment

The app can be deployed to:
- **Heroku**: Add a `Procfile` with `web: node server.js`
- **Railway**: Direct deployment with automatic Node.js detection
- **DigitalOcean App Platform**: Configure build and run commands
- **AWS/GCP/Azure**: Deploy with their respective Node.js services

## Environment Variables

For production deployment, consider these environment variables:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment setting (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Future Enhancements

- [ ] User authentication and personal trips
- [ ] Database integration for persistent data
- [ ] Trip sharing functionality
- [ ] Mobile app version
- [ ] Integration with booking APIs
- [ ] Weather API integration
- [ ] Photo upload and gallery
- [ ] Expense tracking
- [ ] Offline functionality

## License

This project is open source. Feel free to use and modify for your own travel planning needs.

---

**Happy travels!** ✈️ 🗺️ # eurotrip-2025
