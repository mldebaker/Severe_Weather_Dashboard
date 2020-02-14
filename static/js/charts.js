// Create Queue
queue()
    .defer(d3.json, "/weather/severeweather")
    .defer(d3.json, "../static/geojson/us-states.json")
    .await(makeGraphs);

// Create Make Graph Function
function makeGraphs(error, weatherJson,statesJson){

    // Link Data
    var weatherSevereWeather = weatherJson;

    // Create Data Parser Function
    weatherSevereWeather.forEach(function(d){
        d["DAMAGE_PROPERTY_NUM"] = +d["DAMAGE_PROPERTY_NUM"];
        d["DAMAGE_CROPS_NUM"] = +d["DAMAGE_CROPS_NUM"];
    });

    // Crossfilter
    // Create Crossfilter Instance
    var ndx = crossfilter(weatherSevereWeather)

    // Create Data Dimensions
    // Create Date Dimension
    var dateDim = ndx.dimension(function(d){ return d["BEGIN_DATE"]; });

    // Create Choropleth Dimension
    var stateDim = ndx.dimension(function(d){ return d["STATE_ABBR"]; }); 

    // Create Total Dimension
    var totalDim = ndx.dimension(function(d){ return d["EVENT_TYPE"]; });

    // Create Data Groups
    // Create Count By Type Data Group
    var countByType = totalDim.group();

    // Create Total Property Damage Data Group
    var totalPropertyDamage = ndx.groupAll().reduceSum(function(d){
        return d["DAMAGE_PROPERTY_NUM"];
    });

    // Create Total Crop Damage Data group
    var totalCropDamage = ndx.groupAll().reduceSum(function(d){
        return d["DAMAGE_CROPS_NUM"];
    });

    // Create Total Deaths By Type Data Group
    var totalDeathsByType = totalDim.group().reduceSum(function(d){
        return d["DEATHS_DIRECT"];
    });
    
    // Create Total Injuries By Type Data Group
    var totalInjuriesByType = totalDim.group().reduceSum(function(d){
        return d["INJURIES_DIRECT"];
    });

    // Create Total Storms By State Data Group
    var totalStormTypeByState = stateDim.group().reduceCount(function(d){
        return d["ABSOLUTE_ROWNUMBER"];
    });

    console.log(totalStormTypeByState)

    // Create Data Variables
    // Create Max States Variable
    var max_state = totalStormTypeByState.top(50).value;

    console.log(max_state)

    // Create Min Date Variable
    var min_date = dateDim.bottom(1)["BEGIN_DATE"];

    // Create Max Date Variable
    var max_date = dateDim.top(1)["BEGIN_DATE"];

    console.log(max_date, min_date)

    // Define Charts
    // Define Total By Type Row Chart
    var typeTotalRowChart = dc.rowChart("#total-by-type-row-chart");

    // Define Propert Damage Number Display
    var propDamageND = dc.numberDisplay("#property-damage-nd");

    // Define Crop Damage Number Display
    var cropDamageND = dc.numberDisplay("#crop-damage-nd");

    // Define Death By Type Row Chart
    var deathsRowChart =  dc.rowChart("#deaths-row-chart");

    // Define Injuries By Type Row Chart
    var injuriesRowChart = dc.rowChart("#injuries-row-chart");

    // Define Time Chart
    var timeChart = dc.barChart("#time-chart");

    // Define US Choropleth
    var usChoro = dc.geoChoroplethChart("#us-choro");
    
    // Define Chart Parameters
    // Create Total by Type Row Chart Parameters
    typeTotalRowChart
        .width(348)
        .height(120)
        .dimension(totalDim)
        .group(countByType)
        .xAxis().ticks(5);
    
    // Create Porperty Damange Row Chart Parameters
    propDamageND
        .valueAccessor(function(d){ return d; })
        .group(totalPropertyDamage);

    // Create Crop Damage Row Chart Parameters
    cropDamageND
        .valueAccessor(function(d){ return d; })
        .group(totalCropDamage);

    // Create Death Pie Chart Parameters
    deathsRowChart
        .width(348)
        .height(120)
        .dimension(totalDim)
        .group(totalDeathsByType)
        .xAxis().ticks(5);

    // Create Injuries Pie Chart Parameters
    injuriesRowChart
        .width(348)
        .height(120)
        .dimension(totalDim)
        .group(totalInjuriesByType)
        .xAxis().ticks(5);

    // Create Time Chart Parameters
    timeChart
        .width(1118)
        .height(200)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(stateDim)
        .group(totalStormTypeByState)
        .transitionDuration(500)
        .x(d3.scaleOrdinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .label();
    // Create Choropleth  Chart Parameters
    usChoro
        .width(700)
        .height(300)
        .dimension(stateDim)
        .group(totalStormTypeByState)
        .transitionDuration(500)
        .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", 
                 "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
        .colorDomain([0, 500])
        .overlayGeoJson(statesJson["features"], "state", function (d) {
            return d.properties.name;
        })
        .projection(d3.geoAlbersUsa()
                          .scale(600)
                          .translate([340, 150]))
        .title(function (p) {
        return "State: " + p["key"]
                + "\n"
                + "Total Storms: " + Math.round(p["value"])
    })

    // Render Charts
    dc.renderAll();
};

