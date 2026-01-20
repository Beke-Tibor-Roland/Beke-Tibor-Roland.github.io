// Navigation functionality and chart initialization
document.addEventListener('DOMContentLoaded', async function() {
    // Mobile menu toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdownLinks = document.querySelectorAll('.dropdown-link');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Mobile dropdown toggle
    const navDropdown = document.querySelector('.nav-dropdown');
    if (navDropdown && window.innerWidth <= 968) {
        const dropdownTrigger = navDropdown.querySelector('.nav-link');
        dropdownTrigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 968) {
                e.preventDefault();
                navDropdown.classList.toggle('active');
            }
        });
    }

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (!link.closest('.nav-dropdown')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Close menu when clicking dropdown links
    dropdownLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            if (navDropdown) {
                navDropdown.classList.remove('active');
            }
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
                if (!link.closest('.nav-dropdown') || window.innerWidth > 968) {
                    e.preventDefault();
                    const targetSection = document.querySelector(targetId);
                    if (targetSection) {
                        targetSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            }
            // Otherwise let the link work normally (for cross-page navigation)
        });
    });

    // Smooth scroll for dropdown links
    dropdownLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
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
    xposedBreachData = await fetchXposedBreachData();
    
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
                const element = entry.target;
                const elementId = element.id;
                
                console.log('Element visible:', elementId);
                
                if (elementId === 'visualization1' && !chart1) {
                    console.log('Creating Chart 1...');
                    chartObserver.unobserve(element);
                    createChart1();
                } else if (elementId === 'visualization2' && !chart2) {
                    console.log('Creating Chart 2...');
                    chartObserver.unobserve(element);
                    createChart2();
                } else if (elementId === 'visualization3' && !chart3) {
                    console.log('Creating Chart 3...');
                    chartObserver.unobserve(element);
                    createChart3();
                } else if (elementId === 'visualization4' && !chart4) {
                    console.log('Creating Chart 4...');
                    chartObserver.unobserve(element);
                    createChart4();
                } else if (elementId === 'visualization5' && !map5) {
                    console.log('Creating Map 5...');
                    chartObserver.unobserve(element);
                    createMap5();
                } else if (elementId === 'visualization6' && !chart6) {
                    console.log('Creating Chart 6...');
                    chartObserver.unobserve(element);
                    createChart6();
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '100px'
    });
    
    // Observe all chart canvases and map containers
    const elementsToObserve = document.querySelectorAll('#visualization1, #visualization2, #visualization3, #visualization4, #visualization5, #visualization6');
    console.log('Elements found to observe:', elementsToObserve.length);
    elementsToObserve.forEach(element => {
        console.log('Observing:', element.id, element.tagName);
        chartObserver.observe(element);
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
            const canvasOrMap = vizContainer.querySelector('canvas') || vizContainer.querySelector('#visualization5');
            const vizId = canvasOrMap ? canvasOrMap.id : null;
            const title = vizContainer.querySelector('.viz-title').textContent;
            
            // Determine which chart/map to recreate
            let chartNumber = parseInt(vizId.replace('visualization', ''));
            openChartModal(chartNumber, title);
        });
    });
}

function openChartModal(chartNumber, title) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'chart-modal';
    
    // For map (viz5), create different modal content
    if (chartNumber === 5) {
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
                    <div id="modal-map" style="height: 100%; width: 100%;"></div>
                </div>
            </div>
        `;
    } else {
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
    }
    
    document.body.appendChild(modal);
    
    // Create chart/map based on number
    let modalChart;
    let modalMap;
    
    if (chartNumber === 5) {
        // Recreate map in modal
        setTimeout(() => createModalMap5(), 100);
    } else {
        // Recreate the chart in modal with larger size
        const modalCanvas = modal.querySelector('#modal-canvas');
        const ctx = modalCanvas.getContext('2d');
        
        if (chartNumber === 1) {
            modalChart = createModalChart1(ctx);
        } else if (chartNumber === 2) {
            modalChart = createModalChart2(ctx);
        } else if (chartNumber === 3) {
            modalChart = createModalChart3(ctx);
        } else if (chartNumber === 4) {
            modalChart = createModalChart4(ctx);
        } else if (chartNumber === 6) {
            createModalChart6();
        }
    }
    
    // Close modal handlers
    const closeBtn = modal.querySelector('.chart-modal-close');
    const closeHandler = () => {
        if (modalChart) {
            modalChart.destroy();
        }
        if (modalMap) {
            modalMap.remove();
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

// Modal Chart 4 - Treemap for modal
function createModalChart4(ctx) {
    if (!xposedBreachData || xposedBreachData.length === 0) {
        console.warn('No xposed breach data available for modal treemap');
        return null;
    }
    
    const sortedBreaches = xposedBreachData
        .filter(breach => {
            return breach.exposedRecords && 
                   breach.exposedRecords > 0 &&
                   breach.domain &&
                   breach.domain !== '';
        })
        .sort((a, b) => b.exposedRecords - a.exposedRecords)
        .slice(0, 10);
    
    const treemapData = sortedBreaches.map(breach => {
        let breachDate = 'Unknown';
        if (breach.breachedDate) {
            try {
                breachDate = new Date(breach.breachedDate).toLocaleDateString();
            } catch (e) {
                breachDate = 'Unknown';
            }
        }
        
        return {
            breach: breach.breachID || 'Unknown',
            value: breach.exposedRecords || 0,
            domain: breach.domain || 'N/A',
            industry: breach.industry || 'Unknown',
            date: breachDate
        };
    });
    
    const colorPalette = [
        'rgba(255, 99, 132, 0.8)',   'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',   'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',  'rgba(255, 159, 64, 0.8)',
        'rgba(231, 76, 60, 0.8)',    'rgba(46, 204, 113, 0.8)',
        'rgba(155, 89, 182, 0.8)',   'rgba(52, 152, 219, 0.8)'
    ];
    
    const colors = treemapData.map((d, index) => colorPalette[index % colorPalette.length]);
    
    return new Chart(ctx, {
        type: 'treemap',
        data: {
            datasets: [{
                label: 'Data Breaches',
                tree: treemapData,
                key: 'value',
                groups: ['breach'],
                backgroundColor: (ctx) => {
                    if (ctx.type !== 'data') return 'transparent';
                    return colors[ctx.dataIndex];
                },
                borderColor: '#ffffff',
                borderWidth: 2,
                spacing: 1,
                labels: {
                    display: true,
                    formatter: (ctx) => {
                        if (ctx.type !== 'data') return '';
                        const area = ctx.raw.w * ctx.raw.h;
                        if (area < 2000) return '';
                        const data = ctx.raw._data;
                        return [data.breach, formatNumber(data.value)];
                    },
                    color: '#ffffff',
                    font: { size: 11, weight: 'bold', family: 'Inter, sans-serif' }
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            animation: { duration: 1000, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
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
                        title: function(context) {
                            const raw = context[0].raw;
                            const data = raw._data || raw.data || raw;
                            return data.breach || raw.g || 'Unknown';
                        },
                        label: function(context) {
                            const idx = context.dataIndex;
                            const originalData = treemapData[idx];
                            return [
                                `🔒 Exposed Records: ${formatNumber(originalData.value)}`,
                                `🌐 Domain: ${originalData.domain}`,
                                `🏢 Industry: ${originalData.industry}`,
                                `📅 Date: ${originalData.date}`
                            ];
                        }
                    }
                }
            }
        }
    });
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
let xposedBreachData = [];
let chart1, chart2, chart3, chart4, chart6, map5;

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

// Fetch breach data from xposedornot.com API
async function fetchXposedBreachData() {
    try {
        // Check localStorage cache (24 hour expiry)
        const cacheKey = 'xposedBreachData_cache';
        const cacheTimeKey = 'xposedBreachData_cache_time';
        const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(cacheTimeKey);
        
        if (cachedData && cacheTime) {
            const age = Date.now() - parseInt(cacheTime);
            if (age < cacheExpiry) {
                console.log('✓ Using cached xposed breach data');
                return JSON.parse(cachedData);
            }
        }
        
        console.log('Fetching breach data from xposedornot.com...');
        const response = await fetch('https://api.xposedornot.com/v1/breaches', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        if (jsonData.status !== 'success' || !jsonData.exposedBreaches) {
            throw new Error('Unexpected response format from xposedornot API');
        }
        
        const breaches = jsonData.exposedBreaches;
        console.log(`✓ Loaded ${breaches.length} breach records from xposedornot`);
        
        // Cache the data
        try {
            localStorage.setItem(cacheKey, JSON.stringify(breaches));
            localStorage.setItem(cacheTimeKey, Date.now().toString());
            console.log('✓ Xposed data cached for 24 hours');
        } catch (e) {
            console.warn('Could not cache xposed data:', e);
        }
        
        return breaches;
    } catch (error) {
        console.error('Error fetching xposed breach data:', error);
        console.warn('Using empty dataset for treemap');
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
// Visualization 4: Treemap Chart from xposedornot.com API
function createChart4() {
    console.log('Creating Chart 4 (Treemap)...');
    const canvas = document.getElementById('visualization4');
    
    if (!canvas) {
        console.error('Canvas visualization4 not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    console.log('Canvas created for Chart 4');
    
    if (!xposedBreachData || xposedBreachData.length === 0) {
        console.warn('No xposed breach data available for treemap');
        return;
    }
    
    // Filter and sort breaches by exposedRecords, only keep ones with domain
    const sortedBreaches = xposedBreachData
        .filter(breach => {
            return breach.exposedRecords && 
                   breach.exposedRecords > 0 &&
                   breach.domain &&
                   breach.domain !== '';
        })
        .sort((a, b) => b.exposedRecords - a.exposedRecords)
        .slice(0, 10);
    
    console.log(`Creating treemap with ${sortedBreaches.length} breaches`);
    console.log('First breach sample:', sortedBreaches[0]);
    
    // Prepare data for treemap - store all breach data with proper null checks
    const treemapData = sortedBreaches.map(breach => {
        let breachDate = 'Unknown';
        if (breach.breachedDate) {
            try {
                breachDate = new Date(breach.breachedDate).toLocaleDateString();
            } catch (e) {
                breachDate = 'Unknown';
            }
        }
        
        return {
            breach: breach.breachID || 'Unknown',
            value: breach.exposedRecords || 0,
            domain: breach.domain || 'N/A',
            industry: breach.industry || 'Unknown',
            date: breachDate
        };
    });
    
    console.log('Treemap data sample:', treemapData[0]);
    
    // Generate distinct colors for each breach
    const colorPalette = [
        'rgba(255, 99, 132, 0.8)',   // Red
        'rgba(54, 162, 235, 0.8)',   // Blue
        'rgba(255, 206, 86, 0.8)',   // Yellow
        'rgba(75, 192, 192, 0.8)',   // Teal
        'rgba(153, 102, 255, 0.8)',  // Purple
        'rgba(255, 159, 64, 0.8)',   // Orange
        'rgba(231, 76, 60, 0.8)',    // Dark Red
        'rgba(46, 204, 113, 0.8)',   // Green
        'rgba(155, 89, 182, 0.8)',   // Violet
        'rgba(52, 152, 219, 0.8)'    // Light Blue
    ];
    
    const colors = treemapData.map((d, index) => colorPalette[index % colorPalette.length]);
    
    chart4 = new Chart(ctx, {
        type: 'treemap',
        data: {
            datasets: [{
                label: 'Data Breaches',
                tree: treemapData,
                key: 'value',
                groups: ['breach'],
                backgroundColor: (ctx) => {
                    if (ctx.type !== 'data') return 'transparent';
                    return colors[ctx.dataIndex];
                },
                borderColor: '#ffffff',
                borderWidth: 2,
                spacing: 1,
                labels: {
                    display: true,
                    formatter: (ctx) => {
                        if (ctx.type !== 'data') return '';
                        
                        // Only show label if the box is large enough
                        const area = ctx.raw.w * ctx.raw.h;
                        if (area < 2000) return '';
                        
                        const data = ctx.raw._data;
                        return [data.breach, formatNumber(data.value)];
                    },
                    color: '#ffffff',
                    font: {
                        size: 11,
                        weight: 'bold',
                        family: 'Inter, sans-serif'
                    }
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            animation: {
                duration: 1500,
                easing: 'easeOutQuart',
                resize: {
                    duration: 0
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
                        title: function(context) {
                            const raw = context[0].raw;
                            console.log('Full raw object:', raw);
                            console.log('Raw keys:', Object.keys(raw));
                            
                            // Try different possible locations for the data
                            const data = raw._data || raw.data || raw;
                            return data.breach || raw.g || 'Unknown';
                        },
                        label: function(context) {
                            const raw = context.raw;
                            console.log('Label raw object:', raw);
                            
                            // Find the original data - it might be in different locations
                            const idx = context.dataIndex;
                            const originalData = treemapData[idx];
                            
                            console.log('Original data from array:', originalData);
                            
                            return [
                                `🔒 Exposed Records: ${formatNumber(originalData.value)}`,
                                `🌐 Domain: ${originalData.domain}`,
                                `🏢 Industry: ${originalData.industry}`,
                                `📅 Date: ${originalData.date}`
                            ];
                        }
                    }
                }
            }
        }
    });
    
    console.log('Chart 4 (Treemap) created successfully!');
}

// Visualization 5: World Choropleth Map showing breach frequency by country
async function createMap5() {
    console.log('Creating Map 5 (Choropleth)...');
    
    try {
        // Fetch and parse CSV data
        const response = await fetch('data/data_breaches_global.csv');
        const csvText = await response.text();
        
        // Parse CSV manually
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        const countryIndex = headers.indexOf('Country');
        
        // Country name mapping to match GeoJSON names
        const countryNameMap = {
            'USA': 'United States of America',
            'US': 'United States of America',
            'United States': 'United States of America',
            'UK': 'United Kingdom',
            'Russia': 'Russian Federation',
            'South Korea': 'Republic of Korea',
            'North Korea': "Democratic People's Republic of Korea",
            'Vietnam': 'Viet Nam',
            'Iran': 'Iran (Islamic Republic of)',
            'Syria': 'Syrian Arab Republic',
            'Venezuela': 'Venezuela (Bolivarian Republic of)',
            'Bolivia': 'Bolivia (Plurinational State of)',
            'Tanzania': 'United Republic of Tanzania',
            'Moldova': 'Republic of Moldova',
            'Czech Republic': 'Czechia',
            'Macedonia': 'North Macedonia',
            'Ivory Coast': "Côte d'Ivoire",
            'East Timor': 'Timor-Leste',
            'Laos': "Lao People's Democratic Republic"
        };
        
        // Reverse mapping: CSV name -> GeoJSON name
        const reverseMap = {
            'Russian Federation': 'Russia'
        };
        
        // Count breach frequency by country
        const countryBreaches = {};
        const countryBreachesForGeoJSON = {}; // Store with GeoJSON names
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            const values = lines[i].split(',');
            let country = values[countryIndex];
            if (country) {
                // Normalize country name from CSV
                country = countryNameMap[country] || country;
                countryBreaches[country] = (countryBreaches[country] || 0) + 1;
                
                // Also store with GeoJSON name if different
                const geoJsonName = reverseMap[country] || country;
                countryBreachesForGeoJSON[geoJsonName] = (countryBreachesForGeoJSON[geoJsonName] || 0) + 1;
            }
        }
        
        console.log('Country breach frequencies:', countryBreaches);
        console.log('All CSV countries:', Object.keys(countryBreaches).sort());
        console.log('Breach counts:', countryBreaches);
        console.log('GeoJSON-ready breach counts:', countryBreachesForGeoJSON);
        
        // Initialize Leaflet map
        map5 = L.map('visualization5').setView([20, 0], 2);
        
        // Add tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map5);
        
        // Fetch GeoJSON data for country boundaries
        const geoResponse = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
        const geoData = await geoResponse.json();
        
        // Debug: Log GeoJSON country names
        console.log('GeoJSON countries sample:', geoData.features.slice(0, 10).map(f => f.properties.ADMIN || f.properties.name));
        console.log('Looking for Russia in GeoJSON...');
        const russiaFeature = geoData.features.find(f => 
            (f.properties.ADMIN && f.properties.ADMIN.toLowerCase().includes('russia')) ||
            (f.properties.name && f.properties.name.toLowerCase().includes('russia'))
        );
        console.log('Russia feature found:', russiaFeature ? (russiaFeature.properties.ADMIN || russiaFeature.properties.name) : 'NOT FOUND');
        
        // Find max breach count for color scaling
        const maxBreaches = Math.max(...Object.values(countryBreaches));
        const minBreaches = Math.min(...Object.values(countryBreaches).filter(v => v > 0));
        
        console.log('Breach count range:', minBreaches, 'to', maxBreaches);
        
        // Function to get color based on breach count
        // Uses logarithmic scale for better distribution
        function getColor(count) {
            if (!count) return '#1a1f3a'; // Dark background for no data
            
            // Use log scale for better color distribution
            const logMin = Math.log(minBreaches);
            const logMax = Math.log(maxBreaches);
            const logCount = Math.log(count);
            const intensity = (logCount - logMin) / (logMax - logMin);
            
            // Gradient: cyan (#00f0ff) -> purple (#b026ff) -> pink (#ff00f5)
            if (intensity < 0.5) {
                // Cyan to Purple
                const t = intensity * 2; // 0 to 1
                const r = Math.floor(0 + t * 176);
                const g = Math.floor(240 - t * 202);
                const b = Math.floor(255);
                return `rgb(${r}, ${g}, ${b})`;
            } else {
                // Purple to Pink
                const t = (intensity - 0.5) * 2; // 0 to 1
                const r = Math.floor(176 + t * 79);
                const g = Math.floor(38 - t * 38);
                const b = Math.floor(255 - t * 10);
                return `rgb(${r}, ${g}, ${b})`;
            }
        }
        
        // Style function for countries
        function style(feature) {
            const countryName = feature.properties.ADMIN || feature.properties.name;
            const breachCount = countryBreachesForGeoJSON[countryName] || 0;
            
            // Debug logging for specific countries
            if (countryName && (countryName.includes('Russia') || countryName.includes('United States') || countryName.includes('China'))) {
                console.log(`Style for ${countryName}: ${breachCount} breaches, color: ${getColor(breachCount)}`);
            }
            
            return {
                fillColor: getColor(breachCount),
                weight: 1,
                opacity: 0.8,
                color: '#00f0ff',
                fillOpacity: 0.7
            };
        }
        
        // Highlight feature on hover
        function highlightFeature(e) {
            const layer = e.target;
            layer.setStyle({
                weight: 2,
                color: '#ff00f5',
                fillOpacity: 0.9
            });
            layer.bringToFront();
        }
        
        // Reset highlight
        function resetHighlight(e) {
            geoJsonLayer.resetStyle(e.target);
        }
        
        // Click handler
        function onCountryClick(e) {
            const countryName = e.target.feature.properties.ADMIN || e.target.feature.properties.name;
            const breachCount = countryBreaches[countryName] || 0;
            
            L.popup()
                .setLatLng(e.latlng)
                .setContent(`
                    <div style="color: #ffffff; font-family: Inter, sans-serif;">
                        <strong style="color: #ff00f5; font-size: 16px;">${countryName}</strong><br>
                        <span style="color: #00f0ff;">Data Breaches:</span> <strong>${breachCount.toLocaleString()}</strong>
                    </div>
                `)
                .openOn(map5);
        }
        
        // Add each feature
        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: onCountryClick
            });
        }
        
        // Add GeoJSON layer
        const geoJsonLayer = L.geoJson(geoData, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map5);
        
        // Debug: Count how many countries got colored
        let coloredCount = 0;
        let matchedCountries = [];
        geoData.features.forEach(feature => {
            const name = feature.properties.ADMIN || feature.properties.name;
            if (countryBreachesForGeoJSON[name]) {
                coloredCount++;
                matchedCountries.push(name);
            }
        });
        console.log(`Colored ${coloredCount} countries out of 10 in CSV`);
        console.log('Matched countries:', matchedCountries);
        console.log('CSV countries that did NOT match:', 
            Object.keys(countryBreaches).filter(c => !matchedCountries.includes(c) && !matchedCountries.includes(reverseMap[c])));
        
        // Add legend
        const legend = L.control({ position: 'bottomright' });
        
        legend.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.background = 'rgba(10, 14, 39, 0.9)';
            div.style.padding = '10px';
            div.style.borderRadius = '8px';
            div.style.border = '1px solid #00f0ff';
            div.style.color = '#ffffff';
            div.style.fontFamily = 'Inter, sans-serif';
            div.style.fontSize = '12px';
            
            const grades = [0, Math.floor(maxBreaches * 0.25), Math.floor(maxBreaches * 0.5), Math.floor(maxBreaches * 0.75), maxBreaches];
            
            div.innerHTML = '<strong style="color: #ff00f5;">Breach Frequency</strong><br>';
            
            for (let i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(grades[i] + 1) + '; width: 18px; height: 18px; display: inline-block; margin-right: 5px; border: 1px solid #00f0ff;"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }
            
            return div;
        };
        
        legend.addTo(map5);
        
        console.log('Map 5 (Choropleth) created successfully!');
        
    } catch (error) {
        console.error('Error creating Map 5:', error);
    }
}

// Create modal version of Map 5
async function createModalMap5() {
    console.log('Creating Modal Map 5...');
    
    try {
        // Fetch and parse CSV data
        const response = await fetch('data/data_breaches_global.csv');
        const csvText = await response.text();
        
        // Parse CSV manually
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        const countryIndex = headers.indexOf('Country');
        
        // Country name mapping
        const countryNameMap = {
            'USA': 'United States of America',
            'US': 'United States of America',
            'United States': 'United States of America',
            'UK': 'United Kingdom',
            'Russia': 'Russian Federation',
            'South Korea': 'Republic of Korea',
            'North Korea': "Democratic People's Republic of Korea",
            'Vietnam': 'Viet Nam',
            'Iran': 'Iran (Islamic Republic of)',
            'Syria': 'Syrian Arab Republic',
            'Venezuela': 'Venezuela (Bolivarian Republic of)',
            'Bolivia': 'Bolivia (Plurinational State of)',
            'Tanzania': 'United Republic of Tanzania',
            'Moldova': 'Republic of Moldova',
            'Czech Republic': 'Czechia',
            'Macedonia': 'North Macedonia',
            'Ivory Coast': "Côte d'Ivoire",
            'East Timor': 'Timor-Leste',
            'Laos': "Lao People's Democratic Republic"
        };
        
        // Count breach frequency by country
        const countryBreaches = {};
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            const values = lines[i].split(',');
            let country = values[countryIndex];
            if (country) {
                country = countryNameMap[country] || country;
                countryBreaches[country] = (countryBreaches[country] || 0) + 1;
            }
        }
        
        // Initialize Leaflet map in modal
        const modalMap = L.map('modal-map').setView([20, 0], 2);
        
        // Add tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(modalMap);
        
        // Fetch GeoJSON data
        const geoResponse = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
        const geoData = await geoResponse.json();
        
        // Find max breach count
        const maxBreaches = Math.max(...Object.values(countryBreaches));
        const minBreaches = Math.min(...Object.values(countryBreaches).filter(v => v > 0));
        
        // Color function with logarithmic scale
        function getColor(count) {
            if (!count) return '#1a1f3a';
            
            const logMin = Math.log(minBreaches);
            const logMax = Math.log(maxBreaches);
            const logCount = Math.log(count);
            const intensity = (logCount - logMin) / (logMax - logMin);
            
            // Gradient: cyan (#00f0ff) -> purple (#b026ff) -> pink (#ff00f5)
            if (intensity < 0.5) {
                const t = intensity * 2;
                const r = Math.floor(0 + t * 176);
                const g = Math.floor(240 - t * 202);
                const b = Math.floor(255);
                return `rgb(${r}, ${g}, ${b})`;
            } else {
                const t = (intensity - 0.5) * 2;
                const r = Math.floor(176 + t * 79);
                const g = Math.floor(38 - t * 38);
                const b = Math.floor(255 - t * 10);
                return `rgb(${r}, ${g}, ${b})`;
            }
        }
        
        // Style function
        function style(feature) {
            const countryName = feature.properties.ADMIN || feature.properties.name;
            const breachCount = countryBreaches[countryName] || 0;
            
            return {
                fillColor: getColor(breachCount),
                weight: 1,
                opacity: 0.8,
                color: '#00f0ff',
                fillOpacity: 0.7
            };
        }
        
        // Event handlers
        function highlightFeature(e) {
            const layer = e.target;
            layer.setStyle({
                weight: 2,
                color: '#ff00f5',
                fillOpacity: 0.9
            });
            layer.bringToFront();
        }
        
        function resetHighlight(e) {
            geoJsonLayer.resetStyle(e.target);
        }
        
        function onCountryClick(e) {
            const countryName = e.target.feature.properties.ADMIN || e.target.feature.properties.name;
            const breachCount = countryBreaches[countryName] || 0;
            
            L.popup()
                .setLatLng(e.latlng)
                .setContent(`
                    <div style="color: #ffffff; font-family: Inter, sans-serif;">
                        <strong style="color: #ff00f5; font-size: 16px;">${countryName}</strong><br>
                        <span style="color: #00f0ff;">Data Breaches:</span> <strong>${breachCount.toLocaleString()}</strong>
                    </div>
                `)
                .openOn(modalMap);
        }
        
        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: onCountryClick
            });
        }
        
        // Add GeoJSON layer
        const geoJsonLayer = L.geoJson(geoData, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(modalMap);
        
        // Add legend
        const legend = L.control({ position: 'bottomright' });
        
        legend.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.background = 'rgba(10, 14, 39, 0.9)';
            div.style.padding = '10px';
            div.style.borderRadius = '8px';
            div.style.border = '1px solid #00f0ff';
            div.style.color = '#ffffff';
            div.style.fontFamily = 'Inter, sans-serif';
            div.style.fontSize = '12px';
            
            const grades = [0, Math.floor(maxBreaches * 0.25), Math.floor(maxBreaches * 0.5), Math.floor(maxBreaches * 0.75), maxBreaches];
            
            div.innerHTML = '<strong style="color: #ff00f5;">Breach Frequency</strong><br>';
            
            for (let i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(grades[i] + 1) + '; width: 18px; height: 18px; display: inline-block; margin-right: 5px; border: 1px solid #00f0ff;"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }
            
            return div;
        };
        
        legend.addTo(modalMap);
        
        // Force map to refresh after modal is fully visible
        setTimeout(() => {
            modalMap.invalidateSize();
        }, 200);
        
        console.log('Modal Map 5 created successfully!');
        
    } catch (error) {
        console.error('Error creating Modal Map 5:', error);
    }
}

// Visualization 6: Doughnut Chart showing Defense Mechanism distribution
async function createChart6() {
    console.log('Creating Chart 6 (Defense Mechanisms)...');
    
    // Prevent multiple creations
    if (chart6) {
        console.log('Chart 6 already exists');
        return;
    }
    
    try {
        // Check if canvas exists
        const canvas = document.getElementById('visualization6');
        if (!canvas) {
            console.error('Canvas visualization6 not found');
            return;
        }
        
        // Fetch and parse CSV data
        const response = await fetch('data/data_breaches_global.csv');
        const csvText = await response.text();
        
        // Parse CSV manually
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        const defenseIndex = headers.findIndex(h => h.trim() === 'Defense Mechanism Used');
        
        console.log('Defense Mechanism column index:', defenseIndex);
        
        // Count defense mechanisms
        const defenseCounts = {};
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',');
            const defense = values[defenseIndex]?.trim();
            
            if (defense && defense !== '') {
                defenseCounts[defense] = (defenseCounts[defense] || 0) + 1;
            }
        }
        
        console.log('Defense mechanism counts:', defenseCounts);
        
        // Prepare data for chart
        const labels = Object.keys(defenseCounts);
        const data = Object.values(defenseCounts);
        const total = data.reduce((sum, val) => sum + val, 0);
        
        // Neon colors for each defense mechanism
        const colors = [
            'rgba(0, 240, 255, 0.8)',   // Cyan
            'rgba(176, 38, 255, 0.8)',  // Purple
            'rgba(255, 0, 245, 0.8)',   // Pink
            'rgba(0, 255, 170, 0.8)',   // Green-cyan
            'rgba(255, 100, 180, 0.8)'  // Pink-red
        ];
        
        const borderColors = [
            '#00f0ff',
            '#b026ff',
            '#ff00f5',
            '#00ffaa',
            '#ff64b4'
        ];
        
        const ctx = document.getElementById('visualization6').getContext('2d');
        
        chart6 = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: borderColors.slice(0, labels.length),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.3,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            font: {
                                family: 'Inter, sans-serif',
                                size: 12
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 14, 39, 0.9)',
                        titleColor: '#ff00f5',
                        bodyColor: '#ffffff',
                        borderColor: '#00f0ff',
                        borderWidth: 1,
                        padding: 12,
                        bodyFont: {
                            family: 'Inter, sans-serif',
                            size: 13
                        },
                        titleFont: {
                            family: 'Inter, sans-serif',
                            size: 14,
                            weight: 'bold'
                        },
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value.toLocaleString()} incidents (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Chart 6 (Doughnut) created successfully!');
        
    } catch (error) {
        console.error('Error creating Chart 6:', error);
    }
}

// Create modal version of Chart 6
async function createModalChart6() {
    console.log('Creating Modal Chart 6...');
    
    try {
        // Fetch and parse CSV data
        const response = await fetch('data/data_breaches_global.csv');
        const csvText = await response.text();
        
        // Parse CSV manually
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        const defenseIndex = headers.findIndex(h => h.trim() === 'Defense Mechanism Used');
        
        // Count defense mechanisms
        const defenseCounts = {};
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',');
            const defense = values[defenseIndex]?.trim();
            
            if (defense && defense !== '') {
                defenseCounts[defense] = (defenseCounts[defense] || 0) + 1;
            }
        }
        
        // Prepare data for chart
        const labels = Object.keys(defenseCounts);
        const data = Object.values(defenseCounts);
        const total = data.reduce((sum, val) => sum + val, 0);
        
        // Neon colors for each defense mechanism
        const colors = [
            'rgba(0, 240, 255, 0.8)',   // Cyan
            'rgba(176, 38, 255, 0.8)',  // Purple
            'rgba(255, 0, 245, 0.8)',   // Pink
            'rgba(0, 255, 170, 0.8)',   // Green-cyan
            'rgba(255, 100, 180, 0.8)'  // Pink-red
        ];
        
        const borderColors = [
            '#00f0ff',
            '#b026ff',
            '#ff00f5',
            '#00ffaa',
            '#ff64b4'
        ];
        
        const ctx = document.getElementById('modal-canvas').getContext('2d');
        
        const modalChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: borderColors.slice(0, labels.length),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            font: {
                                family: 'Inter, sans-serif',
                                size: 14
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 14, 39, 0.9)',
                        titleColor: '#ff00f5',
                        bodyColor: '#ffffff',
                        borderColor: '#00f0ff',
                        borderWidth: 1,
                        padding: 15,
                        bodyFont: {
                            family: 'Inter, sans-serif',
                            size: 15
                        },
                        titleFont: {
                            family: 'Inter, sans-serif',
                            size: 16,
                            weight: 'bold'
                        },
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value.toLocaleString()} incidents (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Modal Chart 6 created successfully!');
        
    } catch (error) {
        console.error('Error creating Modal Chart 6:', error);
    }
}