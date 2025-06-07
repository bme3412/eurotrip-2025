const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { getTripData, updateTripData, getChecklistStates, updateChecklistState } = require('../data');

const tripUpdateSchema = Joi.object({
    overview: Joi.object().required(),
    timeline: Joi.object().required(),
    checklists: Joi.object().required(),
    reference: Joi.object().required(),
    itinerary: Joi.object().required()
});

// API Routes
router.get('/overview', (req, res) => {
  res.json(getTripData().overview);
});

router.get('/timeline', (req, res) => {
  res.json(getTripData().timeline);
});

router.get('/checklists', (req, res) => {
  res.json(getTripData().checklists);
});

router.get('/itinerary', (req, res) => {
    res.json(getTripData().itinerary);
});

router.get('/reference', (req, res) => {
  res.json(getTripData().reference);
});

router.get('/complete', (req, res) => {
  res.json(getTripData());
});

// API endpoint to update trip data
router.put('/update', (req, res) => {
  try {
    const { error, value } = tripUpdateSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    
    updateTripData(value);
    
    res.json({ success: true, message: 'Trip data updated successfully' });
    
  } catch (error) {
    console.error('❌ Error updating trip data:', error.message);
    res.status(500).json({ error: 'Failed to update trip data' });
  }
});

// Checklist state management
router.get('/checklist-states', (req, res) => {
  res.json(getChecklistStates());
});

router.post('/checklist-states/:id', (req, res) => {
  const { id } = req.params;
  const { checked } = req.body;
  
  updateChecklistState(id, checked);
  res.json({ success: true, id, checked });
});

module.exports = router; 