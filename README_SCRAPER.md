# Data Breach Scraper

This Python script scrapes cybersecurity breach data from multiple sources to feed your Data Breach Intelligence Dashboard.

## 🎯 Data Sources

1. **XposedOrNot API** - Already integrated in your site
2. **Have I Been Pwned (HIBP) API** - Comprehensive breach database
3. **Privacy Rights Clearinghouse** - US-focused breach data
4. **IT Governance** - Monthly cyber incident reports

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Scraper

```bash
python scrape_breach_data.py
```

### 3. Output Files

The script creates:
- `api/data_breaches_scraped.json` - JSON format for web use
- `data/data_breaches_scraped.csv` - CSV format for analysis

## 📋 Features

- **Multi-source scraping**: Aggregates data from 4+ sources
- **Deduplication**: Removes duplicate entries automatically
- **Rate limiting**: Respects server resources with delays
- **Error handling**: Continues on failures, logs issues
- **Rich data**: Collects breach dates, affected records, industries, attack types

## 🔧 Configuration

### Scrape Different Years

Edit the script's main block:

```python
scraper.run_full_scrape(years=[2023, 2024, 2025])
```

### Add HIBP API Key (Optional)

Get a key from https://haveibeenpwned.com/API/Key and add:

```python
scraper.scrape_hibp_api(api_key='YOUR_API_KEY_HERE')
```

## 📊 Integration with Your Dashboard

After scraping, update your `script.js` to use the new data:

```javascript
async function fetchBreachData() {
    const response = await fetch('api/data_breaches_scraped.json');
    // ...rest of your code
}
```

## ⚡ Automation

### Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., weekly)
4. Action: Start a program
5. Program: `python`
6. Arguments: `C:\path\to\scrape_breach_data.py`

### GitHub Actions (Recommended)

Create `.github/workflows/scrape-data.yml`:

```yaml
name: Scrape Breach Data

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:  # Manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: python scrape_breach_data.py
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "Update scraped breach data"
```

## 🔒 Legal & Ethics

- Respects `robots.txt`
- Includes rate limiting
- Uses public APIs and data
- For educational/portfolio purposes
- Check each site's Terms of Service

## 🐛 Troubleshooting

### Import Error: No module named 'bs4'
```bash
pip install beautifulsoup4
```

### Timeout Errors
Increase timeout in requests:
```python
response = requests.get(url, timeout=60)
```

### Empty Results
- Check internet connection
- Verify URLs are still valid
- Some sites may block automated requests

## 📈 Example Output

```
🚀 Starting full breach data scrape...
📡 Fetching from XposedOrNot API...
✅ Found 245 breaches from XposedOrNot
📡 Fetching from HIBP API...
✅ Found 612 breaches from HIBP
🔄 Deduplicating data...
✅ Removed 87 duplicates, 770 unique records remain

📊 Scraping complete!
Total unique breaches collected: 770

📈 Summary by source:
  • HIBP: 612 breaches
  • XposedOrNot: 245 breaches
  • PrivacyRights: 89 breaches
  • ITGovernance: 124 breaches

💾 Saved 770 breaches to api/data_breaches_scraped.json
💾 Saved 770 breaches to data/data_breaches_scraped.csv

✅ All done!
```

## 🔄 Regular Updates

Run this script:
- **Weekly**: For active monitoring
- **Monthly**: For portfolio updates
- **On-demand**: When adding new visualizations

## 📚 Additional Resources

- [Have I Been Pwned API Docs](https://haveibeenpwned.com/API/v3)
- [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [Requests Library Guide](https://requests.readthedocs.io/)
