export async function getTripData() {
    const response = await fetch('/api/trip/complete');
    if (!response.ok) {
        throw new Error('Failed to fetch trip data');
    }
    return response.json();
}

export async function getChecklistStates() {
    const response = await fetch('/api/trip/checklist-states');
    if (!response.ok) {
        throw new Error('Failed to fetch checklist states');
    }
    return response.json();
}

export async function saveChecklistState(id, checked) {
    await fetch(`/api/trip/checklist-states/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checked })
    });
} 