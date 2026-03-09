/**
 * @file Componente de Mapa Interativo para Parceiros
 * @description Renderiza mapa com Leaflet permitindo dragging do marcador
 * para ajuste fino da localização. Inclui recentramento automático.
 *
 * @module componentes/MapaParceiro
 */

import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../estilos/componentes/personalizados/MapaParceiro.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const LEAFLET_ICON_CONFIG = {
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
};

const MAP_CONFIG = {
  ZOOM_INICIAL: 15,
  ALTURA: '280px',
  LATITUDE_MIN: -90,
  LATITUDE_MAX: 90,
  LONGITUDE_MIN: -180,
  LONGITUDE_MAX: 180,
};

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

// ============================================================================
// INICIALIZAÇÃO DO LEAFLET
// ============================================================================

/**
 * Corrige o problema padrão do Leaflet com ícones do marker
 * Necessário pois Leaflet tenta carregar ícones de forma relativa
 */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions(LEAFLET_ICON_CONFIG);

// ============================================================================
// COMPONENTES
// ============================================================================

/**
 * Componente auxiliar que recentra o mapa quando as coordenadas mudam
 *
 * Utiliza o hook `useMap` do react-leaflet para acessar a instância
 * do mapa e atualiza a visualização via `setView`.
 *
 * @component
 * @param {number} lat - Latitude para centralizar
 * @param {number} lng - Longitude para centralizar
 * @returns {null} Este componente não renderiza nada
 */
const MapRecentrador = ({ lat, lng }) => {
  const mapa = useMap();

  useEffect(() => {
    if (mapa && lat && lng) {
      mapa.setView([lat, lng], mapa.getZoom());
    }
  }, [lat, lng, mapa]);

  return null;
};

// ============================================================================
// VALIDAÇÃO
// ============================================================================

/**
 * Valida se as coordenadas são geograficamente válidas
 *
 * @param {number|string} latitude - Latitude a validar
 * @param {number|string} longitude - Longitude a validar
 * @returns {boolean} true se ambas as coordenadas são válidas
 */
const sãoCoordenadosValidas = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < MAP_CONFIG.LATITUDE_MIN || lat > MAP_CONFIG.LATITUDE_MAX) return false;
  if (lng < MAP_CONFIG.LONGITUDE_MIN || lng > MAP_CONFIG.LONGITUDE_MAX) return false;

  return true;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Mapa Interativo para Localização de Parceiros
 *
 * Renderiza um mapa do OpenStreetMap com:
 * - Marcador arrastável para ajuste fino de coordenadas
 * - Popup exibindo nome e coordenadas exatas (6 casas decimais)
 * - Recentramento automático ao alterar coordenadas
 * - Validação de limites geográficos
 *
 * @component
 * @param {number|string} latitude - Latitude inicial do marcador
 * @param {number|string} longitude - Longitude inicial do marcador
 * @param {string} nomeParceiro - Nome para exibição no popup
 * @param {Function} onMarkerDrag - Callback quando marcador é arrastado
 * @returns {JSX.Element}
 *
 * @example
 * <MapaParceiro
 *   latitude={-23.5505}
 *   longitude={-46.6333}
 *   nomeParceiro="São Paulo"
 *   onMarkerDrag={({latitude, longitude}) => {
 *     console.log(`Nova posição: ${latitude}, ${longitude}`);
 *   }}
 * />
 */
const MapaParceiro = ({ latitude, longitude, nomeParceiro, onMarkerDrag }) => {
  const coordenadasValidas = sãoCoordenadosValidas(latitude, longitude);
  const coordInicial = coordenadasValidas ? [latitude, longitude] : [0, 0];

  const [coordenatasMarcador, setCoordenatasMarcador] = useState(coordInicial);

  const markerRef = useRef(null);

  // Sincronizar estado quando as coordenadas iniciais mudam
  if (
    coordenadasValidas &&
    (coordenatasMarcador[0] !== latitude || coordenatasMarcador[1] !== longitude)
  ) {
    setCoordenatasMarcador([latitude, longitude]);
  }

  /**
   * Handler para quando o marcador é arrastado
   */
  const handleMarcadorArrastado = () => {
    if (markerRef.current) {
      const posicao = markerRef.current.getLatLng();
      const novasCoordenadas = {
        latitude: posicao.lat,
        longitude: posicao.lng,
      };

      setCoordenatasMarcador([posicao.lat, posicao.lng]);
      onMarkerDrag?.(novasCoordenadas);
    }
  };

  // Se não houver coordenadas válidas, mostrar mensagem
  if (!coordenadasValidas) {
    return (
      <div className="mapa-parceiro-vazio">
        <div>
          <p>Insira coordenadas para visualizar no mapa</p>
          <p>Use a pesquisa de CEP ou digite manualmente latitude e longitude</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer center={coordInicial} zoom={MAP_CONFIG.ZOOM_INICIAL} className="mapa-parceiro">
      <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />

      <Marker
        ref={markerRef}
        position={coordenatasMarcador}
        draggable={true}
        eventHandlers={{
          dragend: handleMarcadorArrastado,
        }}
      >
        <Popup>
          <div className="mapa-parceiro-popup">
            <strong>{nomeParceiro}</strong>
            <code>
              {parseFloat(coordenatasMarcador[0]).toFixed(6)},{' '}
              {parseFloat(coordenatasMarcador[1]).toFixed(6)}
            </code>
          </div>
        </Popup>
      </Marker>

      <MapRecentrador lat={latitude} lng={longitude} />
    </MapContainer>
  );
};

export default MapaParceiro;
