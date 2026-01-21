"""
Data Breach Scraper for Cybersecurity Dashboard
Scrapes breach data from multiple sources and outputs to JSON/CSV
"""

import requests
import json
import csv
import time
from datetime import datetime
from bs4 import BeautifulSoup
import pandas as pd

class BreachDataScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        self.breach_data = []
    
    def scrape_xposedornot(self):
        """Scrape from XposedOrNot API (already working in your site)"""
        print("📡 Fetching from XposedOrNot API...")
        try:
            response = requests.get(
                'https://api.xposedornot.com/v1/breaches',
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                breaches = data.get('exposedBreaches', [])
                
                for breach in breaches:
                    self.breach_data.append({
                        'breach_id': breach.get('breachID', 'Unknown'),
                        'domain': breach.get('domain', 'N/A'),
                        'breach_date': breach.get('breachedDate', 'Unknown'),
                        'exposed_records': breach.get('exposedRecords', 0),
                        'industry': breach.get('industry', 'Unknown'),
                        'data_classes': ', '.join(breach.get('exposedData', [])),
                        'password_risk': breach.get('passwordRisk', 'Unknown'),
                        'search_status': breach.get('searchable', False),
                        'verified': breach.get('verified', False),
                        'source': 'XposedOrNot'
                    })
                
                print(f"✅ Found {len(breaches)} breaches from XposedOrNot")
                return True
            else:
                print(f"❌ XposedOrNot API returned status {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error scraping XposedOrNot: {e}")
            return False
    
    def scrape_privacy_rights(self, year=2024):
        """Scrape Privacy Rights Clearinghouse database"""
        print(f"📡 Scraping Privacy Rights Clearinghouse ({year})...")
        try:
            url = f'https://privacyrights.org/data-breaches?title=&breach_date%5Bmin%5D={year}-01-01&breach_date%5Bmax%5D={year}-12-31'
            response = requests.get(url, headers=self.headers, timeout=30)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find breach table rows
                breach_rows = soup.find_all('tr', class_='views-row')
                
                for row in breach_rows:
                    cells = row.find_all('td')
                    if len(cells) >= 5:
                        self.breach_data.append({
                            'organization': cells[0].get_text(strip=True),
                            'breach_type': cells[1].get_text(strip=True),
                            'records_exposed': self._parse_number(cells[2].get_text(strip=True)),
                            'breach_date': cells[3].get_text(strip=True),
                            'location': cells[4].get_text(strip=True),
                            'year': year,
                            'source': 'PrivacyRights'
                        })
                
                print(f"✅ Found {len(breach_rows)} breaches from Privacy Rights")
                return True
            else:
                print(f"❌ Privacy Rights returned status {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error scraping Privacy Rights: {e}")
            return False
    
    def scrape_itgovernance(self, year=2024):
        """Scrape IT Governance cyber incidents list"""
        print(f"📡 Scraping IT Governance ({year})...")
        try:
            months = ['january', 'february', 'march', 'april', 'may', 'june',
                     'july', 'august', 'september', 'october', 'november', 'december']
            
            count = 0
            for month in months:
                url = f'https://www.itgovernance.co.uk/blog/list-of-data-breaches-and-cyber-attacks-in-{month}-{year}'
                response = requests.get(url, headers=self.headers, timeout=30)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Find breach entries (they use <h3> for organization names)
                    breach_entries = soup.find_all(['h3', 'h4'])
                    
                    for entry in breach_entries:
                        text = entry.get_text(strip=True)
                        if text and len(text) > 5 and text.lower() not in ['related articles', 'related', 'share this article']:
                            # Extract breach info from surrounding paragraphs
                            next_p = entry.find_next('p')
                            description = next_p.get_text(strip=True) if next_p else ''
                            
                            self.breach_data.append({
                                'organization': text,
                                'description': description[:200],
                                'month': month,
                                'year': year,
                                'source': 'ITGovernance'
                            })
                            count += 1
                    
                    time.sleep(2)  # Rate limiting - be respectful
                else:
                    print(f"⚠️ Month {month} returned status {response.status_code}")
            
            print(f"✅ Scraped {count} entries from IT Governance for {year}")
            return True
            
        except Exception as e:
            print(f"❌ Error scraping IT Governance: {e}")
            return False
    
    def scrape_hibp_api(self, api_key=None):
        """Scrape Have I Been Pwned API (requires API key for most endpoints)"""
        print("📡 Fetching from HIBP API...")
        try:
            # Free breaches endpoint (no key required)
            url = 'https://haveibeenpwned.com/api/v3/breaches'
            headers = self.headers.copy()
            
            if api_key:
                headers['hibp-api-key'] = api_key
            
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                breaches = response.json()
                
                for breach in breaches:
                    self.breach_data.append({
                        'name': breach.get('Name'),
                        'title': breach.get('Title'),
                        'domain': breach.get('Domain'),
                        'breach_date': breach.get('BreachDate'),
                        'added_date': breach.get('AddedDate'),
                        'pwn_count': breach.get('PwnCount', 0),
                        'description': breach.get('Description', ''),
                        'data_classes': ', '.join(breach.get('DataClasses', [])),
                        'is_verified': breach.get('IsVerified'),
                        'is_fabricated': breach.get('IsFabricated'),
                        'is_sensitive': breach.get('IsSensitive'),
                        'is_retired': breach.get('IsRetired'),
                        'is_spam_list': breach.get('IsSpamList'),
                        'logo_path': breach.get('LogoPath', ''),
                        'source': 'HIBP'
                    })
                
                print(f"✅ Found {len(breaches)} breaches from HIBP")
                return True
            else:
                print(f"❌ HIBP API returned status {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error scraping HIBP: {e}")
            return False
    
    def _parse_number(self, text):
        """Parse number strings like '1.2M' or '500K' to integers"""
        try:
            text = text.replace(',', '').strip()
            if 'M' in text or 'million' in text.lower():
                return int(float(text.replace('M', '').replace('million', '').strip()) * 1000000)
            elif 'K' in text or 'thousand' in text.lower():
                return int(float(text.replace('K', '').replace('thousand', '').strip()) * 1000)
            elif 'B' in text or 'billion' in text.lower():
                return int(float(text.replace('B', '').replace('billion', '').strip()) * 1000000000)
            else:
                return int(float(text))
        except:
            return 0
    
    def save_to_json(self, filename='data_breaches_scraped.json'):
        """Save scraped data to JSON file"""
        output_path = f'api/{filename}'
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.breach_data, f, indent=2, ensure_ascii=False)
        print(f"💾 Saved {len(self.breach_data)} breaches to {output_path}")
    
    def save_to_csv(self, filename='data_breaches_scraped.csv'):
        """Save scraped data to CSV file"""
        if not self.breach_data:
            print("⚠️ No data to save!")
            return
        
        output_path = f'data/{filename}'
        
        # Get all unique keys from all dictionaries
        all_keys = set()
        for item in self.breach_data:
            all_keys.update(item.keys())
        
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=sorted(all_keys))
            writer.writeheader()
            writer.writerows(self.breach_data)
        
        print(f"💾 Saved {len(self.breach_data)} breaches to {output_path}")
    
    def deduplicate_data(self):
        """Remove duplicate entries based on domain/organization and breach date"""
        print("🔄 Deduplicating data...")
        seen = set()
        unique_data = []
        
        for item in self.breach_data:
            # Create unique key from available fields
            key_parts = []
            for field in ['domain', 'organization', 'name', 'breach_id']:
                if field in item and item[field]:
                    key_parts.append(str(item[field]).lower())
            
            if 'breach_date' in item:
                key_parts.append(str(item['breach_date']))
            
            key = '|'.join(key_parts)
            
            if key and key not in seen:
                seen.add(key)
                unique_data.append(item)
        
        removed = len(self.breach_data) - len(unique_data)
        self.breach_data = unique_data
        print(f"✅ Removed {removed} duplicates, {len(unique_data)} unique records remain")
    
    def run_full_scrape(self, years=[2024, 2025]):
        """Run all scraping methods"""
        print("🚀 Starting full breach data scrape...")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        # Scrape from all sources
        self.scrape_xposedornot()
        time.sleep(2)
        
        self.scrape_hibp_api()  # No API key = limited data but still useful
        time.sleep(2)
        
        # Scrape privacy rights for multiple years
        for year in years:
            self.scrape_privacy_rights(year=year)
            time.sleep(2)
        
        # Scrape IT Governance (careful - many requests)
        for year in years:
            self.scrape_itgovernance(year=year)
            time.sleep(3)
        
        # Clean up duplicates
        self.deduplicate_data()
        
        # Save results
        print("\n📊 Scraping complete!")
        print(f"Total unique breaches collected: {len(self.breach_data)}")
        print(f"⏰ Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        self.save_to_json()
        self.save_to_csv()
        
        # Print summary statistics
        print("\n📈 Summary by source:")
        sources = {}
        for item in self.breach_data:
            source = item.get('source', 'Unknown')
            sources[source] = sources.get(source, 0) + 1
        
        for source, count in sorted(sources.items(), key=lambda x: x[1], reverse=True):
            print(f"  • {source}: {count} breaches")
        
        print("\n✅ All done! Check the api/ and data/ folders for output files.")

if __name__ == '__main__':
    scraper = BreachDataScraper()
    
    # Run scraper for 2024 and 2025 data
    scraper.run_full_scrape(years=[2024, 2025])
    
    # Optional: If you have a HIBP API key, uncomment and set it here:
    # scraper.scrape_hibp_api(api_key='YOUR_API_KEY_HERE')
