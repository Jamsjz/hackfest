"""
Crop-specific agronomic profiles for precision agriculture forecasting.
Contains base temperatures, growth stages, stress thresholds, and phenology data.
"""

CROP_PROFILES = {
    "Rice": {
        "T_base": 10.0,
        "T_opt": 30.0,
        "T_max": 40.0,
        "optimal_soil_temp": 25,
        "Kc": {"init": 1.05, "mid": 1.20, "end": 0.90},
        "stages": {
            "Germination": 100,
            "Tillering": 300,
            "Vegetative": 500,
            "Flowering": 800,
            "Grain Filling": 1100,
            "Ripening": 1400
        },
        "target_gdd": 1400,
        "critical_stages": ["Flowering"],
        "stress_thresholds": {
            "heat": 35.0,
            "cold": 15.0,
            "humidity_disease": 85.0
        },
        "base_yield_tha": 5.5
    },
    "Maize": {
        "T_base": 10.0,
        "T_opt": 25.0,
        "T_max": 35.0,
        "optimal_soil_temp": 22,
        "Kc": {"init": 0.3, "mid": 1.2, "end": 0.5},
        "stages": {
            "Germination": 80,
            "Vegetative": 350,
            "Tasseling": 600,
            "Silking": 750,
            "Grain Filling": 1000,
            "Maturity": 1300
        },
        "target_gdd": 1300,
        "critical_stages": ["Silking"],
        "stress_thresholds": {
            "heat": 32.0,
            "cold": 8.0,
            "humidity_disease": 90.0
        },
        "base_yield_tha": 8.0
    },
    "Wheat": {
        "T_base": 0.0,
        "T_opt": 21.0,
        "T_max": 30.0,
        "optimal_soil_temp": 15,
        "Kc": {"init": 0.3, "mid": 1.15, "end": 0.4},
        "stages": {
            "Germination": 50,
            "Tillering": 200,
            "Stem Extension": 450,
            "Heading": 700,
            "Flowering": 900,
            "Grain Filling": 1100,
            "Ripening": 1300
        },
        "target_gdd": 1300,
        "critical_stages": ["Flowering", "Grain Filling"],
        "stress_thresholds": {
            "heat": 25.0,
            "cold": -2.0,
            "humidity_disease": 80.0
        },
        "base_yield_tha": 4.5
    },
    "Potato": {
        "T_base": 2.0,
        "T_opt": 18.0,
        "T_max": 25.0,
        "optimal_soil_temp": 16,
        "Kc": {"init": 0.5, "mid": 1.15, "end": 0.75},
        "stages": {
            "Sprouting": 50,
            "Vegetative": 200,
            "Tuber Initiation": 400,
            "Tuber Bulking": 700,
            "Maturation": 1000
        },
        "target_gdd": 1000,
        "critical_stages": ["Tuber Initiation"],
        "stress_thresholds": {
            "heat": 28.0,
            "cold": 0.0,
            "humidity_disease": 90.0
        },
        "base_yield_tha": 25.0
    },
    "Tomato": {
        "T_base": 10.0,
        "T_opt": 22.0,
        "T_max": 35.0,
        "optimal_soil_temp": 20,
        "Kc": {"init": 0.6, "mid": 1.15, "end": 0.8},
        "stages": {
            "Germination": 80,
            "Vegetative": 250,
            "Flowering": 450,
            "Fruit Set": 650,
            "Fruiting": 900,
            "Ripening": 1100
        },
        "target_gdd": 1100,
        "critical_stages": ["Flowering", "Fruit Set"],
        "stress_thresholds": {
            "heat": 32.0,
            "cold": 10.0,
            "humidity_disease": 80.0
        },
        "base_yield_tha": 50.0
    },
    "Sugarcane": {
        "T_base": 12.0,
        "T_opt": 30.0,
        "T_max": 38.0,
        "optimal_soil_temp": 28,
        "Kc": {"init": 0.4, "mid": 1.25, "end": 0.75},
        "stages": {
            "Germination": 150,
            "Tillering": 500,
            "Grand Growth": 1500,
            "Maturation": 2500
        },
        "target_gdd": 2500,
        "critical_stages": ["Grand Growth"],
        "stress_thresholds": {
            "heat": 38.0,
            "cold": 5.0,
            "humidity_disease": 85.0
        },
        "base_yield_tha": 80.0
    },
    "Cotton": {
        "T_base": 15.6,
        "T_opt": 28.0,
        "T_max": 37.0,
        "optimal_soil_temp": 25,
        "Kc": {"init": 0.35, "mid": 1.15, "end": 0.7},
        "stages": {
            "Emergence": 100,
            "Squaring": 400,
            "Flowering": 700,
            "Boll Development": 1100,
            "Boll Opening": 1400
        },
        "target_gdd": 1400,
        "critical_stages": ["Flowering", "Boll Development"],
        "stress_thresholds": {
            "heat": 35.0,
            "cold": 10.0,
            "humidity_disease": 85.0
        },
        "base_yield_tha": 2.5
    },
    "Mungbean": {
        "T_base": 10.0,
        "T_opt": 28.0,
        "T_max": 35.0,
        "optimal_soil_temp": 24,
        "Kc": {"init": 0.4, "mid": 1.05, "end": 0.6},
        "stages": {
            "Germination": 60,
            "Vegetative": 200,
            "Flowering": 400,
            "Pod Development": 600,
            "Maturity": 800
        },
        "target_gdd": 800,
        "critical_stages": ["Flowering", "Pod Development"],
        "stress_thresholds": {
            "heat": 35.0,
            "cold": 8.0,
            "humidity_disease": 80.0
        },
        "base_yield_tha": 1.5
    }
}

# Physical Constants
STEFAN_BOLTZMANN = 4.903e-9  # MJ K-4 m-2 day-1
PSYCHROMETRIC_CONST = 0.063  # kPa/degC (approx for sea level)
LATENT_HEAT_VAPORIZATION = 2.45  # MJ/kg
SPECIFIC_HEAT_AIR = 1.013e-3  # MJ/kg/degC
