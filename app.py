from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util
from bson.json_util import dumps

app = Flask(__name__)

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'Weather'
COLLECTION_NAME = 'SevereWeather'
FIELDS = {'EVENT_ID': True, 'BEGIN_DATE': True, 'EVENT_TYPE': True, 'DEATHS_DIRECT': True, 
          'INJURIES_DIRECT': True, 'DAMAGE_PROPERTY_NUM': True, 'DAMAGE_CROPS_NUM': True, 'STATE_ABBR': True,
          'BEGIN_LAT': True, 'BEGIN_LON': True, "_id": False,'ABSOLUTE_ROWNUMBER': True}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/weather/severeweather")
def donorschoose_projects():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    projects = collection.find(projection=FIELDS)
    json_SevereWeather = []
    for project in projects:
        json_SevereWeather.append(project)
    json_SevereWeather = json.dumps(json_SevereWeather, default=json_util.default)
    connection.close()
    return json_SevereWeather

if __name__ == "__main__":
    app.run(debug=True)