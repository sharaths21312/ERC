import csv
import json

with open("C:\\Users\\Sharath\\Documents\\Code\\Websites\\erc\\scripts\\data.csv") as f:
    reader = csv.reader(f)
    inp = [*reader]

inp.pop(0)
out = []
for i in inp:
    crow = {}
    if i[0] == "Nobody":
        continue
    crow['names'] = [i[0]]
    if i[24] != "":
        crow['burstcost'] = float(i[24])
    else:
        crow['burstcost'] = 0
    crow['cooldown'] = float(i[23])
    crow['element'] = i[1]
    crow['helptext'] = i[27]
    crow['particlesources'] = []
    for j in range(3):
        if i[2 + j] == "":
            break
        src = {}
        if i[5 + j] != "":
            src['label'] = i[2 + j]
            src['energytype'] = "Instant"
            if i[20 + j] != "":
                src['cooldown'] = float(i[20 + j])
            src['amount'] = float(i[5 + j])
            src['element'] = i[1]
        elif float(i[14 + j]) != 0.0:
            src['label'] = i[2 + j]
            src['energytype'] = "Turret"
            if i[20 + j] != "":
                src['cooldown'] = float(i[20 + j])
            src['amount'] = float(i[14 + j])
            src['element'] = i[1]
            src['duration'] = float(i[17 + j])
        elif i[8 + j] != "":
            src['label'] = i[2 + j]
            src['energytype'] = "Self"
            if i[20 + j] != "":
                src['cooldown'] = float(i[20 + j])
            src['amount'] = float(i[8 + j])
            src['element'] = i[1]
        crow['particlesources'].append(src)
    out.append(crow)

with open("out.json", 'w') as f:
    json.dump({
        "$schema": "./characterschema.json",
        "characters": out
    }, f)