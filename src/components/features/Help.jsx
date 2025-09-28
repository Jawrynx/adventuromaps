import React, { useState } from 'react'
import './css/Help.css';

function Help() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission (replace with actual implementation later)
    setTimeout(() => {
      setSubmitMessage('Thank you for your message! We\'ll get back to you soon.');
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitMessage(''), 5000);
    }, 1000);
  };

  return (
    <div id='help'>
      <div className="help-container">
        <h1>Help & Support</h1>
        
        {/* Quick Start Guide */}
        <section className="help-section">
          <h2>Quick Start Guide</h2>
          <div className="quick-start-grid">
            <div className="quick-start-item">
              <h3>🗺️ Exploring Maps</h3>
              <p>Navigate through our interactive maps to discover national parks, areas of outstanding natural beauty, and adventure routes.</p>
            </div>
            <div className="quick-start-item">
              <h3>📍 Creating Routes</h3>
              <p>Use the drawing tools to create custom routes and waypoints for your outdoor adventures.</p>
            </div>
            <div className="quick-start-item">
              <h3>📚 Reading Guides</h3>
              <p>Access comprehensive guides covering safety, navigation, and activity-specific information.</p>
            </div>
            <div className="quick-start-item">
              <h3>💾 Offline Access</h3>
              <p>Download maps and guides for offline use during your outdoor adventures.</p>
            </div>
          </div>
        </section>

        {/* User Guide Links */}
        <section className="help-section">
          <h2>User Guides</h2>
          <div className="guide-links">
            <a href="#" className="guide-link">📱 Getting Started with AdventuroMaps</a>
            <a href="#" className="guide-link">🎯 Navigation & Wayfinding</a>
            <a href="#" className="guide-link">🏔️ Trip Planning & Preparation</a>
            <a href="#" className="guide-link">🚨 Emergency & First Aid</a>
            <a href="#" className="guide-link">🌿 Environmental Safety & Etiquette</a>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="help-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-container">
            <p className="faq-placeholder">
              We're still collecting common questions from our users. As AdventuroMaps grows, 
              we'll populate this section with the most frequently asked questions to help you 
              get the most out of the app.
            </p>
            <p className="faq-placeholder">
              If you have questions in the meantime, please don't hesitate to contact us using 
              the form below!
            </p>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="help-section">
          <h2>Troubleshooting</h2>
          <div className="troubleshoot-grid">
            <div className="troubleshoot-item">
              <h3>Maps Not Loading</h3>
              <ul>
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Clear your browser cache</li>
              </ul>
            </div>
            <div className="troubleshoot-item">
              <h3>Performance Issues</h3>
              <ul>
                <li>Close other browser tabs</li>
                <li>Restart the application</li>
                <li>Check available system memory</li>
              </ul>
            </div>
            <div className="troubleshoot-item">
              <h3>Data Not Saving</h3>
              <ul>
                <li>Ensure you're logged in</li>
                <li>Check your internet connection</li>
                <li>Try saving again after a moment</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="help-section">
          <h2>Contact Us</h2>
          <div className="contact-section">
            <p>Can't find what you're looking for? We're here to help!</p>
            
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your full name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a topic...</option>
                  <option value="bug-report">Bug Report</option>
                  <option value="feature-request">Feature Request</option>
                  <option value="technical-support">Technical Support</option>
                  <option value="account-help">Account Help</option>
                  <option value="general-inquiry">General Inquiry</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  required
                  placeholder="Please describe your issue or question in detail..."
                  rows={6}
                />
              </div>
              
              {submitMessage && (
                <div className="submit-message success">
                  {submitMessage}
                </div>
              )}
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="help-section">
          <h2>Additional Resources</h2>
          <div className="resources-grid">
            <div className="resource-item">
              <h3>🔗 Useful Links</h3>
              <ul>
                <li><a href="#">AdventuroMaps Blog</a></li>
                <li><a href="#">Community Forum</a></li>
                <li><a href="#">Safety Guidelines</a></li>
              </ul>
            </div>
            <div className="resource-item">
              <h3>📞 Emergency Contacts</h3>
              <ul>
                <li>Mountain Rescue: 999 (UK)</li>
                <li>Coastguard: 999 (UK)</li>
                <li>Emergency Services: 112 (EU)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Help