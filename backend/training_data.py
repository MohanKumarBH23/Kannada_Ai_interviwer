"""
Curated interview Q&A training data used to prime Gemini prompts and question bank.
Specialized for operational & blue-collar job interviews in Karnataka (Kannada + English).
Each entry has: role, difficulty, category, question, ideal_answer_hints.
"""

# Alias mapping for intelligent role normalization (supports English and Kannada)
ROLE_ALIASES = {
    "Delivery Executive": [
        "delivery", "delivery executive", "delivery boy", "delivery partner", "courier",
        "swiggy", "zomato", "amazon delivery", "flipkart delivery", "zepto", "blinkit",
        "dunzo", "food delivery", "parcel delivery", "rider", "ಡೆಲಿವರಿ", "ಡೆಲಿವರಿ ಬಾಯ್",
        "ಡೆಲಿವರಿ ಎಕ್ಸಿಕ್ಯೂಟಿವ್", "ಕೊರಿಯರ್"
    ],
    "Driver": [
        "driver", "cab driver", "taxi driver", "auto driver", "bus driver", "truck driver",
        "chauffeur", "ambulance driver", "commercial driver", "heavy vehicle driver",
        "light vehicle driver", "uber driver", "ola driver", "ಚಾಲಕ", "ಡ್ರೈವರ್", "ಟ್ಯಾಕ್ಸಿ", "ಆಟೋ"
    ],
    "Security Guard": [
        "security", "security guard", "security officer", "security supervisor", "watchman",
        "guard", "gatekeeper", "bouncer", "ಸೆಕ್ಯುರಿಟಿ", "ಭದ್ರತಾ", "ಭದ್ರತಾ ಸಿಬ್ಬಂದಿ", "ಕಾವಲುಗಾರ"
    ],
    "Warehouse Associate": [
        "warehouse", "warehouse associate", "warehouse worker", "loader", "unloader", "packer",
        "picker", "inventory helper", "stock boy", "logistics helper", "stower", "sorter",
        "ಗೋದಾಮು", "ಲೋಡರ್", "ಪ್ಯಾಕರ್", "ದಾಸ್ತಾನು ಸಹಾಯಕ"
    ],
    "Electrician": [
        "electrician", "wireman", "electrical technician", "maintenance electrician",
        "lineman", "electrical helper", "ವಿದ್ಯುತ್", "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್", "ವೈರ್‌ಮನ್"
    ],
    "Plumber": [
        "plumber", "plumbing", "pipe fitter", "pipefitter", "sanitary worker",
        "ಪ್ಲಂಬರ್", "ನಳ ದುರಸ್ತಿ", "ಪೈಪ್ ಫಿಟ್ಟರ್"
    ],
    "Customer Support Executive": [
        "customer support", "customer care", "bpo", "telecaller", "call center",
        "voice process", "support executive", "kannada support", "telesales",
        "ಗ್ರಾಹಕ ಸೇವೆ", "ಟೆಲಿಕಾಲರ್", "ಕಾಲ್ ಸೆಂಟರ್"
    ],
    "Retail Store Assistant": [
        "retail", "retail assistant", "store assistant", "cashier", "sales associate",
        "sales boy", "sales girl", "supermarket helper", "billing cashier", "counter sales",
        "ಮಾರಾಟ ಸಹಾಯಕ", "ಕ್ಯಾಷಿಯರ್", "ಅಂಗಡಿ ಸಹಾಯಕ"
    ],
    "Housekeeping Staff": [
        "housekeeping", "cleaner", "sweeper", "office boy", "peon", "cleaning staff",
        "sanitation worker", "janitor", "ಸ್ವಚ್ಛತಾ ಸಿಬ್ಬಂದಿ", "ಹೌಸ್‌ಕೀಪಿಂಗ್", "ಕಚೇರಿ ಸಹಾಯಕ"
    ],
    "Cook": [
        "cook", "chef", "kitchen helper", "assistant cook", "catering helper", "commis",
        "roti maker", "ಅಡುಗೆ", "ಕಿಚನ್", "ಅಡುಗೆಯವರು"
    ],
    "Carpenter": [
        "carpenter", "mason", "construction worker", "wood worker", "bar bender",
        "ಬಡಗಿ", "ಮೇಸ್ತ್ರಿ", "ಗಾರೆ ಕೆಲಸಗಾರ"
    ],
    "Factory Worker": [
        "factory worker", "machine operator", "assembly worker", "manufacturing helper",
        "plant worker", "production worker", "ಕಾರ್ಖಾನೆ", "ಯಂತ್ರ ನಿರ್ವಾಹಕ", "ಅಸೆಂಬ್ಲಿ ಕಾರ್ಮಿಕ"
    ],
}


BLUE_COLLAR_TRAINING_DATA = [
    # ── 1. DELIVERY EXECUTIVE (ಡೆಲಿವರಿ ಎಕ್ಸಿಕ್ಯೂಟಿವ್) ──────────────────────────
    {
        "role": "Delivery Executive",
        "difficulty": "easy",
        "category": "Navigation & Route Planning",
        "question": "ನೀವು ಗ್ರಾಹಕರ ವಿಳಾಸವನ್ನು ಹುಡುಕಲು ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ (Google Maps) ಅಥವಾ ಜಿಪಿಎಸ್ ಅನ್ನು ಹೇಗೆ ಬಳಸುತ್ತೀರಿ? ||| How do you use Google Maps or GPS to locate customer addresses?",
        "ideal_answer_hints": [
            "Uses Google Maps to find the shortest, safest route and avoid heavy traffic jams",
            "Locates known nearby landmarks if exact building or house number is not visible",
            "Calls the customer courteously only after checking the map and landmark carefully",
            "Parks vehicle safely on the roadside before checking phone; never uses phone while riding",
        ],
    },
    {
        "role": "Delivery Executive",
        "difficulty": "easy",
        "category": "Pre-Ride Vehicle Safety",
        "question": "ಡೆಲಿವರಿ ಮಾಡುವ ಮೊದಲು ನಿಮ್ಮ ದ್ವಿಚಕ್ರ ವಾಹನದಲ್ಲಿ ಯಾವ ತಪಾಸಣೆಗಳನ್ನು ಮಾಡುತ್ತೀರಿ? ||| What pre-trip checks do you perform on your two-wheeler before starting delivery?",
        "ideal_answer_hints": [
            "Checks fuel gauge, engine oil, and correct tire air pressure",
            "Inspects front and rear brakes, headlights, turn indicators, and horn",
            "Carries valid Driving License, RC, Insurance, and wears an ISI-marked helmet",
            "Ensures delivery thermal bag is clean and secured with a rain cover",
        ],
    },
    {
        "role": "Delivery Executive",
        "difficulty": "medium",
        "category": "Cash Handling & Customer Service",
        "question": "ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ (COD) ಆರ್ಡರ್‌ನಲ್ಲಿ ಗ್ರಾಹಕರು ಹಣ ಪಾವತಿಸಲು ನಿರಾಕರಿಸಿದರೆ ಅಥವಾ ಕಡಿಮೆ ಹಣ ನೀಡಿದರೆ ನೀವು ಏನು ಮಾಡುತ್ತೀರಿ? ||| What do you do if a customer refuses to pay or pays less money on a Cash on Delivery (COD) order?",
        "ideal_answer_hints": [
            "Stays calm, polite, and respectful without getting into an argument",
            "Shows the exact billed amount in the delivery app and customer invoice",
            "Offers online UPI/QR code payment option if exact cash change is unavailable",
            "Does not hand over the parcel until payment is confirmed",
            "Contacts the rider helpline or hub supervisor immediately to report the issue",
        ],
    },
    {
        "role": "Delivery Executive",
        "difficulty": "medium",
        "category": "Damaged Package Handling",
        "question": "ಗ್ರಾಹಕರ ವಿಳಾಸಕ್ಕೆ ತಲುಪಿದಾಗ ಪಾರ್ಸೆಲ್ ಪ್ಯಾಕೇಜ್ ಹರಿದಿರುವುದು ಅಥವಾ ಒಡೆದಿರುವುದು ಕಂಡುಬಂದರೆ ಏನು ಮಾಡುತ್ತೀರಿ? ||| If you arrive at the customer address and notice the package is damaged or torn, what action will you take?",
        "ideal_answer_hints": [
            "Informs the customer immediately and honestly before completing delivery",
            "Takes clear photos of the damaged box through the partner app",
            "Follows app SOP for damaged return or cancellation and explains refund/replacement steps politely",
            "Apologizes for the inconvenience caused and brings package back to the hub safely",
        ],
    },
    {
        "role": "Delivery Executive",
        "difficulty": "hard",
        "category": "Crisis & Delay Management",
        "question": "ಭಾರೀ ಟ್ರಾಫಿಕ್ ಅಥವಾ ವಾಹನ ಪಂಕ್ಚರ್ ಆದ ಕಾರಣ ಡೆಲಿವರಿ ತಡವಾಗುವ ಸಾಧ್ಯತೆ ಇದ್ದರೆ ಅದನ್ನು ಹೇಗೆ ನಿಭಾಯಿಸುತ್ತೀರಿ? ||| How do you handle delivery delays caused by severe traffic congestion or a flat tire?",
        "ideal_answer_hints": [
            "Pulls over to a safe spot immediately to evaluate the situation",
            "Contacts customer via app call/chat to explain delay politely with realistic estimated time",
            "Alerts dispatch/support team so urgent deliveries can be reassigned if repair takes time",
            "Never indulges in rash driving, speeding, or signal jumping to recover lost time",
            "Prioritizes express or food parcels as soon as the vehicle is repaired",
        ],
    },

    # ── 2. DRIVER / COMMERCIAL DRIVER (ಚಾಲಕ / ಡ್ರೈವರ್) ─────────────────────────
    {
        "role": "Driver",
        "difficulty": "easy",
        "category": "Daily Vehicle Inspection",
        "question": "ದಿನದ ಮೊದಲ ಟ್ರಿಪ್ ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು ವಾಹನದ ಯಾವ ಪ್ರಮುಖ ಭಾಗಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತೀರಿ? ||| Which critical parts of the vehicle do you check before starting the first trip of the day?",
        "ideal_answer_hints": [
            "Checks engine oil level, coolant level, and brake fluid",
            "Inspects all four tires and spare tire (Stepney) for air pressure and wear",
            "Tests foot brake, handbrake, headlights, wiper blades, and horn",
            "Verifies availability of valid vehicle papers (DL, RC, Insurance, Emission, Fitness)",
        ],
    },
    {
        "role": "Driver",
        "difficulty": "easy",
        "category": "Traffic Rules & Road Signs",
        "question": "ರಸ್ತೆಯಲ್ಲಿ ಸಂಚರಿಸುವಾಗ ಸ್ಟಾಪ್ (STOP) ಮತ್ತು ಗಿವ್ ವೇ (GIVE WAY) ಚಿಹ್ನೆಗಳ ವ್ಯತ್ಯಾಸವೇನು? ||| What is the difference between STOP and GIVE WAY traffic signs on the road?",
        "ideal_answer_hints": [
            "STOP sign requires a full, complete halt before the line regardless of cross traffic",
            "GIVE WAY requires slowing down and yielding priority to vehicles on the main road",
            "Both are regulatory signs essential for preventing intersection accidents",
            "Must check side mirrors and blind spots before accelerating forward",
        ],
    },
    {
        "role": "Driver",
        "difficulty": "medium",
        "category": "Bad Weather & Night Driving",
        "question": "ಭಾರೀ ಮಳೆ ಅಥವಾ ಮಂಜು ಇರುವ ಸಮಯದಲ್ಲಿ ವಾಹನ ಚಾಲನೆ ಮಾಡುವಾಗ ಯಾವ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸುತ್ತೀರಿ? ||| What safety precautions do you take while driving in heavy rain or low-visibility fog?",
        "ideal_answer_hints": [
            "Reduces driving speed substantially below the normal speed limit",
            "Maintains safe following distance (at least 4-5 vehicle lengths) to brake safely on wet roads",
            "Uses low-beam headlights and defogger; avoids high-beam in fog which blinds vision",
            "Avoids harsh sudden braking or sharp steering turns to prevent skidding/hydroplaning",
            "Pulls safely off the carriageway with hazard lights on if downpour completely obstructs view",
        ],
    },
    {
        "role": "Driver",
        "difficulty": "medium",
        "category": "Passenger Courtesy & Conflict",
        "question": "ಕ್ಯಾಬ್‌ನಲ್ಲಿ ಪ್ರಯಾಣಿಕರು ಅಸಭ್ಯವಾಗಿ ವರ್ತಿಸಿದರೆ ಅಥವಾ ನಿಮ್ಮನ್ನು ಅತಿವೇಗವಾಗಿ ಚಲಿಸಲು ಒತ್ತಾಯಿಸಿದರೆ ಹೇಗೆ ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತೀರಿ? ||| If a passenger behaves rudely or pressures you to overspeed, how do you handle it?",
        "ideal_answer_hints": [
            "Remains patient, composed, and courteous without raising voice or arguing",
            "Politely explains that speeding and signal violations risk passenger life and violate law",
            "Assures the passenger that the fastest safe route is being taken",
            "Uses company emergency SOS button or alerts driver control room if passenger becomes hostile",
            "Logs the trip issue in the driver feedback portal after completing the ride safely",
        ],
    },
    {
        "role": "Driver",
        "difficulty": "hard",
        "category": "Emergency Brake Failure Protocol",
        "question": "ಚಾಲನೆ ಮಾಡುವಾಗ ಬ್ರೇಕ್ ಫೇಲ್ (Brake Failure) ಆದರೆ ಅಪಘಾತ ತಪ್ಪಿಸಲು ನೀವು ತಕ್ಷಣ ಏನು ಕ್ರಮ ಕೈಗೊಳ್ಳುತ್ತೀರಿ? ||| If your brakes fail while driving, what immediate steps will you take to prevent an accident?",
        "ideal_answer_hints": [
            "Pumps the brake pedal repeatedly to build any residual hydraulic pressure",
            "Downshifts gears rapidly (e.g. 4th -> 3rd -> 2nd -> 1st) for engine deceleration",
            "Gradually applies the handbrake notch-by-notch without locking wheels to prevent overturning",
            "Switches on hazard warning flashers and sounds continuous horn to warn surrounding road users",
            "Guides the vehicle toward an uphill road, gravel verge, or soft roadside hedge to stop",
        ],
    },

    # ── 3. SECURITY GUARD (ಭದ್ರತಾ ಸಿಬ್ಬಂದಿ) ──────────────────────────────────
    {
        "role": "Security Guard",
        "difficulty": "easy",
        "category": "Visitor Access Control",
        "question": "ಅಪಾರ್ಟ್ಮೆಂಟ್ ಅಥವಾ ಕಂಪನಿಯ ಮುಖ್ಯ ಗೇಟ್‌ನಲ್ಲಿ ಅಪರಿಚಿತ ಸಂದರ್ಶಕರು ಬಂದಾಗ ನೀವು ಅವರನ್ನು ಹೇಗೆ ಸ್ವಾಗತಿಸುತ್ತೀರಿ ಮತ್ತು ದಾಖಲಿಸುತ್ತೀರಿ? ||| How do you greet and register unknown visitors at an apartment or corporate gate?",
        "ideal_answer_hints": [
            "Greets visitor politely with respectful salute/Namaskara",
            "Asks for visitor name, mobile number, vehicle number, and purpose of visit",
            "Enters details in visitor register book or digital tablet (e.g., MyGate)",
            "Calls host resident/office to get explicit permission before allowing entry",
            "Issues visitor pass and directs visitor to designated visitor parking area",
        ],
    },
    {
        "role": "Security Guard",
        "difficulty": "easy",
        "category": "Core Duties & Discipline",
        "question": "ಭದ್ರತಾ ಸಿಬ್ಬಂದಿಯ ಮುಖ್ಯ ಕರ್ತವ್ಯಗಳು ಮತ್ತು ಜವಾಬ್ದಾರಿಗಳು ಯಾವುವು? ||| What are the core duties and responsibilities of a security guard?",
        "ideal_answer_hints": [
            "Safeguarding property, residents, staff, and assets from theft, vandalism, and trespassing",
            "Regular patrolling of boundaries, gates, basements, and fire exits",
            "Monitoring surveillance cameras (CCTV) and verifying gate passes for materials",
            "Ensuring punctuality, maintaining neat uniform and disciplined post attendance",
        ],
    },
    {
        "role": "Security Guard",
        "difficulty": "medium",
        "category": "Emergency & Fire Safety",
        "question": "ಕಟ್ಟಡದ ಒಂದು ಭಾಗದಲ್ಲಿ ಹೊಗೆ ಅಥವಾ ಬೆಂಕಿ ಕಾಣಿಸಿಕೊಂಡರೆ ನಿಮ್ಮ ತಕ್ಷಣದ ಕ್ರಮವೇನು? ||| If you notice smoke or fire in a section of the building, what is your immediate course of action?",
        "ideal_answer_hints": [
            "Activates manual fire alarm call point immediately and alerts security control room",
            "Assesses fire size; uses suitable fire extinguisher using PASS technique (Pull, Aim, Squeeze, Sweep)",
            "Calls Fire Brigade (101) and emergency services without delay if fire is growing",
            "Directs occupants down emergency fire staircases; strictly prohibits using elevators/lifts",
            "Assembles and accounts for occupants at the designated outdoor assembly point",
        ],
    },
    {
        "role": "Security Guard",
        "difficulty": "medium",
        "category": "Unauthorized Intrusion",
        "question": "ಗೇಟ್‌ನಲ್ಲಿ ವ್ಯಕ್ತಿಯೊಬ್ಬರು ಗೇಟ್ ಪಾಸ್ ಅಥವಾ ಅನುಮತಿ ಇಲ್ಲದೆ ಬಲವಂತವಾಗಿ ಪ್ರವೇಶಿಸಲು ಯತ್ನಿಸಿದರೆ ಹೇಗೆ ನಿಭಾಯಿಸುತ್ತೀರಿ? ||| How do you handle an individual attempting to force entry without a valid gate pass or permission?",
        "ideal_answer_hints": [
            "Steps in firmly and closes the security boom barrier/gate to block unauthorized entry",
            "Communicates organization entry policy calmly, firmly, and respectfully",
            "Avoids physical scuffles or abusive language while holding ground",
            "Calls for immediate guard backup and informs security supervisor over walkie-talkie",
            "Notes down person's description and vehicle number for incident reporting",
        ],
    },
    {
        "role": "Security Guard",
        "difficulty": "hard",
        "category": "Night Patrol & Vigilance",
        "question": "ರಾತ್ರಿ ಪಾಳಿಯ ಗಸ್ತು (Night Patrol) ತಿರುಗುವಾಗ ನೀವು ಗಮನಿಸುವ ಮುಖ್ಯ ಸುರಕ್ಷತಾ ಅಂಶಗಳು ಯಾವುವು? ||| What key security aspects do you check during your night patrol rounds?",
        "ideal_answer_hints": [
            "Inspects perimeter fence, compound walls, gates, and dark corners with a powerful torch",
            "Checks locks on all office doors, windows, meter rooms, and generator rooms",
            "Verifies that emergency exit pathways and stairways are free of obstructions",
            "Notes and immediately reports any suspicious persons, parked vehicles, or water/gas leaks",
            "Logs hourly patrol checkpoints using electronic guard wand or patrol logbook",
        ],
    },

    # ── 4. WAREHOUSE ASSOCIATE (ಗೋದಾಮು ಸಿಬ್ಬಂದಿ / ಲೋಡರ್ / ಪ್ಯಾಕರ್) ────────────
    {
        "role": "Warehouse Associate",
        "difficulty": "easy",
        "category": "Safe Lifting & Ergonomics",
        "question": "ಭಾರವಾದ ಬಾಕ್ಸ್‌ಗಳನ್ನು ನೆಲದಿಂದ ಎತ್ತುವಾಗ ಬೆನ್ನಿನ ನೋವು ಅಥವಾ ಗಾಯವಾಗದಂತೆ ಹೇಗೆ ಸುರಕ್ಷಿತವಾಗಿ ಎತ್ತಬೇಕು? ||| How do you safely lift heavy boxes from the floor to avoid back strain or injury?",
        "ideal_answer_hints": [
            "Bends at the knees and hips, keeping back upright and straight (squat lift)",
            "Keeps the load close to the chest/body center of gravity",
            "Lifts with leg power instead of straining lumbar/back muscles",
            "Never twists body while lifting; shifts footing instead",
            "Requests buddy help (two-person lift) or trolley for loads exceeding 20-25 kg",
        ],
    },
    {
        "role": "Warehouse Associate",
        "difficulty": "easy",
        "category": "Barcode Scanner Usage",
        "question": "ಗೋದಾಮಿನಲ್ಲಿ ಬಾರ್‌ಕೋಡ್ ಸ್ಕ್ಯಾನರ್ (Barcode Scanner) ಅಥವಾ ಹ್ಯಾಂಡ್‌ಹೆಲ್ಡ್ ಡಿವೈಸ್ (HHT) ಅನ್ನು ಹೇಗೆ ಬಳಸುತ್ತೀರಿ? ||| How do you use a barcode scanner or handheld terminal (HHT) in the warehouse?",
        "ideal_answer_hints": [
            "Scans product barcode and shelf rack barcode to verify item SKU and bin location",
            "Matches item quantity against picklist or invoice displayed on the screen",
            "Alerts inventory supervisor immediately if barcode is damaged, unreadable, or mismatched",
            "Maintains battery charge and docks scanner safely at designated charging rack after shift",
        ],
    },
    {
        "role": "Warehouse Associate",
        "difficulty": "medium",
        "category": "Inventory FIFO Principle",
        "question": "FIFO (ಫಸ್ಟ್ ಇನ್, ಫಸ್ಟ್ ಔಟ್) ಪದ್ಧತಿ ಎಂದರೇನು ಮತ್ತು ಗೋದಾಮಿನಲ್ಲಿ ಅದು ಏಕೆ ಮುಖ್ಯ? ||| What is the FIFO (First In, First Out) method and why is it important in a warehouse?",
        "ideal_answer_hints": [
            "FIFO means the oldest stock received first is picked and dispatched first",
            "Prevents products from expiring, getting outdated, or suffering packaging degradation on shelves",
            "Places newly received stock at the back and moves older stock to the front picking slot",
            "Crucial for FMCG, grocery, pharmaceuticals, and seasonal products",
        ],
    },
    {
        "role": "Warehouse Associate",
        "difficulty": "medium",
        "category": "Fragile Packaging Standards",
        "question": "ಆರ್ಡರ್ ಪ್ಯಾಕ್ ಮಾಡುವಾಗ ಗಾಜಿನ ಸಾಮಾನು ಅಥವಾ ಸೂಕ್ಷ್ಮ (Fragile) ವಸ್ತುಗಳನ್ನು ಹೇಗೆ ಪ್ಯಾಕ್ ಮಾಡುತ್ತೀರಿ? ||| How do you pack fragile items like glassware or electronics to prevent damage in transit?",
        "ideal_answer_hints": [
            "Wraps item in 2-3 layers of bubble wrap and secures with tape",
            "Fills all void spaces inside corrugated carton with air pillows or paper dunnage to eliminate movement",
            "Applies heavy-duty packing tape in H-pattern along top and bottom flaps",
            "Affixes bright 'FRAGILE - HANDLE WITH CARE' stickers on top and side panels",
        ],
    },
    {
        "role": "Warehouse Associate",
        "difficulty": "hard",
        "category": "Peak Shift Productivity",
        "question": "ದಿನದ ಶಿಫ್ಟ್‌ನಲ್ಲಿ ಹೆಚ್ಚಿನ ಸಂಖ್ಯೆಯ ಆರ್ಡರ್‌ಗಳನ್ನು ನಿಗದಿತ ಸಮಯದೊಳಗೆ ಪೂರ್ಣಗೊಳಿಸಬೇಕಾದಾಗ ನಿಮ್ಮ ಕೆಲಸವನ್ನು ಹೇಗೆ ನಿರ್ವಹಿಸುತ್ತೀರಿ? ||| How do you manage your tasks when tasked with dispatching a very high volume of orders during peak shifts?",
        "ideal_answer_hints": [
            "Organizes workstation in advance with pre-assembled boxes, tape dispensers, and bubble wrap",
            "Groups pick orders by zone/aisle to eliminate back-and-forth walking across warehouse",
            "Works steadily and safely without rushing past quality/packing inspection checks",
            "Communicates clearly with forklift drivers and pallet movers to keep dispatch lanes clear",
            "Maintains high packing accuracy so zero orders are returned due to wrong item dispatch",
        ],
    },

    # ── 5. ELECTRICIAN (ವಿದ್ಯುತ್ ತಂತ್ರಜ್ಞ) ──────────────────────────────────
    {
        "role": "Electrician",
        "difficulty": "easy",
        "category": "Wire Color Codes & Safety",
        "question": "ವೈರಿಂಗ್ ಕೆಲಸ ಮಾಡುವಾಗ ಫೇಸ್ (Phase), ನ್ಯೂಟ್ರಲ್ (Neutral) ಮತ್ತು ಅರ್ಥಿಂಗ್ (Earthing) ವೈರ್‌ಗಳ ಬಣ್ಣ ಕೋಡ್ ತಿಳಿಸಿ? ||| What are the standard color codes for Phase, Neutral, and Earthing wires in single-phase AC wiring?",
        "ideal_answer_hints": [
            "Phase/Live wire is Red (or Brown in modern Indian standard)",
            "Neutral wire is Black (or Blue in modern standard)",
            "Earth wire is always Green or Green with Yellow stripe",
            "Always verifies voltage with a phase tester screwdriver or multimeter before touching any wire",
        ],
    },
    {
        "role": "Electrician",
        "difficulty": "easy",
        "category": "Earthing & Shock Protection",
        "question": "ಮನೆಯಲ್ಲಿ ಅರ್ಥಿಂಗ್ (Earthing) ಏಕೆ ಅತಿ ಮುಖ್ಯ? ಅರ್ಥಿಂಗ್ ಇಲ್ಲದಿದ್ದರೆ ಏನಾಗುತ್ತದೆ? ||| Why is proper Earthing crucial in electrical installations? What happens without it?",
        "ideal_answer_hints": [
            "Earthing provides a low-resistance direct path for leakage fault current into the ground",
            "Protects humans from fatal electrocution when touching metallic bodies of faulty appliances",
            "Ensures MCB/RCCB trips instantly when an internal insulation breakdown occurs",
            "Protects sensitive electrical equipment from voltage spikes and lightning surges",
        ],
    },
    {
        "role": "Electrician",
        "difficulty": "medium",
        "category": "Circuit Breakers & Protection",
        "question": "ಶಾರ್ಟ್ ಸರ್ಕ್ಯೂಟ್ (Short Circuit) ಮತ್ತು ಓವರ್‌ಲೋಡ್ (Overload) ನಡುವಿನ ವ್ಯತ್ಯಾಸವೇನು? ಇವುಗಳನ್ನು MCB ಹೇಗೆ ತಡೆಯುತ್ತದೆ? ||| What is the difference between a Short Circuit and an Overload? How does an MCB protect against them?",
        "ideal_answer_hints": [
            "Short circuit occurs when live and neutral make direct contact, causing instantaneous massive current surge",
            "Overload happens when connected appliances draw more current than wire rating continuously over time",
            "MCB uses electromagnetic solenoid coil for instantaneous trip during short circuits",
            "MCB uses bimetallic thermal strip for delayed thermal trip during sustained overload",
        ],
    },
    {
        "role": "Electrician",
        "difficulty": "medium",
        "category": "Multimeter Diagnostics",
        "question": "ಮಲ್ಟಿಮೀಟರ್ (Multimeter) ಬಳಸಿ ಎಸಿ ವೋಲ್ಟೇಜ್ (AC Voltage) ಮತ್ತು ಕಂಟಿನ್ಯೂಯಿಟಿ (Continuity) ಅನ್ನು ಹೇಗೆ ಪರೀಕ್ಷಿಸುತ್ತೀರಿ? ||| How do you test AC voltage and continuity using a digital multimeter?",
        "ideal_answer_hints": [
            "For AC Voltage: sets knob to AC 750V/600V~, inserts black lead in COM and red lead in V/Ω",
            "Places probes in socket terminals; verifies single phase reading is approximately 220V - 240V at 50Hz",
            "For Continuity: turns power breaker OFF, sets dial to buzzer/diode icon",
            "Touches probes to wire ends; buzzer beep confirms intact wire, silence indicates broken wire",
        ],
    },
    {
        "role": "Electrician",
        "difficulty": "hard",
        "category": "Live Panel Safety & LOTO",
        "question": "ಲೈವ್ ಎಲೆಕ್ಟ್ರಿಕ್ ಪ್ಯಾನಲ್‌ನಲ್ಲಿ ಕೆಲಸ ಮಾಡುವಾಗ ನೀವು ತೆಗೆದುಕೊಳ್ಳುವ ಕಡ್ಡಾಯ ಸುರಕ್ಷತಾ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು ಯಾವುವು? ||| What mandatory safety precautions do you follow when working near a live electrical distribution panel?",
        "ideal_answer_hints": [
            "Applies Lockout/Tagout (LOTO) and shuts off incoming main isolator wherever possible",
            "Wears certified 1000V dielectric rubber insulating gloves and electrical safety boots with rubber soles",
            "Uses exclusively VDE/insulated hand tools (screwdrivers, pliers) rated for 1000V AC",
            "Stands on an insulated rubber safety mat; follows one-hand rule to avoid hand-to-hand current path",
            "Never works in damp conditions, with wet hands, or wearing metallic rings/bracelets",
        ],
    },

    # ── 6. PLUMBER (ಪ್ಲಂಬರ್ / ನಳ ದುರಸ್ತಿಗಾರ) ───────────────────────────────
    {
        "role": "Plumber",
        "difficulty": "easy",
        "category": "Piping Materials & Heat Resistance",
        "question": "PVC, CPVC ಮತ್ತು GI ಪೈಪ್‌ಗಳ ನಡುವಿನ ವ್ಯತ್ಯಾಸವೇನು? ಬಿಸಿ ನೀರಿಗೆ ಯಾವ ಪೈಪ್ ಬಳಸಬೇಕು? ||| What is the difference between PVC, CPVC, and GI pipes? Which is used for hot water lines?",
        "ideal_answer_hints": [
            "PVC is used for cold water supply and drainage; cannot handle hot water",
            "CPVC (Chlorinated PVC) withstands temperatures up to 93°C; standard for hot water geyser lines",
            "GI (Galvanized Iron) is rigid metal piping, durable but prone to corrosion and heavy scaling",
            "Uses CPVC solvent cement for CPVC joints and Teflon tape on threaded fittings",
        ],
    },
    {
        "role": "Plumber",
        "difficulty": "easy",
        "category": "Thread Seal Tape Application",
        "question": "ಪೈಪ್ ಜಾಯಿಂಟ್‌ಗಳಲ್ಲಿ ನೀರಿನ ಸೋರಿಕೆ (Water Leakage) ತಡೆಯಲು ಟೆಫ್ಲಾನ್ ಟೇಪ್ (Teflon Tape) ಅನ್ನು ಹೇಗೆ ಸುತ್ತಿದ್ದೀರಿ? ||| How do you properly apply Teflon (PTFE) thread seal tape to prevent joint leakage?",
        "ideal_answer_hints": [
            "Cleans male threads of all dirt, dust, and old pipe dope",
            "Wraps tape clockwise in the thread tightening direction so it stays flat when screwed in",
            "Applies 4 to 6 snug wraps keeping tension without covering the initial thread opening",
            "Tightens fitting with pipe wrench firmly without over-torquing which cracks fittings",
        ],
    },
    {
        "role": "Plumber",
        "difficulty": "medium",
        "category": "Drain Blockage Clearance",
        "question": "ಸಿಂಕ್ ಅಥವಾ ಬಾತ್‌ರೂಮ್ ಡ್ರೈನ್‌ನಲ್ಲಿ ನೀರು ಸರಾಗವಾಗಿ ಹರಿಯದೆ ಕಟ್ಟಿಕೊಂಡಾಗ (Blockage) ಅದನ್ನು ಹೇಗೆ ತೆರವುಗೊಳಿಸುತ್ತೀರಿ? ||| How do you clear a clogged sink or bathroom drain that is overflowing?",
        "ideal_answer_hints": [
            "Starts with a rubber suction plunger to clear superficial blockages with water pressure",
            "Places a bucket underneath and unscrews the bottle trap / P-trap beneath the sink to remove debris",
            "Feeds a flexible plumbing auger/snake wire into drain line to hook out stubborn hair/grease clogs",
            "Flushes line with hot water and baking soda/vinegar or drain cleaner to dissolve fats",
            "Replaces rubber washer gaskets and tests with full tap flow to confirm leak-free drainage",
        ],
    },
    {
        "role": "Plumber",
        "difficulty": "medium",
        "category": "Water Pressure & Airlock",
        "question": "ಓವರ್‌ಹೆಡ್ ವಾಟರ್ ಟ್ಯಾಂಕ್‌ನಿಂದ ಕೆಳಗಿನ ನಲ್ಲಿಗಳಲ್ಲಿ ನೀರಿನ ಪ್ರೆಷರ್ (Water Pressure) ತುಂಬಾ ಕಡಿಮೆಯಿದ್ದರೆ ಕಾರಣವೇನು ಮತ್ತು ಹೇಗೆ ಸರಿಪಡಿಸುತ್ತೀರಿ? ||| If water pressure is very low in taps from an overhead tank, what are the causes and solutions?",
        "ideal_answer_hints": [
            "Checks for an airlock trapped in the pipeline; releases air by opening the lowest tap fully",
            "Inspects and cleans sediment/calcium buildup from tap aerator nozzles and angle valves",
            "Ensures the main overhead gate valve / ball valve is fully open and unobstructed",
            "Checks vertical height difference between tank base and tap outlet; installs pressure booster pump if head is insufficient",
        ],
    },
    {
        "role": "Plumber",
        "difficulty": "hard",
        "category": "Concealed Seepage Diagnosis",
        "question": "ಗೋಡೆಯೊಳಗೆ (Concealed Pipeline) ಅಡಗಿರುವ ಪೈಪ್‌ನಲ್ಲಿ ಸೋರಿಕೆಯಾದರೆ (Seepage) ಅದನ್ನು ಗೋಡೆ ಒಡೆಯದೆ ಹೇಗೆ ಪತ್ತೆ ಹಚ್ಚುತ್ತೀರಿ? ||| If there is concealed pipe leakage inside a finished wall, how do you pinpoint the location before breaking tiles?",
        "ideal_answer_hints": [
            "Uses pressure testing pump on isolated pipe sections to identify whether hot, cold, or drain line has pressure drop",
            "Uses moisture meters, acoustic listening devices, or thermal camera to trace cold water path behind tiles",
            "Closes stop cocks one by one to isolate the exact bathroom zone leaking",
            "Marks minimal tile area for precise cut using grinder instead of breaking large wall surface",
            "Replaces damaged pipe segment with genuine coupler and conducts pressure hold test for 30 minutes before plastering",
        ],
    },

    # ── 7. CUSTOMER SUPPORT EXECUTIVE - KANNADA (ಗ್ರಾಹಕ ಸೇವಾ ಪ್ರತಿನಿಧಿ) ────────
    {
        "role": "Customer Support Executive",
        "difficulty": "easy",
        "category": "Call Greeting & Verification",
        "question": "ಗ್ರಾಹಕರು ಕರೆ ಮಾಡಿದಾಗ ಮೊದಲ 10 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ನೀವು ಅವರನ್ನು ಹೇಗೆ ವೃತ್ತಿಪರವಾಗಿ ಸ್ವಾಗತಿಸುತ್ತೀರಿ? ||| How do you professionally greet a customer in the first 10 seconds of a phone call?",
        "ideal_answer_hints": [
            "Greets with warm, polite Kannada: 'ನಮಸ್ಕಾರ, [ಕಂಪನಿ ಹೆಸರು] ಗೆ ಸ್ವಾಗತ. ನನ್ನ ಹೆಸರು [ನಿಮ್ಮ ಹೆಸರು]. ನಿಮಗೆ ನಾನು ಇಂದು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?'",
            "Maintains pleasant, clear tone, confident pace, and smiling voice",
            "Asks for customer name and account/order number respectfully",
            "Demonstrates willingness and readiness to solve their issue promptly",
        ],
    },
    {
        "role": "Customer Support Executive",
        "difficulty": "easy",
        "category": "Active Listening Skills",
        "question": "ಗ್ರಾಹಕರ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಮತ್ತು ಸಮಸ್ಯೆ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಆಕ್ಟಿವ್ ಲಿಸನಿಂಗ್ (Active Listening) ಅನ್ನು ಹೇಗೆ ಬಳಸುತ್ತೀರಿ? ||| How do you use active listening to understand the customer's issue accurately?",
        "ideal_answer_hints": [
            "Listens patiently without interrupting while customer is describing their concern",
            "Jots down critical details like Order ID, transaction date, and complaint details",
            "Paraphrases back to confirm: 'ನಾನು ಸರಿಯಾಗಿ ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದರೆ, ನಿಮ್ಮ ಸಮಸ್ಯೆ ಇದು... ಸರಿನಾ ಸರ್?'",
            "Uses short affirmative verbal nods like 'ಖಂಡಿತ', 'ಸರಿ', 'ಗಮನಿಸುತ್ತಿದ್ದೇನೆ' to show engagement",
        ],
    },
    {
        "role": "Customer Support Executive",
        "difficulty": "medium",
        "category": "Angry Customer De-escalation",
        "question": "ಆರ್ಡರ್ ತಡವಾಗಿ ಕೋಪಗೊಂಡಿರುವ ಗ್ರಾಹಕರನ್ನು ಸಮಾಧಾನಪಡಿಸಲು ನೀವು ಯಾವ ಹಂತಗಳನ್ನು ಅನುಸರಿಸುತ್ತೀರಿ? ||| What steps do you follow to calm down an angry customer whose order is delayed?",
        "ideal_answer_hints": [
            "Expresses genuine empathy: 'ನಿಮಗಾದ ತೊಂದರೆಗೆ ಕ್ಷಮೆಯಿರಲಿ. ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿ ನನಗೆ ಸಂಪೂರ್ಣ ಅರ್ಥವಾಗುತ್ತದೆ.'",
            "Never argues, interrupts, or takes angry words personally; keeps voice steady and respectful",
            "Pulls up real-time tracking notes on system to identify exact reason for delay",
            "Provides a clear, honest turnaround time and offers priority dispatch or compensation coupon",
            "Assures customer with personal ticket ownership until issue is resolved",
        ],
    },
    {
        "role": "Customer Support Executive",
        "difficulty": "medium",
        "category": "Call Hold & Escalation Protocol",
        "question": "ಗ್ರಾಹಕರ ಪ್ರಶ್ನೆಗೆ ನಿಮ್ಮ ಬಳಿ ತಕ್ಷಣ ಉತ್ತರ ಇಲ್ಲದಿದ್ದರೆ ನೀವು ಅವರಿಗೆ ಏನು ಹೇಳುತ್ತೀರಿ? ||| What do you say to a customer when you do not know the answer to their query immediately?",
        "ideal_answer_hints": [
            "Never gives guesswork or false assurances to customer",
            "Politely requests hold permission: 'ದಯವಿಟ್ಟು ಒಂದು ನಿಮಿಷ ಹೋಲ್ಡ್‌ನಲ್ಲಿರಲು ಸಾಧ್ಯವೇ, ನಾನು ಈ ವಿವರವನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳುತ್ತೇನೆ.'",
            "Consults knowledge base or supervisor within acceptable hold threshold (60-90 seconds)",
            "Returns promptly, thanks customer for patience, and gives accurate resolution steps",
        ],
    },
    {
        "role": "Customer Support Executive",
        "difficulty": "hard",
        "category": "Policy Boundary & Explaining No",
        "question": "ಕಂಪನಿಯ ನಿಯಮಗಳ ಪ್ರಕಾರ ಗ್ರಾಹಕರು ಕೇಳುತ್ತಿರುವ ರಿಫಂಡ್ (Refund) ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲದಿದ್ದಾಗ ಅವರಿಗೆ ಹೇಗೆ ಮನವರಿಕೆ ಮಾಡುತ್ತೀರಿ? ||| When company policy does not allow the refund requested by a customer, how do you explain it firmly and politely?",
        "ideal_answer_hints": [
            "Demonstrates empathy before explaining policy limits",
            "Explains the policy rationale simply without robotic or condescending language",
            "Presents available alternative options (e.g., product replacement, store credit, discount)",
            "Listens patiently to feedback without yielding on fraud/compliance rules",
            "Escalates to senior team lead if customer insists on official dispute resolution",
        ],
    },

    # ── 8. RETAIL STORE ASSISTANT / CASHIER (ಮಾರಾಟ ಸಹಾಯಕ / ಕ್ಯಾಷಿಯರ್) ─────────
    {
        "role": "Retail Store Assistant",
        "difficulty": "easy",
        "category": "Merchandising & Shelf Facing",
        "question": "ಸೂಪರ್‌ಮಾರ್ಕೆಟ್‌ನಲ್ಲಿ ವಸ್ತುಗಳನ್ನು ಶೆಲ್ಫ್‌ಗಳಲ್ಲಿ ಜೋಡಿಸುವಾಗ ಯಾವ ನಿಯಮಗಳನ್ನು ಪಾಲಿಸುತ್ತೀರಿ? ||| What rules do you follow when stacking and organizing products on retail shelves?",
        "ideal_answer_hints": [
            "Faces product packaging forward so brand labels and barcodes face customer eyes",
            "Stacks older stock in front and freshly arrived stock behind (FIFO)",
            "Verifies price shelf talkers match barcode numbers accurately",
            "Keeps gangways and aisles completely clear of empty cartons and hazards",
        ],
    },
    {
        "role": "Retail Store Assistant",
        "difficulty": "easy",
        "category": "POS Cash & UPI Verification",
        "question": "ಕ್ಯಾಶ್ ಕೌಂಟರ್‌ನಲ್ಲಿ ಯುಪಿಐ (UPI) ಮತ್ತು ಕಾರ್ಡ್ ಪಾವತಿಗಳನ್ನು ಹೇಗೆ ಪರಿಶೀಲಿಸುತ್ತೀರಿ? ||| How do you verify UPI and credit/debit card payments at the cash billing counter?",
        "ideal_answer_hints": [
            "Waits for payment green tick screen and voice soundbox confirmation before handing items",
            "Verifies total transaction amount on POS terminal matches customer bill exactly",
            "Counts cash change openly in front of customer before handing currency notes",
            "Gives printed invoice bill and closes with polite greeting: 'ಧನ್ಯವಾದಗಳು, ಮತ್ತೆ ಬನ್ನಿ!'",
        ],
    },
    {
        "role": "Retail Store Assistant",
        "difficulty": "medium",
        "category": "Exchange Without Receipt",
        "question": "ಗ್ರಾಹಕರು ಬಿಲ್ ಇಲ್ಲದೆ ಸರಕುಗಳನ್ನು ಬದಲಾಯಿಸಲು (Exchange) ಅಥವಾ ಹಣ ವಾಪಸ್ ಕೇಳಿದರೆ ನೀವು ಹೇಗೆ ವ್ಯವಹರಿಸುತ್ತೀರಿ? ||| How do you handle a customer requesting an item exchange or refund without a purchase receipt?",
        "ideal_answer_hints": [
            "Welcomes customer politely and listens to their issue with the product",
            "Explains store return policy gently regarding receipt requirement for inventory control",
            "Offers to search transaction in billing POS using customer phone number or purchase date",
            "Calls floor supervisor for authorization if customer purchase is genuine and tags are intact",
        ],
    },
    {
        "role": "Retail Store Assistant",
        "difficulty": "medium",
        "category": "Shoplifting & Loss Prevention",
        "question": "ಅಂಗಡಿಯಲ್ಲಿ ಕಳ್ಳತನ (Shoplifting) ಅಥವಾ ವಸ್ತುಗಳನ್ನು ಬ್ಯಾಗ್‌ನಲ್ಲಿ ಅಡಗಿಸಿಟ್ಟುಕೊಳ್ಳುವುದನ್ನು ಗಮನಿಸಿದರೆ ನಿಮ್ಮ ಕ್ರಮವೇನು? ||| If you notice a customer concealing merchandise or shoplifting, what should you do?",
        "ideal_answer_hints": [
            "Stays calm and avoids loud public accusations or physical grabbing",
            "Approaches customer offering helpful service: 'ಸರ್, ನಿಮಗೆ ಈ ವಸ್ತು ಆಯ್ಕೆ ಮಾಡಲು ಸಹಾಯ ಬೇಕೇ?'",
            "Discreetly informs floor manager and security staff with description and aisle location",
            "Allows trained security guard to verify billing receipt at exit door detector",
        ],
    },
    {
        "role": "Retail Store Assistant",
        "difficulty": "hard",
        "category": "Billing Rush & Queue Management",
        "question": "ವಾರಾಂತ್ಯದಲ್ಲಿ (Weekend Rush) ಬಿಲ್ಲಿಂಗ್ ಕೌಂಟರ್‌ನಲ್ಲಿ ಉದ್ದನೆಯ ಸರತಿ ಸಾಲು (Queue) ಇದ್ದಾಗ ಬಿಲ್ಲಿಂಗ್ ವೇಗ ಮತ್ತು ನಿಖರತೆಯನ್ನು ಹೇಗೆ ಕಾಪಾಡಿಕೊಳ್ಳುತ್ತೀರಿ? ||| How do you balance billing speed and cash accuracy during peak weekend checkout rushes?",
        "ideal_answer_hints": [
            "Scans products with two-hand coordination: scan with right, bag with left",
            "Calls supervisor to open spare cash registers when queue reaches more than 4 customers",
            "Encourages contactless UPI/tap cards for faster queue throughput",
            "Never rushes counting physical cash notes; maintains 100% drawer tally accuracy",
            "Greets each customer warmly even during heavy peak rush hours",
        ],
    },

    # ── 9. HOUSEKEEPING STAFF / CLEANER (ಸ್ವಚ್ಛತಾ ಸಿಬ್ಬಂದಿ) ───────────────────
    {
        "role": "Housekeeping Staff",
        "difficulty": "easy",
        "category": "Waste Segregation Guidelines",
        "question": "ಕಚೇರಿ ಅಥವಾ ಮಾಲ್‌ನಲ್ಲಿ ಹಸಿ ಕಸ (Wet Waste) ಮತ್ತು ಒಣ ಕಸ (Dry Waste) ವಿಂಗಡಣೆ ಏಕೆ ಮುಖ್ಯ ಮತ್ತು ಹೇಗೆ ಮಾಡುತ್ತೀರಿ? ||| Why is wet and dry waste segregation important in housekeeping and how do you separate it?",
        "ideal_answer_hints": [
            "Green bin is dedicated for wet/organic kitchen waste and leftover food",
            "Blue bin is dedicated for dry recyclable waste like paper, plastic wrappers, cardboard, and cans",
            "Red bin is for hazardous waste like broken glass, blades, and sanitary pads",
            "Prevents foul stench, pests, disease spread, and enables safe municipal recycling",
        ],
    },
    {
        "role": "Housekeeping Staff",
        "difficulty": "easy",
        "category": "Floor Mopping & Slip Prevention",
        "question": "ಮಾರ್ಬಲ್ ಅಥವಾ ಟೈಲ್ಸ್ ನೆಲ ಒರೆಸುವಾಗ (Mopping) ಜಾರಿ ಬೀಳದಂತೆ ಯಾವ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸುತ್ತೀರಿ? ||| What precautions do you take while wet mopping floors to prevent people from slipping and falling?",
        "ideal_answer_hints": [
            "Places bright yellow 'CAUTION - WET FLOOR' warning signs at both ends of walkway",
            "Mops one half of the corridor first so pedestrians can walk safely on dry half",
            "Wrings out mop head thoroughly in bucket wringer so floor is damp rather than soaking wet",
            "Uses recommended dilution of cleaning chemical to avoid leaving slippery soapy residue",
        ],
    },
    {
        "role": "Housekeeping Staff",
        "difficulty": "medium",
        "category": "Restroom Sanitization Protocol",
        "question": "ಶೌಚಾಲಯ (Restroom) ಸ್ವಚ್ಛಗೊಳಿಸುವಾಗ ಯಾವ ನೈರ್ಮಲ್ಯ ಪ್ರೋಟೋಕಾಲ್ ಮತ್ತು ರಕ್ಷಣಾತ್ಮಕ ಸಾಧನಗಳನ್ನು ಬಳಸುತ್ತೀರಿ? ||| What hygiene protocol and PPE do you use when deep cleaning restrooms?",
        "ideal_answer_hints": [
            "Wears protective rubber gloves, mask, waterproof apron, and anti-slip rubber gumboots",
            "Uses designated color-coded microfiber cloths (red cloth strictly for commode)",
            "Applies disinfectant toilet cleaner inside bowl and under rim; leaves for 10 minutes before brushing",
            "Wipes and sanitizes high-touch touchpoints: taps, door latches, flush buttons, and soap dispensers",
            "Restocks hand wash, paper towels, tissue rolls, and checks exhaust fan functionality",
        ],
    },
    {
        "role": "Housekeeping Staff",
        "difficulty": "medium",
        "category": "Office Desk & Document Care",
        "question": "ಕಚೇರಿಯ ಮೇಜಿನ ಮೇಲಿರುವ ಕಂಪ್ಯೂಟರ್, ಕೀಬೋರ್ಡ್ ಮತ್ತು ಮುಖ್ಯ ಕಾಗದಪತ್ರಗಳ ಸುತ್ತ ಹೇಗೆ ಸ್ವಚ್ಛತೆ ಮಾಡುತ್ತೀರಿ? ||| How do you clean around office workstations with computers and confidential documents?",
        "ideal_answer_hints": [
            "Never sprays liquid cleaner directly on electronics; mists lightly on microfiber cloth",
            "Uses dry soft brush or lint-free cloth for keyboards and display monitors",
            "Never moves, reads, or discards papers, files, or notes on employee desks",
            "Inspects for and reports any loose wiring or sparking plugs immediately to maintenance",
        ],
    },
    {
        "role": "Housekeeping Staff",
        "difficulty": "hard",
        "category": "Spill Management & Chemical Hazard",
        "question": "ಕಟ್ಟಡದಲ್ಲಿ ನೀರು ಸೋರಿಕೆ ಅಥವಾ ರಾಸಾಯನಿಕ ಚೆಲ್ಲಿಕೊಂಡರೆ (Chemical Spill) ತಕ್ಷಣ ಹೇಗೆ ಸ್ಪಂದಿಸುತ್ತೀರಿ? ||| If there is a sudden pipe burst or chemical spill in a common area, how do you respond immediately?",
        "ideal_answer_hints": [
            "Immediately blocks off spill zone with warning cones and barriers to prevent foot traffic",
            "Locates and shuts off main water control valve if pipe burst is source",
            "Checks chemical label and follows MSDS (Material Safety Data Sheet) safety protocol",
            "Wears heavy chemical-resistant gloves; uses sawdust or absorbent pads to soak up liquid safely",
            "Disposes of soaked waste in hazardous bin and alerts housekeeping supervisor",
        ],
    },

    # ── 10. COOK / KITCHEN HELPER (ಅಡುಗೆಯವರು / ಕಿಚನ್ ಹೆಲ್ಪರ್) ──────────────────
    {
        "role": "Cook",
        "difficulty": "easy",
        "category": "Kitchen Personal Hygiene",
        "question": "ಅಡುಗೆಮನೆಯಲ್ಲಿ ಆಹಾರ ತಯಾರಿಸುವ ಮೊದಲು ನೀವು ಪಾಲಿಸುವ ವೈಯಕ್ತಿಕ ನೈರ್ಮಲ್ಯ (Personal Hygiene) ನಿಯಮಗಳು ಯಾವುವು? ||| What personal hygiene standards do you maintain before starting food preparation in a commercial kitchen?",
        "ideal_answer_hints": [
            "Washes hands with soap and hot water for 20 seconds before touching food ingredients",
            "Wears clean chef apron, hairnet/chef cap, and keeps fingernails short and clean",
            "Removes wristwatches, rings, and hand jewelry that harbor bacteria",
            "Never coughs, sneezes, or smokes near cooking stations or prep counters",
        ],
    },
    {
        "role": "Cook",
        "difficulty": "easy",
        "category": "Cross-Contamination Prevention",
        "question": "ತರಕಾರಿ ಮತ್ತು ಹಸಿ ಮಾಂಸವನ್ನು ಕತ್ತರಿಸುವಾಗ ಕ್ರಾಸ್-ಕಂಟಾಮಿನೇಷನ್ (Cross-Contamination) ತಡೆಯಲು ಏನು ಮಾಡುತ್ತೀರಿ? ||| How do you prevent cross-contamination between raw meats and fresh vegetables?",
        "ideal_answer_hints": [
            "Uses separate color-coded cutting boards: green for vegetables, red for raw meat",
            "Uses dedicated knives for raw meat and separate knives for cooked food and salads",
            "Washes and sanitizes cutting boards and counters with hot soapy water after each use",
            "Stores raw meat on bottom refrigerator shelves so juices never drip onto vegetables",
        ],
    },
    {
        "role": "Cook",
        "difficulty": "medium",
        "category": "Peak Rush Meal Prep",
        "question": "ರೆಸ್ಟೋರೆಂಟ್‌ನಲ್ಲಿ ಮಧ್ಯಾಹ್ನದ ಊಟದ ಸಮಯದಲ್ಲಿ (Lunch Rush) ತ್ವರಿತವಾಗಿ ಮತ್ತು ರುಚಿಕರವಾಗಿ ಆರ್ಡರ್ ತಯಾರಿಸಲು ಹೇಗೆ ತಯಾರಿ ನಡೆಸುತ್ತೀರಿ? ||| How do you organize prep work (Mise en place) to manage rapid cooking during lunch rush hours?",
        "ideal_answer_hints": [
            "Preps all base gravies, chopped onions, ginger-garlic paste, and boiled vegetables ahead of service",
            "Keeps cooking oils, spices, ladles, and pans clean and arranged in easy reach",
            "Follows standardized recipes and measured portion control to maintain uniform taste",
            "Communicates calmly and efficiently with kitchen teammates and order captains",
        ],
    },
    {
        "role": "Cook",
        "difficulty": "medium",
        "category": "LPG Gas Safety & Leak Protocol",
        "question": "ಅಡುಗೆಮನೆಯ ಗ್ಯಾಸ್ ಸಿಲಿಂಡರ್ ಅಥವಾ ಬರ್ನರ್‌ನಲ್ಲಿ ಗ್ಯಾಸ್ ವಾಸನೆ (LPG Leak) ಬಂದರೆ ನಿಮ್ಮ ತಕ್ಷಣದ ಕ್ರಮವೇನು? ||| If you smell an LPG gas leak in the kitchen, what is your immediate safety protocol?",
        "ideal_answer_hints": [
            "Immediately turns off the main cylinder regulator valve and stove burner knobs",
            "Opens all windows, doors, and exhaust shutters to ventilate the gas",
            "Strictly avoids striking matches or turning electrical switches ON or OFF (sparks ignite gas)",
            "Evacuates kitchen staff to open air area safely",
            "Informs hotel manager and calls commercial gas distributor emergency line",
        ],
    },
    {
        "role": "Cook",
        "difficulty": "hard",
        "category": "Commercial Food Storage & Dates",
        "question": "ಫ್ರಿಡ್ಜ್ ಅಥವಾ ಡೀಪ್ ಫ್ರೀಜರ್‌ನಲ್ಲಿ ಆಹಾರ ವಸ್ತುಗಳನ್ನು ದೀರ್ಘಕಾಲ ತಾಜಾವಾಗಿಡಲು ತಾಪಮಾನ ನಿಯಮಗಳು ಮತ್ತು ದಿನಾಂಕ ಲೇಬಲಿಂಗ್ ಹೇಗೆ ಮಾಡುತ್ತೀರಿ? ||| How do you store food in commercial chillers/freezers with proper temperature and date labeling?",
        "ideal_answer_hints": [
            "Maintains chiller temperature below 4°C and deep freezer at -18°C or colder",
            "Labels every prepped container with preparation date, item name, and expiry date",
            "Follows FIFO (First In, First Out) principle strictly to consume older batches first",
            "Cools hot cooked batches before refrigeration so chiller ambient temperature does not rise",
            "Discards any food item showing signs of spoilage, sour smell, or mold immediately",
        ],
    },

    # ── 11. CARPENTER / MASON (ಬಡಗಿ / ಮೇಸ್ತ್ರಿ) ──────────────────────────────
    {
        "role": "Carpenter",
        "difficulty": "easy",
        "category": "Measurements & Try Square",
        "question": "ಮರದ ಕೆಲಸ ಮಾಡುವಾಗ ಅಳತೆ ಟೇಪ್ (Measuring Tape) ಮತ್ತು ರೈಟ್ ಆಂಗಲ್ (Try Square) ಅನ್ನು ಹೇಗೆ ನಿಖರವಾಗಿ ಬಳಸುತ್ತೀರಿ? ||| How do you accurately use a measuring tape and try square for wood joinery?",
        "ideal_answer_hints": [
            "Reads metric (mm, cm) and imperial (inches) tape increments accurately",
            "Uses Try Square to verify true 90-degree right angles on timber edges before cutting",
            "Marks cutting lines with sharp pencil taking saw blade kerf thickness into account",
            "Follows standard rule: 'Measure twice, cut once' to eliminate wood wastage",
        ],
    },
    {
        "role": "Carpenter",
        "difficulty": "easy",
        "category": "Wood & Board Types",
        "question": "ಟೀಕ್ ವುಡ್ (Teak), ಪ್ಲೈವುಡ್ (Plywood) ಮತ್ತು MDF ಬೋರ್ಡ್ ನಡುವಿನ ವ್ಯತ್ಯಾಸವೇನು? ||| What is the difference between Teak wood, Plywood, and MDF board?",
        "ideal_answer_hints": [
            "Teak is solid natural hardwood, durable, water-resistant, ideal for main doors",
            "Plywood is cross-laminated wood veneers, strong and resistant to bending/warping",
            "MDF is compressed wood fiber, very smooth for paint finish but sensitive to water",
            "Chooses correct material based on moisture exposure and furniture load requirements",
        ],
    },
    {
        "role": "Carpenter",
        "difficulty": "medium",
        "category": "Power Saw Safety & Kickback",
        "question": "ಸರ್ಕ್ಯುಲರ್ ಸಾ (Circular Saw) ಅಥವಾ ರೂಟರ್ ಮೆಷಿನ್ ಬಳಸುವಾಗ ಕಿಕ್‌ಬ್ಯಾಕ್ (Kickback) ತಪ್ಪಿಸಲು ಯಾವ ಸುರಕ್ಷತಾ ನಿಯಮ ಪಾಲಿಸುತ್ತೀರಿ? ||| What safety precautions do you follow to prevent kickback when operating a circular saw or router?",
        "ideal_answer_hints": [
            "Wears safety goggles, dust mask, and earplugs; tucks loose clothing and hair",
            "Ensures blade is sharp, clean, and securely tightened at rated RPM",
            "Uses a guide fence or straight rail; never forces or twists saw blade in the cut",
            "Stands to the side of cut path rather than directly behind moving blade",
            "Clamps workpiece firmly with C-clamps or bar clamps before starting cut",
        ],
    },
    {
        "role": "Carpenter",
        "difficulty": "medium",
        "category": "Lamination & Adhesive Bonding",
        "question": "ಮರದ ಫರ್ನಿಚರ್‌ಗೆ ಮೈಕಾ ಲ್ಯಾಮಿನೇಟ್ (Mica / Laminate) ಅಂಟಿಸುವಾಗ ಗುಳ್ಳೆಗಳು (Air Bubbles) ಬಾರದಂತೆ ಹೇಗೆ ಹಚ್ಚುತ್ತೀರಿ? ||| How do you apply laminate sheet onto plywood to ensure zero air bubbles and strong bonding?",
        "ideal_answer_hints": [
            "Sands plywood substrate smooth and clears all sawdust before glue application",
            "Applies even layer of synthetic contact adhesive on both plywood and laminate back",
            "Allows glue to become tacky for 10-15 minutes before pressing surfaces together",
            "Applies uniform rolling pressure from center towards edges using heavy hand roller",
            "Trims excess overhang with router laminate trimmer bit for clean edges",
        ],
    },
    {
        "role": "Carpenter",
        "difficulty": "hard",
        "category": "Site Installation & Plumb Alignment",
        "question": "ಗ್ರಾಹಕರ ಸೈಟ್‌ನಲ್ಲಿ ಕಸ್ಟಮ್ ವಾರ್ಡ್ರೋಬ್ ಅಥವಾ ಮಾಡ್ಯುಲರ್ ಕಿಚನ್ ಜೋಡಿಸುವಾಗ ಗೋಡೆ ಅಥವಾ ನೆಲ ಅಸಮಾನವಾಗಿದ್ದರೆ (Uneven Wall/Floor) ಹೇಗೆ ಲೆವೆಲಿಂಗ್ ಮಾಡುತ್ತೀರಿ? ||| How do you level and install custom wardrobes when room walls or floors are uneven and out of plumb?",
        "ideal_answer_hints": [
            "Checks horizontal and vertical level across entire wall using precision spirit level",
            "Uses adjustable base legs or hardwood shims beneath cabinet base plinth",
            "Scribes side filler strips to trace uneven wall curve so no gaps remain visible",
            "Fastens carcase firmly into wall masonry with heavy-duty anchor screws and wall plugs",
            "Adjusts 3-way concealed hinges on cabinet doors for uniform reveal spacing",
        ],
    },

    # ── 12. FACTORY WORKER (ಕಾರ್ಖಾನೆ ಕಾರ್ಮಿಕ / ಯಂತ್ರ ನಿರ್ವಾಹಕ) ───────────────
    {
        "role": "Factory Worker",
        "difficulty": "easy",
        "category": "Shop Floor PPE Safety",
        "question": "ಕಾರ್ಖಾನೆಯ ಶಾಪ್ ಫ್ಲೋರ್‌ನಲ್ಲಿ ಕೆಲಸ ಮಾಡುವಾಗ ನೀವು ಧರಿಸಬೇಕಾದ ವೈಯಕ್ತಿಕ ಸುರಕ್ಷತಾ ಸಾಧನಗಳು (PPE) ಯಾವುವು? ||| What Personal Protective Equipment (PPE) is mandatory on a factory shop floor?",
        "ideal_answer_hints": [
            "Steel-toe safety shoes to prevent crushed feet from dropped heavy components",
            "Safety goggles to protect eyes against flying metal burrs, dust, or chemical splashes",
            "Hard hat helmet in zones with overhead conveyor tracks or crane hoisting",
            "Earplugs/earmuffs in high noise areas and dust mask/respirator where required",
            "Well-fitted company uniform with no loose ties, long hair tucked, and no wrist accessories",
        ],
    },
    {
        "role": "Factory Worker",
        "difficulty": "easy",
        "category": "Emergency Stop Button",
        "question": "ಯಂತ್ರದಲ್ಲಿ ಕೆಲಸ ಮಾಡುವಾಗ ಎಮರ್ಜೆನ್ಸಿ ಸ್ಟಾಪ್ ಬಟನ್ (Emergency Stop Button) ಯಾವಾಗ ಮತ್ತು ಹೇಗೆ ಬಳಸುತ್ತೀರಿ? ||| When and how do you use the Emergency Stop (E-Stop) button on a machine?",
        "ideal_answer_hints": [
            "Hits the big red mushroom button immediately if someone's clothing or limb gets caught in moving parts",
            "Uses during abnormal machine rattling, smoke, sparks, jamming, or safety guard opening",
            "Cuts electrical power to motors within milliseconds to prevent severe injury",
            "Never resets the E-stop switch until the machine is thoroughly inspected by maintenance team",
        ],
    },
    {
        "role": "Factory Worker",
        "difficulty": "medium",
        "category": "Quality Inspection & Defects",
        "question": "ನಿಮ್ಮ ಶಿಫ್ಟ್‌ನಲ್ಲಿ ತಯಾರಾದ ಉತ್ಪನ್ನಗಳಲ್ಲಿ ದೋಷ (Defect) ಅಥವಾ ಗುಣಮಟ್ಟದ ಕೊರತೆ ಕಂಡುಬಂದರೆ ಏನು ಮಾಡುತ್ತೀರಿ? ||| What do you do if you detect defects or quality issues during your production shift?",
        "ideal_answer_hints": [
            "Immediately stops feeding new parts into machine to avoid manufacturing more scrap",
            "Segregates and labels defective pieces in red rejected component bin",
            "Informs shift supervisor and quality control inspector with sample defect",
            "Checks machine jig, tool sharpness, and coolant pressure for parameter drift",
            "Logs rejection count in shift production record book",
        ],
    },
    {
        "role": "Factory Worker",
        "difficulty": "medium",
        "category": "Shift Handover Protocol",
        "question": "ಪಾಳಿ ಹಸ್ತಾಂತರದ (Shift Handover) ಸಮಯದಲ್ಲಿ ಮುಂದಿನ ಶಿಫ್ಟ್‌ನ ಆಪರೇಟರ್‌ಗೆ ಯಾವ ಮಾಹಿತಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳುತ್ತೀರಿ? ||| What information do you communicate during shift handover to the next operator?",
        "ideal_answer_hints": [
            "Communicates total production count achieved vs shift target",
            "Reports any machine abnormal noise, minor jamming, or maintenance interventions",
            "Notes remaining raw material inventory on pallet and upcoming batch orders",
            "Confirms workstation is cleaned, scrap cleared, and safety checklist signed off",
        ],
    },
    {
        "role": "Factory Worker",
        "difficulty": "hard",
        "category": "Machine Safety Interlocks & SOP",
        "question": "ಯಂತ್ರದ ಸುರಕ್ಷತಾ ಗಾರ್ಡ್ (Safety Guard) ಅಥವಾ ಸೆನ್ಸಾರ್ ಕೆಲಸ ಮಾಡದಿದ್ದರೆ ಕೆಲಸ ಮುಂದುವರಿಸಬಹುದೇ? ನಿಮ್ಮ ಕ್ರಮವೇನು? ||| If a machine safety guard or optical sensor is malfunctioning, can you bypass it to finish work? What is your action?",
        "ideal_answer_hints": [
            "Strictly never bypass, tamper, or tape down any safety interlock or light curtain",
            "Stops the machine immediately and attaches a yellow 'OUT OF SERVICE - DO NOT OPERATE' tag",
            "Reports malfunction to the maintenance engineer and safety officer immediately",
            "Prioritizes human life and limb over production shift targets",
            "Resumes machine operation only after certified maintenance clearance",
        ],
    },

    # ── 12. GENERAL BLUE-COLLAR FOUNDATIONAL (ಮೂಲಭೂತ ಸಾಮರ್ಥ್ಯಗಳು) ─────────────
    {
        "role": "General Blue Collar",
        "difficulty": "easy",
        "category": "Punctuality & Discipline",
        "question": "ಕೆಲಸಕ್ಕೆ ಸಮಯಪಾಲನೆ (Punctuality) ಮತ್ತು ನಿಯಮಿತ ಹಾಜರಾತಿಯ ಮಹತ್ವವೇನು? ||| Why is punctuality and regular attendance essential for this role?",
        "ideal_answer_hints": [
            "Arrives 10-15 minutes before shift starts for briefing, tool inspection, and uniform check",
            "Ensures delivery routes, security posts, and production lines are never left unattended",
            "Informs team supervisor well in advance in case of genuine medical emergency",
            "Demonstrates reliable work ethic, earns employer trust, and boosts customer satisfaction",
        ],
    },
    {
        "role": "General Blue Collar",
        "difficulty": "medium",
        "category": "Workplace Teamwork & Courtesy",
        "question": "ಕೆಲಸದ ಸ್ಥಳದಲ್ಲಿ ಸಹೋದ್ಯೋಗಿಗಳೊಂದಿಗೆ ತಂಡವಾಗಿ (Teamwork) ಕೆಲಸ ಮಾಡುವುದು ಹೇಗೆ? ||| How do you work effectively as a team player with your coworkers?",
        "ideal_answer_hints": [
            "Communicates politely and respectfully in native language (Kannada)",
            "Helps teammates willingly during heavy workload, emergency spikes, or shift handovers",
            "Resolves minor disagreements calmly without arguments or shouting",
            "Follows supervisor instructions and respects company safety protocols",
        ],
    },
]

# Retain technical software roles as secondary for backward compatibility
TECH_TRAINING_DATA = [
    {
        "role": "Software Engineer",
        "difficulty": "easy",
        "category": "DSA",
        "question": "What is the time complexity of binary search? ||| ಬೈನರಿ ಸರ್ಚ್‌ನ ಸಮಯ ಸಂಕೀರ್ಣತೆ (Time Complexity) ಏನು?",
        "ideal_answer_hints": [
            "O(log n) time complexity",
            "Works on sorted arrays",
            "Halves the search space each iteration",
        ],
    },
    {
        "role": "Software Engineer",
        "difficulty": "medium",
        "category": "System Design",
        "question": "How would you design a URL shortener like bit.ly? ||| Bit.ly ನಂತಹ URL ಶಾರ್ಟ್‌ನರ್ ಅನ್ನು ಹೇಗೆ ವಿನ್ಯಾಸಗೊಳಿಸುತ್ತೀರಿ?",
        "ideal_answer_hints": [
            "Base62 encoding to generate short keys",
            "Database mapping short key -> original URL",
            "Cache hot URLs with Redis",
        ],
    },
]

# Combined master training data
TRAINING_DATA = BLUE_COLLAR_TRAINING_DATA + TECH_TRAINING_DATA


def normalize_role(role: str) -> str:
    """
    Intelligently maps any role string (including Kannada, variations, and partial matches)
    to a canonical role name.
    """
    if not role:
        return "Delivery Executive"
    
    cleaned = role.strip().lower()
    
    # 1. Exact alias lookup
    for canonical_name, aliases in ROLE_ALIASES.items():
        for alias in aliases:
            if alias in cleaned or cleaned in alias:
                return canonical_name

    # 2. Match directly against canonical names in dataset
    for q in TRAINING_DATA:
        if q["role"].lower() in cleaned or cleaned in q["role"].lower():
            return q["role"]
            
    # Default to Delivery Executive for blue collar platform
    return "Delivery Executive"


def get_questions_for_role(role: str, difficulty: str | None = None, limit: int = 3) -> list:
    """
    Return high-accuracy sample questions for a given role/difficulty, used for few-shot prompt priming.
    Supports intelligent role normalization and synonym matching.
    """
    canonical_role = normalize_role(role)
    
    # Primary filter by canonical role
    filtered = [q for q in TRAINING_DATA if q["role"].lower() == canonical_role.lower()]
    
    # Optional difficulty filter
    if difficulty:
        diff_filtered = [q for q in filtered if q["difficulty"].lower() == difficulty.lower()]
        if diff_filtered:
            filtered = diff_filtered

    if not filtered:
        # Fallback to general blue-collar questions
        filtered = [q for q in TRAINING_DATA if q["role"] == "General Blue Collar"] or TRAINING_DATA

    return filtered[:limit]


def get_all_questions() -> list:
    """Return all training questions."""
    return TRAINING_DATA


def get_all_blue_collar_roles() -> list:
    """Return list of distinct blue-collar roles supported."""
    return list(ROLE_ALIASES.keys())
