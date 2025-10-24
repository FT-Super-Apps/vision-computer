// API Base URL
const API_BASE = window.location.origin;

// State
let state = {
    pdfFile: null,
    docxFile: null,
    flaggedPhrases: [],
    strategy: 'header_focused',
    outputFile: null,
    currentStep: 1,
    matchedItems: [],
    bypassOutputFile: null
};

// DOM Elements
const elements = {
    pdfFile: document.getElementById('pdfFile'),
    docxFile: document.getElementById('docxFile'),
    pdfFileName: document.getElementById('pdfFileName'),
    docxFileName: document.getElementById('docxFileName'),
    btnAnalyze: document.getElementById('btnAnalyze'),
    btnBack: document.getElementById('btnBack'),
    btnProcess: document.getElementById('btnProcess'),
    btnDownload: document.getElementById('btnDownload'),
    btnReset: document.getElementById('btnReset'),
    btnMatchFlags: document.getElementById('btnMatchFlags'),
    btnBypassMatched: document.getElementById('btnBypassMatched'),
    btnDownloadBypass: document.getElementById('btnDownloadBypass'),
    flagsInput: document.getElementById('flagsInput'),
    flagsPreview: document.getElementById('flagsPreview'),
    flagsList: document.getElementById('flagsList'),
    matchResults: document.getElementById('matchResults'),
    matchedList: document.getElementById('matchedList'),
    unmatchedList: document.getElementById('unmatchedList'),
    bypassResults: document.getElementById('bypassResults'),
    bypassItemsList: document.getElementById('bypassItemsList'),
    errorBox: document.getElementById('errorBox'),
    errorMessage: document.getElementById('errorMessage')
};

// Initialize
function init() {
    setupEventListeners();
    showStep(1);
}

// Setup Event Listeners
function setupEventListeners() {
    // File inputs
    elements.pdfFile.addEventListener('change', (e) => handleFileSelect(e, 'pdf'));
    elements.docxFile.addEventListener('change', (e) => handleFileSelect(e, 'docx'));

    // Buttons
    elements.btnAnalyze.addEventListener('click', handleAnalyze);
    elements.btnBack.addEventListener('click', () => showStep(1));
    elements.btnProcess.addEventListener('click', handleProcess);
    elements.btnDownload.addEventListener('click', handleDownload);
    elements.btnReset.addEventListener('click', resetApp);
    elements.btnMatchFlags.addEventListener('click', handleMatchFlags);
    elements.btnBypassMatched.addEventListener('click', handleBypassMatched);
    elements.btnDownloadBypass.addEventListener('click', handleDownloadBypass);

    // Flags input - live preview
    elements.flagsInput.addEventListener('input', handleFlagsInput);

    // Error close
    document.querySelector('.error-close').addEventListener('click', hideError);

    // Tab buttons for match results
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active from all tabs
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Add active to clicked tab
            e.target.classList.add('active');
            const tabId = e.target.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Handle File Selection
function handleFileSelect(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    if (type === 'pdf') {
        state.pdfFile = file;
        elements.pdfFileName.textContent = file.name;
    } else {
        state.docxFile = file;
        elements.docxFileName.textContent = file.name;
    }

    // Enable analyze button if both files selected
    elements.btnAnalyze.disabled = !(state.pdfFile && state.docxFile);
}

// Show Error
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorBox.classList.remove('hidden');
    setTimeout(hideError, 5000);
}

// Hide Error
function hideError() {
    elements.errorBox.classList.add('hidden');
}

// Show Step
function showStep(step) {
    state.currentStep = step;
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
}

// Show loading modal
function showLoading() {
    const modal = document.getElementById('loadingModal');
    modal.classList.add('active');
}

// Hide loading modal
function hideLoading() {
    const modal = document.getElementById('loadingModal');
    modal.classList.remove('active');
}

// Update loading step
function updateLoadingStep(stepId, status) {
    // status: 'pending', 'active', 'completed'
    const step = document.getElementById(stepId);
    if (!step) return;

    // Remove all status classes
    step.classList.remove('active', 'completed', 'pulse');

    if (status === 'active') {
        step.classList.add('active', 'pulse');
        const icon = step.querySelector('.loading-step-icon');
        icon.textContent = '⚙️';
    } else if (status === 'completed') {
        step.classList.add('completed');
        const icon = step.querySelector('.loading-step-icon');
        icon.textContent = '✓';
    } else {
        // pending
        const icon = step.querySelector('.loading-step-icon');
        icon.textContent = '⏳';
    }
}

// Handle Analyze - Detect Flags from PDF
async function handleAnalyze() {
    try {
        // Show loading modal
        showLoading();

        // Step 1: Upload
        updateLoadingStep('step-upload', 'active');
        elements.btnAnalyze.disabled = true;

        // Upload PDF for highlight detection
        const formData = new FormData();
        formData.append('file', state.pdfFile);

        updateLoadingStep('step-upload', 'completed');

        // Step 2: Detect Highlights + OCR
        updateLoadingStep('step-ocr', 'active');

        const response = await fetch(`${API_BASE}/analyze/detect-flags`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to process PDF');
        }

        updateLoadingStep('step-ocr', 'completed');

        // Step 3: Extract
        updateLoadingStep('step-extract', 'active');

        const result = await response.json();

        if (!result.success) {
            throw new Error('Flag detection failed');
        }

        updateLoadingStep('step-extract', 'completed');

        // Step 4: Parse
        updateLoadingStep('step-parse', 'active');

        // Auto-populate flags input with detected flagged items
        const flagsText = result.flagged_items.join('\n');
        elements.flagsInput.value = flagsText;

        // Trigger the input handler to show preview
        handleFlagsInput();

        updateLoadingStep('step-parse', 'completed');

        // Step 5: Complete
        updateLoadingStep('step-complete', 'active');

        // Update step 2 info
        document.getElementById('pdfInfo').textContent = `${state.pdfFile.name} (${result.total_pages} pages, ${result.total_highlights} highlights, ${result.total_flags} flags extracted)`;
        document.getElementById('docxInfo').textContent = state.docxFile.name;

        // Show detection method if available
        if (result.method) {
            const infoBox = document.querySelector('#step2 .info-box');
            const methodInfo = document.createElement('p');
            methodInfo.innerHTML = `<strong>Detection Method:</strong> ${result.method}`;
            infoBox.appendChild(methodInfo);
        }

        updateLoadingStep('step-complete', 'completed');

        // Small delay before hiding loading and showing results
        await new Promise(resolve => setTimeout(resolve, 500));

        // Hide loading modal
        hideLoading();

        // Reset button state
        elements.btnAnalyze.disabled = false;

        // Go to step 2
        showStep(2);

        // Reset loading steps for next use
        setTimeout(() => {
            updateLoadingStep('step-upload', 'pending');
            updateLoadingStep('step-ocr', 'pending');
            updateLoadingStep('step-extract', 'pending');
            updateLoadingStep('step-parse', 'pending');
            updateLoadingStep('step-complete', 'pending');
        }, 1000);

    } catch (error) {
        console.error('Error:', error);
        hideLoading();
        showError(error.message);
        elements.btnAnalyze.disabled = false;

        // Reset loading steps
        updateLoadingStep('step-upload', 'pending');
        updateLoadingStep('step-ocr', 'pending');
        updateLoadingStep('step-extract', 'pending');
        updateLoadingStep('step-parse', 'pending');
        updateLoadingStep('step-complete', 'pending');
    }
}

// Handle Flags Input - Live Preview
function handleFlagsInput() {
    const input = elements.flagsInput.value.trim();

    if (!input) {
        elements.flagsPreview.style.display = 'none';
        elements.btnProcess.disabled = true;
        elements.btnMatchFlags.disabled = true;
        return;
    }

    // Split by newlines and filter empty lines
    const lines = input.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    state.flaggedPhrases = lines;

    // Update preview
    document.getElementById('totalFlags').textContent = lines.length;
    displayFlagsList(lines);
    elements.flagsPreview.style.display = 'block';

    // Enable process button if we have flags
    elements.btnProcess.disabled = lines.length === 0;

    // Enable match button if we have flags and original file
    elements.btnMatchFlags.disabled = !(lines.length > 0 && state.docxFile);
}

// Handle Match Flags
async function handleMatchFlags() {
    try {
        if (!state.pdfFile || !state.docxFile) {
            throw new Error('Both PDF and original document files are required');
        }

        elements.btnMatchFlags.disabled = true;
        showLoading('Matching flags dengan file original...');

        const formData = new FormData();
        formData.append('turnitin_pdf', state.pdfFile);
        formData.append('original_doc', state.docxFile);

        const response = await fetch(`${API_BASE}/analyze/match-flags`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to match flags');
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error('Flag matching failed');
        }

        // Hide loading modal
        hideLoading();

        // Display match results
        displayMatchResults(result);

        // Enable button again
        elements.btnMatchFlags.disabled = false;

    } catch (error) {
        console.error('Error:', error);
        hideLoading();
        showError('Match failed: ' + error.message);
        elements.btnMatchFlags.disabled = false;
    }
}

// Display Match Results
function displayMatchResults(result) {
    const {
        total_flagged,
        total_matched,
        total_unmatched,
        match_percentage,
        matched_items,
        unmatched_items
    } = result;

    // Update match stats
    document.getElementById('matchTotal').textContent = total_flagged;
    document.getElementById('matchMatched').textContent = total_matched;
    document.getElementById('matchUnmatched').textContent = total_unmatched;
    document.getElementById('matchPercentage').textContent = match_percentage + '%';
    document.getElementById('matchedCount').textContent = total_matched;
    document.getElementById('unmatchedCount').textContent = total_unmatched;

    // Display matched items
    elements.matchedList.innerHTML = '';
    if (matched_items && matched_items.length > 0) {
        matched_items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'match-item matched';
            div.innerHTML = `
                <div class="match-item-header">
                    <strong>${index + 1}. Match Score: ${item.similarity_score}% ✓</strong>
                </div>
                <div class="match-comparison">
                    <div class="match-column turnitin">
                        <div class="column-label">📄 From Turnitin (Flagged):</div>
                        <div class="column-text">"${escapeHtml(item.flagged_text)}"</div>
                    </div>
                    <div class="match-arrow">→</div>
                    <div class="match-column original">
                        <div class="column-label">📝 From Original Document:</div>
                        <div class="column-text">"${escapeHtml(item.matched_text)}"</div>
                    </div>
                </div>
            `;
            elements.matchedList.appendChild(div);
        });
    } else {
        elements.matchedList.innerHTML = '<p>No matched items found.</p>';
    }

    // Display unmatched items
    elements.unmatchedList.innerHTML = '';
    if (unmatched_items && unmatched_items.length > 0) {
        unmatched_items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'match-item unmatched';
            div.innerHTML = `
                <div class="match-item-header">
                    <strong>${index + 1}. Best Score: ${item.best_score}% ✗</strong>
                </div>
                <div class="match-comparison">
                    <div class="match-column turnitin">
                        <div class="column-label">📄 Flagged Text:</div>
                        <div class="column-text">"${escapeHtml(item.flagged_text)}"</div>
                    </div>
                    <div class="match-status-unmatched">
                        ⚠️ Tidak ditemukan di file original<br>
                        <small>(Similarity score < 80%)</small>
                    </div>
                </div>
            `;
            elements.unmatchedList.appendChild(div);
        });
    } else {
        elements.unmatchedList.innerHTML = '<p>All items matched!</p>';
    }

    // Show match results
    elements.matchResults.style.display = 'block';

    // Store matched items in state for bypass
    state.matchedItems = matched_items;

    // Enable bypass button if we have matched items
    elements.btnBypassMatched.disabled = matched_items.length === 0;

    // Update matched count in info box
    document.getElementById('matchedCountInfo').textContent = matched_items.length;

    // DISABLE old Process button - user should use new bypass button instead
    elements.btnProcess.disabled = true;
    elements.btnProcess.style.opacity = '0.5';
    elements.btnProcess.style.cursor = 'not-allowed';
    elements.btnProcess.title = 'Gunakan "Apply Bypass ke Matched Items" untuk memodifikasi SEMUA flagged text';
}

// Helper function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Handle Bypass Matched Flags
async function handleBypassMatched() {
    try {
        if (!state.matchedItems || state.matchedItems.length === 0) {
            throw new Error('No matched items to bypass');
        }

        if (!state.docxFile) {
            throw new Error('Original document file is required');
        }

        elements.btnBypassMatched.disabled = true;
        showLoading('Applying bypass ke semua matched items...');

        // Extract flagged text from matched items
        const flaggedTexts = state.matchedItems.map(item => item.flagged_text).join('\n');

        const formData = new FormData();
        formData.append('original_doc', state.docxFile);
        formData.append('flagged_text', flaggedTexts);
        formData.append('homoglyph_density', 0.95);
        formData.append('invisible_density', 0.40);

        const response = await fetch(`${API_BASE}/analyze/bypass-matched-flags`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to apply bypass');
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error('Bypass process failed');
        }

        // Hide loading
        hideLoading();

        // Display bypass results in Step 2
        displayBypassResults(result);

        // Update Step 4 stats dengan bypass results
        updateStep4StatsFromBypass(result);

        // Enable button again
        elements.btnBypassMatched.disabled = false;

    } catch (error) {
        console.error('Error:', error);
        hideLoading();
        showError('Bypass failed: ' + error.message);
        elements.btnBypassMatched.disabled = false;
    }
}

// Display Bypass Results
function displayBypassResults(result) {
    const {
        total_flagged_items,
        total_replacements,
        processed_items,
        processed_flags,
        output_file
    } = result;

    // Update bypass stats
    document.getElementById('bypassTotal').textContent = total_flagged_items;
    document.getElementById('bypassProcessed').textContent = processed_items;
    document.getElementById('bypassReplacements').textContent = total_replacements;

    // Store output file path for download
    state.bypassOutputFile = output_file;

    // Display processed items
    elements.bypassItemsList.innerHTML = '';
    if (processed_flags && processed_flags.length > 0) {
        processed_flags.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'bypass-item';
            div.innerHTML = `
                <div class="bypass-item-header">
                    <strong>${index + 1}. ${escapeHtml(item.flagged_text)}</strong>
                    <span class="bypass-badge">${item.replacements_made} replacement(s)</span>
                </div>
                <div class="bypass-item-modified">
                    <small>Modified: ${escapeHtml(item.modified_version)}</small>
                </div>
            `;
            elements.bypassItemsList.appendChild(div);
        });
    } else {
        elements.bypassItemsList.innerHTML = '<p>No items were processed.</p>';
    }

    // Show bypass results
    elements.bypassResults.style.display = 'block';
}

// Update Step 4 stats dengan bypass results
function updateStep4StatsFromBypass(result) {
    const {
        total_flagged_items,
        total_replacements,
        processed_items
    } = result;

    // Update Step 4 completion stats dengan bypass results
    document.getElementById('statsHeaders').textContent = processed_items + ' matched items';
    document.getElementById('statsPhrases').textContent = total_replacements + ' replacements';
    document.getElementById('statsTotal').textContent = total_replacements + ' modifications (All Flagged Text)';
    document.getElementById('statsStrategy').textContent = 'Matched Items Bypass (Homoglyph 95% + Invisible 40%)';

    // Store output file untuk Step 4 download
    state.outputFile = result.output_file;
}

// Handle Download Bypass
async function handleDownloadBypass() {
    if (!state.bypassOutputFile) {
        showError('No bypass output file available');
        return;
    }

    try {
        // Extract just the filename from the path
        const filename = state.bypassOutputFile.split('/').pop();

        // Download the file
        const response = await fetch(`${API_BASE}/bypass/download/${filename}`);
        if (!response.ok) {
            throw new Error('Failed to download file');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `modified_bypass_${Date.now()}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Download error:', error);
        showError('Download failed: ' + error.message);
    }
}

// Display Flags List
function displayFlagsList(phrases) {
    elements.flagsList.innerHTML = '';

    if (phrases.length === 0) {
        elements.flagsList.innerHTML = '<p>No flagged phrases found.</p>';
        return;
    }

    phrases.forEach((phrase, index) => {
        const div = document.createElement('div');
        div.className = 'flag-item';
        div.innerHTML = `<strong>${index + 1}.</strong> ${phrase}`;
        elements.flagsList.appendChild(div);
    });
}

// Handle Process - Apply Bypass
async function handleProcess() {
    try {
        showStep(3);
        updateProgress(10, 'Preparing files...');

        // Create flag file from extracted phrases
        const flagContent = state.flaggedPhrases.join('\n');
        const flagBlob = new Blob([flagContent], { type: 'text/plain' });

        updateProgress(30, 'Uploading files...');

        // Upload DOCX and process bypass
        const formData = new FormData();
        formData.append('file', state.docxFile);
        formData.append('strategy', state.strategy);

        updateProgress(50, 'Applying bypass technique...');
        const response = await fetch(`${API_BASE}/bypass/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to process document');
        }

        updateProgress(80, 'Finalizing...');
        const result = await response.json();

        if (!result.success) {
            throw new Error('Bypass processing failed');
        }

        state.outputFile = result.output_file;

        updateProgress(100, 'Complete!');

        // Show results
        setTimeout(() => {
            displayResults(result);
            showStep(4);
        }, 500);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
        showStep(2);
    }
}

// Display Results
function displayResults(result) {
    document.getElementById('statsHeaders').textContent = result.statistics.headers_modified;
    document.getElementById('statsPhrases').textContent = result.statistics.phrases_modified;
    document.getElementById('statsTotal').textContent = result.statistics.total_modifications;
    document.getElementById('statsStrategy').textContent = result.strategy;
}

// Handle Download
async function handleDownload() {
    try {
        const filename = state.outputFile.split('/').pop();
        const response = await fetch(`${API_BASE}/bypass/download/${filename}`);

        if (!response.ok) {
            throw new Error('Failed to download file');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        console.error('Error:', error);
        showError('Failed to download file');
    }
}

// Update Progress
function updateProgress(percent, message) {
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('processingStatus').textContent = message;
}

// Reset App
function resetApp() {
    state = {
        pdfFile: null,
        docxFile: null,
        flaggedPhrases: [],
        strategy: 'header_focused',
        outputFile: null,
        currentStep: 1
    };

    elements.pdfFile.value = '';
    elements.docxFile.value = '';
    elements.pdfFileName.textContent = 'Belum ada file';
    elements.docxFileName.textContent = 'Belum ada file';
    elements.btnAnalyze.disabled = true;
    elements.strategySelect.value = 'header_focused';

    showStep(1);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
