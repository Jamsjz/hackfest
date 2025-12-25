DISEASE_CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

DISEASES_INFO = {
    "Tomato___Bacterial_spot": {
        "Precautions": """
*   **स्वस्थ बीउ:** प्रमाणित र रोगमुक्त बीउ मात्र प्रयोग गर्नुहोस्।
*   **बाली चक्र (Crop Rotation):** कम्तीमा २-३ वर्षसम्म एउटै खेतमा गोलभेंडा, खुर्सानी वा आलु नलगाउनुहोस्।
*   **सिँचाइ:** फोहोरा (Sprinkler) सिँचाइ नगर्नुहोस्, यसले ब्याक्टेरिया फैलाउँछ। थोपा सिँचाइ उत्तम हुन्छ।
*   **सरसफाई:** खेतबारीका झारपात र पुराना बोटका अवशेषहरू हटाएर जलाउनुहोस्।
""",
        "Solution": """
*   **कपर अक्सिक्लोराइड (Copper Oxychloride):** २-३ ग्राम प्रति लिटर पानीमा मिसाएर छर्कनुहोस्।
*   **एन्टिबायोटिक:** कपर फन्गीसाइडसँगै स्ट्रेप्टोसाइक्लिन (Streptocycline) ०.१ ग्राम प्रति लिटर पानीमा मिसाएर १५ दिनको फरकमा छर्कनुहोस्।
*   **मानकोजेब (Mancozeb):** २.५ ग्राम प्रति लिटर पानीमा मिसाएर छर्कँदा पनि रोग नियन्त्रणमा मद्धत पुग्छ।
""",
    },
    "Tomato___Early_blight": {
        "Precautions": """
*   **थाँक्रा दिने:** बोटलाई थाँक्रा दिएर वा डोरीले बाँधेर जमिनबाट माथि उठाउनुहोस्।
*   **मल्चिङ:** माटोको ढुसी पातमा उछिट्टिएर जान नदिन प्लाष्टिक वा परालको मल्चिङ गर्नुहोस्।
*   **तल्लो पात हटाउने:** जमिन नजिकका पुराना र पहेँला पातहरू हटाउनुहोस्।
*   **रोग प्रतिरोधी जात:** 'सिर्जना' जस्ता रोग प्रतिरोधी जातहरू लगाउनुहोस्।
""",
        "Solution": """
*   **मानकोजेब (Mancozeb):** २.५ ग्राम प्रति लिटर पानीमा मिसाएर ७-१० दिनको फरकमा छर्कनुहोस्।
*   **क्लोरोथालोनिल (Chlorothalonil):** २ ग्राम प्रति लिटर पानीमा मिसाएर छर्कनुहोस्।
*   **हेक्साकोनाजोल (Hexaconazole):** लक्षण कडा देखिएमा १ मिलिलिटर प्रति लिटर पानीमा मिसाएर छर्कनुहोस्।
""",
    },
    "Tomato___Late_blight": {
        "Precautions": """
*   **मौसम अनुगमन:** चिसो र ओसिलो मौसम (बादल लागेको दिन) मा विशेष सतर्क रहनुहोस्।
*   **हावाको बहाव:** बोटहरू धेरै बाक्लो नरोप्नुहोस्, हावा राम्रोसँग खेल्न दिनुहोस्।
*   **नियनत्रित वातावरण:** टनेल खेतीमा आर्द्रता (Humidity) कम गर्न भेन्टिलेसन खुल्ला राख्नुहोस्।
""",
        "Solution": """
*   **क्रिलाक्सिल (Metalaxyl + Mancozeb):** १.५ देखि २ ग्राम प्रति लिटर पानीमा मिसाएर रोग देखिने बित्तिकै छर्कनुहोस्।
*   **सेक्टिन (Fenamidone + Mancozeb):** २ ग्राम प्रति लिटर पानीमा मिसाएर छर्कनुहोस्।
*   **साफ (Carbendazim + Mancozeb):** २ ग्राम प्रति लिटर पानीमा मिसाएर हप्ताको एक पटक छर्कनुहोस्।
""",
    },
    "Tomato___Leaf_Mold": {
        "Precautions": """
*   **भेन्टिलेसन:** पोलिहाउस वा टनेलमा हावाको राम्रो बहाव (Air circulation) कायम राख्नुहोस्।
*   **सिँचाइ समय:** बेलुका सिँचाइ नगर्नुहोस्, जसले रातभर पात ओसिलो बनाउँछ।
*   **दूरी:** बोटहरू बीचको दूरी बढाउनुहोस्।
""",
        "Solution": """
*   **कपर फन्गीसाइड:** कपर अक्सिक्लोराइड २ ग्राम प्रति लिटर पानीमा मिसाएर छर्कनुहोस्।
*   **मानकोजेब:** २.५ ग्राम प्रति लिटर पानीमा मिसाएर ७-१० दिनको अन्तरालमा छर्कनुहोस्।
*   **टिल्ट (Propiconazole):** १ मिलिलिटर प्रति लिटर पानीमा मिसाएर छर्कन सकिन्छ।
""",
    },
    "Tomato___Septoria_leaf_spot": {
        "Precautions": """
*   **अवशेष व्यवस्थापन:** अघिल्लो बालीका अवशेषहरू पूर्ण रूपमा हटाउनुहोस् किनकि यसको ढुसी त्यहीँ बाँच्छ।
*   **झारपात नियन्त्रण:** खेतबारी सधैं सफा राख्नुहोस्।
*   **बाली चक्र:** १-२ वर्ष गोलभेंडा परिवारका बाली नलगाउनुहोस्।
""",
        "Solution": """
*   **क्लोरोथालोनिल (Chlorothalonil):** २ ग्राम प्रति लिटर पानीमा मिसाएर छर्कनुहोस्।
*   **कपर अक्सिक्लोराइड:** ३ ग्राम प्रति लिटर पानीमा मिसाएर छर्कनुहोस्।
*   **मानकोजेब:** २.५ ग्राम प्रति लिटर पानीमा मिसाएर प्रयोग गर्नुहोस्।
""",
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "Precautions": """
*   **नियमित जाँच:** पातको तल्लो भागमा मसिना रातो थोप्ला वा जालो लागेको छ कि छैन लेन्सले हेर्नुहोस्।
*   **चिस्यान:** माकुरा सुख्खा र तातो मौसममा बढी सक्रिय हुने भएकाले खेतमा चिस्यान कायम राख्नुहोस्।
*   **धुलो नियन्त्रण:** बाटो नजिकै खेती छ भने धुलो कम गर्न बार लगाउनुहोस्।
""",
        "Solution": """
*   **निमको तेल (Neem Oil):** ५ मिलिलिटर प्रति लिटर पानीमा मिसाएर पातको तल्लो भाग भिज्ने गरी छर्कनुहोस्।
*   **अबामेक्टिन (Abamectin):** १ मिलिलिटर प्रति ३ लिटर पानीमा मिसाएर छर्कनुहोस्।
*   **ओमाइट (Omite) वा ओबेरोन (Oberon):** १-१.५ मिलिलिटर प्रति लिटर पानीमा मिसाएर प्रयोग गर्नुहोस्।
""",
    },
    "Tomato___Target_Spot": {
        "Precautions": """
*   **पोषण:** बोटलाई सन्तुलित मलखाद दिनुहोस्, धेरै नाइट्रोजन मल प्रयोग नगर्नुहोस्।
*   **हावाको बहाव:** बाक्लो रोप्नु हुँदैन र अनावश्यक हाँगाहरू छाँट्नुहोस्।
*   **स्वस्थ बीउ:** सधैं उपचार गरिएको स्वस्थ बीउ मात्र प्रयोग गर्नुहोस्।
""",
        "Solution": """
*   **एजोक्सिस्ट्रोबिन (Azoxystrobin):** १ मिलिलिटर प्रति लिटर पानीमा मिसाएर छर्कनुहोस्।
*   **क्लोरोथालोनिल:** २ ग्राम प्रति लिटर पानीमा मिसाएर १०-१४ दिनको फरकमा प्रयोग गर्नुहोस्।
*   **मानकोजेब:** २.५ ग्राम प्रति लिटर पानीमा मिसाएर छर्कनुहोस्।
""",
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "Precautions": """
*   **सेतो झिँगा नियन्त्रण:** यो भाइरस सेतो झिँगाले सार्ने भएकोले यसको नियन्त्रण नै मुख्य उपाय हो।
*   **पहेँलो स्टिकी ट्रयाप:** खेतमा पहेंलो पासो (Yellow Sticky Trap) राखेर सेतो झिँगालाई आकर्षित गरी नष्ट गर्नुहोस्।
*   **इन्सेक्ट नेट:** ४०-५० मेसको सेतो नेट (Insect net) भित्र खेती गर्नुहोस्।
*   **रोगी बोट:** रोग लागेको बोट देख्नासाथ उखेलेर गाड्नुहोस्।
""",
        "Solution": """
*   **इमिडाक्लोप्रिड (Imidacloprid):** १ मिलिलिटर प्रति ३ लिटर पानीमा मिसाएर सेतो झिँगा नियन्त्रण गर्नुहोस्।
*   **एसिटामिप्रिड (Acetamiprid):** १ ग्राम प्रति २ लिटर पानीमा मिसाएर छर्कनुहोस्।
*   **निम तेल:** नियमित रूपमा ५ मिलिलिटर प्रति लिटर पानीमा मिसाएर छर्कनुहोस्।
*   *(नोट: भाइरसको कुनै औषधी हुँदैन, वाहक किरालाई नै मार्नुपर्छ)*
""",
    },
    "Tomato___Tomato_mosaic_virus": {
        "Precautions": """
*   **बीउ उपचार:** रोप्नु अघि बीउलाई १०% को ट्राइसोडियम फस्फेट (Trisodium Phosphate) को घोलमा १५ मिनेट डुबाएर उपचार गर्नुहोस्।
*   **सरसफाई:** सुर्तीजन्य पदार्थ (चुरोट, खैनी) सेवन गरेर हात नधोई गोलभेंडाको बोट नछुनुहोस्।
*   **दुधको प्रयोग:** बिरुवा सार्नु अघि जरालाई १०% को दूध (Skimmed milk) को घोलमा डुबाउँदा संक्रमण कम हुन्छ।
""",
        "Solution": """
*   **रोगी बोट नष्ट गर्ने:** यो रोगको कुनै रासायनिक उपचार छैन। मोजाइक (पातमा हरियो-पहेंलो धब्बा) देखिएको बोटलाई उखेलेर जलाउनुहोस्।
*   **भिरोसिल:** केही हदसम्म 'भिरोसिल' (Viro-sil) जस्ता भाइरस निरोधक प्रयोग गर्न सकिन्छ।
*   **औजार सरसफाई:** गोडमेल गर्दा प्रयोग हुने औजारहरू साबुन पानी वा ब्लिचले धुनुहोस्।
""",
    },
}


CROPS_USED = [
    "rice",
    "maize",
    "chickpea",
    "kidneybeans",
    "pigeonpeas",
    "mothbeans",
    "mungbean",
    "blackgram",
    "lentil",
    "pomegranate",
    "banana",
    "mango",
    "grapes",
    "watermelon",
    "muskmelon",
    "apple",
    "orange",
    "papaya",
    "coconut",
    "cotton",
    "jute",
    "coffee",
]

GRID_WIDTH = 4

MODEL_ALPHA = 100
MODEL_GOLDUNIT = 10
SPEED = 1400

MONTHS = [
    "Baisakh",
    "Jestha",
    "Asar",
    "Shrawan",
    "Bhadra",
    "Ashwin",
    "Kartik",
    "Mangsir",
    "Poush",
    "Magh",
    "Falgun",
    "Chaitra",
]

REGIONS = {
    "Terai": {
        "temperature": 30.0,
        "humidity": 80.0,
        "rainfall": 150.0,
        "moisture": 60.0,
        "desc": "Hot, humid plains of southern Nepal; major rice, maize, jute, sugarcane, cotton belt.",
    },
    "Hilly": {
        "temperature": 20.0,
        "humidity": 60.0,
        "rainfall": 100.0,
        "moisture": 45.0,
        "desc": "Mid‑hills with moderate climate; suitable for maize, millet, vegetables, citrus, lentil.",
    },
    "Himalayan": {
        "temperature": 5.0,
        "humidity": 40.0,
        "rainfall": 50.0,
        "moisture": 30.0,
        "desc": "High mountains; cool climate; apples, barley, potatoes, off‑season vegetables.",
    },
}

CROPS = {
    "Rice": {
        "cost": {"Terai": 150, "Hilly": 180, "Himalayan": 220},
        "days": 12,
        "harvest_gold": 220,
        "ideal": {
            "moisture": 80,
            "temperature": 24,
            "n": 80,
            "p": 48,
            "k": 40,
            "humidity": 82,
            "ph": 6,
            "rainfall": 236,
        },
    },
    "Maize": {
        "cost": {"Terai": 120, "Hilly": 140, "Himalayan": 170},
        "days": 10,
        "harvest_gold": 190,
        "ideal": {
            "moisture": 55,
            "temperature": 22,
            "n": 78,
            "p": 48,
            "k": 20,
            "humidity": 65,
            "ph": 6,
            "rainfall": 85,
        },
    },
    "Banana": {
        "cost": {"Terai": 200, "Hilly": 220, "Himalayan": 260},
        "days": 18,
        "harvest_gold": 320,
        "ideal": {
            "moisture": 70,
            "temperature": 27,
            "n": 100,
            "p": 82,
            "k": 50,
            "humidity": 80,
            "ph": 6,
            "rainfall": 105,
        },
    },
    "Mango": {
        "cost": {"Terai": 220, "Hilly": 240, "Himalayan": 280},
        "days": 18,
        "harvest_gold": 340,
        "ideal": {
            "moisture": 60,
            "temperature": 31,
            "n": 20,
            "p": 27,
            "k": 30,
            "humidity": 50,
            "ph": 6,
            "rainfall": 95,
        },
    },
    "Apple": {
        "cost": {"Terai": 260, "Hilly": 240, "Himalayan": 220},
        "days": 20,
        "harvest_gold": 360,
        "ideal": {
            "moisture": 50,
            "temperature": 23,
            "n": 21,
            "p": 134,
            "k": 200,
            "humidity": 92,
            "ph": 6,
            "rainfall": 113,
        },
    },
    "Jute": {
        "cost": {"Terai": 140, "Hilly": 170, "Himalayan": 200},
        "days": 14,
        "harvest_gold": 230,
        "ideal": {
            "moisture": 65,
            "temperature": 25,
            "n": 78,
            "p": 47,
            "k": 40,
            "humidity": 80,
            "ph": 7,
            "rainfall": 175,
        },
    },
    "Papaya": {
        "cost": {"Terai": 190, "Hilly": 210, "Himalayan": 250},
        "days": 16,
        "harvest_gold": 310,
        "ideal": {
            "moisture": 65,
            "temperature": 34,
            "n": 50,
            "p": 59,
            "k": 50,
            "humidity": 92,
            "ph": 7,
            "rainfall": 143,
        },
    },
    "Lentil": {
        "cost": {"Terai": 110, "Hilly": 120, "Himalayan": 150},
        "days": 11,
        "harvest_gold": 200,
        "ideal": {
            "moisture": 45,
            "temperature": 25,
            "n": 19,
            "p": 68,
            "k": 19,
            "humidity": 65,
            "ph": 7,
            "rainfall": 46,
        },
    },
    "Orange": {
        "cost": {"Terai": 210, "Hilly": 200, "Himalayan": 230},
        "days": 18,
        "harvest_gold": 330,
        "ideal": {
            "moisture": 55,
            "temperature": 23,
            "n": 20,
            "p": 17,
            "k": 10,
            "humidity": 92,
            "ph": 7,
            "rainfall": 110,
        },
    },
    "Cotton": {
        "cost": {"Terai": 160, "Hilly": 190, "Himalayan": 220},
        "days": 15,
        "harvest_gold": 240,
        "ideal": {
            "moisture": 55,
            "temperature": 24,
            "n": 118,
            "p": 46,
            "k": 20,
            "humidity": 80,
            "ph": 7,
            "rainfall": 80,
        },
    },
}


ACTIONS = {
    "plough": {
        "name": "Tractor Ploughing",
        "cost": {"Terai": 90, "Hilly": 110, "Himalayan": 130},
        "effect": {"moisture": -5},
        "desc": "Primary tillage using tractor or power tiller, common in Terai and accessible hills.",
        "duration": 3,
    },
    "irrigate": {
        "name": "Canal / Tube-well Irrigation",
        "cost": {"Terai": 70, "Hilly": 90, "Himalayan": 110},
        "effect": {"moisture": 20, "temperature": -1},
        "desc": "Flood or furrow irrigation from canal, river lift, or tube-well depending on region.",
        "duration": 3,
    },
    "fertilizer/chemical/nitrogen": {
        "name": "Urea (46% Nitrogen)",
        "cost": {"Terai": 60, "Hilly": 65, "Himalayan": 70},
        "effect": {"n": 30, "p": 0, "k": 0, "ph": -0.1},
        "desc": "Common nitrogen fertilizer used across Nepal to boost vegetative growth.",
        "duration": 2,
    },
    "fertilizer/chemical/phosphorus": {
        "name": "DAP (18-46-0)",
        "cost": {"Terai": 70, "Hilly": 75, "Himalayan": 80},
        "effect": {"n": 10, "p": 25, "k": 0, "ph": -0.05},
        "desc": "Diammonium phosphate, major source of phosphorus with some nitrogen.",
        "duration": 2,
    },
    "fertilizer/chemical/potassium": {
        "name": "MOP (0-0-60)",
        "cost": {"Terai": 65, "Hilly": 70, "Himalayan": 75},
        "effect": {"n": 0, "p": 0, "k": 25},
        "desc": "Muriate of potash, common potassium fertilizer for grain and fruit crops.",
        "duration": 2,
    },
    "fertilizer/organic/fym": {
        "name": "Farmyard Manure (FYM)",
        "cost": {"Terai": 50, "Hilly": 55, "Himalayan": 60},
        "effect": {"n": 5, "p": 5, "k": 5, "ph": 0.05},
        "desc": "Cattle/buffalo manure and compost, widely used in hill and mountain farms.",
        "duration": 3,
    },
    "mulch": {
        "name": "Mulching with Crop Residue",
        "cost": {"Terai": 40, "Hilly": 45, "Himalayan": 50},
        "effect": {"moisture": 10},
        "desc": "Use of rice straw, maize stover, or leaf litter to conserve soil moisture.",
        "duration": 3,
    },
    "harvest": {
        "name": "Harvest and Thresh",
        "cost": {"Terai": 100, "Hilly": 110, "Himalayan": 130},
        "effect": {},
        "desc": "Cutting, collecting, and threshing or packing produce for market.",
        "duration": 4,
    },
    "remove_crop": {
        "name": "Remove Crop",
        "cost": {"Terai": 20, "Hilly": 25, "Himalayan": 30},
        "effect": {},
        "desc": "Remove unwanted crops from the field.",
        "duration": 1,
    },
}
