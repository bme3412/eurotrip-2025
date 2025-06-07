import { getTripData, getChecklistStates, saveChecklistState } from './api.js';
import { 
    generateCalendar, 
    populateChecklists, 
    initializeModal, 
    applyCheckboxStates, 
    initializeChecklistHandlers 
} from './ui.js';

document.addEventListener('DOMContentLoaded', function() {
    // Force modal hidden on load
    const modal = document.getElementById('dayModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
    initializeApp();
});

async function initializeApp() {
    try {
        const tripData = await getTripData();
        
        generateCalendar(tripData.timeline);
        populateChecklists(tripData.checklists);
        initializeModal();

        const checklistStates = await getChecklistStates();
        applyCheckboxStates(checklistStates);
        initializeChecklistHandlers(saveChecklistState);
        
    } catch (error) {
        console.error('Error loading trip data:', error);
        // TODO: Show an error message to the user
    }
} 