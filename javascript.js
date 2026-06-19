document.addEventListener('DOMContentLoaded', function () {

  // EMAILJS CREDENTIALS
  var SERVICE_ID  = 'YOUR_SERVICE_ID';   // ← Replace with real value
  var TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // ← Replace with real value
  var PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // ← Replace with real value

  
  if (typeof emailjs !== 'undefined') {
    emailjs.init(PUBLIC_KEY);
  }

  
  // Location config object — no hardcoded coords inline
  
  var LOCATIONS = {
    main: {
      lat: -25.9280536,
      lng: 28.0997046,
      label: "Tshifhi's Cakes",
      address: '1447 Barbary Street, Midrand'
    }
  };

  
  //  8: Input sanitization helper
    function sanitizeInput(str) {
    return str.replace(/[<>'"]/g, '').trim();
  }

  
  // Lightbox setup
  
  if (typeof lightbox !== 'undefined' && typeof lightbox.option === 'function') {
    lightbox.option({
      'resizeDuration': 200,
      'wrapAround': true,
      'fadeDuration': 300
    });
  }

  
  // Form setup
  
  var form = document.getElementById('contact-form');
  if (!form) {
    return;
  }

  
  var feedback = document.getElementById('contactFeedback');
  if (feedback) {
    feedback.setAttribute('aria-live', 'polite');
    feedback.setAttribute('aria-atomic', 'true');
  }

  var submitBtn = form.querySelector('.contact-submit');

  
  //Specific, helpful feedback messages
 
  function setFeedback(message, isError) {
    if (!feedback) {
      alert(message);
      return;
    }
    feedback.textContent = message;
    feedback.className = 'contact-feedback' + (isError ? ' error' : ' success');
  }

  function resetButton() {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message'
      submitBtn.setAttribute('aria-disabled', 'false');
      submitBtn.setAttribute('aria-label', 'Send message');
    }
  }

  function setButtonSending() {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      submitBtn.setAttribute('aria-disabled', 'true');
      submitBtn.setAttribute('aria-label', 'Sending message, please wait');
    }
  }

  
  //Email format validation
 
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }


  // Inline field error helpers
  
  function showFieldError(fieldName, message) {
    var field = form.elements[fieldName];
    if (!field) return;
    field.classList.add('error');
    field.classList.remove('success');
    var errorEl = document.getElementById(fieldName + '-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  function clearFieldError(fieldName) {
    var field = form.elements[fieldName];
    if (!field) return;
    field.classList.remove('error');
    field.classList.add('success');
    var errorEl = document.getElementById(fieldName + '-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  
  if (form.elements['from_name']) {
    form.elements['from_name'].addEventListener('blur', function () {
      var val = sanitizeInput(this.value);
      if (!val || val.length < 2) {
        showFieldError('from_name', 'Please enter your full name (min 2 characters).');
      } else if (!/^[a-zA-Z\s]+$/.test(val)) {
        showFieldError('from_name', 'Name must contain letters and spaces only.');
      } else {
        clearFieldError('from_name');
      }
    });
  }

  if (form.elements['from_email']) {
    form.elements['from_email'].addEventListener('blur', function () {
      var val = sanitizeInput(this.value);
      if (!val) {
        showFieldError('from_email', 'Please enter your email address.');
      } else if (!isValidEmail(val)) {
        showFieldError('from_email', 'Please enter a valid email address.');
      } else {
        clearFieldError('from_email');
      }
    });
  }

  if (form.elements['message']) {
    form.elements['message'].addEventListener('blur', function () {
      var val = sanitizeInput(this.value);
      if (!val || val.length < 20) {
        showFieldError('message', 'Message must be at least 20 characters.');
      } else if (val.length > 1000) {
        showFieldError('message', 'Message must not exceed 1000 characters.');
      } else {
        clearFieldError('message');
      }
    });

   
    form.elements['message'].addEventListener('input', function () {
      var counter = document.getElementById('message-counter');
      if (counter) {
        counter.textContent = this.value.length + ' / 1000 characters';
      }
    });
  }

  
  function sendViaFormspree(name, email, message) {
    var FORMSPREE_ID = 'YOUR_FORMSPREE_ID'; // ← Replace with real ID
    return fetch('https://formspree.io/f/' + FORMSPREE_ID, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_name: name,
        from_email: email,
        message: message
      })
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    
    var name    = sanitizeInput(form.elements['from_name']
                    ? form.elements['from_name'].value : '');
    var email   = sanitizeInput(form.elements['from_email']
                    ? form.elements['from_email'].value : '');
    var message = sanitizeInput(form.elements['message']
                    ? form.elements['message'].value : '');

    // Validate all fields on submit
    var hasErrors = false;

    if (!name || name.length < 2 || !/^[a-zA-Z\s]+$/.test(name)) {
      showFieldError('from_name', 'Please enter your full name (letters only, min 2 characters).');
      hasErrors = true;
    } else {
      clearFieldError('from_name');
    }

    
    if (!email || !isValidEmail(email)) {
      showFieldError('from_email', 'Please enter a valid email address.');
      hasErrors = true;
    } else {
      clearFieldError('from_email');
    }

    if (!message || message.length < 20) {
      showFieldError('message', 'Message must be at least 20 characters.');
      hasErrors = true;
    } else if (message.length > 1000) {
      showFieldError('message', 'Message must not exceed 1000 characters.');
      hasErrors = true;
    } else {
      clearFieldError('message');
    }

    // Scroll to first error field
    if (hasErrors) {
      var firstError = form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setButtonSending();

    
    if (typeof emailjs !== 'undefined' && typeof emailjs.sendForm === 'function') {
      emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, '#contact-form')
        .then(function () {
          form.reset();
        
          setFeedback(
            'Thank you ' + name + ', your message has been sent! ' +
            'We will respond within 1 business day.',
            false
          );
          resetButton();
        }, function (error) {
          console.error('EmailJS failed:', error);
          
          setFeedback(
            'Message failed to send (Error: ' + (error.text || error.status) + '). ' +
            'Trying an alternative method...',
            true
          );
          
          sendViaFormspree(name, email, message)
            .then(function (res) {
              if (res.ok) {
                form.reset();
                setFeedback(
                  'Thank you ' + name + ', your message has been sent! ' +
                  'We will respond within 1 business day.',
                  false
                );
              } else {
                
                setFeedback(
                  'Unable to send your message. Please check your internet ' +
                  'connection and try again.',
                  true
                );
              }
              resetButton();
            })
            .catch(function () {
              setFeedback(
                'No internet connection detected. Please check your network ' +
                'and try again.',
                true
              );
              resetButton();
            });
        });
      return;
    }

    
    sendViaFormspree(name, email, message)
      .then(function (res) {
        if (res.ok) {
          form.reset();
          setFeedback(
            'Thank you ' + name + ', your message has been sent! ' +
            'We will respond within 1 business day.',
            false
          );
        } else {
          setFeedback(
            'Unable to send your message. Please check your internet ' +
            'connection and try again.',
            true
          );
        }
        resetButton();
      })
      .catch(function () {
        setFeedback(
          'No internet connection detected. Please check your network ' +
          'and try again.',
          true
        );
        resetButton();
      });
  });

  
  var mapElement = document.getElementById('map');
  if (mapElement && typeof L !== 'undefined') {
    var loc = LOCATIONS.main;

    var map = L.map('map', {
      center: [loc.lat, loc.lng],
      zoom: 14,
      scrollWheelZoom: false,
      tap: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var directionsUrl =
      'https://www.google.com/maps/dir/?api=1&destination=' +
      loc.lat + ',' + loc.lng;

        var popupContent =
      '<strong>' + loc.label + '</strong>' +
      '<br>' + loc.address +
      '<br><a href="' + directionsUrl +
      '" target="_blank" rel="noopener">Get directions</a>';

    var marker = L.marker([loc.lat, loc.lng])
      .addTo(map)
      .bindPopup(popupContent)
      .openPopup();

    // Locate me control
    var locateControl = L.control({ position: 'topright' });
    locateControl.onAdd = function () {
      var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      var btn = L.DomUtil.create('a', '', container);
      btn.href = '#';
      btn.title = 'Locate me';
      btn.innerHTML = '';
      L.DomEvent.on(btn, 'click', function (e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        map.locate({ setView: true, maxZoom: 16 });
      });
      return container;
    };
    locateControl.addTo(map);

    map.on('locationfound', function (e) {
      var r = Math.round(e.accuracy || 0);
      L.marker(e.latlng)
        .addTo(map)
        .bindPopup('You are within ' + r + ' meters of this point')
        .openPopup();
    });

    //  6: specific location error message
    map.on('locationerror', function () {
      setFeedback(
        'Unable to determine your location. ' +
        'Please check your browser location permissions.',
        true
      );
    });

    // Enable scroll wheel zoom only after first click
    var scrollEnabled = false;
    map.on('click', function () {
      if (!scrollEnabled) {
        map.scrollWheelZoom.enable();
        scrollEnabled = true;
      }
    });
  }

});
    