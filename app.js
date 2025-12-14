// === CONFIGURATION ===
const SUPABASE_URL = 'https://antzuhakwgyuswjipmnf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudHp1aGFrd2d5dXN3amlwbW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjA4ODUsImV4cCI6MjA4MTIzNjg4NX0.xqhNrQk2hwMzCve2kpfhH0JeYXHhsMx1FEgWajydV3A';
let supabase;

// === STATE MANAGEMENT ===
const state = {
    settings: {
        totalShares: 1000,
        sharePrice: 500,
        isRoundOpen: true,
        allowImages: true,
        displayMode: 'full' // full, list, grid
    },
    reservations: [],
    loading: true
};

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            await initApp();
        } else {
            console.error("Supabase library not loaded");
            alert("فشل تحميل المكتبات اللازمة");
        }
    } catch (error) {
        console.error("Supabase init error:", error);
        alert("تنبيه: " + (error.message || JSON.stringify(error)));
    }
});

async function initApp() {
    await fetchData();
    setupRealtimeSubscription();
    initializeForm();
    renderApp();
    setupEventListeners();
}

async function fetchData() {
    try {
        // Fetch Settings
        const { data: settingsData, error: settingsError } = await supabase
            .from('settings')
            .select('*')
            .single();

        if (settingsData) {
            state.settings = {
                totalShares: settingsData.total_shares,
                sharePrice: settingsData.share_price,
                isRoundOpen: settingsData.is_round_open,
                allowImages: settingsData.allow_images,
                displayMode: settingsData.display_mode
            };
        } else if (settingsError) {
            console.warn("Settings not found, using defaults. ensure SQL script is run.");
        }

        // Fetch Reservations
        const { data: reservationsData, error: reservationsError } = await supabase
            .from('reservations')
            .select('*')
            .order('created_at', { ascending: true });

        if (reservationsData) {
            state.reservations = reservationsData;
        }

        state.loading = false;
        updateDisplay();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function setupRealtimeSubscription() {
    supabase
        .channel('public:any')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, payload => {
            handleRealtimeReservation(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, payload => {
            handleRealtimeSettings(payload);
        })
        .subscribe();
}

function handleRealtimeReservation(payload) {
    if (payload.eventType === 'INSERT') {
        state.reservations.push(payload.new);
    } else if (payload.eventType === 'UPDATE') {
        const index = state.reservations.findIndex(r => r.id === payload.new.id);
        if (index !== -1) {
            // Merge to keep local fields if any, though standard is rewrite
            state.reservations[index] = payload.new;
        }
    } else if (payload.eventType === 'DELETE') {
        state.reservations = state.reservations.filter(r => r.id !== payload.old.id);
    }
    updateDisplay();
}

function handleRealtimeSettings(payload) {
    if (payload.new) {
        const s = payload.new;
        state.settings = {
            totalShares: s.total_shares,
            sharePrice: s.share_price,
            isRoundOpen: s.is_round_open,
            allowImages: s.allow_images,
            displayMode: s.display_mode
        };
        updateDisplay();
    }
}

// === FORM INITIALIZATION ===
function initializeForm() {
    const form = document.getElementById('reservationForm');
    if (!form) return;

    const formHtml = `
        <div class="shares-amount-container">
            <div class="shares-amount-box">
                <label for="shares">أرغب بحجز عدد الاسهم التالي:</label>
                <div style="position: relative; max-width: 150px; margin: 0 auto;">
                    <input type="number" id="shares" name="shares" min="1" required placeholder="0" style="text-align: center; font-size: 1.5rem; padding: 8px; width: 100%;">
                </div>
                <span class="available-hint" style="margin-top: 8px; display: block;">متاح: <span id="availableHint">...</span> سهم</span>
            </div>
            <div class="shares-amount-box">
                <label>القيمة الإجمالية</label>
                <div class="value-display"><span id="totalAmountDisplay">0</span> $</div>
                <input type="hidden" id="totalAmount" value="0">
            </div>
        </div>

        <div class="form-grid">
            <div class="form-group">
                <label for="fullName">الاسم الكامل <span class="required">*</span></label>
                <input type="text" id="fullName" name="fullName" required placeholder="أدخل اسمك الكامل">
            </div>
            <div class="form-group">
                <label for="phone">رقم الهاتف <span class="required">*</span></label>
                <div class="phone-input-wrapper">
                    <select id="countryCode" class="country-select" style="width: auto; min-width: 150px;">
                        <option value="+966">+966 السعودية 🇸🇦</option>
                        <option value="+971">+971 الإمارات 🇦🇪</option>
                        <option value="+965">+965 الكويت 🇰🇼</option>
                        <option value="+974">+974 قطر 🇶🇦</option>
                        <option value="+973">+973 البحرين 🇧🇭</option>
                        <option value="+968">+968 عمان 🇴🇲</option>
                        <option value="+20">+20 مصر 🇪🇬</option>
                        <option value="+962">+962 الأردن 🇯🇴</option>
                        <option value="+961">+961 لبنان 🇱🇧</option>
                        <option value="+964">+964 العراق 🇮🇶</option>
                        <option value="+212">+212 المغرب 🇲🇦</option>
                        <option value="+213">+213 الجزائر 🇩🇿</option>
                        <option value="+216">+216 تونس 🇹🇳</option>
                        <option value="+249">+249 السودان 🇸🇩</option>
                        <option value="+218">+218 ليبيا 🇱🇾</option>
                        <option value="+970">+970 فلسطين 🇵🇸</option>
                        <option value="+967">+967 اليمن 🇾🇪</option>
                        <option value="+963">+963 سوريا 🇸🇾</option>
                        <option value="+252">+252 الصومال 🇸🇴</option>
                        <option value="+253">+253 جيبوتي 🇩🇯</option>
                        <option value="+222">+222 موريتانيا 🇲🇷</option>
                        <option value="+269">+269 جزر القمر 🇰🇲</option>
                        <option value="+90">+90 تركيا 🇹🇷</option>
                        <option value="+44">+44 بريطانيا 🇬🇧</option>
                        <option value="+1">+1 أمريكا 🇺🇸</option>
                        <option value="+33">+33 فرنسا 🇫🇷</option>
                        <option value="+49">+49 ألمانيا 🇩🇪</option>
                        <option value="+39">+39 إيطاليا 🇮🇹</option>
                        <option value="+34">+34 إسبانيا 🇪🇸</option>
                        <option value="+7">+7 روسيا 🇷🇺</option>
                        <option value="+60">+60 ماليزيا 🇲🇾</option>
                        <option value="+62">+62 إندونيسيا 🇮🇩</option>
                        <option value="+91">+91 الهند 🇮🇳</option>
                        <option value="+92">+92 باكستان 🇵🇰</option>
                        <option value="+1">+1 كندا 🇨🇦</option>
                        <option value="+61">+61 أستراليا 🇦🇺</option>
                        <option value="+237">+237 الكاميرون 🇨🇲</option>
                        <option value="+234">+234 نيجيريا 🇳🇬</option>
                    </select>
                    <input type="tel" id="phone" name="phone" required placeholder="5XX XXX XXXX" style="flex: 1;">
                </div>
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
                <label>نوع الخصوصية</label>
                <div class="privacy-options">
                    <label class="privacy-option">
                        <input type="radio" name="privacy" value="full" checked>
                        <span class="option-content">
                            <span class="option-title">عرض الاسم الكامل + الصورة (موصى به)</span>
                            <span class="option-desc">يظهر اسمك وصورتك في قائمة المؤسسين (نرجو التكرم باختيار الاختيار الثالث للتعارف وتشجيع باقي الزملاء)</span>
                        </span>
                    </label>
                    <label class="privacy-option">
                        <input type="radio" name="privacy" value="name_only">
                        <span class="option-content">
                            <span class="option-title">عرض الاسم فقط</span>
                            <span class="option-desc">يظهر اسمك فقط ويتم إخفاء صورتك</span>
                        </span>
                    </label>
                    <label class="privacy-option">
                        <input type="radio" name="privacy" value="anonymous">
                        <span class="option-content">
                            <span class="option-title">فاعل خير (مخفي)</span>
                            <span class="option-desc">لا يظهر اسمك ولا صورتك في القائمة</span>
                        </span>
                    </label>
                </div>
            </div>
        </div>

        <button type="submit" class="cta-button" id="submitBtn" style="width: 100%; margin-top: 24px;">تأكيد الحجز</button>
        <div class="success-message" id="successMessage">
            تم الحجز بنجاح! رقم طلبك: <span id="reservationRef"></span>
        </div>
    `;

    form.innerHTML = formHtml;

    // Total Amount Calculation
    const sharesInput = document.getElementById('shares');
    const totalAmountInput = document.getElementById('totalAmount');
    const totalAmountDisplay = document.getElementById('totalAmountDisplay');

    if (sharesInput) {
        sharesInput.addEventListener('input', (e) => {
            const shares = parseInt(e.target.value) || 0;
            const total = shares * state.settings.sharePrice;
            totalAmountInput.value = total;
            totalAmountDisplay.textContent = total.toLocaleString();
        });
    }

    form.addEventListener('submit', handleReservation);
}

// === FORM HANDLING ===
async function handleReservation(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('reservationForm');

    // Disable button
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Get Data
    const formData = new FormData(form);
    const shares = parseInt(formData.get('shares'));
    const fullName = formData.get('fullName');
    const countryCode = document.getElementById('countryCode').value;
    const phoneBody = document.getElementById('phone').value;
    const phone = `${countryCode} ${phoneBody}`;
    const privacy = document.querySelector('input[name="privacy"]:checked').value;

    // Validation
    if (!fullName || !phoneBody || !shares || !privacy) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        return;
    }

    const remaining = getRemainingShares();
    if (shares > remaining) {
        alert(`عذراً، المتبقي فقط ${remaining} سهم`);
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        return;
    }

    try {
        const { data, error } = await supabase
            .from('reservations')
            .insert([{
                full_name: fullName,
                phone: phone,
                shares: shares,
                privacy: privacy,
                visible: true
            }])
            .select()
            .single();

        if (error) throw error;

        // Show success
        submitBtn.classList.remove('loading');
        form.style.display = 'none';

        const successMsg = document.getElementById('successMessage');
        document.getElementById('reservationRef').textContent = data.id.slice(0, 8); // Short ID
        successMsg.classList.add('show');

        // Reset form after delay
        setTimeout(() => {
            form.reset();
            form.style.display = 'flex';
            successMsg.classList.remove('show');
            submitBtn.disabled = false;
        }, 5000);

    } catch (error) {
        console.error('Reservation error:', error);
        alert('حدث خطأ أثناء الاتصال بالخادم. حاول مرة أخرى.');
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// === ADMIN ACTIONS ===
async function toggleRoundStatus() {
    const newState = !state.settings.isRoundOpen;
    try {
        await supabase
            .from('settings')
            .update({ is_round_open: newState })
            .gt('id', 0);
    } catch (e) { console.error(e); }
}

async function updateSettings(e) {
    if (e) e.preventDefault();

    // Get values from admin inputs
    const totalShares = parseInt(document.getElementById('adminTotalShares').value);
    const sharePrice = parseInt(document.getElementById('adminSharePrice').value);

    try {
        await supabase
            .from('settings')
            .update({
                total_shares: totalShares,
                share_price: sharePrice
            })
            .gt('id', 0); // Update all settings row

        alert('تم حفظ الإعدادات');
    } catch (err) {
        alert('خطأ في الحفظ');
        console.error(err);
    }
}

async function toggleReservationVisibility(id, currentStatus) {
    try {
        // Find current status locally first to be responsive, or use passed arg
        // But for reliable toggle, we use the argument if passed, or negate visible.
        // Assuming currentStatus is boolean.

        let newStatus = !currentStatus;
        if (currentStatus === undefined || currentStatus === null) {
            // Find in state
            const r = state.reservations.find(re => re.id == id);
            if (r) newStatus = !r.visible;
        }

        await supabase
            .from('reservations')
            .update({ visible: newStatus })
            .eq('id', id);
    } catch (e) { console.error(e); }
}

async function deleteReservation(id) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
        await supabase
            .from('reservations')
            .delete()
            .eq('id', id);
    } catch (e) { console.error(e); }
}


// === HELPER FUNCTIONS ===
function getRemainingShares() {
    const reserved = state.reservations.reduce((acc, curr) => acc + curr.shares, 0);
    return state.settings.totalShares - reserved;
}

// === UI UPDATES ===
function updateDisplay() {
    // 1. Update Progress
    const reserved = state.reservations.reduce((acc, curr) => acc + curr.shares, 0);
    const remaining = Math.max(0, state.settings.totalShares - reserved);
    const progress = Math.min(100, (reserved / state.settings.totalShares) * 100);

    const totalSharesEl = document.getElementById('totalShares');
    if (totalSharesEl) totalSharesEl.textContent = state.settings.totalShares.toLocaleString();

    // Update progress bars with animation
    const progressFill = document.querySelector('.progress-fill');
    const heroProgressFill = document.querySelector('.hero-progress-fill');

    if (progressFill) progressFill.style.width = `${progress}%`;
    if (heroProgressFill) heroProgressFill.style.width = `${progress}%`;

    // Counts
    const investorsCountEl = document.getElementById('investorsCount');
    if (investorsCountEl) investorsCountEl.textContent = state.reservations.length;

    const reservedSharesEl = document.getElementById('reservedShares');
    if (reservedSharesEl) reservedSharesEl.textContent = reserved.toLocaleString();

    // Values
    const raised = reserved * state.settings.sharePrice;
    const raisedAmountEl = document.getElementById('raisedAmount');
    if (raisedAmountEl) raisedAmountEl.textContent = '$' + raised.toLocaleString();

    // Available hint in form
    const hintEl = document.getElementById('availableHint');
    if (hintEl) hintEl.textContent = remaining;

    // 2. Update Participants Grid
    renderParticipants();

    // 3. Update Admin Tables if visible
    const dashboard = document.querySelector('.admin-dashboard');
    if (dashboard && dashboard.classList.contains('show')) {
        renderAdminReservations();
    }

    // 4. Update Settings Inputs check
    const totalSharesInput = document.getElementById('adminTotalShares');
    // Only update if not focused to avoid interfering with typing
    if (totalSharesInput && document.activeElement !== totalSharesInput) {
        totalSharesInput.value = state.settings.totalShares;
    }
    const sharePriceInput = document.getElementById('adminSharePrice');
    if (sharePriceInput && document.activeElement !== sharePriceInput) {
        sharePriceInput.value = state.settings.sharePrice;
    }

    // 5. Hero Badge Status
    const badge = document.querySelector('.hero-badge');
    if (badge) {
        badge.innerHTML = state.settings.isRoundOpen
            ? '<span class="pulse-dot"></span> جولة مفتوحة الآن'
            : '<span class="status-dot closed"></span> جولة مغلقة';

        badge.className = state.settings.isRoundOpen ? 'hero-badge' : 'hero-badge closed';
    }

    // 6. Round Closed Overlay
    const overlay = document.getElementById('roundClosedOverlay');
    if (overlay) {
        if (!state.settings.isRoundOpen) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
        }
    }
}

function renderParticipants() {
    const grid = document.getElementById('participantsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    // Filter visible ones
    const visibleReservations = state.reservations.filter(r => r.visible);

    if (visibleReservations.length === 0) {
        grid.innerHTML = '<div class="no-data">كن أول المبادرين بالحجز!</div>';
        return;
    }

    visibleReservations.forEach(r => {
        const card = document.createElement('div');
        card.className = 'participant-card';

        let avatarHtml = '';
        let nameHtml = '';

        // Handle Privacy Modes
        if (r.privacy === 'anonymous') {
            avatarHtml = `<div class="participant-avatar placeholder">?</div>`;
            nameHtml = `<h3>فاعل خير</h3>`;
        } else {
            // Check if name_only
            const isNameOnly = r.privacy === 'name_only';
            const initial = r.full_name ? r.full_name.charAt(0) : '?';

            if (isNameOnly) {
                avatarHtml = `<div class="participant-avatar placeholder">${initial}</div>`;
            } else {
                // Full display - using initial for now as image is removed from requirements
                avatarHtml = `<div class="participant-avatar placeholder" style="background: var(--primary); color: white;">${initial}</div>`;
            }

            nameHtml = `<h3>${r.full_name || 'فاعل خير'}</h3>`;
        }

        card.innerHTML = `
            ${avatarHtml}
            <div class="participant-info">
                ${nameHtml}
                <div class="participant-shares">
                    <span class="share-icon">🔹</span>
                    <span>${r.shares} سهم</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderAdminReservations() {
    const tbody = document.getElementById('adminReservationsTable');
    if (!tbody) return;

    tbody.innerHTML = '';

    state.reservations.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.full_name}</td>
            <td dir="ltr">${r.phone}</td>
            <td>${r.shares}</td>
            <td>${(r.shares * state.settings.sharePrice).toLocaleString()} $</td>
            <td>
                <span class="privacy-badge ${r.privacy}">
                    ${getPivacyLabel(r.privacy)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button onclick="toggleReservationVisibility('${r.id}', ${r.visible})" class="icon-btn ${r.visible ? '' : 'off'}" title="تغيير الظهور">
                        👁️
                    </button>
                    <button onclick="deleteReservation('${r.id}')" class="icon-btn delete" title="حذف">
                        🗑️
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getPivacyLabel(key) {
    const map = {
        'full': 'كامل',
        'name_only': 'اسم فقط',
        'anonymous': 'مخفي'
    };
    return map[key] || key;
}

function renderApp() {
    // Initial Render
    updateDisplay();
}

function setupEventListeners() {
    // Admin Login Logic
    const loginBtn = document.getElementById('adminLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const pass = document.getElementById('adminPassword').value;
            if (pass === '123456') {
                document.querySelector('.admin-login').style.display = 'none';
                document.querySelector('.admin-dashboard').classList.add('show');
                renderAdminReservations();
            } else {
                document.querySelector('.login-error').classList.add('show');
            }
        });
    }

    // Modal
    document.getElementById('adminBtn')?.addEventListener('click', () => {
        document.getElementById('adminModal').classList.add('show');
    });

    document.querySelector('.close-modal')?.addEventListener('click', () => {
        document.getElementById('adminModal').classList.remove('show');
    });

    // Save Settings
    document.getElementById('saveSettingsBtn')?.addEventListener('click', updateSettings);

    // Toggle Round
    document.getElementById('toggleRoundBtn')?.addEventListener('click', toggleRoundStatus);

    // Tabs logic for admin
    const tabs = document.querySelectorAll('.admin-tab');
    if (tabs) {
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                e.target.classList.add('active');
                const target = e.target.dataset.tab;
                const targetEl = document.getElementById(target);
                if (targetEl) targetEl.classList.add('active');
            });
        });
    }
}
