/**
 * SoulScript — "Speak Human. We'll Speak AI."
 * Frontend Application Logic
 * 
 * This file handles all the interactivity:
 * - Loading data from the backend
 * - Managing the multi-stage UI flow
 * - Theme switching (dark/light)
 * - Sending thoughts to the Gemini API via our Flask backend
 * - Displaying results
 * - Copy to clipboard
 * - Prompt history (localStorage)
 */

// ============================================
// STATE
// Keep track of what the user has selected
// ============================================

const state = {
    selectedCategory: null,     // Which category pill is active
    currentThought: '',         // The raw thought text
    aiProfiles: {},             // AI profile data from backend
    categories: [],             // Category data from backend
    history: [],                // Past prompt transformations
};

// ============================================
// DOM ELEMENTS
// Grab references to HTML elements we'll interact with
// ============================================

const elements = {
    // Stages
    stageHome: document.getElementById('stageHome'),
    stageLoading: document.getElementById('stageLoading'),
    stageResults: document.getElementById('stageResults'),
    stageAiGuide: document.getElementById('stageAiGuide'),
    stageHistory: document.getElementById('stageHistory'),

    // Inputs & Buttons
    thoughtInput: document.getElementById('thoughtInput'),
    transformBtn: document.getElementById('transformBtn'),
    categoryPills: document.getElementById('categoryPills'),
    copyBtn: document.getElementById('copyBtn'),
    backBtn: document.getElementById('backBtn'),
    refineBtn: document.getElementById('refineBtn'),
    themeToggle: document.getElementById('themeToggle'),
    themeToggleMobile: document.getElementById('themeToggleMobile'),
    hamburgerBtn: document.getElementById('hamburgerBtn'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),

    // Result displays
    originalThoughtText: document.getElementById('originalThoughtText'),
    intentText: document.getElementById('intentText'),
    aiRecommendations: document.getElementById('aiRecommendations'),
    promptText: document.getElementById('promptText'),
    tipsGrid: document.getElementById('tipsGrid'),

    // Panels
    aiMiniList: document.getElementById('aiMiniList'),
    aiGuideGrid: document.getElementById('aiGuideGrid'),
    rightPanel: document.getElementById('rightPanel'),
    historyList: document.getElementById('historyList'),
};

// ============================================
// INITIALIZATION
// This runs when the page first loads
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();          // Apply saved theme
    updateGreeting();     // Set time-based greeting
    loadCategories();     // Fetch categories from backend
    loadAIProfiles();     // Fetch AI profiles from backend
    loadHistory();        // Load history from localStorage
    setupEventListeners(); // Wire up all buttons and interactions
});

// ============================================
// THEME MANAGEMENT
// Switches between dark and light themes
// ============================================

function loadTheme() {
    // Check if user previously picked a theme
    const savedTheme = localStorage.getItem('soulscript-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    // Save preference so it persists across page reloads
    localStorage.setItem('soulscript-theme', next);
}

// ============================================
// GREETING
// Shows "Good morning/afternoon/evening" based on time
// ============================================

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    const h1 = document.querySelector('.greeting h1');
    if (h1) h1.textContent = `${greeting} 👋`;
}

// ============================================
// DATA LOADING
// Fetch categories and AI profiles from the Flask backend
// ============================================

async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        state.categories = await response.json();
        renderCategoryPills();
    } catch (error) {
        console.error('Failed to load categories:', error);
        // Fallback: render a basic set of categories
        renderFallbackPills();
    }
}

async function loadAIProfiles() {
    try {
        const response = await fetch('/api/ai-profiles');
        state.aiProfiles = await response.json();
        renderAIMiniList();
        renderAIGuidePage();
    } catch (error) {
        console.error('Failed to load AI profiles:', error);
    }
}

// ============================================
// RENDER FUNCTIONS
// These build the HTML for different parts of the UI
// ============================================

function renderCategoryPills() {
    elements.categoryPills.innerHTML = state.categories.map(cat => `
        <button class="pill" data-category="${cat.id}">
            <span class="pill-icon">${cat.icon}</span>
            <span>${cat.name}</span>
        </button>
    `).join('');

    // Add click handlers to each pill
    elements.categoryPills.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', () => {
            // Deselect all pills
            elements.categoryPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            // Select this one
            pill.classList.add('active');
            state.selectedCategory = pill.dataset.category;
            updateTransformButton();
        });
    });
}

function renderFallbackPills() {
    const fallback = [
        { id: 'writing', icon: '✍️', name: 'Writing' },
        { id: 'coding', icon: '💻', name: 'Code' },
        { id: 'image', icon: '🎨', name: 'Art' },
        { id: 'research', icon: '🔍', name: 'Research' },
        { id: 'creative', icon: '🎭', name: 'Creative' },
        { id: 'summarize', icon: '📋', name: 'Summarize' },
        { id: 'translate', icon: '🌍', name: 'Translate' },
    ];
    state.categories = fallback;
    renderCategoryPills();
}

function renderAIMiniList() {
    const profiles = state.aiProfiles;
    elements.aiMiniList.innerHTML = Object.entries(profiles).map(([key, ai]) => `
        <div class="ai-mini-item" title="${ai.tagline}">
            <div class="ai-mini-icon" style="background: ${ai.color}">
                ${ai.icon}
            </div>
            <div class="ai-mini-info">
                <span class="ai-mini-name">${ai.name}</span>
                <span class="ai-mini-tagline">${ai.tagline}</span>
            </div>
        </div>
    `).join('');
}

function renderAIGuidePage() {
    const profiles = state.aiProfiles;
    elements.aiGuideGrid.innerHTML = Object.entries(profiles).map(([key, ai]) => `
        <div class="ai-guide-card">
            <div class="ai-guide-header">
                <div class="ai-guide-icon" style="background: ${ai.color}">
                    ${ai.icon}
                </div>
                <div>
                    <div class="ai-guide-title">
                        ${ai.name}
                        <span class="ai-guide-free ${ai.free_tier ? 'yes' : 'no'}">
                            ${ai.free_tier ? 'FREE' : 'PAID'}
                        </span>
                    </div>
                    <div class="ai-guide-tagline">${ai.tagline}</div>
                </div>
            </div>
            <ul class="ai-guide-best-for">
                ${ai.best_for.map(item => `<li>${item}</li>`).join('')}
            </ul>
            <a href="${ai.url}" target="_blank" class="ai-guide-link">
                Visit ${ai.name} →
            </a>
        </div>
    `).join('');
}

function renderResults(data) {
    // Show the original thought
    elements.originalThoughtText.textContent = state.currentThought;

    // Show what SoulScript understood
    elements.intentText.textContent = data.understood_intent;

    // Render AI recommendations
    elements.aiRecommendations.innerHTML = data.recommended_ais.map((ai, index) => {
        const profile = state.aiProfiles[ai.key] || {};
        const color = profile.color || '#6c9eff';
        const confidencePercent = Math.round(ai.confidence * 100);
        
        return `
            <div class="ai-rec-card">
                <div class="ai-rec-header">
                    <div class="ai-rec-name">
                        <div class="ai-color-dot" style="background: ${color}"></div>
                        <span>${ai.name}</span>
                    </div>
                    <span class="ai-rec-confidence">${confidencePercent}%</span>
                </div>
                <div class="ai-rec-reason">${ai.reason}</div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${confidencePercent}%; background: ${color}"></div>
                </div>
                ${profile.url ? `<a href="${profile.url}" target="_blank" class="ai-rec-link">Open ${ai.name} →</a>` : ''}
            </div>
        `;
    }).join('');

    // Render the generated prompt
    elements.promptText.textContent = data.generated_prompt;

    // Render tips
    if (data.tips && data.tips.length > 0) {
        elements.tipsGrid.innerHTML = data.tips.map(tip => `
            <div class="tip-card">
                <span class="tip-icon">💡</span>
                ${tip}
            </div>
        `).join('');
    }
}

function renderHistory() {
    if (state.history.length === 0) {
        elements.historyList.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📭</span>
                <p>No prompts yet. Go create your first one!</p>
            </div>
        `;
        return;
    }

    elements.historyList.innerHTML = state.history.map((item, index) => `
        <div class="history-item" data-index="${index}">
            <div class="history-thought">${item.thought}</div>
            <div class="history-meta">
                <span>${item.category}</span>
                <span>•</span>
                <span>${item.ai}</span>
                <span>•</span>
                <span>${item.date}</span>
            </div>
        </div>
    `).join('');
}

// ============================================
// STAGE MANAGEMENT
// Controls which stage/page is visible
// ============================================

function showStage(stageId) {
    // Hide all stages
    document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
    // Show the requested stage
    const stage = document.getElementById(stageId);
    if (stage) stage.classList.add('active');

    // Show/hide the right panel (only visible on home)
    if (elements.rightPanel) {
        elements.rightPanel.style.display = 
            (stageId === 'stageHome') ? '' : 'none';
    }
}

function navigateTo(page) {
    // Update nav item active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Map page names to stage IDs
    const pageMap = {
        'home': 'stageHome',
        'new-prompt': 'stageHome',  // Same as home for now
        'history': 'stageHistory',
        'ai-guide': 'stageAiGuide',
        'templates': 'stageHome',   // Same as home for now
    };

    showStage(pageMap[page] || 'stageHome');
    closeMobileSidebar();
}

// ============================================
// CORE FUNCTIONALITY
// The main transform flow
// ============================================

async function transformThought() {
    const thought = elements.thoughtInput.value.trim();
    if (!thought || !state.selectedCategory) return;

    state.currentThought = thought;

    // Show loading stage
    showStage('stageLoading');

    try {
        // Send the thought to our Flask backend
        const response = await fetch('/api/transform', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                thought: thought,
                category: state.selectedCategory
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Something went wrong');
        }

        const data = await response.json();
        
        // Save to history
        saveToHistory(thought, data);

        // Render and show results
        renderResults(data);
        showStage('stageResults');

    } catch (error) {
        console.error('Transform failed:', error);
        // Show error in results area
        showStage('stageResults');
        elements.aiRecommendations.innerHTML = `
            <div class="error-card">
                <span class="error-icon">😵</span>
                <p class="error-message">${error.message}</p>
                <button class="btn-secondary" onclick="navigateTo('home')">
                    ← Try again
                </button>
            </div>
        `;
        elements.promptText.textContent = '';
        elements.intentText.textContent = 'Could not process your thought.';
        elements.tipsGrid.innerHTML = '';
    }
}

// ============================================
// CLIPBOARD
// Copy the generated prompt to clipboard
// ============================================

async function copyPrompt() {
    const text = elements.promptText.textContent;
    if (!text) return;

    try {
        await navigator.clipboard.writeText(text);
        // Visual feedback
        const copyText = elements.copyBtn.querySelector('.copy-text');
        const originalText = copyText.textContent;
        copyText.textContent = 'Copied!';
        elements.copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyText.textContent = originalText;
            elements.copyBtn.classList.remove('copied');
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

// ============================================
// HISTORY
// Store and retrieve past transformations
// ============================================

function saveToHistory(thought, data) {
    const entry = {
        thought: thought,
        category: state.selectedCategory,
        ai: data.recommended_ais?.[0]?.name || 'Unknown',
        prompt: data.generated_prompt,
        intent: data.understood_intent,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now()
    };
    state.history.unshift(entry); // Add to beginning
    // Keep only last 50 entries
    if (state.history.length > 50) state.history.pop();
    localStorage.setItem('soulscript-history', JSON.stringify(state.history));
    renderHistory();
}

function loadHistory() {
    try {
        const saved = localStorage.getItem('soulscript-history');
        state.history = saved ? JSON.parse(saved) : [];
    } catch (e) {
        state.history = [];
    }
    renderHistory();
}

// ============================================
// UI HELPERS
// Small utility functions
// ============================================

function updateTransformButton() {
    // Enable the button only when there's text AND a category selected
    const hasText = elements.thoughtInput.value.trim().length > 0;
    const hasCat = state.selectedCategory !== null;
    elements.transformBtn.disabled = !(hasText && hasCat);
}

function closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.remove('open');
    elements.sidebarOverlay.classList.remove('active');
}

// ============================================
// EVENT LISTENERS
// Wire up all the interactive elements
// ============================================

function setupEventListeners() {
    // --- Transform button ---
    elements.transformBtn.addEventListener('click', transformThought);

    // --- Text input: enable/disable button ---
    elements.thoughtInput.addEventListener('input', updateTransformButton);

    // --- Enter key to submit (Ctrl+Enter or Cmd+Enter) ---
    elements.thoughtInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (!elements.transformBtn.disabled) {
                transformThought();
            }
        }
    });

    // --- Copy button ---
    elements.copyBtn.addEventListener('click', copyPrompt);

    // --- Back button ---
    elements.backBtn.addEventListener('click', () => {
        navigateTo('home');
    });

    // --- Refine button ---
    elements.refineBtn.addEventListener('click', () => {
        // Go back to home with the same thought pre-filled
        navigateTo('home');
        elements.thoughtInput.value = state.currentThought;
        updateTransformButton();
        elements.thoughtInput.focus();
    });

    // --- Theme toggles ---
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.themeToggleMobile.addEventListener('click', toggleTheme);

    // --- Sidebar navigation ---
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.page);
        });
    });

    // --- Mobile hamburger ---
    elements.hamburgerBtn.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('open');
        elements.sidebarOverlay.classList.toggle('active');
    });

    elements.sidebarOverlay.addEventListener('click', closeMobileSidebar);

    // --- Template cards ---
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            const template = card.dataset.template;
            elements.thoughtInput.value = template;
            elements.thoughtInput.focus();
            updateTransformButton();
            // Scroll to the thought input
            elements.thoughtInput.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // --- History items ---
    elements.historyList.addEventListener('click', (e) => {
        const historyItem = e.target.closest('.history-item');
        if (historyItem) {
            const index = parseInt(historyItem.dataset.index);
            const item = state.history[index];
            if (item) {
                // Fill in the thought and navigate to home
                elements.thoughtInput.value = item.thought;
                state.selectedCategory = item.category;
                navigateTo('home');
                updateTransformButton();
                // Highlight the matching category pill
                elements.categoryPills.querySelectorAll('.pill').forEach(pill => {
                    pill.classList.toggle('active', pill.dataset.category === item.category);
                });
            }
        }
    });
}
