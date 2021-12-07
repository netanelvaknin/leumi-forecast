require("dotenv").config();
const fs = require("fs");
const http = require("./http");
const { cities } = require("./config");

const getWeatherForecasts = () => {
    const responses = [];
    const endpoints = cities.map((city) => `/data/2.5/forecast?q=${city}&cnt=5&units=metric&appid=${process.env.WEATHER_APP_KEY}`);

    return new Promise((resolve, reject) => {
        endpoints.forEach(async endpoint => {
            try {
                const { data } = await http.get(endpoint);
                responses.push(data);

                if (responses.length === endpoints.length) resolve(responses);
            } catch (e) {
                reject("Something went wrong, Please try again later");
            }
        });
    });
}

const createForecastTable = (forecasts) => {
    if (forecasts.length > 0) {
        const table = [];
        const relevantInformation = forecasts.map(({ list, city }) => ({ list, city }));

        relevantInformation.forEach(({ list, city }) => {
            list.forEach((dailyForecast, index) => {
                const isRaining = dailyForecast.hasOwnProperty("rain");
                table.push({
                    name: city.name,
                    day: index + 1,
                    temp: Math.floor(dailyForecast.main.temp),
                    isRaining,
                });
            });
        });

        return table;
    }
};


const getStatistics = (table) => {
    const statistics = [];
    const daysStructure = Array(6).fill([]);
    table.forEach((daily) => daysStructure[daily.day].push(daily));

    const citiesWithRain = daysStructure.map(day => day.filter(forecast => forecast.isRaining)).flat();

    daysStructure.forEach((day, index) => {
        if (index > 0) {
            const max = day.reduce((prev, current) => (prev.temp > current.temp) ? prev : current);
            const min = day.reduce((prev, current) => (prev.temp < current.temp) ? prev : current);
            const rainingCities = citiesWithRain.filter(({ day }) => day === index).map((({ name }) => name));
            const uniqueRainingCities = [...new Set(rainingCities)];
            statistics.push([index, min.name, max.name, uniqueRainingCities.join(' ')]);
        }
    });

    return statistics;
}

const generateWeatherReport = (table) => {
    let csv = "";
    table.forEach((i) => csv += i.join(',') + "\r\n")

    fs.writeFile('weather-report.csv', csv, 'utf8', (err) => {
        if (err) throw err;
        console.log('Your report created successfuly :-)');
    });
}

getWeatherForecasts()
    .then((d) => createForecastTable(d))
    .then((s) => getStatistics(s))
    .then((t) => generateWeatherReport(t))
