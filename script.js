// Navigation functionality and chart initialization
document.addEventListener('DOMContentLoaded', async function() {
    // Mobile menu toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            // Only prevent default and smooth scroll if it's a hash link on the same page
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
            // Otherwise let the link work normally (for cross-page navigation)
        });
    });

    // Scroll-triggered animations for visualization cards (optimized)
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        // Use requestAnimationFrame for smooth animations
        requestAnimationFrame(() => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        });
    }, observerOptions);

    // Observe all visualization containers with lazy loading
    document.querySelectorAll('.viz-container, .viz-description').forEach(el => {
        observer.observe(el);
    });

    // Fetch data from GitHub API and create charts
    breachData = await fetchBreachData();
    
    if (breachData.length === 0) {
        console.error('No data available to display');
        alert('Failed to load data. Please check the console for details.');
        return;
    }
    
    console.log('Loaded breach data:', breachData.length, 'records');
    console.log('Sample data:', breachData.slice(0, 2));
    console.log('Chart.js available?', typeof Chart !== 'undefined');
    
    // Create charts with lazy loading when they become visible
    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const canvas = entry.target;
                const canvasId = canvas.id;
                
                if (canvasId === 'visualization1' && !chart1) {
                    createChart1();
                } else if (canvasId === 'visualization2' && !chart2) {
                    createChart2();
                } else if (canvasId === 'visualization3' && !chart3) {
                    createChart3();
                }
                
                chartObserver.unobserve(canvas);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '100px'
    });
    
    // Observe all chart canvases
    document.querySelectorAll('#visualization1, #visualization2, #visualization3').forEach(canvas => {
        chartObserver.observe(canvas);
    });
    
    // Setup chart zoom modal
    setupChartZoom();
});

// Chart zoom modal functionality
function setupChartZoom() {
    const zoomButtons = document.querySelectorAll('.btn-icon');
    
    zoomButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const vizContainer = button.closest('.viz-container');
            const canvasId = vizContainer.querySelector('canvas').id;
            const title = vizContainer.querySelector('.viz-title').textContent;
            
            // Determine which chart to recreate
            let chartNumber = parseInt(canvasId.replace('visualization', ''));
            openChartModal(chartNumber, title);
        });
    });
}

function openChartModal(chartNumber, title) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'chart-modal';
    modal.innerHTML = `
        <div class="chart-modal-content">
            <div class="chart-modal-header">
                <h2>${title}</h2>
                <button class="chart-modal-close" aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="chart-modal-body">
                <canvas id="modal-canvas"></canvas>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Recreate the chart in modal with larger size
    const modalCanvas = modal.querySelector('#modal-canvas');
    const ctx = modalCanvas.getContext('2d');
    
    // Create chart based on number
    let modalChart;
    if (chartNumber === 1) {
        modalChart = createModalChart1(ctx);
    } else if (chartNumber === 2) {
        modalChart = createModalChart2(ctx);
    } else if (chartNumber === 3) {
        modalChart = createModalChart3(ctx);
    }
    
    // Close modal handlers
    const closeBtn = modal.querySelector('.chart-modal-close');
    const closeHandler = () => {
        if (modalChart) {
            modalChart.destroy();
        }
        closeChartModal(modal);
    };
    
    closeBtn.addEventListener('click', closeHandler);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeHandler();
        }
    });
    
    // ESC key to close
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeHandler();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
    
    // Animate in
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeChartModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
}

// Modal Chart 1 - Same as createChart1 but for modal
function createModalChart1(ctx) {
    const countryMap = new Map();
    breachData.forEach(breach => {
        const country = breach.country;
        const users = breach.affected_users || 0;
        if (countryMap.has(country)) {
            countryMap.set(country, countryMap.get(country) + users);
        } else {
            countryMap.set(country, users);
        }
    });
    
    const sortedData = Array.from(countryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const labels = sortedData.map(d => d[0]);
    const data = sortedData.map(d => d[1]);
    
    const backgroundColors = sortedData.map((_, i) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 600);
        if (i < 3) {
            gradient.addColorStop(0, '#ff00f5');
            gradient.addColorStop(1, '#b026ff');
        } else if (i < 6) {
            gradient.addColorStop(0, '#b026ff');
            gradient.addColorStop(1, '#00f0ff');
        } else {
            gradient.addColorStop(0, '#00f0ff');
            gradient.addColorStop(1, 'rgba(0, 240, 255, 0.5)');
        }
        return gradient;
    });
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Records Exposed',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: '#00f0ff',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.8,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 39, 0.95)',
                    titleColor: '#ff00f5',
                    titleFont: { size: 16, weight: 'bold' },
                    bodyColor: '#ffffff',
                    bodyFont: { size: 14 },
                    borderColor: '#00f0ff',
                    borderWidth: 1,
                    padding: 15,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            const country = sortedData[context.dataIndex][0];
                            const users = sortedData[context.dataIndex][1];
                            return [
                                `🌍 Country: ${country}`,
                                `👥 Affected Users: ${formatNumber(users)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(176, 38, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#a0aec0',
                        font: { size: 13, family: 'Inter, sans-serif' },
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#a0aec0',
                        font: { size: 13, family: 'Inter, sans-serif' },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Modal Chart 2 - Same as createChart2 but for modal
function createModalChart2(ctx) {
    const yearMap = new Map();
    breachData.forEach(breach => {
        const year = breach.year;
        const users = breach.affected_users || 0;
        if (yearMap.has(year)) {
            yearMap.set(year, yearMap.get(year) + users);
        } else {
            yearMap.set(year, users);
        }
    });
    
    const sortedYears = Array.from(yearMap.entries())
        .sort((a, b) => a[0] - b[0]);
    
    const labels = sortedYears.map(d => d[0]);
    const data = sortedYears.map(d => d[1]);
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 500);
    gradient.addColorStop(0, 'rgba(176, 38, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 245, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 240, 255, 0.4)');
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Records Exposed',
                data: data,
                borderColor: '#b026ff',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ff00f5',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.8,
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 39, 0.95)',
                    titleColor: '#ff00f5',
                    titleFont: { size: 16, weight: 'bold' },
                    bodyColor: '#ffffff',
                    bodyFont: { size: 14 },
                    borderColor: '#b026ff',
                    borderWidth: 1,
                    padding: 15,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `👥 Affected Users: ${formatNumber(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 240, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#a0aec0',
                        font: { size: 13, family: 'Inter, sans-serif' },
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(176, 38, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#a0aec0',
                        font: { size: 13, family: 'Inter, sans-serif' }
                    }
                }
            }
        }
    });
}

// Modal Chart 3 - Same as createChart3 but for modal
function createModalChart3(ctx) {
    const attackTypeColors = {
        'Phishing': 'rgba(255, 99, 132, 0.8)',
        'Malware': 'rgba(54, 162, 235, 0.8)',
        'Ransomware': 'rgba(255, 206, 86, 0.8)',
        'DDoS': 'rgba(75, 192, 192, 0.8)',
        'SQL Injection': 'rgba(153, 102, 255, 0.8)',
        'Zero-Day Exploit': 'rgba(255, 159, 64, 0.8)',
        'Insider Threat': 'rgba(231, 76, 60, 0.8)',
        'Credential Stuffing': 'rgba(46, 204, 113, 0.8)',
        'Man-in-the-Middle': 'rgba(155, 89, 182, 0.8)',
        'Brute Force': 'rgba(52, 152, 219, 0.8)'
    };
    
    const industryData = {};
    const attackTypes = new Set();
    
    breachData.forEach(breach => {
        const industry = breach.target_industry;
        const attackType = breach.attack_type;
        const users = breach.affected_users || 0;
        
        if (!industryData[industry]) {
            industryData[industry] = {};
        }
        if (!industryData[industry][attackType]) {
            industryData[industry][attackType] = 0;
        }
        
        industryData[industry][attackType] += users;
        attackTypes.add(attackType);
    });
    
    const industries = Object.keys(industryData)
        .map(industry => ({
            name: industry,
            total: Object.values(industryData[industry]).reduce((sum, val) => sum + val, 0)
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 8)
        .map(item => item.name);
    
    const datasets = Array.from(attackTypes).map(attackType => {
        return {
            label: attackType,
            data: industries.map(industry => industryData[industry][attackType] || 0),
            backgroundColor: attackTypeColors[attackType] || 'rgba(169, 169, 169, 0.8)',
            borderColor: (attackTypeColors[attackType] || 'rgba(169, 169, 169, 0.8)').replace('0.8', '1'),
            borderWidth: 1
        };
    });
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: industries,
            datasets: datasets
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#a0aec0',
                        font: { size: 11, family: 'Inter, sans-serif', weight: '500' },
                        padding: 10,
                        usePointStyle: true,
                        pointStyle: 'rect',
                        boxWidth: 15,
                        boxHeight: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 39, 0.95)',
                    titleColor: '#ff00f5',
                    titleFont: { size: 16, weight: 'bold' },
                    bodyColor: '#ffffff',
                    bodyFont: { size: 14 },
                    borderColor: '#00f0ff',
                    borderWidth: 1,
                    padding: 15,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const attackType = context.dataset.label;
                            const users = context.parsed.x;
                            return `${attackType}: ${formatNumber(users)} users`;
                        },
                        footer: function(tooltipItems) {
                            const total = tooltipItems.reduce((sum, item) => sum + item.parsed.x, 0);
                            return `Total: ${formatNumber(total)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 240, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#a0aec0',
                        font: { size: 12, family: 'Inter, sans-serif' },
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    },
                    title: {
                        display: true,
                        text: 'Affected Users',
                        color: '#a0aec0',
                        font: { size: 13, family: 'Inter, sans-serif', weight: 'bold' }
                    }
                },
                y: {
                    stacked: true,
                    grid: { display: false },
                    ticks: {
                        color: '#a0aec0',
                        font: { size: 12, family: 'Inter, sans-serif' }
                    },
                    title: {
                        display: true,
                        text: 'Industry',
                        color: '#a0aec0',
                        font: { size: 13, family: 'Inter, sans-serif', weight: 'bold' }
                    }
                }
            }
        }
    });
}

// Smooth scroll function for buttons
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Global data storage
let breachData = [];
let chart1, chart2, chart3;

// Fetch breach data from your GitHub API with caching
async function fetchBreachData() {
    try {
        // Check localStorage cache (24 hour expiry)
        const cacheKey = 'breachData_cache';
        const cacheTimeKey = 'breachData_cache_time';
        const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(cacheTimeKey);
        
        if (cachedData && cacheTime) {
            const age = Date.now() - parseInt(cacheTime);
            if (age < cacheExpiry) {
                console.log('✓ Using cached breach data');
                return JSON.parse(cachedData);
            }
        }
        
        console.log('Fetching breach data from GitHub...');
        const response = await fetch('https://raw.githubusercontent.com/Beke-Tibor-Roland/Beke-Tibor-Roland.github.io/main/api/data_breaches_global.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            cache: 'force-cache'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        console.log('Raw API response type:', Array.isArray(jsonData) ? 'Array' : typeof jsonData);
        console.log('First item sample:', jsonData[0]);
        
        // The API returns a direct array
        if (!Array.isArray(jsonData)) {
            console.error('Unexpected data format:', jsonData);
            throw new Error('Data is not in expected array format');
        }
        
        console.log(`✓ Loaded ${jsonData.length} breach records from GitHub`);
        
        // Cache the data
        try {
            localStorage.setItem(cacheKey, JSON.stringify(jsonData));
            localStorage.setItem(cacheTimeKey, Date.now().toString());
            console.log('✓ Data cached for 24 hours');
        } catch (e) {
            console.warn('Could not cache data:', e);
        }
        
        return jsonData;
    } catch (error) {
        console.error('Error fetching breach data:', error);
        console.error('Error details:', error.message);
        alert('Failed to load breach data. Please check your internet connection or API configuration.\n\nError: ' + error.message);
        return [];
    }
}

// Helper function to format large numbers
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Helper function to create gradients
function createGradient(ctx, colorStops) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    colorStops.forEach(stop => {
        gradient.addColorStop(stop.position, stop.color);
    });
    return gradient;
}

// Visualization 1: Top Breaches Bar Chart
function createChart1() {
    console.log('Creating Chart 1...');
    const canvas = document.getElementById('visualization1');
    
    if (!canvas) {
        console.error('Canvas visualization1 not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    console.log('Canvas created for Chart 1');
    
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded!');
        return;
    }
    
    // Aggregate by country and sum affected users
    const countryMap = new Map();
    breachData.forEach(breach => {
        const country = breach.country;
        const users = breach.affected_users || 0;
        if (countryMap.has(country)) {
            countryMap.set(country, countryMap.get(country) + users);
        } else {
            countryMap.set(country, users);
        }
    });
    
    // Sort by affected users and take top 10
    const sortedData = Array.from(countryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const labels = sortedData.map(d => d[0]);
    const data = sortedData.map(d => d[1]);
    
    // Create gradient colors for each bar
    const backgroundColors = sortedData.map((_, i) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        if (i < 3) {
            gradient.addColorStop(0, '#ff00f5');
            gradient.addColorStop(1, '#b026ff');
        } else if (i < 6) {
            gradient.addColorStop(0, '#b026ff');
            gradient.addColorStop(1, '#00f0ff');
        } else {
            gradient.addColorStop(0, '#00f0ff');
            gradient.addColorStop(1, 'rgba(0, 240, 255, 0.5)');
        }
        return gradient;
    });
    
    try {
        chart1 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Records Exposed',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: '#00f0ff',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeOutBounce',
                    delay: (context) => {
                        let delay = 0;
                        if (context.type === 'data' && context.mode === 'default') {
                            delay = context.dataIndex * 100;
                        }
                        return delay;
                    },
                    onComplete: function() {
                        console.log('Chart 1 animation complete');
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 39, 0.95)',
                    titleColor: '#ff00f5',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyColor: '#ffffff',
                    bodyFont: {
                        size: 13
                    },
                    borderColor: '#00f0ff',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            const country = sortedData[context.dataIndex][0];
                            const users = sortedData[context.dataIndex][1];
                            return [
                                `🌍 Country: ${country}`,
                                `👥 Affected Users: ${formatNumber(users)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(176, 38, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            size: 11,
                            family: 'Inter, sans-serif'
                        },
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            size: 11,
                            family: 'Inter, sans-serif'
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
        });
        console.log('Chart 1 created successfully!');
        console.log('Chart 1 object:', chart1);
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
        console.log('Canvas style:', canvas.style.cssText);
    } catch (error) {
        console.error('Error creating Chart 1:', error);
    }
}

// Visualization 2: Timeline Line Chart
function createChart2() {
    console.log('Creating Chart 2...');
    const canvas = document.getElementById('visualization2');
    
    if (!canvas) {
        console.error('Canvas visualization2 not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    console.log('Canvas created for Chart 2');
    
    // Aggregate by year
    const yearMap = new Map();
    breachData.forEach(breach => {
        const year = breach.year;
        const users = breach.affected_users || 0;
        if (yearMap.has(year)) {
            yearMap.set(year, yearMap.get(year) + users);
        } else {
            yearMap.set(year, users);
        }
    });
    
    // Sort by year
    const sortedYears = Array.from(yearMap.entries())
        .sort((a, b) => a[0] - b[0]);
    
    const labels = sortedYears.map(d => d[0]);
    const data = sortedYears.map(d => d[1]);
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(176, 38, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 245, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 240, 255, 0.4)');
    
    chart2 = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Records Exposed',
                data: data,
                borderColor: '#b026ff',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ff00f5',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2500,
                easing: 'easeInOutCubic',
                y: {
                    from: 500,
                    easing: 'easeOutElastic'
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 39, 0.95)',
                    titleColor: '#ff00f5',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyColor: '#ffffff',
                    bodyFont: {
                        size: 13
                    },
                    borderColor: '#b026ff',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `👥 Affected Users: ${formatNumber(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 240, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            size: 11,
                            family: 'Inter, sans-serif'
                        },
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(176, 38, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            size: 11,
                            family: 'Inter, sans-serif'
                        }
                    }
                }
            }
        }
    });
}

// Visualization 3: Attack Types by Industry - Stacked Horizontal Bar Chart
function createChart3() {
    console.log('Creating Chart 3...');
    const canvas = document.getElementById('visualization3');
    
    if (!canvas) {
        console.error('Canvas visualization3 not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    console.log('Canvas created for Chart 3');
    
    // Attack type colors
    const attackTypeColors = {
        'Phishing': 'rgba(255, 99, 132, 0.8)',
        'Malware': 'rgba(54, 162, 235, 0.8)',
        'Ransomware': 'rgba(255, 206, 86, 0.8)',
        'DDoS': 'rgba(75, 192, 192, 0.8)',
        'SQL Injection': 'rgba(153, 102, 255, 0.8)',
        'Zero-Day Exploit': 'rgba(255, 159, 64, 0.8)',
        'Insider Threat': 'rgba(231, 76, 60, 0.8)',
        'Credential Stuffing': 'rgba(46, 204, 113, 0.8)',
        'Man-in-the-Middle': 'rgba(155, 89, 182, 0.8)',
        'Brute Force': 'rgba(52, 152, 219, 0.8)'
    };
    
    // Aggregate data by industry and attack type
    const industryData = {};
    const attackTypes = new Set();
    
    breachData.forEach(breach => {
        const industry = breach.target_industry;
        const attackType = breach.attack_type;
        const users = breach.affected_users || 0;
        
        if (!industryData[industry]) {
            industryData[industry] = {};
        }
        if (!industryData[industry][attackType]) {
            industryData[industry][attackType] = 0;
        }
        
        industryData[industry][attackType] += users;
        attackTypes.add(attackType);
    });
    
    // Get top 8 industries by total affected users
    const industries = Object.keys(industryData)
        .map(industry => ({
            name: industry,
            total: Object.values(industryData[industry]).reduce((sum, val) => sum + val, 0)
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 8)
        .map(item => item.name);
    
    // Create datasets for each attack type
    const datasets = Array.from(attackTypes).map(attackType => {
        return {
            label: attackType,
            data: industries.map(industry => industryData[industry][attackType] || 0),
            backgroundColor: attackTypeColors[attackType] || 'rgba(169, 169, 169, 0.8)',
            borderColor: (attackTypeColors[attackType] || 'rgba(169, 169, 169, 0.8)').replace('0.8', '1'),
            borderWidth: 1
        };
    });
    
    chart3 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: industries,
            datasets: datasets
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                onComplete: () => {
                    animated = true;
                },
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default') {
                        delay = context.dataIndex * 150;
                    }
                    return delay;
                },
                duration: 1500,
                easing: 'easeOutQuart'
            },
            animations: {
                x: {
                    from: 0,
                    duration: 1500,
                    easing: 'easeOutQuart'
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#a0aec0',
                        font: {
                            size: 10,
                            family: 'Inter, sans-serif',
                            weight: '500'
                        },
                        padding: 8,
                        usePointStyle: true,
                        pointStyle: 'rect',
                        boxWidth: 12,
                        boxHeight: 12
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 39, 0.95)',
                    titleColor: '#ff00f5',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyColor: '#ffffff',
                    bodyFont: {
                        size: 13
                    },
                    borderColor: '#00f0ff',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const attackType = context.dataset.label;
                            const users = context.parsed.x;
                            return `${attackType}: ${formatNumber(users)} users`;
                        },
                        footer: function(tooltipItems) {
                            const total = tooltipItems.reduce((sum, item) => sum + item.parsed.x, 0);
                            return `Total: ${formatNumber(total)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 240, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            size: 11,
                            family: 'Inter, sans-serif'
                        },
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    },
                    title: {
                        display: true,
                        text: 'Affected Users',
                        color: '#a0aec0',
                        font: {
                            size: 12,
                            family: 'Inter, sans-serif',
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            size: 11,
                            family: 'Inter, sans-serif'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Industry',
                        color: '#a0aec0',
                        font: {
                            size: 12,
                            family: 'Inter, sans-serif',
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
}
