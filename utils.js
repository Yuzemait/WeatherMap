const openWeatherMapApiKey = '9012594ce2cc2280fc3d97914638de4d'; // Reemplaza con tu clave de OpenWeatherMap

        let currentInfoWindow = null; // Variable para almacenar el InfoWindow actual

        // Función que se ejecuta cuando la API de Google Maps se ha cargado
        function initMap() {
            // Coordenadas iniciales del mapa
            const ubicacionInicial = { lat: 20.66682 , lng: -103.39182 }; // Ciudad de México

            // Crear el mapa
            const map = new google.maps.Map(document.getElementById('map'), {
                zoom: 12,
                center: ubicacionInicial,
            });

            // Agregar un listener para detectar clics en el mapa
            map.addListener('click', (event) => {
                const ubicacionClic = event.latLng;
                mostrarInfoClima(ubicacionClic, map);
            });
        }

        // Función para mostrar el InfoWindow con los datos meteorológicos
        async function mostrarInfoClima(ubicacion, map) {
            try {
                const lat = ubicacion.lat();
                const lng = ubicacion.lng();
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${openWeatherMapApiKey}&units=metric&lang=es`);

                if (!response.ok) {
                    throw new Error('Error al obtener los datos de OpenWeatherMap');
                }

                const data = await response.json();
                const descripcionClima = data.weather[0].description;
                const temperatura = data.main.temp;
                const iconoClima = data.weather[0].icon; // Obtén el código del icono del clima

                // Usar template literal para crear el contenido HTML
                const contenidoHTML = `
                    <div class="contenido">
                        <img src="https://openweathermap.org/img/wn/${iconoClima}@2x.png" alt="${descripcionClima}" class="imagen-clima">
                        <p>${descripcionClima}, ${temperatura}°C</p>
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

                // Guardamos el InfoWindow actual para poder cerrarlo en el futuro
                currentInfoWindow = infowindow;

            } catch (error) {
                console.error('Error al obtener los datos de OpenWeatherMap:', error);
            }
        }

window.initMap = initMap;