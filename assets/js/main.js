// Harmony Diabetes, Thyroid & Endocrine Centre – site scripts

const CLINIC_WHATSAPP = '917770013575';

// ----- Mobile navigation -----
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');

function setNav(open) {
  nav.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navToggle.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
}

navToggle.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setNav(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

// ----- Footer year -----
document.getElementById('year').textContent = new Date().getFullYear();

// ----- Appointment form -> WhatsApp (home page only) -----
const form = document.getElementById('appointmentForm');
if (form) initAppointmentForm(form);

function initAppointmentForm(form) {
  const errorBox = document.getElementById('formError');
  const dateInput = form.elements.date;

  const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  dateInput.min = toISO(new Date());

  function showError(message, field) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    if (field) {
      field.classList.add('invalid');
      field.focus();
    }
  }

  form.addEventListener('input', (e) => {
    e.target.classList.remove('invalid');
    if (e.target.name === 'location') form.querySelectorAll('input[name="location"]').forEach((r) => r.classList.remove('invalid'));
    errorBox.hidden = true;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { name, phone, age, date, concern, message } = form.elements;
    const location = form.querySelector('input[name="location"]:checked');
    const digits = phone.value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');

    if (!location) return showError('Please choose a location: Kharadi or Hadapsar.', form.querySelector('input[name="location"]'));
    if (name.value.trim().length < 2) return showError('Please enter your full name.', name);
    if (!/^[6-9]\d{9}$/.test(digits)) return showError('Please enter a valid 10-digit mobile number.', phone);
    if (!date.value) return showError('Please choose a preferred date.', date);
    if (date.value < dateInput.min) return showError('Please choose today or a future date.', date);
    const day = new Date(`${date.value}T00:00`).getDay();
    if (day === 0) return showError('Both clinics are closed on Sundays. Please choose another day.', date);
    if (day === 6 && location.value === 'Hadapsar') return showError('Noble Hospital, Hadapsar OPD is closed on Saturdays. Please choose Monday to Friday, or the Kharadi clinic.', date);

    const prettyDate = new Date(`${date.value}T00:00`).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });

    const lines = [
      'Hello, I would like to book an appointment with Dr. Suhas Khaire.',
      '',
      `Name: ${name.value.trim()}`,
      `Mobile: ${digits}`,
      age.value ? `Age: ${age.value}` : null,
      `Location: ${location.value === 'Kharadi' ? 'Kharadi (Harmony Centre, Nyati Eureka)' : 'Hadapsar (Noble Hospital)'}`,
      `Preferred date: ${prettyDate}`,
      concern.value ? `Reason: ${concern.value}` : null,
      message.value.trim() ? `Message: ${message.value.trim()}` : null,
    ].filter((line) => line !== null);

    const url = `https://wa.me/${CLINIC_WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
  });
}
