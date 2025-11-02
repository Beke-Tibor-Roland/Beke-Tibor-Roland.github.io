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

// Sample data for visualizations
const breachData = [
    {
        "Entity": "Facebook",
        "Year": 2019,
        "Records": 858500000,
        "Organization type": "social network",
        "Method": "poor security"
    },
    {
        "Entity": "Instagram",
        "Year": 2020,
        "Records": 200000000,
        "Organization type": "social network",
        "Method": "poor security"
    },
    {
        "Entity": "TikTok",
        "Year": 2020,
        "Records": 42000000,
        "Organization type": "social media",
        "Method": "poor security"
    },
    {
        "Entity": "YouTube",
        "Year": 2020,
        "Records": 4000000,
        "Organization type": "social media",
        "Method": "poor security"
    }
];

const recordsByYearData = [
    { "Year": "2004", "Records": 92510000.0 },
    { "Year": "2005", "Records": 46825000.0 },
    { "Year": "2006", "Records": 71260000.0 },
    { "Year": "2007", "Records": 153286405.0 },
    { "Year": "2008", "Records": 69066500.0 },
    { "Year": "2009", "Records": 255467987.0 },
    { "Year": "2010", "Records": 15980476.0 },
    { "Year": "2011", "Records": 227788137.0 },
    { "Year": "2012", "Records": 428839635.0 },
    { "Year": "2013", "Records": 3469434877.0 },
    { "Year": "2014", "Records": 850978000.0 },
    { "Year": "2014 and 2015", "Records": 363000.0 },
    { "Year": "2015", "Records": 201654459.0 },
    { "Year": "2016", "Records": 540582363.0 },
    { "Year": "2017", "Records": 254766877.0 },
    { "Year": "2018", "Records": 1529849832.0 },
    { "Year": "2018-2019", "Records": 2000000.0 },
    { "Year": "2019", "Records": 3824900831.0 },
    { "Year": "2019-2020", "Records": 0.0 },
    { "Year": "2020", "Records": 1251422083.0 },
    { "Year": "2021", "Records": 61396266.0 },
    { "Year": "2022", "Records": 9958922.0 }
];

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

// Process the raw data and add categories, then aggregate by category and organization type
const rawMethodVsCategoryData = [
    { "Organization type": "Clinical Laboratory", "Method": "poor security", "TotalRecords": 11900000.0, "Count": 1 },
    { "Organization type": "Consumer Goods", "Method": "hacked", "TotalRecords": 150000000.0, "Count": 1 },
    { "Organization type": "Information Security", "Method": "hacked", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "Network Monitoring", "Method": "hacked", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "QR code payment", "Method": "improper setting, hacked", "TotalRecords": 20076016.0, "Count": 1 },
    { "Organization type": "Question & Answer", "Method": "hacked", "TotalRecords": 100000000.0, "Count": 1 },
    { "Organization type": "Telephone directory", "Method": "unknown", "TotalRecords": 299055000.0, "Count": 1 },
    { "Organization type": "academic", "Method": "accidentally published", "TotalRecords": 43000.0, "Count": 1 },
    { "Organization type": "academic", "Method": "hacked", "TotalRecords": 2725540.0, "Count": 9 },
    { "Organization type": "academic", "Method": "lost / stolen computer", "TotalRecords": 2172000.0, "Count": 2 },
    { "Organization type": "academic", "Method": "lost / stolen media", "TotalRecords": 2200000.0, "Count": 1 },
    { "Organization type": "advertising", "Method": "hacked", "TotalRecords": 75000.0, "Count": 1 },
    { "Organization type": "arts group", "Method": "poor security", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "background check", "Method": "unknown", "TotalRecords": 56000000.0, "Count": 1 },
    { "Organization type": "banking", "Method": "poor security", "TotalRecords": 90000.0, "Count": 1 },
    { "Organization type": "consulting, accounting", "Method": "poor security", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "data broker", "Method": "poor security", "TotalRecords": 340000000.0, "Count": 1 },
    { "Organization type": "dating", "Method": "hacked", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "educational services", "Method": "hacked", "TotalRecords": 35040000.0, "Count": 1 },
    { "Organization type": "energy", "Method": "hacked", "TotalRecords": 110000.0, "Count": 1 },
    { "Organization type": "energy", "Method": "inside job", "TotalRecords": 12900000.0, "Count": 2 },
    { "Organization type": "energy", "Method": "poor security", "TotalRecords": 1300000.0, "Count": 1 },
    { "Organization type": "fashion", "Method": "hacked", "TotalRecords": 123857.0, "Count": 1 },
    { "Organization type": "financial", "Method": "accidentally published", "TotalRecords": 200000000.0, "Count": 1 },
    { "Organization type": "financial", "Method": "hacked", "TotalRecords": 443298083.0, "Count": 19 },
    { "Organization type": "financial", "Method": "inside job", "TotalRecords": 44300000.0, "Count": 6 },
    { "Organization type": "financial", "Method": "intentionally lost", "TotalRecords": 960000.0, "Count": 1 },
    { "Organization type": "financial", "Method": "lost / stolen media", "TotalRecords": 23734000.0, "Count": 7 },
    { "Organization type": "financial", "Method": "poor security", "TotalRecords": 275000.0, "Count": 2 },
    { "Organization type": "financial", "Method": "rogue contractor", "TotalRecords": 30000.0, "Count": 1 },
    { "Organization type": "financial", "Method": "unsecured S3 bucket", "TotalRecords": 106000000.0, "Count": 1 },
    { "Organization type": "financial service company", "Method": "poor security", "TotalRecords": 885000000.0, "Count": 1 },
    { "Organization type": "financial, credit reporting", "Method": "poor security", "TotalRecords": 163119000.0, "Count": 1 },
    { "Organization type": "gambling", "Method": "unknown", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "game", "Method": "hacked", "TotalRecords": 350000.0, "Count": 1 },
    { "Organization type": "gaming", "Method": "accidentally published", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "gaming", "Method": "hacked", "TotalRecords": 172623989.0, "Count": 11 },
    { "Organization type": "genealogy", "Method": "unknown", "TotalRecords": 92283889.0, "Count": 1 },
    { "Organization type": "government", "Method": "accidentally published", "TotalRecords": 21673461.0, "Count": 7 },
    { "Organization type": "government", "Method": "hacked", "TotalRecords": 88290899.0, "Count": 8 },
    { "Organization type": "government", "Method": "inside job", "TotalRecords": 1412000.0, "Count": 4 },
    { "Organization type": "government", "Method": "lost / stolen computer", "TotalRecords": 100000.0, "Count": 1 },
    { "Organization type": "government", "Method": "lost / stolen media", "TotalRecords": 30634500.0, "Count": 6 },
    { "Organization type": "government", "Method": "poor security", "TotalRecords": 60240000.0, "Count": 4 },
    { "Organization type": "government, database", "Method": "hacked", "TotalRecords": 1500000.0, "Count": 1 },
    { "Organization type": "government, healthcare", "Method": "hacked", "TotalRecords": 9037378.0, "Count": 2 },
    { "Organization type": "government, military", "Method": "hacked", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "government, military", "Method": "lost / stolen computer", "TotalRecords": 26500000.0, "Count": 1 },
    { "Organization type": "health", "Method": "poor security", "TotalRecords": 500000.0, "Count": 1 },
    { "Organization type": "healthcare", "Method": "hacked", "TotalRecords": 135763800.0, "Count": 18 },
    { "Organization type": "healthcare", "Method": "inside job", "TotalRecords": 6406700.0, "Count": 2 },
    { "Organization type": "healthcare", "Method": "lost / stolen computer", "TotalRecords": 6583234.0, "Count": 6 },
    { "Organization type": "healthcare", "Method": "lost / stolen media", "TotalRecords": 20594036.0, "Count": 14 },
    { "Organization type": "healthcare", "Method": "poor security", "TotalRecords": 1780600.0, "Count": 5 },
    { "Organization type": "healthcare", "Method": "poor security/inside job", "TotalRecords": 14200.0, "Count": 1 },
    { "Organization type": "healthcare", "Method": "unknown", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "hosting provider", "Method": "hacked", "TotalRecords": 1107034.0, "Count": 1 },
    { "Organization type": "hotel", "Method": "hacked", "TotalRecords": 500363000.0, "Count": 7 },
    { "Organization type": "hotel", "Method": "poor security/inside job", "TotalRecords": 5200000.0, "Count": 1 },
    { "Organization type": "humanitarian", "Method": "unknown", "TotalRecords": 515000.0, "Count": 1 },
    { "Organization type": "information technology", "Method": "hacked", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "local search", "Method": "unprotected api", "TotalRecords": 100000000.0, "Count": 1 },
    { "Organization type": "market analysis", "Method": "poor security", "TotalRecords": 120000000.0, "Count": 1 },
    { "Organization type": "media", "Method": "hacked", "TotalRecords": 1700000.0, "Count": 3 },
    { "Organization type": "messaging app", "Method": "hacked", "TotalRecords": 162000000.0, "Count": 1 },
    { "Organization type": "military", "Method": "accidentally published", "TotalRecords": 985000.0, "Count": 2 },
    { "Organization type": "military", "Method": "hacked", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "military", "Method": "inside job", "TotalRecords": 260000.0, "Count": 1 },
    { "Organization type": "military", "Method": "lost / stolen computer", "TotalRecords": 131000.0, "Count": 1 },
    { "Organization type": "military", "Method": "lost / stolen media", "TotalRecords": 76072000.0, "Count": 2 },
    { "Organization type": "military, healthcare", "Method": "lost / stolen computer", "TotalRecords": 4901432.0, "Count": 1 },
    { "Organization type": "mobile carrier", "Method": "accidentally exposed", "TotalRecords": 900000.0, "Count": 1 },
    { "Organization type": "mobile carrier", "Method": "hacked", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "online marketing", "Method": "publicly accessible Amazon Web Services (AWS) server", "TotalRecords": 38000000.0, "Count": 1 },
    { "Organization type": "online shopping", "Method": "ransomware hacked", "TotalRecords": 1648922.0, "Count": 1 },
    { "Organization type": "personal and demographic data about residents and their properties of US", "Method": "Poor security", "TotalRecords": 201000000.0, "Count": 1 },
    { "Organization type": "phone accessories", "Method": "poor security", "TotalRecords": 377428.0, "Count": 1 },
    { "Organization type": "publisher (magazine)", "Method": "unknown", "TotalRecords": 380000.0, "Count": 1 },
    { "Organization type": "restaurant", "Method": "hacked", "TotalRecords": 2000000.0, "Count": 3 },
    { "Organization type": "retail", "Method": "accidentally published", "TotalRecords": 95000.0, "Count": 1 },
    { "Organization type": "retail", "Method": "hacked", "TotalRecords": 362228335.0, "Count": 22 },
    { "Organization type": "retail", "Method": "inside job", "TotalRecords": 8637405.0, "Count": 1 },
    { "Organization type": "retail", "Method": "lost / stolen computer", "TotalRecords": 897000.0, "Count": 2 },
    { "Organization type": "retail", "Method": "poor security", "TotalRecords": 283000.0, "Count": 1 },
    { "Organization type": "shopping", "Method": "inside job", "TotalRecords": 510000.0, "Count": 1 },
    { "Organization type": "social media", "Method": "poor security", "TotalRecords": 46000000.0, "Count": 2 },
    { "Organization type": "social network", "Method": "accidentally published", "TotalRecords": 6000000.0, "Count": 1 },
    { "Organization type": "social network", "Method": "accidentally uploaded", "TotalRecords": 1500000.0, "Count": 1 },
    { "Organization type": "social network", "Method": "hacked", "TotalRecords": 173000000.0, "Count": 1 },
    { "Organization type": "social network", "Method": "poor security", "TotalRecords": 1057500000.0, "Count": 5 },
    { "Organization type": "social networking", "Method": "hacked", "TotalRecords": 14870304.0, "Count": 1 },
    { "Organization type": "software", "Method": "zero-day vulnerabilities", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "special public corporation", "Method": "hacked", "TotalRecords": 1250000.0, "Count": 1 },
    { "Organization type": "tech", "Method": "data exposed by misconfiguration", "TotalRecords": 250000000.0, "Count": 1 },
    { "Organization type": "tech", "Method": "hacked", "TotalRecords": 157848000.0, "Count": 9 },
    { "Organization type": "tech", "Method": "hacked/misconfiguration", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "tech", "Method": "lost / stolen computer", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "tech", "Method": "poor security", "TotalRecords": 593050000.0, "Count": 7 },
    { "Organization type": "tech, retail", "Method": "accidentally published", "TotalRecords": 12367232.0, "Count": 1 },
    { "Organization type": "tech, retail", "Method": "lost / stolen media", "TotalRecords": 200000.0, "Count": 1 },
    { "Organization type": "tech, web", "Method": "hacked", "TotalRecords": 22000000.0, "Count": 1 },
    { "Organization type": "telecom", "Method": "hacked", "TotalRecords": 45000000.0, "Count": 1 },
    { "Organization type": "telecom", "Method": "inside job", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "telecommunications", "Method": "misconfiguration/poor security", "TotalRecords": 100000000.0, "Count": 1 },
    { "Organization type": "telecommunications", "Method": "poor security", "TotalRecords": 320000000.0, "Count": 1 },
    { "Organization type": "telecoms", "Method": "accidentally published", "TotalRecords": 170000.0, "Count": 1 },
    { "Organization type": "telecoms", "Method": "hacked", "TotalRecords": 29454000.0, "Count": 7 },
    { "Organization type": "telecoms", "Method": "inside job", "TotalRecords": 2000000.0, "Count": 1 },
    { "Organization type": "telecoms", "Method": "lost / stolen computer", "TotalRecords": 113000.0, "Count": 1 },
    { "Organization type": "telecoms", "Method": "lost / stolen media", "TotalRecords": 17000000.0, "Count": 1 },
    { "Organization type": "telecoms", "Method": "poor security", "TotalRecords": 1900000.0, "Count": 1 },
    { "Organization type": "ticket distribution", "Method": "hacked", "TotalRecords": 26151608.0, "Count": 1 },
    { "Organization type": "transport", "Method": "hacked", "TotalRecords": 66920000.0, "Count": 5 },
    { "Organization type": "transport", "Method": "lost / stolen media", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "transport", "Method": "poor security", "TotalRecords": 52000.0, "Count": 1 },
    { "Organization type": "various", "Method": "poor security", "TotalRecords": 6400000.0, "Count": 1 },
    { "Organization type": "web", "Method": "accidentally published", "TotalRecords": 28420000.0, "Count": 4 },
    { "Organization type": "web", "Method": "hacked", "TotalRecords": 4663249235.0, "Count": 43 },
    { "Organization type": "web", "Method": "improper setting, hacked", "TotalRecords": 1381735.0, "Count": 1 },
    { "Organization type": "web", "Method": "inside job, hacked", "TotalRecords": 92000000.0, "Count": 1 },
    { "Organization type": "web", "Method": "poor security", "TotalRecords": 376000.0, "Count": 2 },
    { "Organization type": "web", "Method": "poor security / hacked", "TotalRecords": 412214295.0, "Count": 1 },
    { "Organization type": "web", "Method": "social engineering", "TotalRecords": 6054459.0, "Count": 1 },
    { "Organization type": "web service", "Method": "hacked", "TotalRecords": 0.0, "Count": 1 },
    { "Organization type": "web, gaming", "Method": "hacked", "TotalRecords": 32000000.0, "Count": 1 },
    { "Organization type": "web, military", "Method": "accidentally published", "TotalRecords": 163792.0, "Count": 1 },
    { "Organization type": "web, tech", "Method": "hacked", "TotalRecords": 4700000.0, "Count": 1 }
];

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

const methodVsCategoryData = Array.from(categoryAggregation.values());

// Visualization 1: Bar Chart - Data Breaches by Entity
const spec1 = {
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
};

// Visualization 2: Line Chart - Data Breach Records Over Time
const spec2 = {
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
};

// Visualization 3: Scatter Plot - Breach Method Categories vs Number of Incidents
const spec3 = {
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
};

// Embed visualizations when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure DOM is fully ready
    setTimeout(() => {
        vegaEmbed('#visualization1', spec1, {
            actions: false,
            renderer: 'svg'
        }).catch(err => {
            console.error('Error embedding visualization 1:', err);
        });

        vegaEmbed('#visualization2', spec2, {
            actions: false,
            renderer: 'svg'
        }).catch(err => {
            console.error('Error embedding visualization 2:', err);
        });

        vegaEmbed('#visualization3', spec3, {
            actions: false,
            renderer: 'svg'
        }).catch(err => {
            console.error('Error embedding visualization 3:', err);
        });
    }, 100);
});
