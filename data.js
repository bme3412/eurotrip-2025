const fs = require('fs').promises;
const path = require('path');

const tripDataPath = path.join(__dirname, 'trip-itinerary.json');
const checklistStatesPath = path.join(__dirname, 'checklist-states.json');

let tripData = {};
let checklistStates = {};

const loadTripData = async () => {
    try {
        const tripDataRaw = await fs.readFile(tripDataPath, 'utf8');
        tripData = JSON.parse(tripDataRaw);
        console.log('✅ Trip itinerary data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading trip itinerary:', error.message);
        // Fallback minimal data structure if JSON file fails to load
        tripData = {
            overview: {
                title: "Nordic + Iceland Summer Travel",
                subtitle: "Unable to load detailed itinerary",
                totalDays: 17,
                countries: 6,
                startDate: "2025-06-20",
                endDate: "2025-07-06"
            },
            timeline: {},
            checklists: { flights: [], accommodations: [], tours: [] },
            reference: { currencies: {}, weather: {}, highlights: [] }
        };
    }
};

const loadChecklistStates = async () => {
    try {
        const checklistStatesRaw = await fs.readFile(checklistStatesPath, 'utf8');
        checklistStates = JSON.parse(checklistStatesRaw);
        console.log('✅ Checklist states loaded successfully');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('📝 No checklist states file found, starting with empty states.');
            checklistStates = {};
        } else {
            console.error('❌ Error loading checklist states:', error.message);
            checklistStates = {};
        }
    }
};

const saveTripData = async () => {
    try {
        await fs.writeFile(tripDataPath, JSON.stringify(tripData, null, 2));
        console.log('✅ Trip itinerary data saved successfully');
    } catch (error) {
        console.error('❌ Error saving trip itinerary:', error.message);
    }
};

const saveChecklistStates = async () => {
    try {
        await fs.writeFile(checklistStatesPath, JSON.stringify(checklistStates, null, 2));
        console.log('✅ Checklist states saved successfully');
    } catch (error) {
        console.error('❌ Error saving checklist states:', error.message);
    }
};

const getTripData = () => tripData;
const getChecklistStates = () => checklistStates;

const updateTripData = (newTripData) => {
    tripData = newTripData;
    saveTripData();
};

const updateChecklistState = (id, checked) => {
    checklistStates[id] = checked;
    saveChecklistStates();
};

const initializeData = async () => {
    await loadTripData();
    await loadChecklistStates();
};

module.exports = {
    initializeData,
    getTripData,
    updateTripData,
    getChecklistStates,
    updateChecklistState
}; 