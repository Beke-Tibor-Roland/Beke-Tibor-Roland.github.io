import csv
import json

def csv_to_json(csv_file, json_file):
    data = []
    
    with open(csv_file, 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        
        for row in csv_reader:
            # Clean and convert data
            record = {
                'country': row['Country'],
                'year': int(row['Year']),
                'attack_type': row['Attack Type'],
                'target_industry': row['Target Industry'],
                'financial_loss': float(row['Financial Loss (in Million $)']),
                'affected_users': int(row['Number of Affected Users']),
                'attack_source': row['Attack Source'],
                'vulnerability_type': row['Security Vulnerability Type'],
                'defense_mechanism': row['Defense Mechanism Used'],
                'resolution_time': int(row['Incident Resolution Time (in Hours)'])
            }
            data.append(record)
    
    with open(json_file, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=2)
    
    print(f"✅ Converted {len(data)} records to {json_file}")

csv_to_json('data_breaches_global.csv', 'data_breaches_global.json')