// 🌍 CLIMATE & AGRONOMY ENGINE (climate_db.js) 🌍

const ClimateEngine = {

    getHardinessZone: function(lat) {
        const absLat = Math.abs(lat);
        if (absLat < 25) return { zone: "10-11", frostRisk: "None", season: "Tropical" };
        if (absLat >= 25 && absLat < 30) return { zone: "9", frostRisk: "Very Low", season: "Sub-Tropical" };
        if (absLat >= 30 && absLat < 35) return { zone: "8", frostRisk: "Low (Dec-Feb)", season: "Warm Temperate" };
        if (absLat >= 35 && absLat < 40) return { zone: "6-7", frostRisk: "Moderate (Nov-Mar)", season: "Temperate" };
        if (absLat >= 40 && absLat < 45) return { zone: "4-5", frostRisk: "High (Oct-Apr)", season: "Cool Temperate" };
        return { zone: "1-3", frostRisk: "Extreme (Sep-May)", season: "Arctic/Sub-Arctic" };
    },

    getCurrentSeason: function() {
        const month = new Date().getMonth(); 
        if (month >= 2 && month <= 4) return "spring";
        if (month >= 5 && month <= 7) return "summer";
        if (month >= 8 && month <= 10) return "fall";
        return "winter";
    },

    calculateVPD: function(tempF, humidity) {
        const tempC = (tempF - 32) * (5/9);
        const svp = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
        const vpd = svp * (1 - (humidity / 100));
        return vpd; 
    },

    checkLethalGates: function(plant, weekTempsMin, weekTempsMax, maxWind) {
        if (!weekTempsMin || !weekTempsMax) return { pass: true };
        const lowestTemp = Math.round(Math.min(...weekTempsMin));
        const highestTemp = Math.round(Math.max(...weekTempsMax));
        const roundedWind = Math.round(maxWind || 0);

        if (plant.temp_floor && lowestTemp <= parseFloat(plant.temp_floor)) {
            return { pass: false, reason: `Lethal cold! Drop to ${lowestTemp}°F.` };
        }
        if (plant.temp_ceiling && highestTemp >= parseFloat(plant.temp_ceiling)) {
            return { pass: false, reason: `Lethal heat! Spike to ${highestTemp}°F.` };
        }
        if (plant.wind_tolerance && roundedWind >= parseFloat(plant.wind_tolerance) + 10) { 
            return { pass: false, reason: `Gusts up to ${roundedWind} mph will cause damage.` };
        }
        return { pass: true };
    },

    scoreComfort: function(plant, avgTemp, avgHumidity, rainTotal) {
        let score = 70; 
        const opt = plant.optimal_temp || [65, 80];
        if (avgTemp >= opt[0] && avgTemp <= opt[1]) score += 15; else score -= 10; 
        if (plant.min_humidity && avgHumidity >= plant.min_humidity) score += 10; else score -= 5; 
        
        if (rainTotal > 1.0) { 
            if (plant.water_frequency === "very_low" || plant.water_frequency === "low") score -= 20; 
        }
        
        if (score > 100) score = 100;
        if (score < 0) score = 0;
        return score;
    },

    runAnalysis: function(lat, lon, weekTempsMin, weekTempsMax, dailyGusts, currentTemp, currentHumidity, rainTotal, moonPhaseStr, isDaytime) {
        if (!window.floraDB || Object.keys(window.floraDB).length === 0) {
            return { zone: {zone: "Unknown"}, recommendations: [] };
        }

        const zoneData = this.getHardinessZone(lat || 33.44);
        const currentSeason = this.getCurrentSeason();
        const results = [];
        const currentVPD = this.calculateVPD(currentTemp || 72, currentHumidity || 40);

        for (const [id, originalPlant] of Object.entries(window.floraDB)) {
            let activePlant = JSON.parse(JSON.stringify(originalPlant));

            // Normalize database properties to ensure engine compatibility
            if (!activePlant.optimal_temp && activePlant.opt_min !== undefined) {
                activePlant.optimal_temp = [parseFloat(activePlant.opt_min), parseFloat(activePlant.opt_max)];
            } else if (!activePlant.optimal_temp) {
                activePlant.optimal_temp = [65, 80];
            }

            if (!activePlant.vpd_range && activePlant.vpd_min !== undefined) {
                activePlant.vpd_range = [parseFloat(activePlant.vpd_min), parseFloat(activePlant.vpd_max)];
            } else if (!activePlant.vpd_range) {
                activePlant.vpd_range = [0.8, 1.2];
            }

            // Check if plant seasonal toggle matches current season
            let isSeasonMatch = (!activePlant.season || activePlant.season === currentSeason || activePlant.season === 'year_round');

            let currentVPDRange = activePlant.vpd_range;
            let idealVPDText = `${currentVPDRange[0]} - ${currentVPDRange[1]}`;

            let safeDays = [];
            if (dailyGusts) {
                dailyGusts.forEach((gust) => {
                    if (gust <= (activePlant.wind_tolerance || 15)) safeDays.push(true);
                });
            }

            let worstGust = dailyGusts ? Math.max(...dailyGusts) : 0;
            const survival = this.checkLethalGates(activePlant, weekTempsMin, weekTempsMax, worstGust);
            let comfortScore = this.scoreComfort(activePlant, currentTemp || 72, currentHumidity || 40, rainTotal || 0);

            let primaryTag = "VIBING STABLE";
            let primaryTooltip = "Conditions are ideal.";
            let tagClass = "tag-max";
            let reason = `Zone ${zoneData.zone} verified. Plant is healthy and stable.`;

            if (!survival.pass) {
                primaryTag = "STRICTLY INDOORS!!";
                tagClass = "tag-sanctuary";
                reason = survival.reason;
                comfortScore = 0;
            } else if (!isSeasonMatch) {
                primaryTag = "DORMANT / OFF-SEASON";
                tagClass = "tag-shade";
                reason = `This plant is optimized for ${activePlant.season}, currently resting.`;
            }

            let secondaryTag = activePlant.water_frequency ? `${activePlant.water_frequency.toUpperCase()} WATER` : "MOD WATER";
            let secondaryTooltip = activePlant.water_schedule || "Check soil moisture regularly.";

            results.push({
                id: id,
                plant: activePlant, 
                score: comfortScore,
                primaryTag: primaryTag,
                primaryTooltip: primaryTooltip,
                tagClass: tagClass,
                secondaryTag: secondaryTag,
                secondaryTooltip: secondaryTooltip,
                reason: reason,
                liveVPD: currentVPD.toFixed(2),
                idealVPDText: idealVPDText,
                isLunarBoostActive: false,
                respiration: "Active metabolic cycle"
            });
        }

        results.sort((a, b) => b.score - a.score);
        return { zone: zoneData, recommendations: results };
    }
};

window.ClimateEngine = ClimateEngine;

