// === INVESTMENT SHARES RESERVATION SYSTEM ===

// Configuration & State
const CONFIG = {
    adminPassword: '123456',
    defaultTotalShares: 1000,
    sharePrice: 500
};

let state = {
    settings: {
        totalShares: 1000,
        sharePrice: 500,
        roundOpen: true,
        allowImages: true,
        displayMode: 'full' // 'numbers', 'anonymous', 'full'
    },
    reservations: [],
    activities: []
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initializeForm();
    initializeAdminPanel();
    updateDisplay();
    generateSampleData();
});

// === STATE MANAGEMENT ===
function loadState() {
    const saved = localStorage.getItem('investmentState');
    if (saved) {
        const savedState = JSON.parse(saved);
        // Merge saved state with default structure to handle new fields
        state = {
            ...state,
            ...savedState,
            settings: { ...state.settings, ...savedState.settings }
        };
        // Ensure sharePrice exists
        if (!state.settings.sharePrice) state.settings.sharePrice = 500;
    }
    checkRoundStatus();
}

function saveState() {
    localStorage.setItem('investmentState', JSON.stringify(state));
}

function checkRoundStatus() {
    const overlay = document.getElementById('roundClosedOverlay');
    if (!state.settings.roundOpen) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

// === FORM INITIALIZATION ===
function initializeForm() {
    const form = document.getElementById('reservationForm');
    const formHtml = `
        <div class="shares-amount-container">
            <div class="shares-amount-box">
                <label for="shares">أرغب بحجز عدد الاسهم التالي:</label>
                <div style="position: relative; max-width: 150px; margin: 0 auto;">
                    <input type="number" id="shares" name="shares" min="1" required placeholder="0" style="text-align: center; font-size: 1.5rem; padding: 8px; width: 100%;">
                </div>
                <span class="available-hint" style="margin-top: 8px; display: block;">متاح: <span id="availableHint">${getRemainingShares()}</span> سهم</span>
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
        </div>
        
        <div class="form-group full-width">
            <label>مستوى الخصوصية <span class="required">*</span> <span style="font-size: 0.85rem; font-weight: normal; color: var(--primary); display: block; margin-top: 4px;">(نرجو التكرم باختيار الاختيار الثالث للتعارف وتشجيع باقي الزملاء)</span></label>
            <div class="privacy-options">
                <label class="privacy-option">
                    <input type="radio" name="privacy" value="anonymous" required>
                    <span class="option-content">
                        <span class="custom-radio"></span>
                        <span class="option-icon">🔒</span>
                        <span class="option-text">
                            <span class="option-title">عرض الحجز بدون اسم</span>
                            <span class="option-desc">سيظهر حجزك بشكل مجهول</span>
                        </span>
                    </span>
                </label>
                <label class="privacy-option">
                    <input type="radio" name="privacy" value="firstName">
                    <span class="option-content">
                        <span class="custom-radio"></span>
                        <span class="option-icon">👤</span>
                        <span class="option-text">
                            <span class="option-title">عرض الاسم الأول فقط</span>
                            <span class="option-desc">سيظهر اسمك الأول للمشاركين</span>
                        </span>
                    </span>
                </label>
                <label class="privacy-option">
                    <input type="radio" name="privacy" value="full" checked>
                    <span class="option-content">
                        <span class="custom-radio"></span>
                        <span class="option-icon">🌟</span>
                        <span class="option-text">
                            <span class="option-title">عرض الاسم + الصورة</span>
                            <span class="option-desc">ستظهر صورتك واسمك كاملاً</span>
                        </span>
                    </span>
                </label>
            </div>
        </div>
        
        <button type="submit" class="submit-btn" id="submitBtn">
            <span class="btn-text">تأكيد الحجز</span>
            <span class="btn-loader"></span>
        </button>
    `;

    form.innerHTML = formHtml;

    // Image upload handling
    /* Image upload handling removed */

    // Total Amount Calculation
    const sharesInput = document.getElementById('shares');
    const totalInput = document.getElementById('totalAmount');

    sharesInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val > 0) {
            // Use dynamic price from state
            const total = (val * state.settings.sharePrice);
            document.getElementById('totalAmountDisplay').textContent = total.toLocaleString();
            document.getElementById('totalAmount').value = total;
        } else {
            document.getElementById('totalAmountDisplay').textContent = "0";
            document.getElementById('totalAmount').value = "0";
        }
    });

    // Form submission
    form.addEventListener('submit', handleReservation);
}

// === RESERVATION HANDLING ===
async function handleReservation(e) {
    e.preventDefault();

    if (!state.settings.roundOpen) {
        alert('الجولة مغلقة حالياً');
        return;
    }

    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');

    const fullName = document.getElementById('fullName').value.trim();
    // const email = document.getElementById('email').value.trim(); // Removed
    const countryCode = document.getElementById('countryCode').value;
    const phoneBody = document.getElementById('phone').value.trim();
    const phone = `${countryCode} ${phoneBody}`;
    const shares = parseInt(document.getElementById('shares').value);
    const privacy = document.querySelector('input[name="privacy"]:checked')?.value;
    // Image removed

    // Validation
    if (!fullName || !phoneBody || !shares || !privacy) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }

    if (shares > getRemainingShares()) {
        alert(`عدد الأسهم المطلوبة (${shares}) أكبر من المتاح (${getRemainingShares()})`);
        return;
    }

    // Check for duplicate phone (instead of email)
    if (state.reservations.some(r => r.phone === phone && r.visible)) {
        alert('رقم الهاتف مسجل مسبقاً');
        return;
    }

    // Show loading
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create reservation
    const reservation = {
        id: generateId(),
        fullName,
        email: "", // Removed
        phone,
        shares,
        privacy,
        image: null,
        visible: true,
        timestamp: new Date().toISOString()
    };

    state.reservations.push(reservation);

    // Add activity
    addActivity('reservation', shares);

    saveState();
    updateDisplay();

    // Show success
    submitBtn.classList.remove('loading');
    form.style.display = 'none';

    const successMsg = document.getElementById('successMessage');
    document.getElementById('reservationRef').textContent = reservation.id;
    successMsg.classList.add('show');

    // Reset form after delay
    setTimeout(() => {
        form.reset();
        // Image preview reset removed
        form.style.display = 'flex';
        successMsg.classList.remove('show');
        submitBtn.disabled = false;
    }, 5000);
}

// === DISPLAY UPDATES ===
function updateDisplay() {
    const total = state.settings.totalShares;
    const reserved = getReservedShares();
    const remaining = getRemainingShares();
    const percentage = Math.round((reserved / total) * 100);

    // Update stats
    document.getElementById('totalShares').textContent = total.toLocaleString();
    document.getElementById('reservedShares').textContent = reserved.toLocaleString();
    document.getElementById('remainingShares').textContent = remaining.toLocaleString();
    // document.getElementById('fillPercentage').textContent = percentage; // Removed
    const sharePriceDisplay = document.getElementById('sharePriceDisplay');
    if (sharePriceDisplay) sharePriceDisplay.textContent = state.settings.sharePrice;

    document.getElementById('progressPercent').textContent = percentage + '%';

    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = percentage + '%';

    // Change color based on percentage
    if (percentage >= 90) {
        progressBar.style.background = 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)';
    } else if (percentage >= 70) {
        progressBar.style.background = 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)';
    } else {
        progressBar.style.background = 'var(--gradient-1)';
    }

    // Update available hint
    const availableHint = document.getElementById('availableHint');
    if (availableHint) availableHint.textContent = remaining.toLocaleString();

    // Update last update time
    document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('ar-EG');

    // Update participants display
    updateParticipantsDisplay();

    // Update activity feed
    updateActivityFeed();
}

function updateParticipantsDisplay() {
    const grid = document.getElementById('participantsGrid');
    const noParticipants = document.getElementById('noParticipants');

    const visibleParticipants = state.reservations.filter(r =>
        r.visible && r.privacy !== 'anonymous' &&
        (state.settings.displayMode === 'full' || state.settings.displayMode !== 'numbers')
    );

    if (visibleParticipants.length === 0 || state.settings.displayMode === 'numbers') {
        grid.innerHTML = '';
        noParticipants.style.display = 'block';
        return;
    }

    noParticipants.style.display = 'none';

    grid.innerHTML = visibleParticipants.map(p => {
        const displayName = p.privacy === 'firstName'
            ? p.fullName.split(' ')[0]
            : p.fullName;

        const showImage = p.privacy === 'full' && p.image && state.settings.displayMode === 'full';
        const initial = p.fullName.charAt(0);

        return `
            <div class="participant-card" title="${p.shares} سهم">
                <div class="participant-avatar">
                    ${showImage ? `<img src="${p.image}" alt="${displayName}">` : initial}
                </div>
                <div class="participant-name">${displayName}</div>
                <div class="participant-shares">${p.shares} سهم</div>
            </div>
        `;
    }).join('');
}

function updateActivityFeed() {
    const feed = document.getElementById('activityFeed');

    if (state.activities.length === 0) {
        feed.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">لا يوجد نشاط حالياً</p>';
        return;
    }

    const recentActivities = state.activities.slice(-10).reverse();

    feed.innerHTML = recentActivities.map(a => `
        <div class="activity-item">
            <span class="activity-icon">${a.type === 'reservation' ? '📈' : '👤'}</span>
            <span class="activity-text">${a.message}</span>
            <span class="activity-time">${formatTime(a.timestamp)}</span>
        </div>
    `).join('');
}

// === ADMIN PANEL ===
function initializeAdminPanel() {
    const adminBtn = document.getElementById('adminBtn');
    const adminModal = document.getElementById('adminModal');
    const closeBtn = document.getElementById('closeAdminModal');
    const loginForm = document.getElementById('adminLoginForm');

    adminBtn.addEventListener('click', () => {
        adminModal.classList.add('show');
    });

    closeBtn.addEventListener('click', () => {
        adminModal.classList.remove('show');
        resetAdminPanel();
    });

    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            adminModal.classList.remove('show');
            resetAdminPanel();
        }
    });

    loginForm.addEventListener('submit', handleAdminLogin);

    // Initialize admin dashboard
    initializeAdminDashboard();
}

function handleAdminLogin(e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    const errorMsg = document.getElementById('loginError');

    if (password === CONFIG.adminPassword) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminDashboard').classList.add('show');
        loadAdminData();
    } else {
        errorMsg.classList.add('show');
        setTimeout(() => errorMsg.classList.remove('show'), 3000);
    }
}

function initializeAdminDashboard() {
    const dashboard = document.getElementById('adminDashboard');

    dashboard.innerHTML = `
        <div class="admin-tabs">
            <button class="admin-tab active" data-tab="settings">الإعدادات</button>
            <button class="admin-tab" data-tab="reservations">الحجوزات</button>
            <button class="admin-tab" data-tab="display">خيارات العرض</button>
        </div>
        
        <div class="tab-content active" id="settingsTab">
            <div class="settings-grid">
                <div class="setting-card">
                    <h4>إجمالي الأسهم</h4>
                    <input type="number" id="adminTotalShares" min="1" value="${state.settings.totalShares}">
                    <button class="save-setting" onclick="updateTotalShares()">حفظ</button>
                </div>
                <div class="setting-card">
                    <h4>سعر السهم ($)</h4>
                    <input type="number" id="adminSharePrice" min="1" value="${state.settings.sharePrice}">
                    <button class="save-setting" onclick="updateSharePrice()">حفظ</button>
                </div>
                <div class="setting-card">
                    <h4>حالة الجولة</h4>
                    <div class="toggle-switch">
                        <input type="checkbox" id="roundStatus" ${state.settings.roundOpen ? 'checked' : ''} onchange="toggleRoundStatus()">
                        <label for="roundStatus">
                            <span class="toggle-on">مفتوحة</span>
                            <span class="toggle-off">مغلقة</span>
                        </label>
                    </div>
                </div>
                <div class="setting-card">
                    <h4>السماح برفع الصور</h4>
                    <div class="toggle-switch">
                        <input type="checkbox" id="allowImages" ${state.settings.allowImages ? 'checked' : ''} onchange="toggleAllowImages()">
                        <label for="allowImages">
                            <span class="toggle-on">مفعّل</span>
                            <span class="toggle-off">معطّل</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="tab-content" id="reservationsTab">
            <div class="reservations-actions">
                <button class="action-btn" onclick="exportToCSV()">📥 تحميل CSV</button>
                <button class="action-btn danger" onclick="clearAllReservations()">🗑️ مسح الكل</button>
            </div>
            <div class="reservations-table-wrapper">
                <table class="reservations-table">
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <!-- <th>البريد</th> -->
                            <th>الهاتف</th>
                            <th>الأسهم</th>
                            <th>الخصوصية</th>
                            <th>الحالة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="reservationsTableBody"></tbody>
                </table>
            </div>
        </div>
        
        <div class="tab-content" id="displayTab">
            <div class="display-options">
                <h4>وضع العرض الافتراضي</h4>
                <div class="display-modes">
                    <label class="display-mode">
                        <input type="radio" name="displayMode" value="numbers" ${state.settings.displayMode === 'numbers' ? 'checked' : ''} onchange="updateDisplayMode('numbers')">
                        <span class="mode-content">
                            <span class="mode-icon">📊</span>
                            <span class="mode-text"><span class="mode-title">أرقام فقط</span><span class="mode-desc">عرض الإحصائيات بدون أسماء</span></span>
                        </span>
                    </label>
                    <label class="display-mode">
                        <input type="radio" name="displayMode" value="anonymous" ${state.settings.displayMode === 'anonymous' ? 'checked' : ''} onchange="updateDisplayMode('anonymous')">
                        <span class="mode-content">
                            <span class="mode-icon">🔒</span>
                            <span class="mode-text"><span class="mode-title">النشاط المجهول</span><span class="mode-desc">إشعارات بدون معلومات شخصية</span></span>
                        </span>
                    </label>
                    <label class="display-mode">
                        <input type="radio" name="displayMode" value="full" ${state.settings.displayMode === 'full' ? 'checked' : ''} onchange="updateDisplayMode('full')">
                        <span class="mode-content">
                            <span class="mode-icon">🌟</span>
                            <span class="mode-text"><span class="mode-title">الأسماء والصور</span><span class="mode-desc">عرض كامل للمشاركين</span></span>
                        </span>
                    </label>
                </div>
            </div>
        </div>
    `;

    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab + 'Tab').classList.add('active');
        });
    });
}

function loadAdminData() {
    updateReservationsTable();
}

function updateReservationsTable() {
    const tbody = document.getElementById('reservationsTableBody');
    if (!tbody) return;

    const privacyLabels = { anonymous: 'مجهول', firstName: 'الاسم الأول', full: 'كامل' };

    tbody.innerHTML = state.reservations.map(r => `
        <tr>
            <td>${r.fullName}</td>
            <!-- <td>${r.email}</td> -->
            <td>${r.phone}</td>
            <td>${r.shares}</td>
            <td>${privacyLabels[r.privacy]}</td>
            <td>${r.visible ? '✅ ظاهر' : '❌ مخفي'}</td>
            <td>
                <button onclick="toggleVisibility('${r.id}')" style="padding:5px 10px;margin:2px;border-radius:5px;border:none;cursor:pointer;background:${r.visible ? '#f59e0b' : '#10b981'};color:white;">
                    ${r.visible ? 'إخفاء' : 'إظهار'}
                </button>
                <button onclick="deleteReservation('${r.id}')" style="padding:5px 10px;margin:2px;border-radius:5px;border:none;cursor:pointer;background:#ef4444;color:white;">
                    حذف
                </button>
            </td>
        </tr>
    `).join('');
}

// === ADMIN ACTIONS ===
function updateTotalShares() {
    const value = parseInt(document.getElementById('adminTotalShares').value);
    if (value > 0) {
        state.settings.totalShares = value;
        saveState();
        updateDisplay();
        alert('تم تحديث إجمالي الأسهم');
    }
}

function updateSharePrice() {
    const value = parseInt(document.getElementById('adminSharePrice').value);
    if (value > 0) {
        state.settings.sharePrice = value;
        saveState();
        updateDisplay();

        // Refresh form calculation validation if needed
        const sharesInput = document.getElementById('shares');
        if (sharesInput && sharesInput.value) {
            sharesInput.dispatchEvent(new Event('input'));
        }

        alert('تم تحديث سعر السهم');
    }
}

function toggleRoundStatus() {
    state.settings.roundOpen = document.getElementById('roundStatus').checked;
    saveState();
    checkRoundStatus();
}

function toggleAllowImages() {
    state.settings.allowImages = document.getElementById('allowImages').checked;
    saveState();
    const imageGroup = document.getElementById('imageUploadGroup');
    if (imageGroup) {
        imageGroup.style.display = state.settings.allowImages ? 'block' : 'none';
    }
}

function updateDisplayMode(mode) {
    state.settings.displayMode = mode;
    saveState();
    updateDisplay();
}

function toggleVisibility(id) {
    const reservation = state.reservations.find(r => r.id === id);
    if (reservation) {
        reservation.visible = !reservation.visible;
        saveState();
        updateDisplay();
        updateReservationsTable();
    }
}

function deleteReservation(id) {
    if (confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
        state.reservations = state.reservations.filter(r => r.id !== id);
        saveState();
        updateDisplay();
        updateReservationsTable();
    }
}

function clearAllReservations() {
    if (confirm('هل أنت متأكد من مسح جميع الحجوزات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        state.reservations = [];
        state.activities = [];
        saveState();
        updateDisplay();
        updateReservationsTable();
    }
}

function exportToCSV() {
    if (state.reservations.length === 0) {
        alert('لا توجد حجوزات للتصدير');
        return;
    }

    const headers = ['الاسم', 'الهاتف', 'الأسهم', 'الخصوصية', 'التاريخ'];
    const rows = state.reservations.map(r => [
        r.fullName, r.phone, r.shares, r.privacy,
        new Date(r.timestamp).toLocaleDateString('ar-EG')
    ]);

    const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function resetAdminPanel() {
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminDashboard').classList.remove('show');
    document.getElementById('adminPassword').value = '';
    document.getElementById('loginError').classList.remove('show');
}

// === HELPER FUNCTIONS ===
function getReservedShares() {
    return state.reservations.filter(r => r.visible).reduce((sum, r) => sum + r.shares, 0);
}

function getRemainingShares() {
    return state.settings.totalShares - getReservedShares();
}

function generateId() {
    return 'INV-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function addActivity(type, shares) {
    const messages = {
        reservation: `تم حجز ${shares} سهم الآن`,
        join: 'انضم مستثمر جديد للجولة'
    };

    state.activities.push({
        type,
        message: messages[type] || messages.join,
        timestamp: new Date().toISOString()
    });
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now - date) / 1000;

    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقائق`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعات`;
    return date.toLocaleDateString('ar-EG');
}

// === SAMPLE DATA ===
function generateSampleData() {
    if (state.reservations.length > 0) return;

    const sampleNames = [
        'أحمد محمد', 'سارة العلي', 'خالد الفهد', 'نورة الحسن',
        'محمد العمري', 'فاطمة الزهراء', 'عبدالله الشمري'
    ];

    const privacyOptions = ['anonymous', 'firstName', 'full'];

    sampleNames.forEach((name, i) => {
        state.reservations.push({
            id: generateId(),
            fullName: name,
            email: "", // user${i + 1}@example.com
            phone: `+966 5${Math.floor(Math.random() * 100000000)}`,
            shares: Math.floor(Math.random() * 50) + 10,
            privacy: privacyOptions[i % 3],
            image: null,
            visible: true,
            timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
        });

        addActivity('reservation', state.reservations[state.reservations.length - 1].shares);
    });

    saveState();
    updateDisplay();
}
