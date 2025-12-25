/**
 * API Service for KrishiBot Backend Integration
 * Connects frontend components to the FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: 'include', // Include cookies for session management
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `API Error: ${response.status}`);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return await response.json();
    } catch (error) {
        console.error(`API Request failed: ${endpoint}`, error);
        throw error;
    }
}

// =============================================================================
// USER API
// =============================================================================

export interface UserCreate {
    username: string;
    latitude: number;
    longitude: number;
}

export interface UserUpdate {
    current_username: string;
    new_username?: string;
    latitude?: number;
    longitude?: number;
}

export interface DiseaseRecord {
    id: number;
    image_path: string;
    detected_disease: string;
    confidence_score: number;
    precautions?: string;
    solutions?: string;
    created_at: string;
}

export interface SoilTypePrediction {
    id: number;
    image_path: string;
    predicted_soil_type: string;
    created_at: string;
}

export interface RiskReport {
    id: number;
    crop_name: string;
    risk_level: string;
    risk_factors: string;
    forecast_start_date: string;
    forecast_end_date: string;
    created_at: string;
}

export interface UserProfile {
    id: number;
    username: string;
    latitude: number;
    longitude: number;
    disease_scans: DiseaseRecord[];
    soil_type_predictions: SoilTypePrediction[];
    risk_reports: RiskReport[];
}

/**
 * Register a new user
 */
export async function registerUser(data: UserCreate): Promise<UserProfile> {
    return apiRequest<UserProfile>('/users/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Get user profile by username (also sets session cookie)
 */
export async function getUserProfile(username: string): Promise<UserProfile> {
    return apiRequest<UserProfile>(`/users/me?username=${encodeURIComponent(username)}`, {
        method: 'GET',
    });
}

/**
 * Login/Get user - tries to fetch existing user or returns null
 */
export async function loginOrRegisterUser(data: UserCreate): Promise<UserProfile> {
    try {
        // First try to get existing user
        const response = await fetch(`${API_BASE_URL}/users/me?username=${encodeURIComponent(data.username)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });

        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        // User doesn't exist, register
    }

    // Register new user
    return registerUser(data);
}

/**
 * Update user profile
 */
export async function updateUser(data: UserUpdate): Promise<UserProfile> {
    return apiRequest<UserProfile>('/users/', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

// =============================================================================
// WEATHER & SOIL API
// =============================================================================

export interface WeatherHourly {
    date: string;
    relative_humidity_2m: number;
    precipitation: number;
    rain: number;
    wind_speed_120m: number;
    temperature_120m: number;
    soil_temperature_54cm: number;
    soil_moisture_27_to_81cm: number;
    terrestrial_radiation: number;
    temperature_2m: number;
}

export interface WeatherDaily {
    date: string;
    temperature_2m_max: number;
    temperature_2m_min: number;
}

export interface SoilData {
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
}

export interface WeatherResponse {
    coordinates: {
        latitude: number;
        longitude: number;
    };
    elevation: number;
    timezone_offset_seconds: number;
    hourly: WeatherHourly[];
    daily: WeatherDaily[];
    processed_weather_for_recommendation: {
        temperature_2m_mean: number | null;
        relative_humidity_2m_mean: number | null;
        total_rainfall: number;
    };
    soil_data: SoilData;
}

/**
 * Get weather and soil data for the current user
 */
export async function getWeatherData(username: string): Promise<WeatherResponse> {
    return apiRequest<WeatherResponse>(`/weather/?username=${encodeURIComponent(username)}`);
}

// =============================================================================
// CROP RECOMMENDATION API
// =============================================================================

export interface CropRecommendation {
    recommended_crops: string[];
    predictions: number[];
}

/**
 * Get crop recommendations based on user's location and environmental data
 */
export async function getCropRecommendation(username: string): Promise<CropRecommendation> {
    return apiRequest<CropRecommendation>('/crop/recommend', {
        method: 'POST',
        body: JSON.stringify({ username }),
    });
}

// =============================================================================
// DISEASE DETECTION API
// =============================================================================

export interface DiseaseDetectionResult {
    id: number;
    image_path: string;
    detected_disease: string;
    confidence_score: number;
    precautions?: string;
    solutions?: string;
    created_at: string;
}

/**
 * Predict disease from an image file
 */
export async function predictDisease(imageFile: File): Promise<DiseaseDetectionResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/tests/disease/predict`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Disease prediction failed: ${response.status}`);
    }

    return await response.json();
}

/**
 * Delete a disease scan record
 */
export async function deleteDiseaseRecord(scanId: number): Promise<void> {
    await apiRequest<void>(`/tests/disease/${scanId}`, {
        method: 'DELETE',
    });
}

// =============================================================================
// SOIL TYPE PREDICTION API
// =============================================================================

export interface SoilTypePredictionResult {
    id: number;
    image_path: string;
    predicted_soil_type: string;
    created_at: string;
}

/**
 * Predict soil type from an image file
 */
export async function predictSoilType(imageFile: File): Promise<SoilTypePredictionResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/tests/soiltype/predict`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Soil type prediction failed: ${response.status}`);
    }

    return await response.json();
}

/**
 * Delete a soil type prediction record
 */
export async function deleteSoilTypePrediction(predictionId: number): Promise<void> {
    await apiRequest<void>(`/tests/soiltype/${predictionId}`, {
        method: 'DELETE',
    });
}

// =============================================================================
// RISK REPORT API
// =============================================================================

/**
 * Delete a risk report
 */
export async function deleteRiskReport(reportId: number): Promise<void> {
    await apiRequest<void>(`/tests/risk/${reportId}`, {
        method: 'DELETE',
    });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert a base64 image string to a File object
 */
export function base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

/**
 * Check if the backend is reachable
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/`, { method: 'GET' });
        return response.ok;
    } catch {
        return false;
    }
}

// =============================================================================
// CHAT API
// =============================================================================

export interface ChatMessage {
    role: string;
    text: string;
}

export interface ChatRequest {
    history: ChatMessage[];
    message: string;
    context?: string;
}

/**
 * Send a message to the AI chat assistant
 */
export async function sendChatMessage(history: ChatMessage[], message: string, context?: string): Promise<string> {
    const payload: ChatRequest = {
        history,
        message,
        context
    };

    const result = await apiRequest<{ response: string }>('/chat/message', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return result.response;
}
