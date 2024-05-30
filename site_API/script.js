document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM content loaded");

    // Simulate real-time data update
    const currentConsumption = document.getElementById('currentConsumption');
    const dailyGoal = document.getElementById('dailyGoal');
    const progress = document.getElementById('progress');
    const co2Saved = document.getElementById('co2Saved');
    const treesPlanted = document.getElementById('treesPlanted');
    const chartTitle = document.getElementById('chartTitle');
    const loadingBar = document.getElementById('loadingBar');
    const loadingPercentage = document.getElementById('loadingPercentage');
    const weatherInfo = document.getElementById('weatherInfo');

    const chartFiles = [
        { 
            file: 'ENSEM_Energie_Active_Totale.csv', 
            label: 'Consommation (kWh)', 
            field: 'ENSEM_ENSAIA/Centrale mesure générale-energie active totale (kW-hr)', 
            title: 'Évolution de la Consommation (kWh)', 
            maxProgress: 100000 
        },
        { 
            file: 'ENSEM_Intensite_moyenne.csv', 
            label: 'Intensité Moyenne (A)', 
            field: 'ENSEM_ENSAIA/Centrale mesure générale-intensité moyenne (A)', 
            title: 'Évolution de l\'Intensité Moyenne (A)', 
            maxProgress: 200000 
        },
        { 
            file: 'ENSEM_Puissance_active_totale.csv', 
            label: 'Puissance Active Totale (kW)', 
            field: 'ENSEM_ENSAIA/Centrale mesure générale-puissance active totale (kW)', 
            title: 'Évolution de la Puissance Active Totale (kW)', 
            maxProgress: 150000 
        }
    ];

    const chartSections = [
        { id: 'charts', isWeather: false },
        { id: 'photo', isWeather: false },
        { id: 'weather', isWeather: true }
    ];

    let currentChartIndex = 0;
    let currentSectionIndex = 0;
    let chartInstance;

    function updateData() {
        const consumption = Math.floor(Math.random() * 1000);
        const goal = 450;
        const progressPercentage = ((consumption / goal) * 100).toFixed(2);

        currentConsumption.textContent = `${consumption} kWh`;
        progress.textContent = `${progressPercentage}%`;
        co2Saved.textContent = `${(consumption * 0.4).toFixed(2)} kg`;
        treesPlanted.textContent = `${Math.floor(consumption / 50)} arbres`;
    }

    function reduceLabels(labels, reductionFactor) {
        return labels.filter((_, index) => index % reductionFactor === 0);
    }

    function updateLoadingBar(sum, maxProgress) {
        const percentage = Math.min((sum / maxProgress) * 100, 100);
        loadingBar.style.width = `${percentage}%`;
        loadingPercentage.textContent = `${percentage.toFixed(2)}% du taux de consommation optimal`;
    }

    function getWeatherIcon(condition) {
        switch (condition.toLowerCase()) {
            case 'ensoleillé':
                return 'wi-day-sunny';
            case 'nuageux':
                return 'wi-cloudy';
            case 'pluie':
                return 'wi-rain';
            case 'neige':
                return 'wi-snow';
            case 'orage':
                return 'wi-thunderstorm';
            default:
                return 'wi-na';
        }
    }

    function loadWeather() {
        // Example weather data, replace with real API call if needed
        const exampleWeatherData = {
            temperature: "22°C",
            condition: "Ensoleillé",
            humidity: "50%",
            wind: "15 km/h"
        };
        const weatherIcon = getWeatherIcon(exampleWeatherData.condition);
        weatherInfo.innerHTML = `
            <i class="wi ${weatherIcon} weather-icon"></i>
            <p>Température : ${exampleWeatherData.temperature}</p>
            <p>Condition : ${exampleWeatherData.condition}</p>
            <p>Humidité : ${exampleWeatherData.humidity}</p>
            <p>Vent : ${exampleWeatherData.wind}</p>
        `;
    }

    function loadChart(file, label, field, title, maxProgress) {
        Papa.parse(file, {
            download: true,
            header: true,
            complete: function(results) {
                console.log(`CSV parsed successfully: ${file}`);
                console.log(results.data);

                const labels = results.data.map(row => row['Timestamp']);
                const data = results.data.map(row => {
                    const value = row[field];
                    return value ? parseFloat(value.replace(',', '.')) : 0; // Replace undefined values with 0
                });

                console.log("Labels:", labels);
                console.log("Data:", data);

                const reducedLabels = reduceLabels(labels, Math.ceil(labels.length / 10)); // Show only 10 labels

                const sum = data.reduce((acc, val) => acc + val, 0);
                updateLoadingBar(sum, maxProgress);

                const ctx = document.getElementById('consumptionChart').getContext('2d');

                if (chartInstance) {
                    chartInstance.destroy();
                }

                chartInstance = new Chart(ctx, {
                    type: 'bar',  // Use 'bar' for bar chart
                    data: {
                        labels: reducedLabels,
                        datasets: [{
                            label: label,
                            data: data,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            x: {
                                beginAtZero: true,
                                ticks: {
                                    maxRotation: 90,
                                    minRotation: 45
                                }
                            },
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });

                // Update the chart title
                chartTitle.textContent = title;
            }
        });
    }

    function cycleCharts() {
        // Hide all sections
        chartSections.forEach(section => {
            document.getElementById(section.id).style.display = 'none';
        });

        // Show the current section
        const currentSection = chartSections[currentSectionIndex];
        document.getElementById(currentSection.id).style.display = 'block';

        if (currentSection.isWeather) {
            loadWeather();
        } else if (currentSection.id === 'photo') {
            // If it's the photo section, no need to load chart
            console.log("Displaying photo section");
        } else {
            const chartConfig = chartFiles[currentChartIndex];
            loadChart(chartConfig.file, chartConfig.label, chartConfig.field, chartConfig.title, chartConfig.maxProgress);
            currentChartIndex = (currentChartIndex + 1) % chartFiles.length;
        }

        // Move to the next section
        currentSectionIndex = (currentSectionIndex + 1) % chartSections.length;
    }

    // Start the chart cycling
    cycleCharts();
    setInterval(cycleCharts, 7000); // Change chart every 5 seconds
});
