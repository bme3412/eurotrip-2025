let allDatesArray = [];
let currentModalDate = null;
let timelineData = null;

export function generateCalendar(data) {
    timelineData = data;
    const availableDates = Object.keys(timelineData).sort();
    allDatesArray = availableDates;
    generateTimeline('main-timeline', availableDates, timelineData);
}

function generateTimeline(containerId, dates, tripData) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    dates.forEach(dateStr => {
        const data = tripData[dateStr];
        if (!data) {
            return; // Skip if no data
        }

        // Restore original card structure
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        if (data.type) dayElement.classList.add(data.type);

        // Parse date in local timezone to avoid timezone issues
        const [year, month, dayNum] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, dayNum); // month is 0-indexed
        const day = date.getDate();
        const monthName = getMonthName(date.getMonth());
        const weekday = getWeekdayName(date.getDay());

        // Create day header with weekday and day number on separate lines
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';

        const dayInfo = document.createElement('div');
        dayInfo.className = 'day-info';
        dayInfo.innerHTML = `<div class="day-weekday">${weekday}</div><div class="day-number">${day}</div>`;
        dayHeader.appendChild(dayInfo);
        
        if (data.type && data.type.startsWith('travel')) {
            dayHeader.classList.add('travel-header');
            const travelFlags = document.createElement('div');
            travelFlags.className = 'travel-flags';
            travelFlags.innerHTML = `${data.fromFlag}<span class="flag-separator">→</span>${data.toFlag}`;
            dayHeader.appendChild(travelFlags);

            dayElement.appendChild(dayHeader);

            const travelIcon = document.createElement('div');
            travelIcon.className = 'travel-icon';
            travelIcon.textContent = data.icon;
            dayElement.appendChild(travelIcon);
        } else {
            dayElement.appendChild(dayHeader);

            // Country day layout with flag
            const flagElement = document.createElement('div');
            flagElement.className = 'country-flag';
            flagElement.textContent = data.flag;
            dayElement.appendChild(flagElement);

            const cityName = document.createElement('div');
            cityName.className = 'city-name';
            cityName.textContent = data.city;
            dayElement.appendChild(cityName);
        }

        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = `${monthName} ${day}: ${data.activity}`;
        dayElement.appendChild(tooltip);

        // Pop animation on click
        dayElement.addEventListener('click', (e) => {
            if (dayElement.classList.contains('popping')) return;
            dayElement.classList.add('popping');
            setTimeout(() => {
                dayElement.classList.remove('popping');
                showModal(dateStr);
            }, 180); // pop duration
        });

        container.appendChild(dayElement);
    });
}

export function populateChecklists(checklists) {
    const { flights, accommodations, tours } = checklists;

    const renderChecklist = (containerId, items, prefix) => {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        items.forEach((item, index) => {
            const li = document.createElement('li');
            const id = `${prefix}-${index}`;
            li.innerHTML = `<input type="checkbox" id="${id}" ${item.checked ? 'checked' : ''}><label for="${id}">${item.text}</label>`;
            container.appendChild(li);
        });
    };

    renderChecklist('flights-checklist', flights, 'flight');
    renderChecklist('accommodations-checklist', accommodations, 'accommodation');
    renderChecklist('tours-checklist', tours, 'tour');
}

export function initializeChecklistHandlers(saveChecklistState) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', async function() {
            try {
                await saveChecklistState(this.id, this.checked);
            } catch (error) {
                console.error('Error saving checkbox state:', error);
            }
        });
    });
}

export function applyCheckboxStates(states) {
    for (const [id, checked] of Object.entries(states)) {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = checked;
        }
    }
}

function getMonthName(month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month];
}

function getWeekdayName(day) {
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return weekdays[day];
}

function renderSection(title, items, renderItem) {
    if (!items || items.length === 0) return '';
    const itemsHtml = items.map(renderItem).join('');
    return `
        <div class="modal-details-section">
            <h3 class="section-title">${title}</h3>
            <div class="details-list">
                ${itemsHtml}
            </div>
        </div>
    `;
}

function renderTextItem(item) {
    return `<div class="detail-item"><p>${item}</p></div>`;
}

function showModal(dateStr) {
    console.log('showModal called with:', dateStr);
    if (!dateStr || !timelineData || !timelineData[dateStr]) {
        console.warn('showModal: invalid or missing dateStr, modal will not open.');
        return;
    }
    currentModalDate = dateStr;
    const modal = document.getElementById('dayModal');
    const data = timelineData[dateStr];

    document.body.classList.add('modal-open');

    const [year, month, dayNum] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, dayNum);
    const day = date.getDate();
    const monthName = getMonthName(date.getMonth());
    const weekday = getWeekdayName(date.getDay());

    document.getElementById('modalTitle').textContent = `${weekday}, ${monthName} ${day}`;
    const modalSubtitle = document.getElementById('modalSubtitle');
    if (data.type && data.type.startsWith('travel')) {
        modalSubtitle.innerHTML = `${data.fromFlag || ''} → ${data.toFlag || ''} <span class="route">(${data.route || ''})</span>`;
    } else {
        modalSubtitle.innerHTML = `${data.flag || ''} ${data.city || ''}`;
    }

    const modalContainer = document.querySelector('.modal-content.itinerary-modal');
    const existingPrev = document.querySelector('.modal-nav-prev');
    if (existingPrev) existingPrev.remove();
    const existingNext = document.querySelector('.modal-nav-next');
    if (existingNext) existingNext.remove();
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'modal-nav modal-nav-prev';
    prevBtn.innerHTML = '‹';
    prevBtn.onclick = () => navigateModal(-1);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'modal-nav modal-nav-next';
    nextBtn.innerHTML = '›';
    nextBtn.onclick = () => navigateModal(1);

    modalContainer.appendChild(prevBtn);
    modalContainer.appendChild(nextBtn);

    updateNavigationButtons();

    const modalBody = document.querySelector('.modal-body');
    modalBody.innerHTML = ''; // Clear existing content

    let content = '';

    // Accommodation from accommodationDetails (via accommodationRef)
    if (window.tripData && window.tripData.accommodationDetails && data.accommodationRef) {
        const acc = window.tripData.accommodationDetails[data.accommodationRef];
        if (acc && acc.name) {
            content += `
                <div class="modal-section modal-accommodation">
                  <h3>🏨 Accommodation</h3>
                  <p><strong>${acc.name}</strong></p>
                  <p>${acc.address}</p>
                  ${acc.googleMaps ? `<p><a href="${acc.googleMaps}" target="_blank">Google Maps</a></p>` : ''}
                  <ul>
                    ${acc.checkIn ? `<li><strong>Check-in:</strong> ${acc.checkIn}</li>` : ''}
                    ${acc.checkOut ? `<li><strong>Check-out:</strong> ${acc.checkOut}</li>` : ''}
                    ${acc.entranceCode ? `<li><strong>Entrance code:</strong> ${acc.entranceCode}</li>` : ''}
                    ${acc.keyInstructions ? `<li><strong>Key instructions:</strong> ${acc.keyInstructions}</li>` : ''}
                    ${acc.nearestSubway ? `<li><strong>Nearest subway:</strong> ${acc.nearestSubway}${acc.subwayLink ? ` (<a href='${acc.subwayLink}' target='_blank'>SL</a>)` : ''}</li>` : ''}
                    ${(acc.wifi && acc.wifi.ssid) ? `<li><strong>Wi-Fi:</strong> ${acc.wifi.ssid} / ${acc.wifi.password}</li>` : ''}
                  </ul>
                </div>
            `;
        }
    }

    // Flight Details
    if (data.flightDetails) {
        // Extract short airport codes
        const departureCodeMatch = data.flightDetails.departure.airport.match(/\(([^)]+)\)/);
        const arrivalCodeMatch = data.flightDetails.arrival.airport.match(/\(([^)]+)\)/);
        const departureCode = departureCodeMatch ? departureCodeMatch[1] : '';
        const arrivalCode = arrivalCodeMatch ? arrivalCodeMatch[1] : '';

        content += `
            <div class="modal-section modal-flight-details-v2">
                <div class="flight-summary">
                    <span class="airline">${data.flightDetails.airline}</span>
                    <span class="flight-number">Flight ${data.flightDetails.flightNumber}</span>
                </div>

                <div class="flight-journey">
                    <div class="journey-point departure-point">
                        <div class="airport-code">${departureCode}</div>
                        <div class="airport-name">${data.flightDetails.departure.airport.replace(/\s*\([^)]+\)/, '')}</div>
                        <div class="flight-time">${data.flightDetails.departure.date}, ${data.flightDetails.departure.time}</div>
                    </div>
                    <div class="journey-connector">
                        <div class="connector-line"></div>
                        <div class="connector-icon">✈️</div>
                    </div>
                    <div class="journey-point arrival-point">
                        <div class="airport-code">${arrivalCode}</div>
                        <div class="airport-name">${data.flightDetails.arrival.airport.replace(/\s*\([^)]+\)/, '')}</div>
                        <div class="flight-time">${data.flightDetails.arrival.date}, ${data.flightDetails.arrival.time}</div>
                    </div>
                </div>

                <div class="flight-meta-details">
                    <div class="meta-item">
                        <span class="meta-icon">⏱️</span>
                        <span class="meta-label">Duration</span>
                        <span class="meta-value">${data.flightDetails.flightInfo.duration}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">💺</span>
                        <span class="meta-label">Seat</span>
                        <span class="meta-value">${data.flightDetails.flightInfo.seat}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">🏷️</span>
                        <span class="meta-label">Fare Class</span>
                        <span class="meta-value">${data.flightDetails.flightInfo.fareClass}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">🚪</span>
                        <span class="meta-label">Terminal</span>
                        <span class="meta-value">${data.flightDetails.departure.terminal}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Scheduled Activities
    if (data.scheduledActivities && data.scheduledActivities.length > 0) {
        content += renderSection('⏰ Schedule', data.scheduledActivities, item => `
            <div class="schedule-item">
                <span class="time">${item.time}</span>
                <span class="icon">${item.icon || ''}</span>
                <div class="event-details">
                  <span class="event">${item.activity}</span>
                  ${item.location ? `<span class="location">${item.location}</span>` : ''}
                </div>
            </div>
        `);
    }

    // Activities (String Array)
    if (Array.isArray(data.activities)) {
        content += renderSection('📝 Activities', data.activities, renderTextItem);
    }

    // Activities (Object with Morning/Afternoon/Evening)
    if (data.activities && typeof data.activities === 'object' && !Array.isArray(data.activities)) {
        let activityHtml = '';
        if(data.activities.morning) {
            activityHtml += renderSection('🌅 Morning', data.activities.morning, renderTextItem);
        }
        if(data.activities.afternoon) {
            activityHtml += renderSection('🏙️ Afternoon', data.activities.afternoon, renderTextItem);
        }
        if(data.activities.evening) {
            activityHtml += renderSection('🌙 Evening', data.activities.evening, renderTextItem);
        }
        content += activityHtml;
    }
    
    // Attractions
    if (data.attractions && data.attractions.length > 0) {
        content += renderSection('🎯 Key Attractions', data.attractions, item => `
            <div class="detail-item">
                <p><strong>${item.name}</strong></p>
                ${item.time ? `<p><em>${item.time}</em></p>`: ''}
                ${item.highlights ? `<p>${Array.isArray(item.highlights) ? item.highlights.join(', ') : item.highlights}</p>`: ''}
                ${item.cost ? `<p><strong>Cost:</strong> ${item.cost}</p>`: ''}
                ${item.tips ? `<p><strong>Tip:</strong> ${item.tips}</p>`: ''}
            </div>
        `);
    }
    
    // Highlights
    if (data.highlights && data.highlights.length > 0) {
        content += renderSection('✨ Highlights', data.highlights, renderTextItem);
    }
    
    // Tips
    if (data.tips && data.tips.length > 0) {
        content += renderSection('💡 Tips', data.tips, renderTextItem);
    }

    // Transportation
    if (data.transportation && data.transportation.length > 0) {
        content += renderSection('🚇 Transportation', data.transportation, item => `
            <div class="detail-item">
                <p><strong>${item.route || item.segment}</strong></p>
                <p>Method: ${item.method || item.mode}, Duration: ${item.duration}</p>
                ${item.description ? `<p><em>${item.description}</em></p>`: ''}
            </div>
        `);
    }

    // Restaurants
    if (data.restaurants && data.restaurants.length > 0) {
        content += renderSection('🍽️ Dining', data.restaurants, item => `
            <div class="detail-item">
                <p><strong>${item.name}</strong></p>
                <p>Cuisine: ${item.cuisine}</p>
                ${item.specialties ? `<p><em>Must-try: ${item.specialties.join(', ')}</em></p>` : ''}
            </div>
        `);
    }

    // Costs
    if (data.costs) {
        const costItems = Object.entries(data.costs).map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`);
        content += renderSection('💰 Estimated Costs', costItems, renderTextItem);
    }

    // Flexible Options
    if (data.flexible_options && data.flexible_options.length > 0) {
        content += renderSection('🔄 Flexible Options', data.flexible_options, renderTextItem);
    }
    
    modalBody.innerHTML = content;
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

function navigateModal(direction) {
    const currentIndex = allDatesArray.indexOf(currentModalDate);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < allDatesArray.length) {
        const newDateStr = allDatesArray[newIndex];
        showModal(newDateStr);
    }
}

function updateNavigationButtons() {
    const currentIndex = allDatesArray.indexOf(currentModalDate);
    const prevBtn = document.querySelector('.modal-nav-prev');
    const nextBtn = document.querySelector('.modal-nav-next');

    if (prevBtn) {
        prevBtn.disabled = currentIndex === 0;
    }
    if (nextBtn) {
        nextBtn.disabled = currentIndex === allDatesArray.length - 1;
    }
}

export function initializeModal() {
    const modal = document.getElementById('dayModal');
    const closeBtn = document.querySelector('.modal .close');

    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }, 200);
    }

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
} 