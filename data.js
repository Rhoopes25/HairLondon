/* ==========================================================
   Site data
   To add a stylist, copy one of the objects in STYLISTS,
   give it a new unique id, and fill in the details.
   ========================================================== */

// Every service the site offers. Stylists pick which ones they do
// and set their own STARTING price (shown as "$65+", since longer or
// thicker hair can cost more). Duration is an estimate in minutes.
// Pick more than one and the times add up, so a haircut + highlights
// shows as one longer appointment.
const SERVICES = {
    'haircut': {
        name: 'Haircut',
        duration: 60,
        description: 'Wash, cut, and style. Bring a photo if you have one.'
    },
    'color': {
        name: 'Color',
        duration: 120,
        description: 'All-over color, from a subtle refresh to a full change.'
    },
    'highlights': {
        name: 'Highlights',
        duration: 150,
        description: 'Foiled or hand-painted brightness, blended to grow out soft.'
    },
    'root-touch-up': {
        name: 'Root Touch-Up',
        duration: 90,
        description: 'Covers regrowth and grays so your color looks fresh again.'
    },
    'blowout': {
        name: 'Blowout',
        duration: 45,
        description: 'Wash and a smooth, bouncy style that lasts a few days.'
    },
    'deep-conditioning': {
        name: 'Deep Conditioning',
        duration: 30,
        description: 'A moisture treatment for dry or color-tired hair.'
    }
};

// Days of the week use JavaScript's numbering: 0 = Sunday ... 6 = Saturday.
const STYLISTS = [{
        id: 'london',
        name: 'London',
        studio: 'Hair by London',
        city: 'Provo',
        photo: 'home.jpg',
        bio: 'Lived-in blondes, soft color, and cuts that grow out well. Relaxed chair, no pressure.',
        workDays: [2, 3, 4, 5, 6],
        services: {
            'haircut': 65,
            'color': 120,
            'highlights': 150,
            'blowout': 45,
            'root-touch-up': 80,
            'deep-conditioning': 35
        },
        portfolio: [
            { src: 'work-2.png', alt: 'Glossy jet black hair in long, soft layers' },
            { src: 'work-1.png', alt: 'Icy platinum balayage on long, loose waves' },
            { src: 'work-4.png', alt: 'Bronde waves blended from root to ends, seen from the back' },
            { src: 'work-6.jpg', alt: 'Soft golden brown hair with long face-framing layers' },
            { src: 'work-3.jpg', alt: 'Ash blonde balayage with curtain bangs' },
            { src: 'work-5.jpg', alt: 'Creamy blonde highlights on long waves, seen from the back' }
        ],
        reviews: [
            { name: 'Maren T.', stars: 5, text: 'Finally found someone I trust with my hair. Booked during nap time and it took two minutes.' },
            { name: 'Priya S.', stars: 5, text: 'Exactly what I asked for, first try. Easy to book around my schedule too.' },
            { name: 'Elise K.', stars: 4, text: 'Relaxed, no pressure, and my color has never looked better.' }
        ]
    },
    {
        id: 'sadie',
        name: 'Sadie Morgan',
        studio: 'Juniper Hair Studio',
        city: 'Orem',
        photo: null,
        bio: 'Color specialist. Rich brunettes, glossy reds, and gray coverage that looks natural.',
        workDays: [1, 3, 4, 5, 6],
        services: {
            'haircut': 55,
            'color': 110,
            'highlights': 165,
            'root-touch-up': 75,
            'blowout': 40
        },
        portfolio: [],
        reviews: [
            { name: 'Hannah W.', stars: 5, text: 'She matched my old color perfectly and explained everything she was doing.' },
            { name: 'Jess P.', stars: 5, text: 'Evening appointments saved me. In and out before bedtime.' }
        ]
    },
    {
        id: 'kai',
        name: 'Kai Nakamura',
        studio: 'The Loft Salon',
        city: 'Lehi',
        photo: null,
        bio: 'Short cuts, bobs, and shapes that are easy to style at home in five minutes.',
        workDays: [1, 2, 3, 4, 5],
        services: {
            'haircut': 45,
            'color': 95,
            'blowout': 35,
            'deep-conditioning': 30
        },
        portfolio: [],
        reviews: [
            { name: 'Aubrey L.', stars: 5, text: 'Best bob I have ever had. Grows out without looking messy.' },
            { name: 'Nina R.', stars: 4, text: 'Quick, friendly, and really listened.' }
        ]
    },
    {
        id: 'brooke',
        name: 'Brooke Ellis',
        studio: 'Wildflower Hair Co.',
        city: 'Springville',
        photo: null,
        bio: 'Blonding and dimensional highlights. I plan your color so you can go longer between visits.',
        workDays: [3, 4, 5, 6],
        services: {
            'haircut': 60,
            'color': 130,
            'highlights': 175,
            'root-touch-up': 85,
            'deep-conditioning': 40
        },
        portfolio: [],
        reviews: [
            { name: 'Claire M.', stars: 5, text: 'Went four months between appointments and it still looked intentional.' },
            { name: 'Tess H.', stars: 5, text: 'Calm salon, great music, and she never rushed me.' }
        ]
    }
];

/* ---------- Helpers shared by every page ---------- */

function getStylist(id) {
    return STYLISTS.find(s => s.id === id) || null;
}

// Valid service ids from a comma-separated query param, in listed order
function parseServiceIds(param) {
    if (!param) return [];
    const seen = {};
    return param.split(',').map(s => s.trim()).filter(id => {
        if (!SERVICES[id] || seen[id]) return false;
        seen[id] = true;
        return true;
    });
}

function servicesQuery(ids) {
    return ids.length ? 'services=' + ids.join(',') : '';
}

function stylistsOffering(ids) {
    if (!ids.length) return STYLISTS.slice();
    return STYLISTS.filter(s => ids.every(id => s.services[id] != null));
}

function avgRating(stylist) {
    const r = stylist.reviews;
    if (!r.length) return null;
    return (r.reduce((sum, x) => sum + x.stars, 0) / r.length).toFixed(1);
}

function startingPrice(stylist) {
    return Math.min(...Object.values(stylist.services));
}

// Prices are starting points, so they always show with a plus: "$65+"
function priceText(amount) {
    return '$' + amount + '+';
}

// Starting price for a set of services with one stylist
function priceFor(stylist, ids) {
    return ids.reduce((sum, id) => sum + stylist.services[id], 0);
}

// Estimated length of an appointment with all these services
function durationFor(ids) {
    return ids.reduce((sum, id) => sum + SERVICES[id].duration, 0);
}

// Lowest and highest price for a service across all stylists who offer it
function priceRange(serviceId) {
    const prices = STYLISTS.map(s => s.services[serviceId]).filter(p => p != null);
    if (!prices.length) return null;
    return { min: Math.min(...prices), max: Math.max(...prices) };
}

function formatDuration(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (!h) return m + ' min';
    return m ? h + ' hr ' + m + ' min' : h + ' hr';
}

function initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// Circle photo, or initials if the stylist hasn't added a photo yet
function avatarHTML(stylist, size) {
    const cls = 'avatar' + (size ? ' avatar--' + size : '');
    if (stylist.photo) {
        return '<span class="' + cls + '"><img src="' + stylist.photo + '" alt=""></span>';
    }
    return '<span class="' + cls + ' avatar--initials" aria-hidden="true">' + initials(stylist.name) + '</span>';
}

function starsHTML(stars) {
    const full = Math.round(stars);
    return '\u2605'.repeat(full) + '\u2606'.repeat(5 - full);
}

// "★★★★★ 4.7 · 3 reviews", or "New" if there are no reviews yet
function ratingHTML(stylist) {
    const rating = avgRating(stylist);
    if (!rating) return '<span>New</span>';
    const count = stylist.reviews.length;
    return '<span class="stars" role="img" aria-label="' + rating + ' out of 5 stars">' + starsHTML(rating) + '</span>' +
        '<span>' + rating + ' \u00b7 ' + count + (count === 1 ? ' review' : ' reviews') + '</span>';
}

/* ---------- Dates and times ---------- */

// Salon hours in minutes from midnight. Slots start every 30 min.
const OPEN = 9 * 60;
const CLOSE = 19 * 60;
const STEP = 30;
const DAYS_AHEAD = 21;

// Time-of-day filter on the Stylists page (by start time)
const TIMES_OF_DAY = {
    morning: { label: 'Morning', from: OPEN, to: 12 * 60 },
    afternoon: { label: 'Afternoon', from: 12 * 60, to: 16 * 60 },
    evening: { label: 'Evening', from: 16 * 60, to: CLOSE }
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatTime(mins, withPeriod = true) {
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const h12 = h24 % 12 || 12;
    const period = h24 < 12 ? 'AM' : 'PM';
    return h12 + ':' + String(m).padStart(2, '0') + (withPeriod ? ' ' + period : '');
}

// "1:00 to 2:30 PM", or "11:00 AM to 12:30 PM" when it crosses noon
function formatRange(start, end) {
    const samePeriod = (start < 720) === (end < 720);
    return formatTime(start, !samePeriod) + ' to ' + formatTime(end);
}

function formatDay(date) {
    return WEEKDAYS[date.getDay()] + ', ' + MONTHS[date.getMonth()] + ' ' + date.getDate();
}

// "2026-10-14", used in links and as a lookup key
function dateKey(date) {
    const p = n => String(n).padStart(2, '0');
    return date.getFullYear() + '-' + p(date.getMonth() + 1) + '-' + p(date.getDate());
}

function parseDateKey(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key || '')) return null;
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return isNaN(date) ? null : date;
}

function todayAtMidnight() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

// The next DAYS_AHEAD days, starting today
function upcomingDays() {
    const today = todayAtMidnight();
    const days = [];
    for (let i = 0; i < DAYS_AHEAD; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push(d);
    }
    return days;
}

/* ---------- Sample availability ----------
   Until there's a real calendar, each stylist gets a steady,
   made-up set of booked half hours per day. The same day always
   shows the same openings, on every page. */

function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function isBlockBooked(stylist, date, mins) {
    return hash(stylist.id + dateKey(date) + mins) % 100 < 10;
}

// Can this stylist fit an appointment of this length starting here?
function isStartAvailable(stylist, date, start, duration) {
    if (!stylist.workDays.includes(date.getDay())) return false;
    if (start + duration > CLOSE) return false;
    const now = new Date();
    if (dateKey(date) === dateKey(now) && start <= now.getHours() * 60 + now.getMinutes() + 60) return false;
    for (let t = start; t < start + duration; t += STEP) {
        if (isBlockBooked(stylist, date, t)) return false;
    }
    return true;
}

// Open start times for a stylist, soonest first.
// days: list of dates to check. tod: a TIMES_OF_DAY key or null.
function openSlots(stylist, duration, days, tod, limit) {
    const range = TIMES_OF_DAY[tod] || { from: OPEN, to: CLOSE };
    const slots = [];
    for (const date of days) {
        for (let start = range.from; start < range.to; start += STEP) {
            if (isStartAvailable(stylist, date, start, duration)) {
                slots.push({ date, start });
                if (limit && slots.length >= limit) return slots;
            }
        }
    }
    return slots;
}

/* ---------- Remembering the last search ----------
   So "Back to stylists" returns her to the same filters. */

function rememberSearch(url) {
    try { sessionStorage.setItem('hbl-search', url); } catch (e) {}
}

function lastSearchUrl() {
    try { return sessionStorage.getItem('hbl-search') || 'stylists.html'; } catch (e) { return 'stylists.html'; }
}

function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}
