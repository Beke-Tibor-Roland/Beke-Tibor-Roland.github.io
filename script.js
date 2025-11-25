// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
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

// Data will be fetched from API
let breachData = [];
let recordsByYearData = [];
let rawMethodVsCategoryData = [];

// Fetch breach data from Have I Been Pwned API
async function fetchBreachData() {
    try {
        const response = await fetch('https://haveibeenpwned.com/api/v3/breaches', {
            headers: {
                'User-Agent': 'DataBreachIntelligenceDashboard'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const breaches = await response.json();
        
        // Transform API data into our format - get top 15 breaches by record count
        breachData = breaches
            .filter(breach => breach.PwnCount && breach.PwnCount > 0 && breach.BreachDate)
            .sort((a, b) => b.PwnCount - a.PwnCount)
            .slice(0, 15)
            .map(breach => ({
                Entity: breach.Title,
                Year: new Date(breach.BreachDate).getFullYear(),
                Records: breach.PwnCount,
                "Organization type": breach.Domain ? breach.Domain.split('.')[0] : 'unknown',
                Method: breach.Description ? 'breach' : 'unknown'
            }));
        
        // Aggregate by year for trend chart
        const yearMap = new Map();
        breaches.forEach(breach => {
            if (breach.BreachDate && breach.PwnCount) {
                const year = new Date(breach.BreachDate).getFullYear().toString();
                if (yearMap.has(year)) {
                    yearMap.get(year).Records += breach.PwnCount;
                } else {
                    yearMap.set(year, { Year: year, Records: breach.PwnCount });
                }
            }
        });
        recordsByYearData = Array.from(yearMap.values()).sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
        
        // Transform for method categorization
        rawMethodVsCategoryData = breaches
            .filter(breach => breach.PwnCount && breach.PwnCount > 0)
            .map(breach => ({
                "Organization type": breach.Domain ? breach.Domain.split('.')[0] : 'unknown',
                "Method": breach.Description ? 'breach' : 'unknown',
                "TotalRecords": breach.PwnCount,
                "Count": 1
            }));
        
        console.log('Breach data loaded successfully', breachData.length, 'breaches');
        return true;
    } catch (error) {
        console.error('Failed to fetch breach data:', error);
        // If API fails, show loading state
        return false;
    }
}

// Function to categorize breach methods
function categorizeMethod(method) {
    const methodLower = method ? method.toLowerCase() : 'unknown';
    
    if (methodLower.includes('hacked') || methodLower.includes('ransomware')) {
        return 'External Attack';
    } else if (methodLower.includes('poor security') || methodLower.includes('misconfiguration') || 
               methodLower.includes('unsecured') || methodLower.includes('unprotected') || 
               methodLower.includes('improper setting') || methodLower.includes('data exposed by misconfiguration')) {
        return 'Poor Security/Configuration';
    } else if (methodLower.includes('accidentally') || methodLower.includes('accidentally published') || 
               methodLower.includes('accidentally exposed') || methodLower.includes('accidentally uploaded')) {
        return 'Accidental Exposure';
    } else if (methodLower.includes('lost') || methodLower.includes('stolen')) {
        return 'Physical Loss/Theft';
    } else if (methodLower.includes('inside job') || methodLower.includes('rogue contractor')) {
        return 'Insider Threat';
    } else if (methodLower.includes('unknown')) {
        return 'Unknown';
    } else if (methodLower.includes('social engineering')) {
        return 'Social Engineering';
    } else if (methodLower.includes('zero-day') || methodLower.includes('vulnerabilities')) {
        return 'Vulnerability Exploit';
    } else {
        return 'External Attack'; // Default to External Attack for breach category
    }
}

// Process the raw data and add categories, then aggregate by category and organization type
function processBreachDataForCharts() {
    // Clear previous data
    methodVsCategoryDataMap.clear();
    categoryAggregation.clear();
    
    rawMethodVsCategoryData.forEach(item => {
        const category = categorizeMethod(item.Method);
        const key = `${category}|${item["Organization type"]}`;
        
        if (methodVsCategoryDataMap.has(key)) {
            const existing = methodVsCategoryDataMap.get(key);
            existing.TotalRecords += item.TotalRecords;
            existing.Count += item.Count;
        } else {
            methodVsCategoryDataMap.set(key, {
                "Organization type": item["Organization type"],
                "Method Category": category,
                "Method": item.Method,
                "TotalRecords": item.TotalRecords,
                "Count": item.Count
            });
        }
    });

    // Convert map to array and aggregate by category only for visualization
    rawMethodVsCategoryData.forEach(item => {
        const category = categorizeMethod(item.Method);
        
        if (categoryAggregation.has(category)) {
            const existing = categoryAggregation.get(category);
            existing.TotalRecords += item.TotalRecords;
            existing.Count += item.Count;
        } else {
            categoryAggregation.set(category, {
                "Method Category": category,
                "TotalRecords": item.TotalRecords,
                "Count": item.Count
            });
        }
    });

    methodVsCategoryData = Array.from(categoryAggregation.values());
}

let methodVsCategoryDataMap = new Map();
let categoryAggregation = new Map();
let methodVsCategoryData = [];

// Helper function to create gradient colors
function createGradient(ctx, colorStops) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    colorStops.forEach((stop, index) => {
        gradient.addColorStop(index / (colorStops.length - 1), stop);
    });
    return gradient;
}

// Helper function to format large numbers
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toString();
}

// Visualization 1: Bar Chart - Data Breaches by Entity
let chart1;
function createChart1() {
    const ctx = document.getElementById('visualization1').getContext('2d');
    
    // Sort data by records descending and limit to top 10
    const sortedData = [...breachData].sort((a, b) => b.Records - a.Records).slice(0, 10);
    
    chart1 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(d => d.Entity),
            datasets: [{
                label: 'Records Exposed',
                data: sortedData.map(d => d.Records),
                backgroundColor: sortedData.map((d, i) => {
                    const ratio = i / sortedData.length;
                    const r = Math.floor(0 + (255 * ratio));
                    const g = Math.floor(240 - (240 * ratio));
                    const b = Math.floor(255 - (50 * ratio));
                    return `rgba(${r}, ${g}, ${b}, 0.85)`;
                }),
                borderColor: sortedData.map((d, i) => {
                    const ratio = i / sortedData.length;
                    const r = Math.floor(0 + (255 * ratio));
                    const g = Math.floor(240 - (240 * ratio));
                    const b = Math.floor(255 - (50 * ratio));
                    return `rgba(${r}, ${g}, ${b}, 1)`;
                }),
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: sortedData.map((d, i) => {
                    const ratio = i / sortedData.length;
                    const r = Math.floor(0 + (255 * ratio));
                    const g = Math.floor(240 - (240 * ratio));
                    const b = Math.floor(255 - (50 * ratio));
                    return `rgba(${r}, ${g}, ${b}, 1)`;
                })
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
                    titleColor: '#00f0ff',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyColor: '#ffffff',
                    bodyFont: {
                        size: 12
                    },
                    borderColor: '#00f0ff',
                    borderWidth: 2,
                    padding: 15,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return sortedData[context[0].dataIndex].Entity;
                        },
                        label: function(context) {
                            const data = sortedData[context.dataIndex];
                            return [
                                `💾 Records: ${data.Records.toLocaleString()}`,
                                `📅 Year: ${data.Year}`,
                                `🏢 Type: ${data["Organization type"]}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11,
                            weight: '500'
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12
                        },
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    },
                    title: {
                        display: true,
                        text: 'Records Exposed',
                        color: '#00f0ff',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 13,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 240, 255, 0.08)'
                    }
                }
            }
        }
    });
}

// Visualization 2: Line Chart - Data Breach Records Over Time
let chart2;
function createChart2() {
    const ctx = document.getElementById('visualization2').getContext('2d');
    
    // Sort by year for proper timeline
    const sortedData = [...recordsByYearData].sort((a, b) => {
        const yearA = parseInt(a.Year.split('-')[0]);
        const yearB = parseInt(b.Year.split('-')[0]);
        return yearA - yearB;
    });
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(176, 38, 255, 0.5)');
    gradient.addColorStop(0.5, 'rgba(176, 38, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(176, 38, 255, 0.02)');
    
    chart2 = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedData.map(d => d.Year),
            datasets: [{
                label: 'Records Exposed',
                data: sortedData.map(d => d.Records),
                borderColor: '#b026ff',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.35,
                pointRadius: 5,
                pointHoverRadius: 10,
                pointBackgroundColor: '#b026ff',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#ff00f5',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeInOutCubic'
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 39, 0.95)',
                    titleColor: '#b026ff',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyColor: '#ffffff',
                    bodyFont: {
                        size: 13
                    },
                    borderColor: '#b026ff',
                    borderWidth: 2,
                    padding: 15,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return `Year ${context[0].label}`;
                        },
                        label: function(context) {
                            return `📊 Records Exposed: ${formatNumber(context.parsed.y)} (${context.parsed.y.toLocaleString()})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11,
                            weight: '500'
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Year',
                        color: '#b026ff',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12
                        },
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    },
                    title: {
                        display: true,
                        text: 'Records Exposed',
                        color: '#b026ff',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 13,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(176, 38, 255, 0.08)'
                    }
                }
            }
        }
    });
}

// Visualization 3: Bubble Chart - Breaches by Industry Over Time
let chart3;
function createChart3() {
    const ctx = document.getElementById('visualization3').getContext('2d');
    
    // Get all breach data and categorize by organization type
    const orgTypeColors = {
        'tech': 'rgba(0, 240, 255, 0.7)',
        'social': 'rgba(255, 0, 245, 0.7)',
        'web': 'rgba(176, 38, 255, 0.7)',
        'financial': 'rgba(0, 255, 127, 0.7)',
        'retail': 'rgba(255, 215, 0, 0.7)',
        'healthcare': 'rgba(255, 105, 180, 0.7)',
        'government': 'rgba(64, 224, 208, 0.7)',
        'gaming': 'rgba(255, 140, 0, 0.7)',
        'telecom': 'rgba(147, 112, 219, 0.7)',
        'other': 'rgba(169, 169, 169, 0.7)'
    };
    
    // Categorize organization types
    function getOrgCategory(orgType) {
        const type = orgType.toLowerCase();
        if (type.includes('tech') || type.includes('technology')) return 'tech';
        if (type.includes('social') || type.includes('facebook') || type.includes('instagram')) return 'social';
        if (type.includes('web')) return 'web';
        if (type.includes('financial') || type.includes('bank')) return 'financial';
        if (type.includes('retail') || type.includes('shopping')) return 'retail';
        if (type.includes('healthcare') || type.includes('health')) return 'healthcare';
        if (type.includes('government') || type.includes('military')) return 'government';
        if (type.includes('gam')) return 'gaming';
        if (type.includes('telecom')) return 'telecom';
        return 'other';
    }
    
    // Group data by organization category
    const categoryData = {};
    breachData.forEach(breach => {
        const category = getOrgCategory(breach["Organization type"]);
        if (!categoryData[category]) {
            categoryData[category] = [];
        }
        categoryData[category].push({
            x: breach.Year,
            y: breach.Records,
            r: Math.max(3, Math.min(15, Math.log10(breach.Records) * 2)),
            entity: breach.Entity
        });
    });
    
    // Create datasets for each category
    const datasets = Object.keys(categoryData).map(category => ({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        data: categoryData[category],
        backgroundColor: orgTypeColors[category] || orgTypeColors.other,
        borderColor: (orgTypeColors[category] || orgTypeColors.other).replace('0.7', '1'),
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
                    borderColor: '#ff00f5',
                    borderWidth: 2,
                    padding: 15,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return context[0].raw.entity || 'Breach Incident';
                        },
                        label: function(context) {
                            return [
                                `Industry: ${context.dataset.label}`,
                                `Year: ${context.parsed.x}`,
                                `Records: ${formatNumber(context.parsed.y)} (${context.parsed.y.toLocaleString()})`,
                                `Impact: ${context.raw.r > 20 ? 'Critical' : context.raw.r > 12 ? 'High' : 'Medium'}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: 2000,
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11
                        },
                        stepSize: 2,
                        callback: function(value) {
                            return Math.floor(value);
                        }
                    },
                    title: {
                        display: true,
                        text: 'Year of Breach',
                        color: '#ff00f5',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 13,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 0, 245, 0.08)'
                    }
                },
                y: {
                    type: 'logarithmic',
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11
                        },
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    },
                    title: {
                        display: true,
                        text: 'Records Exposed (log scale)',
                        color: '#ff00f5',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 13,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 0, 245, 0.08)'
                    }
                }
            }
        }
    });
}

// Create visualizations when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Fetch data from API first
    const dataLoaded = await fetchBreachData();
    
    if (dataLoaded && breachData.length > 0) {
        // Process the data for visualizations
        processBreachDataForCharts();
        
        // Wait a bit to ensure DOM is fully ready, then render charts
        setTimeout(() => {
            createChart1();
            createChart2();
            createChart3();
        }, 100);
    } else {
        console.warn('No breach data available. Charts may not render with full data.');
        // Still attempt to render with empty data
        setTimeout(() => {
            createChart1();
            createChart2();
            createChart3();
        }, 100);
    }
});
