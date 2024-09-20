import json,csv

file = open('videos.csv', 'r', encoding='utf-8')
csv_reader = csv.DictReader(file)


js = []
for line in csv_reader:
    line.pop('description')
    js.append( line )

with open('videos.json', 'w') as file:
    file.write(json.dumps(js, indent=2))