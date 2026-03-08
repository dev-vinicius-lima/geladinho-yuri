import axios from 'axios';

interface GeoapifyFeatureProperties {
  lat: number;
  lon: number;
}

interface GeoapifyFeature {
  properties: GeoapifyFeatureProperties;
}

interface GeoapifyResponse {
  features: GeoapifyFeature[];
}

export async function getLatLongFromAddress(address: string) {
  const apiKey = process.env.GEOAPIFY_API_KEY || '';

  // Geoapify
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
    address,
  )}&apiKey=${apiKey}`;

  try {
    const response = await axios.get<GeoapifyResponse>(url, {
      headers: { 'User-Agent': 'gasfacil-app' },
    });

    if (response.data && response.data.features.length > 0) {
      const { lat, lon } = response.data.features[0].properties;
      return { lat, lon };
    }

    return null;
  } catch (error) {
    console.error('Error ao buscar geolocalização:', error);
    return null;
  }
}
