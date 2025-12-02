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

// API Configuration - Change these URLs to your external API endpoints
const API_CONFIG = {
    breachesUrl: 'data/breaches.json',  // Replace with your API: 'https://api.example.com/breaches'
    recordsByYearUrl: 'data/records-by-year.json',  // Replace with your API
    methodVsCategoryUrl: 'method_vs_category.json'  // Replace with your API
};

// Global data storage
let breachData = [];
let recordsByYearData = [];
let rawMethodVsCategoryData = [];

// Function to load data from external API/JSON files
async function loadData() {
    try {
        // Show loading indicator
        console.log('Loading data from APIs...');
        
        // Fetch all data in parallel
        const [breachesResponse, yearResponse, methodResponse] = await Promise.all([
            fetch(API_CONFIG.breachesUrl),
            fetch(API_CONFIG.recordsByYearUrl),
            fetch(API_CONFIG.methodVsCategoryUrl)
        ]);

        // Check if all responses are OK
        if (!breachesResponse.ok || !yearResponse.ok || !methodResponse.ok) {
            throw new Error('Failed to fetch data from APIs');
        }

        // Parse JSON data
        breachData = await breachesResponse.json();
        recordsByYearData = await yearResponse.json();
        const methodData = await methodResponse.json();
        
        // Handle the nested structure from method_vs_category.json
        rawMethodVsCategoryData = methodData.data ? methodData.data.values : methodData;

        console.log(`✓ Loaded ${breachData.length} breach records`);
        console.log(`✓ Loaded ${recordsByYearData.length} yearly records`);
        console.log(`✓ Loaded ${rawMethodVsCategoryData.length} method/category records`);
        console.log(`Total records: ${breachData.length + recordsByYearData.length + rawMethodVsCategoryData.length}`);

        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load breach data. Please check your internet connection or API configuration.');
        return false;
    }
}

// Function to categorize breach methods
function categorizeMethod(method) {
    const methodLower = method.toLowerCase();
    
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
        return 'Other';
    }
}

// Process and aggregate data
function processMethodVsCategoryData() {
    // Aggregate data by method category and organization type
    const methodVsCategoryDataMap = new Map();

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
    const categoryAggregation = new Map();

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

    return Array.from(categoryAggregation.values());
}

// Visualization specifications - will use data loaded from API
function createVisualizationSpecs() {
    const methodVsCategoryData = processMethodVsCategoryData();
    
    return {
        spec1: {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "description": "Data breach records by entity",
            "data": { "values": breachData },
            "mark": {
                "type": "bar",
                "cornerRadius": 6,
                "tooltip": true
            },
            "encoding": {
                "x": {
                    "field": "Entity",
                    "type": "ordinal",
                    "axis": {
                        "title": "Social Media Platform",
                        "labelAngle": -45,
                        "labelFontSize": 12
                    },
                    "sort": { "field": "Records", "order": "descending" }
                },
                "y": {
                    "field": "Records",
                    "type": "quantitative",
                    "axis": {
                        "title": "Records Exposed (millions)",
                        "format": "~s",
                        "labelFontSize": 12
                    }
                },
                "color": {
                    "field": "Records",
                    "type": "quantitative",
                    "scale": {
                        "range": ["#00f0ff", "#b026ff", "#ff00f5"]
                    },
                    "legend": null
                },
                "tooltip": [
                    {"field": "Entity", "type": "nominal", "title": "Platform"},
                    {"field": "Year", "type": "ordinal", "title": "Year"},
                    {"field": "Records", "type": "quantitative", "title": "Records Exposed", "format": ",.0f"},
                    {"field": "Organization type", "type": "nominal", "title": "Organization Type"},
                    {"field": "Method", "type": "nominal", "title": "Breach Method"}
                ]
            },
            "width": "container",
            "height": 400,
            "config": {
                "background": "transparent",
                "axis": {
                    "labelFont": "Inter, sans-serif",
                    "titleFont": "Inter, sans-serif"
                }
            }
        },
        spec2: {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "description": "Data breach records trend by year",
            "data": { "values": recordsByYearData },
            "mark": {
                "type": "line",
                "point": {
                    "filled": true,
                    "size": 100,
                    "fill": "#b026ff"
                },
                "strokeWidth": 3,
                "tooltip": true
            },
            "encoding": {
                "x": {
                    "field": "Year",
                    "type": "ordinal",
                    "axis": {
                        "title": "Year",
                        "labelAngle": -45,
                        "labelFontSize": 11
                    },
                    "sort": null
                },
                "y": {
                    "field": "Records",
                    "type": "quantitative",
                    "axis": {
                        "title": "Records Exposed (billions)",
                        "format": "~s",
                        "labelFontSize": 12
                    }
                },
                "color": {
                    "value": "#b026ff"
                },
                "tooltip": [
                    {"field": "Year", "type": "ordinal", "title": "Year"},
                    {"field": "Records", "type": "quantitative", "title": "Records Exposed", "format": ",.0f"}
                ]
            },
            "width": "container",
            "height": 400,
            "config": {
                "background": "transparent",
                "axis": {
                    "labelFont": "Inter, sans-serif",
                    "titleFont": "Inter, sans-serif"
                }
            }
        },
        spec3: {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "description": "Data breach method categories vs number of incidents",
            "data": { "values": methodVsCategoryData },
            "mark": {
                "type": "circle",
                "opacity": 0.75,
                "size": 120,
                "stroke": "#ffffff",
                "strokeWidth": 1.5,
                "tooltip": true
            },
            "encoding": {
                "x": {
                    "field": "Method Category",
                    "type": "ordinal",
                    "axis": {
                        "title": "Breach Method Category",
                        "labelAngle": -45,
                        "labelFontSize": 11
                    },
                    "sort": { "field": "Count", "order": "descending" }
                },
                "y": {
                    "field": "Count",
                    "type": "quantitative",
                    "axis": {
                        "title": "Number of Incidents",
                        "format": "~s",
                        "labelFontSize": 12
                    }
                },
                "color": {
                    "field": "Count",
                    "type": "quantitative",
                    "scale": {
                        "range": ["#00f0ff", "#b026ff", "#ff00f5"]
                    },
                    "legend": null
                },
                "tooltip": [
                    {"field": "Method Category", "type": "nominal", "title": "Method Category"},
                    {"field": "Count", "type": "quantitative", "title": "Number of Incidents", "format": ",.0f"},
                    {"field": "TotalRecords", "type": "quantitative", "title": "Total Records Exposed", "format": ",.0f"}
                ]
            },
            "width": "container",
            "height": 500,
            "config": {
                "background": "transparent",
                "axis": {
                    "labelFont": "Inter, sans-serif",
                    "titleFont": "Inter, sans-serif"
                },
                "legend": {
                    "labelFont": "Inter, sans-serif",
                    "titleFont": "Inter, sans-serif"
                }
            }
        }
    };
}

// Embed visualizations after data is loaded
async function embedVisualizations() {
    const success = await loadData();
    
    if (!success) {
        console.error('Failed to load data, visualizations cannot be rendered');
        return;
    }
    
    const specs = createVisualizationSpecs();
    
    // Embed all three visualizations
    vegaEmbed('#visualization1', specs.spec1, {
        actions: false,
        renderer: 'svg'
    }).catch(err => {
        console.error('Error embedding visualization 1:', err);
    });

    vegaEmbed('#visualization2', specs.spec2, {
        actions: false,
        renderer: 'svg'
    }).catch(err => {
        console.error('Error embedding visualization 2:', err);
    });

    vegaEmbed('#visualization3', specs.spec3, {
        actions: false,
        renderer: 'svg'
    }).catch(err => {
        console.error('Error embedding visualization 3:', err);
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure DOM is fully ready
    setTimeout(() => {
        embedVisualizations();
    }, 100);
});
