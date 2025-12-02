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
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
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
    
    // Create charts immediately
    createChart1();
    createChart2();
    createChart3();
});

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

// Fetch breach data from your GitHub API
async function fetchBreachData() {
    try {
        console.log('Fetching breach data from GitHub...');
        const response = await fetch('https://raw.githubusercontent.com/Beke-Tibor-Roland/Beke-Tibor-Roland.github.io/main/api/data_breaches_global.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-cache'
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
                    duration: 1500,
                    easing: 'easeInOutQuart'
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
                duration: 2000,
                easing: 'easeInOutQuart'
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

// Visualization 3: Bubble Chart - Breaches by Industry Over Time
function createChart3() {
    console.log('Creating Chart 3...');
    const canvas = document.getElementById('visualization3');
    
    if (!canvas) {
        console.error('Canvas visualization3 not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    console.log('Canvas created for Chart 3');
    
    // Industry colors
    const industryColors = {
        'IT': 'rgba(0, 240, 255, 0.7)',
        'Banking': 'rgba(255, 215, 0, 0.7)',
        'Healthcare': 'rgba(255, 105, 180, 0.7)',
        'Government': 'rgba(64, 224, 208, 0.7)',
        'Retail': 'rgba(176, 38, 255, 0.7)',
        'Education': 'rgba(0, 255, 127, 0.7)',
        'Telecommunications': 'rgba(147, 112, 219, 0.7)'
    };
    
    // Group data by industry
    const categoryData = {};
    breachData.forEach(breach => {
        const industry = breach.target_industry;
        if (!categoryData[industry]) {
            categoryData[industry] = [];
        }
        const users = breach.affected_users || 0;
        categoryData[industry].push({
            x: breach.year,
            y: users,
            r: Math.max(3, Math.min(15, Math.log10(users + 1) * 2)),
            country: breach.country,
            attackType: breach.attack_type,
            financialLoss: breach.financial_loss
        });
    });
    
    // Create datasets for each industry
    const datasets = Object.keys(categoryData).map(industry => ({
        label: industry,
        data: categoryData[industry],
        backgroundColor: industryColors[industry] || 'rgba(169, 169, 169, 0.7)',
        borderColor: (industryColors[industry] || 'rgba(169, 169, 169, 0.7)').replace('0.7', '1'),
        borderWidth: 2
    }));
    
    chart3 = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: '#a0aec0',
                        font: {
                            size: 11,
                            family: 'Inter, sans-serif',
                            weight: '500'
                        },
                        padding: 10,
                        usePointStyle: true,
                        pointStyle: 'circle'
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
                            const data = context.raw;
                            return [
                                `🌍 Country: ${data.country}`,
                                `📅 Year: ${data.x}`,
                                `👥 Users: ${formatNumber(data.y)}`,
                                `💰 Loss: $${data.financialLoss}M`,
                                `⚠️ Attack: ${data.attackType}`
                            ];
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
                    },
                    title: {
                        display: true,
                        text: 'Year',
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
