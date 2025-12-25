CROP_PROFILES = {
    "Rice": {
        "T_base": 10.0,
        "T_opt": 30.0,
        "T_max": 40.0,  # Heat stress threshold
        "Kc": {"init": 1.05, "mid": 1.20, "end": 0.90},  # Water intensive
        "stages_days": {"vegetative": 50, "flowering": 30, "ripening": 30},
        "critical_stages": ["flowering"],
        "stress_thresholds": {
            "heat": 35.0,  # Sterility risk
            "cold": 15.0,  # Stunted growth
            "humidity_disease": 85.0  # Blast warning
        }
    },
    "Maize": {
        "T_base": 10.0,
        "T_opt": 25.0,
        "T_max": 35.0,
        "Kc": {"init": 0.3, "mid": 1.2, "end": 0.5},
        "stages_days": {"vegetative": 40, "flowering": 20, "ripening": 35},
        "critical_stages": ["flowering"],
        "stress_thresholds": {
            "heat": 32.0,
            "cold": 8.0,
            "humidity_disease": 90.0
        }
    },
    "Wheat": {
        "T_base": 0.0,
        "T_opt": 21.0,
        "T_max": 30.0,
        "Kc": {"init": 0.3, "mid": 1.15, "end": 0.4},
        "stages_days": {"vegetative": 60, "flowering": 30, "ripening": 30},
        "critical_stages": ["flowering", "grain_filling"],
        "stress_thresholds": {
            "heat": 25.0,
            "cold": -2.0,
            "humidity_disease": 80.0
        }
    },
    "Potato": {
        "T_base": 2.0,
        "T_opt": 18.0,
        "T_max": 25.0,
        "Kc": {"init": 0.5, "mid": 1.15, "end": 0.75},
        "stages_days": {"vegetative": 30, "tuber_initiation": 15, "bulking": 45},
        "critical_stages": ["tuber_initiation"],
        "stress_thresholds": {
            "heat": 28.0,  # Stops tuberization
            "cold": 0.0,   # Frost damage
            "humidity_disease": 90.0 # Blight
        }
    },
    "Tomato": {
        "T_base": 10.0,
        "T_opt": 22.0,
        "T_max": 35.0,
        "Kc": {"init": 0.6, "mid": 1.15, "end": 0.8},
        "stages_days": {"vegetative": 30, "flowering": 20, "fruiting": 40},
        "critical_stages": ["flowering", "fruiting"],
        "stress_thresholds": {
            "heat": 32.0,
            "cold": 10.0,
            "humidity_disease": 80.0
        }
    }
}

# General constants
STEFAN_BOLTZMANN = 4.903e-9  # MJ K-4 m-2 day-1
PSYCHROMETRIC_CONST = 0.063  # kPa/degC (approx for sea level, will refine with elev)
