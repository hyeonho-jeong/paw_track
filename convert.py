import csv
import json

csv_file = "assets/dogBreeds.csv"  
json_file = "assets/dogBreeds.json"

data = []
with open(csv_file, encoding="utf-8") as file:
    reader = csv.DictReader(file)
    for row in reader:
        data.append(row)

with open(json_file, "w", encoding="utf-8") as file:
    json.dump(data, file, ensure_ascii=False, indent=4)

print("CSV → JSON conversion complete")
