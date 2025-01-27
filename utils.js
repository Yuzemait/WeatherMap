const openWeatherMapApiKey = '9012594ce2cc2280fc3d97914638de4d'; // Reemplaza con tu clave de OpenWeatherMap

let currentInfoWindow = null; // Variable para almacenar el InfoWindow actual

// Rangos de calidad del aire para cada contaminante
const airQualityRanges = {
    so2: [20, 80, 250, 350],      // Límites para SO2
    no2: [40, 70, 150, 200],      // Límites para NO2
    pm10: [20, 50, 100, 200],     // Límites para PM10
    pm2_5: [10, 25, 50, 75],      // Límites para PM2.5
    o3: [60, 100, 140, 180],      // Límites para O3
    co: [4400, 9400, 12400, 15400] // Límites para CO
};

// Nombres cualitativos basados en los índices
const airQualityNames = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];

// Función para mostrar el InfoWindow con los datos meteorológicos
async function mostrarInfoClima(ubicacion, map) {
    try {
        const lat = ubicacion.lat();
        const lng = ubicacion.lng();
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${openWeatherMapApiKey}&units=metric&lang=es`);

        if (!response.ok) {
            throw new Error('Error al obtener los datos de OpenWeatherMap');
        }

        const response2 = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${openWeatherMapApiKey}`);
        
        if (!response2.ok) {
            throw new Error('Error al obtener los datos de calidad del aire');
        }

        const data2 = await response2.json();
        console.log(data2.list);
        const airQuality = calculateAirQuality(data2.list[0]); // Calcular calidad del aire
        const { index, description } = airQuality;

        const data = await response.json();
        const descripcionClima = data.weather[0].description;
        const temperatura = data.main.temp;
        const iconoClima = data.weather[0].icon; // Obtén el código del icono del clima

        // Usar template literal para crear el contenido HTML
        const contenidoHTML = `
            <div class="info-window-content">
                <ul class="weather-info">
                    <li class="weather-item">
                        <img src="https://openweathermap.org/img/wn/${iconoClima}@2x.png" alt="${descripcionClima}" class="imagen-clima">
                        <span>${descripcionClima} </span>  
                    </li>
                    <li class="temp-item">
                        <img src="https://uxwing.com/wp-content/themes/uxwing/download/medical-science-lab/high-temperature-icon.png" alt="${descripcionClima}" class="imagen-clima">
                        <span>${temperatura} °C</span>
                    </li>
                    <li class="pollution-item">
                        <img src="https://static.thenounproject.com/png/2083791-200.png" alt="${descripcionClima}" class="imagen-clima">
                        <span>${description}</span>
                    </li>
                </ul>

            </div>
        `;

        // Si ya existe un InfoWindow, lo cerramos
        if (currentInfoWindow) {
            currentInfoWindow.close();
        }

        // Crear un nuevo InfoWindow con el contenido HTML
        const infowindow = new google.maps.InfoWindow({
            content: contenidoHTML,
            position: ubicacion, // Coloca el InfoWindow en la ubicación del clic
        });

        // Mostrar el InfoWindow en el mapa
        infowindow.open(map);

            // Obtener el contenedor del InfoWindow después de que se abra
        google.maps.event.addListenerOnce(infowindow, 'domready', () => {
            const contentDiv = document.querySelector('.info-window-content');
            if (contentDiv) {
                // Agregar la clase de animación
                contentDiv.classList.add('animate');
            }
        });

        // Guardamos el InfoWindow actual para poder cerrarlo en el futuro
        currentInfoWindow = infowindow;

    } catch (error) {
        console.error('Error al obtener los datos de OpenWeatherMap:', error);
    }
}

// Función para determinar el índice de calidad del aire de un contaminante
function getAirQualityIndex(value, ranges) {
    if (value < ranges[0]) return 1; // Good
    if (value < ranges[1]) return 2; // Fair
    if (value < ranges[2]) return 3; // Moderate
    if (value < ranges[3]) return 4; // Poor
    return 5; // Very Poor
}

// Función principal para calcular el índice general de calidad del aire
function calculateAirQuality(data) {
    const components = data.components; // Datos de los contaminantes
    let maxIndex = 1; // Índice general (empezamos con "Good")

    // Calcular el índice para cada contaminante y actualizar el índice máximo
    for (const [key, value] of Object.entries(components)) {
        if (airQualityRanges[key]) {
            const index = getAirQualityIndex(value, airQualityRanges[key]);
            maxIndex = Math.max(maxIndex, index);
        }
    }

    // Devolver el índice general y su descripción cualitativa
    return {
        index: maxIndex,
        description: airQualityNames[maxIndex - 1] // Ajustar índice a base 0
    };
}