const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Add emergency contact
router.post('/emergency-contact',  async (req, res) => {
  try {
    const { name, relationship, phone, email } = req.body;
    
    // Validate required fields
    if (!name || !relationship || !phone) {
      return res.status(400).json({ error: 'Name, relationship, and phone are required' });
    }
    
    const user = await User.findById(req.user.id);
    console.log('user in emergency',user)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Add new emergency contact
    user.emergencyContacts.push({
      name,
      relationship,
      phone,
      email
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'Emergency contact added successfully', 
      contacts: user.emergencyContacts 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all emergency contacts
router.get('/emergency-contacts', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('emergencyContacts');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ contacts: user.emergencyContacts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update emergency contact
router.put('/emergency-contact/:contactId', async (req, res) => {
  try {
    const { name, relationship, phone, email } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find contact by ID
    const contact = user.emergencyContacts.id(req.params.contactId);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    // Update fields
    if (name) contact.name = name;
    if (relationship) contact.relationship = relationship;
    if (phone) contact.phone = phone;
    if (email) contact.email = email;
    
    await user.save();
    
    res.status(200).json({ 
      message: 'Emergency contact updated successfully', 
      contacts: user.emergencyContacts 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete emergency contact
router.delete('/emergency-contact/:contactId', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log("user emer",user.emergencyContacts)

    const removedcontact = user.emergencyContacts.id(req.params.contactId);
    console.log('rem con', removedcontact)
    user.emergencyContacts.remove(removedcontact)
    await user.save();
    
    res.status(200).json({ 
      message: 'Emergency contact removed successfully', 
      contacts: user.emergencyContacts 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;