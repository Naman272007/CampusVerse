
/*
  
  Hotspot coordinates:
  [room name, horizontal %, vertical %, width %, height %]

  
*/


// ---------- HELPERS (were missing) ----------
const $ = (selector) => document.querySelector(selector);
const timers = new Map();
// ---------- FLOOR PLAN ZOOM ----------
let floorZoom = 1;

const MIN_FLOOR_ZOOM = 1;
const MAX_FLOOR_ZOOM = 2.5;
const FLOOR_ZOOM_STEP = 0.25;

function applyFloorZoom() {
  const canvas = $("#floorMapCanvas");
  const viewport = $(".floor-map-viewport");

  if (!canvas || !viewport) return;

  // Keep the floor plan and room hotspots aligned.
  const baseWidth = Math.max(viewport.clientWidth - 2, 760);
  canvas.style.width = `${baseWidth * floorZoom}px`;
}

function stopSlideshow(key) {
  clearInterval(timers.get(key));
  timers.delete(key);
}

function openModal(id) {
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  if (id === "academicModal") stopSlideshow("academic");
  if (id === "roomModal") stopSlideshow("room");
}

// × buttons
document.querySelectorAll("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => closeModal(btn.dataset.close));
});

// Clicking the dark background closes the popup
document.querySelectorAll(".modal-backdrop").forEach(back => {
  back.addEventListener("click", e => {
    if (e.target === back) closeModal(back.id);
  });
});

// Esc key closes the top-most open popup
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  const open = [...document.querySelectorAll(".modal-backdrop.open")];
  if (open.length) closeModal(open[open.length - 1].id);
});

const academicData = {
  description: "The Academic Block serves as the central hub of a college campus, purposefully designed to foster learning, collaboration, and intellectual growth. It integrates modern classrooms, lecture halls, and specialized departmental laboratories equipped with contemporary teaching technologies.",
  directions: "1. Enter through the main gate and continue straight ahead for a short distance.\n"+
              "2. On your left, you will see the signboard for the Academic Block.\n"+
              "3. Just beside that board, take the arched pathway.\n"+
              "4. After walking through the arch, the entrance to the Academic Building will be on your left.",
  images: [
    "assets/building/academic-1.jpg",
    "assets/building/academic-2.jpg",
    "assets/building/academic-3.jpeg"
  ]
};

// FLOOR PLAN FILES
const floorInfo = {
  ground: {
    title: "Ground Floor",
    svg: "assets/final_ground.svg"
  },
  first: {
    title: "First Floor",
    svg: "assets/final_first.svg"
  },
  second: {
    title: "Second Floor",
    svg: "assets/final_second.svg"
  }
};

// ROOM CLICK POSITIONS
// These are starter positions. Adjust them to match your SVG labels.
const floorHotspots = {
  ground: [
    ["Networking Lab (132)", 24, 12, 9, 4],
    ["Computer Centre Lab (131 A)", 44, 12, 12, 4],
    ["Cyber Security Lab (132)", 62, 12, 10, 4],
    ["Unknown (126)", 28, 23, 5, 3],
    ["Assistant Librarian (131 B)", 39, 22, 5, 4],
    ["Sr. Network Engineer (131-C)", 42, 23, 5, 4],
    ["Server Room", 46, 23, 4, 3],
    ["Network Engineer (131-E)", 50, 24, 5, 4],
    ["Unknown (134)", 60, 23, 5, 3],
    ["Lecture Hall (122)", 31, 34, 9, 5],
    ["Faculty Room (125)", 43, 34, 6, 5],
    ["Lecture Hall (135)", 57, 36, 9, 5],
    ["Tutorial Room (124)", 22, 44, 6, 4],
    ["Tutorial Room (123)", 22, 51, 6, 4],
    ["3-D Institute Model", 44, 50, 8, 3],
    ["Anechoic Chamber (136)", 64, 45, 7, 4],
    ["Student Activity Centre (137)", 64, 52, 7, 4],
    ["Lecture Hall (121)", 31, 58, 8, 5],
    ["Lecture Hall (138)", 57, 58, 8, 5],
    ["Seminar-II (119)", 31, 74, 8, 4],
    ["Pantry (118)", 24, 74, 5, 3],
    ["Board Room (115)", 20, 83, 7, 4],
    ["Office (114)", 25, 85, 6, 4],
    ["Faculty Cabin (113)", 32, 87, 7, 4],
    ["Entrance Lobby", 44, 79, 10, 5],
    ["Registrar (106)", 58, 83, 5, 4],
    ["Director", 66, 83, 5, 4],
    ["Dean Academics (107)", 58, 74, 5, 4],
    ["Reception", 37, 76, 5, 3 ],
    ["JAO(SS)(108)", 58, 77, 4, 3],
    ["Toilet(M)Students.G",11, 19, 9, 4 ],
    ["Toilet(F)Students.G", 21, 19, 9, 4],
    ["Lift Lobby (139)", 45, 61, 6, 4]
  ],

  first: [
    ["Big Data Lab (216)", 25, 12, 7, 4],
    ["AIDL (215)", 25, 19, 6, 4],
    ["Project Lab (214)", 27, 26, 6, 4],
    ["Library (218)", 42, 18, 12, 5],
    ["Wireless Communication Lab (220)", 58, 12, 10, 4],
    ["AI Experimental Lab (221)", 58, 19, 8, 4],
    ["PCB Design (219)", 49, 25, 7, 5],
    ["Speech Processing Lab (228)", 57, 25, 6, 4],
    ["Lecture Hall (209)", 29, 38, 8, 5],
    ["Faculty Room (227)", 43, 34, 6, 4],
    ["Lecture Hall (222)", 52, 38, 8, 5],
    ["Tutorial (208)", 22, 47, 5, 4],
    ["Tutorial (207)", 22, 55, 5, 4],
    ["Central Atrium", 42, 48, 9, 5],
    ["Tutorial (223)", 62, 46, 5, 4],
    ["Tutorial (224)", 62, 55, 5, 4],
    ["Lecture Hall (206)", 29, 58, 8, 5],
    ["Lecture Hall (225)", 52, 58, 8, 5],
    ["Faculty Cabin Entrance (205)", 31, 76, 9, 5],
    ["Confidential (203)", 51, 76, 6, 4],
    ["Examination Cell", 56, 67, 5, 3],
    ["Office (202)", 58, 83, 8, 5],
    ["Entrance Lobby", 41, 82, 10, 5],
    ["LIFT LOBBY (226)", 42, 61, 10, 6],
    ["Office all inclusive",50, 66, 5, 4 ]
  ],

  second: [
    ["I.S.B.N. Lab (314)", 27, 14, 8, 4],
    ["AICTE IDEA Lab (316)", 44, 14, 11, 4],
    ["Robotics Lab (317)", 60, 14, 8, 4],
    ["Boys Common Room (313)", 28, 24, 7, 4],
    ["Unknown (318)", 60, 24, 6, 4],
    ["Class Room (308)", 30, 35, 8, 4],
    ["Faculty (325)", 45, 34, 6, 4],
    ["Class Room (319)", 55, 35, 8, 4],
    ["Class Room (307)", 30, 43, 8, 4],
    ["Class Room (320)", 55, 43, 8, 4],
    ["Tutorial (306)", 23, 48, 6, 4],
    ["Tutorial (305)", 23, 56, 6, 4],
    ["Central Atrium", 43, 49, 9, 5],
    ["R&D Space (321)", 66, 48, 6, 4],
    ["Unknown (322)", 66, 56, 6, 4],
    ["Lecture Hall (304)", 31, 63, 8, 5],
    ["Lecture Hall (323)", 56, 63, 8, 5],
    ["VLSI and Embedded Lab (303)", 30, 82, 10, 5],
    ["Electronic Circuit Lab (302)", 44, 82, 10, 5],
    ["Computer Programming Lab (301)", 56, 82, 10, 5],
    ["Meeting Room-1 (204)", 45, 76, 8, 4],
    ["Confidential (203)", 63, 78, 7, 4],
    ["Office (202)", 68, 88, 6, 4]
  ]
};

// EDIT EACH ROOM'S DETAILS AND PHOTOS HERE.
// Add more entries by copying the same format.
const roomData = {
  // ==========================================
  // GROUND FLOOR
  // ==========================================

  "Networking Lab (132)": {
    description: "The Networking Lab is an interactive, hands-on space where students discover how the modern internet works and how global data connects. It introduces beginners to the foundational building blocks of digital communication through engaging simulations and physical routing hardware.",
    directions: "1. Go straight, past the entrance lobby maintaining left side of corridor.\n"+
                "2. At the end you will find room 131, facing it turn left then after few steps turn right.\n"+
                "3. After few steps, on the left you will get networking lab.",
    images: [
      "assets/ground/networking-1.jpg",
      "assets/ground/networking-2.png",
      "assets/ground/networking-3.png"
    ]
  },

  "Computer Centre Lab (131 A)": {
    description: "The Computer Centre Lab is an open-access resource center designed to support academic research, assignment formatting, and daily computing needs across all disciplines. It is the university's primary shared workspace for digital literacy, independent study, and technological support.",
    directions: "1. Go straight, past the entrance lobby maintaining left side of corridor.\n"+
                "2. At the end you will find room 131, inside which, is computer centre lab, room 131-A ",
    images: [
      "assets/ground/cc-1.png",
      "assets/ground/cc-2.jpg",
      "assets/ground/cc-3.jpg"
    ]
  },



  "Cyber Security Lab (132)": {
    description: "The Cyber Security Lab is a specialized, secure environment where students learn to defend digital infrastructure against real-world cyber threats.",
    directions: "1. Go straight, past the entrance lobby maintaining right side of corridor.\n"+
                "2. Coming to the very end, you will find room 135 at right.\n"+
                "3. Turn right in the corridor ahead and take the first left.\n"+
                "4. Few steps ahead, on right you will find cyber security lab.\n",

    images: [
      "assets/ground/cs-1.png",
      "assets/ground/cs-2.jpg",
      "assets/rooms/cyber-security-3.jpg"
    ]
  },

  "Unknown (126)": {
    description: "Room label not specified",
    directions: "1. Go straight, past the entrance lobby maintaining left side of corridor.\n"+
                "2. Coming to the very end, you will find room 131, facing it turn left.\n"+
                "3. Continue straight past the double door.\n"+
                "4. After the double door, on immediate right you will find room 126",

    images: [
      "assets/rooms/unknown-126-1.jpg",
      "assets/rooms/unknown-126-2.jpg",
      "assets/rooms/unknown-126-3.jpg"
    ]
  },

  "Toilet(M)Students.G":{
    description:"Hygiene and Washroom Area",
    directions:  "1. Go straight, past the entrance lobby maintaining left side of corridor.\n"+
                "2. At the end you will find room 131\n"+
                "3. Go straight, you will find two double doors in your way, go past it.\n"+
                "4. At almost end of that corridor, on the right is your desired wc",

    images:[
      "assets/ground/Male-wc.jpg"
    ]
  },

  "Toilet(F)Students.G":{
    description:"Hygiene and Washroom Area",
    directions: "1 Go straight, past the entrance lobby maintaining left side of corridor.\n"+
                "2. At the end you will find room 131\n"+
                "3. Go straight, you will find two double doors in your way, go past it.\n"+
                "4. After crossing the second double door, at immediate right, is your desired wc",

    images:[
      "assets/ground/Female-wc.jpg"
    ]
  },
  

  "Assistant Librarian (131 B)": {
    
    directions: "1. Go straight, past the entrance lobby maintaining left side of corridor.\n"+
                "2. At the end you will find room 131\n"+
                "3. Few steps inside 131, on your right, lies assist. librarian room",
    images: [
      "assets/ground/librarian-1.jpg",
      "assets/rooms/librarian-131b-2.jpg",
      "assets/rooms/librarian-131b-3.jpg"
    ]
  },

  "Sr. Network Engineer (131-C)": {
    
    directions: "1. Go straight, past the entrance lobby maintaining left side of corridor.\n"+
                "2. At the end you will find room 131. Upon entering you will find 131-A.\n"+
                "3. Go inside 131-A and on right first cabin is your desired room",
    images: [
      "assets/rooms/sr-network-engineer-131c-1.jpg",
      "assets/rooms/sr-network-engineer-131c-2.jpg",
      "assets/rooms/sr-network-engineer-131c-3.jpg"
    ]
  },

  "Server Room": {
    description: "The Server Room is the secure, central nervous system of the university's digital landscape, housing the critical infrastructure that powers campus network operations",
    directions: "1. Go straight, past the entrance lobby maintaining left side of corridor.\n"+
                "2. At the end you will find room 131. Upon entering you will find 131-A.\n"+
                "3. go inside 131-A, on right after few steps, you will find server room",
    images: [
      "assets/rooms/server-room-1.jpg",
      "assets/rooms/server-room-2.jpg",
      "assets/rooms/server-room-3.jpg"
    ]
  },

  "Network Engineer (131-E)": {
    
    directions: "1. Go straight, past the entrance lobby maintaining left side of corridor.\n"+
                "2. At the end you will find room 131. Upon entering you will find 131-A.\n"+
                "3. Go inside 131-A, turn right go straight, just after the projector, is your desired room",
    images: [
      "assets/rooms/network-engineer-131e-1.jpg",
      "assets/rooms/network-engineer-131e-2.jpg",
      "assets/rooms/network-engineer-131e-3.jpg"
    ]
  },

  "Unknown (134)": {
    description: "Room label not specified",
    directions: "1. Go straight, past the entrance lobby maintaining right side of corridor.\n"+
                "2. Coming to the very end, you will find room 135, take right in the corridor ahead.\n"+
                "3. Continue straight past the double door.\n"+
                "4. After the double door, on immediate left you will find room 134",
    images: [
      "assets/rooms/unknown-134-1.jpg",
      "assets/rooms/unknown-134-2.jpg",
      "assets/rooms/unknown-134-3.jpg"
    ]
  },

  "Lecture Hall (122)": {
    description: "ECE class for 1st year students for session 2026-27\n"+
                  "ILC class for Advance 2 students for session 2026-27\n",
    directions: "1. Go straight, past the entrance lobby maintaining left side of corridor.\n"+
                "2. Coming to the very end, you will find room 122 on your left, before the next corridor ",
    images: [
      "assets/ground/LH-122-1.jpg",
      "assets/rooms/lecture-hall-122-2.jpg",
      "assets/rooms/lecture-hall-122-3.jpg"
    ]
  },

  "Faculty Room (125)": {
    description: "",
    directions: "1. Go straight, past the entrance lobby, following staright path to the lift lobby\n"+
                "2. Go straight through the lift lobby and you will find institute model\n"+
                "3. Move ahead few steps in the same direction and on your front you will find room 125\n",
    images: [
      "assets/ground/facultyG-1.jpg",
      "assets/rooms/faculty-room-125-2.jpg",
      "assets/rooms/faculty-room-125-3.jpg"
    ]
  },

  "Lecture Hall (135)": {
    description: "DSAI class for 1st year students for session 2026-27\n"+
                 "ILC class for basic students for session 2026-27 ",
    directions:  "1. Go straight, past the entrance lobby maintaining right side of corridor.\n"+
                 "2. Coming to the very end, you will find room 135 on your right, before the next corridor ",
    images: [
      "assets/ground/LH-135-1.png",
      "assets/ground/LH-135-2.png",
      "assets/ground/LH-135-3.png"
    ]
  },

  "Tutorial Room (124)": {
    description: "--",
    directions: "1. Go straight, past the entrance lobby maintaining left side of corridor.\n"+
                "2. Continuing your path, you will find institute model on your right\n"+
                "3. Take the left path, on your way, parallel to the model\n"+
                "4. Go straight and you will find two rooms out of which one is 124",
    images: [
      "assets/ground/Tuts-124-1.png",
      "assets/rooms/tutorial-124-2.jpg",
      "assets/rooms/tutorial-124-3.jpg"
    ]
  },

  "Reception":{
   
    description:"The college reception serves as the central hub for campus visitors, handling inquiries, guest check-ins, and general administrative routing.",
    direction:"1. After entering from the main gate, look diagonally left and you will find it\n"+
              "(extra)after entering main gate, at immediate right is the help desk",
  },


  "Tutorial Room (123)": {
    description: "--",
    directions: "1. Go straight, past the entrance lobby maintaining left side of corridor.\n"+
                "2. Continuing your path, you will find institute model on your right\n"+
                "3. Take the left path, on your way, parallel to the model\n"+
                "4. Go straight and you will find two rooms out of which one is 123",
    images: [
      "assets/ground/Tuts-123-1.png",
      "assets/rooms/tutorial-123-2.jpg",
      "assets/rooms/tutorial-123-3.jpg"
    ]
  },

  "3-D Institute Model": {
    description: "3-D model of our institute",
    directions: "1. Go straight, past the entrance lobby, following staright path to the lift lobby\n"+
                "2. Go straight through the lift lobby and you will find institute model",
    images: [
      "assets/rooms/3d-institute-model-1.jpg",
      "assets/rooms/3d-institute-model-2.jpg",
      "assets/rooms/3d-institute-model-3.jpg"
    ]
  },

  "Anechoic Chamber (136)": {
    description: "An anechoic chamber is a specialized, echo-free room designed to completely absorb reflections of either sound or electromagnetic waves. Isolated from external noise, it creates a controlled environment where students and researchers can precisely measure acoustics, antenna performance, and wireless device signals.",
    directions:"1. Go straight, past the entrance lobby maintaining right side of corridor.\n"+
               "2. Continuing your path, you will find institute model on your left\n"+
               "3. Take the right path, on your way, parallel to the model\n"+
               "4. Go straight and you will find two rooms out of which one is 136",
    images: [
      "assets/ground/anechoic-136-1.jpg",
      "assets/rooms/anechoic-136-2.jpg",
      "assets/rooms/anechoic-136-3.jpg"
    ]
  },

  "Student Activity Centre (137)": {
    description: "Previoulsy sac, now used as microwave radar lab(MRL)",
    directions: "1. Go straight, past the entrance lobby maintaining right side of corridor.\n"+
                "2. Continuing your path, you will find institute model on your left\n"+
                "3. Take the right path, on your way, parallel to the model\n"+
                "4. Go straight and you will find two rooms out of which one is 137,(MRL) ",
    images: [
      "assets/ground/MRL-137-1.jpg",
      "assets/rooms/student-activity-137-2.jpg",
      "assets/rooms/student-activity-137-3.jpg"
    ]
  },

  "Lecture Hall (121)": {
    description: "Generally used for club activites and events",
    directions: "1. Go straight, past the entrance lobby maintaining left side of corridor.\n"+
                "2. After going past the lobby and horizontal corridor, on your path you will find room 121 on left",
    images: [
      "assets/ground/LH-121-1.png",
      "assets/ground/LH-121-2.jpg",
      "assets/rooms/lecture-hall-121-3.jpg"
    ]
  },

  "Lecture Hall (138)": {
    description: "Lecture Hall for CSE 1st year for the session 2026-27\n"+
                  "ILC Advance 1 class for the session 2026-27",
    directions: "1. Go straight, past the entrance lobby maintaining right side of corridor.\n"+
                "2. After going past the lobby and horizontal corridor, on your path you will find room 138 on right",
    images: [
      "assets/ground/LH-138-1.png",
      "assets/ground/LH-138-2.jpg",
      "assets/ground/LH-138-3.png"
    ]
  },

  "Seminar-II (119)": {
    description: "--",
    directions: "1. Upon entering the lobby, turn left and you will see a double door\n"+
                "2. Go past the double door and on the immediate right, is your desired room",
    images: [
      "assets/rooms/seminar-119-1.jpg",
      "assets/rooms/seminar-119-2.jpg",
      "assets/rooms/seminar-119-3.jpg"
    ]
  },

  "Pantry (118)": {
    description: "--",
    directions:"1. Upon entering the lobby, turn left and you will see a double door\n"+
               "2. Go past the double door and on you wil find a small lobby\n"+
               "3. Turn right from the lobby and just before the doors lies, pantry",
    images: [
      "assets/rooms/pantry-118-1.jpg",
      "assets/rooms/pantry-118-2.jpg",
      "assets/rooms/pantry-118-3.jpg"
    ]
  },

  "Board Room (115)": {
    description: "",
    directions: "1. Upon entering the lobby, turn left and you will see a double door\n"+
                "2. Go past the double door and on you wil find a small lobby\n"+
                "3. On entering the lobby you will find board room infront of you",
    images: [
      "assets/rooms/board-room-115-1.jpg",
      "assets/rooms/board-room-115-2.jpg",
      "assets/rooms/board-room-115-3.jpg"
    ]
  },

  "Office (114)": {
    description: "",
    directions: "1. Upon entering the lobby, turn left and you will see a double door\n"+
                "2. Go past the double door and on you wil find a small lobby\n"+
                "3. Turn left from the lobby and you will find office infront of you",
    images: [
      "assets/rooms/office-114-1.jpg",
      "assets/rooms/office-114-2.jpg",
      "assets/rooms/office-114-3.jpg"
    ]
  },

  "Faculty Cabin (113)": {
    description: "",
    directions: "1. Upon entering the lobby, turn left and you will see a double door\n"+
                "2. Go past the double door and on the immediate left, is your desired room",
    images: [
      "assets/rooms/faculty-cabin-113-1.jpg",
      "assets/rooms/faculty-cabin-113-2.jpg",
      "assets/rooms/faculty-cabin-113-3.jpg"
    ]
  },

  "Entrance Lobby": {
    description: "The Entrance Lobby serves as the welcoming gateway and central hub of the institute, providing a vibrant first impression for visitors and students alike.",
    directions: "Enter from the main gate of academic block",
    images: [
      "assets/ground/enterance looby-1.jpg",
      "assets/ground/Enterance looby-hd.jpg",
      "assets/ground/enterance-3.jpg"
    ]
  },

  "Registrar (106)": {
    description: "The Registrar Room is the central administrative hub responsible for managing essential student records, academic transcripts, and enrollment data.",
    directions: "1. Upon entering the lobby, turn right and you will see a double door\n"+
                "2. Go past the double door and on the immediate right corridor, is your desired room",
    images: [
      "assets/rooms/registrar-106-1.jpg",
      "assets/rooms/registrar-106-2.jpg",
      "assets/rooms/registrar-106-3.jpg"
    ]
  },

  "Director": {
    description: "",
    directions:"1. Upon entering the lobby, turn right and you will see a double door\n"+
               "2. Go past the double door, move ahead of the corridor in your way and infront of you is the director cabin",
    images: [
      "assets/rooms/director-1.jpg",
      "assets/rooms/director-2.jpg",
      "assets/rooms/director-3.jpg"
    ]
  },

  "Dean Academics (107)": {
    description: "",
    directions: "1. Upon entering the lobby, turn right and you will see a double door\n"+
                "2. Go past the double door and on the immediate left corridor, is your desired room",
    images: [
      "assets/rooms/academic-107-1.jpg",
      "assets/rooms/academic-107-2.jpg",
      "assets/rooms/academic-107-3.jpg"
    ]
  },

   "JAO(SS)(108)": {
    description: "",
    directions: "1. Upon entering the lobby, turn right and you will see a double door\n"+
                "2. Go past the double door and on the immediate left corridor, is your desired room",
    images: [
      "assets/rooms/academic-107-1.jpg",
      "assets/rooms/academic-107-2.jpg",
      "assets/rooms/academic-107-3.jpg"
    ]
  },

  

  "Lift Lobby (139)": {
    description: "Area for accessing lift",
    directions: "1. Walk straight through the entrance lobby and you will find the lift lobby just after crossing the lobby",
    images: [
      "assets/ground/lift g-1.jpg",
      "assets/ground/lift g-2.png",
      "assets/rooms/computer-centre-131a-3.jpg"
    ]
  },

  // ==========================================
  // FIRST FLOOR
  // ==========================================

  "Big Data Lab (216)": {
    description: "A big data lab is a specialized campus facility equipped with high-performance computing infrastructure and advanced analytics software for processing massive, complex datasets. It provides students and researchers with hands-on experience in data mining, machine learning, and predictive modeling to solve real-world industry problems.",
    directions: "1. Go straight from staircase untill the end of the corridor\n"+
                "2. Turn left at the corridor ends. After few steps you will see a double door\n"+
                "3. Just before the double door, turn right in the corridor that follows\n"+
                "4. At the end of corridor on left you have your desired lab",
    images: [
      "assets/First/big-data-216-1.jpg",
      "assets/rooms/big-data-216-2.jpg",
      "assets/rooms/big-data-216-3.jpg"
    ]


  },
  

  "AIDL (215)": {
    description: "An AI data lab is a cutting-edge campus facility featuring advanced GPU hardware and deep learning frameworks for training intelligent models and analyzing complex data. It serves as an experiential learning hub where students and researchers build, test, and deploy artificial intelligence and machine learning applications.",
    directions: "1. Go straight from staircase untill the end of the corridor\n"+
                "2. Turn left at the corridor ends. After few steps you will see a double door\n"+
                "3. Just before the double door, turn right in the corridor that follows\n"+
                "4. After few steps, you have your AIDL lab on left",
    images: [
      "assets/First/aidl-215-1.jpg",
      "assets/rooms/aidl-215-2.jpg",
      "assets/rooms/aidl-215-3.jpg"
    ]
  },

  "Project Lab (214)": {
    description: "A college project lab is a dedicated, collaborative space equipped with specialized tools, software, and hardware for students to design, prototype, and build their capstone or research projects.",
    directions: "1. Go straight from staircase untill the end of the corridor\n"+
                "2. Turn left at the corridor ends. After few steps you will see a double door\n"+
                "3. Past the double door, at immediatae right, is your project lab",
    images: [
      "assets/First/project-214-1.jpg",
      "assets/rooms/project-lab-214-2.jpg",
      "assets/rooms/project-lab-214-3.jpg"
    ]
  },

  "Library (218)": {
    description: "B.Tech students can issue five books at a time for 14 days and re-issue on 14th day if needed\n"+
                 "Monday to friday, the opening hours and issue/return timings are from 9:30 AM to 8:30 PM\n"+
                 "On saturday, the opening hour is form 10 AM to 5 PM and issue/return timing is from 10:30 AM to 5 PM\n"+
                 "On sunday library is clsoed",
    directions: "1. Turn left after stairs\n"+
                "2. Go striaght untill corridor ends and then turn right\n"+
                "3. At the end of corridor you will find library",
    images: [
      "assets/First/library-218-1.jpg",
      "assets/First/library-218-2.png",
      "assets/First/library-218-3.jpg",
      "assets/First/library-218-4.png",
      "assets/First/library-218-5.png"
    ]
  },

  "Wireless Communication Lab (220)": {
    description: "A wireless communication lab is a specialized facility equipped with advanced signal generators, spectrum analyzers, and simulation software like MATLAB. It enables students to analyze radio frequency signals, design antenna systems, and test modern cellular, Wi-Fi, and IoT protocols. This hands-on space bridges the gap between electromagnetic theory and next-generation network deployment.",
    directions: "1. Go straight from staircase untill the end of the corridor\n"+
                "2. Turn right at the end of corridor and take left immediately\n"+
                "3. Go till the end of corridor and at right you will find the lab",
    images: [
      "assets/First/wireless-220-1.jpg",
      "assets/First/wireless-220-2.jpg",
      "assets/rooms/wireless-220-3.jpg"
    ]
  },

  "AI Experimental Lab (221)": {
    description: "An AI experimental lab is an advanced testing environment where students build, train, and deploy next-generation artificial intelligence algorithms.",
    directions: "1. Go straight from staircase untill the end of the corridor\n"+
                "2. Turn right at the end of corridor and take left immediately\n"+
                "3. After few steps at right is your AI Experimental lab",
    images: [
      "assets/First/aiel-221-1.jpg",
      "assets/rooms/ai-experimental-221-2.jpg",
      "assets/rooms/ai-experimental-221-3.jpg"
    ]
  },

  "PCB Design (219)": {
    description: "A PCB design lab is a hands-on technical workshop where students learn to conceptualize, simulate, and fabricate custom Printed Circuit Boards. Equipped with professional EDA software and physical etching or milling machines, it bridges the gap between schematic diagrams and functional electronic hardware.",
    directions: "1. Go straight from staircase untill the end of corridor\n"+
                "2. At the end, look slight right and you will find the lab",
    images: [
      "assets/First/pcb-219-1.jpg",
      "assets/rooms/pcb-design-219-2.jpg",
      "assets/rooms/pcb-design-219-3.jpg"
    ]
  },

  "Speech Processing Lab (228)": {
    description: "A speech processing lab is a specialized facility equipped with advanced audio hardware and acoustic software for analyzing, synthesizing, and recognizing human speech.",
    directions:"1. Go straight from staircase untill the end of corridor\n"+
               "2. Turn right and go past the double door\n"+
               "3. After crossing at imediate left is your desired lab",
    images: [
      "assets/First/speech-228-1.jpg",
      "assets/rooms/speech-processing-228-2.jpg",
      "assets/rooms/speech-processing-228-3.jpg"
    ]
  },

  "Lecture Hall (209)": {
    description: "Lecture Hall for ECE 2nd year, for the session 2026-27",
    directions: "1. Turn left from stairs, go till end of corridor\n"+
                "2. Turn right at the end and after some steps, your desired lecture hall on left",
    images: [
      "assets/First/LH-209-1.jpg",
      "assets/rooms/lecture-hall-209-2.jpg",
      "assets/rooms/lecture-hall-209-3.jpg"
    ]
  },

  "Faculty Room (227)": {
    description: "",
    directions: "1. Go straight after stairs and after some distance, on your right you will se entry for room 222\n"+
                "After reaching parallel to the door, move left and after few steps,  on right you will find the desired room",
    images: [
      "assets/rooms/faculty-227-1.png",
      "assets/rooms/faculty-room-227-2.jpg",
      "assets/rooms/faculty-room-227-3.jpg"
    ]
  },

  "Lecture Hall (222)": {
    description: "Lecture Hall for DSAI 2nd year, for the session 2026-27",
    directions: "Go straight untill the end of corridor\n"+
                "Before starting of the next corridor, on your right is the desired room",
    images: [
      "assets/rooms/lecture-hall-222-1.jpg",
      "assets/rooms/lecture-hall-222-2.jpg",
      "assets/rooms/lecture-hall-222-3.jpg"
    ]
  },

  "Tutorial (208)": {
    description: "",
    directions: "",
    images: [
      "assets/First/Tuts-208-1.jpg",
      "assets/rooms/tutorial-208-2.jpg",
      "assets/rooms/tutorial-208-3.jpg"
    ]
  },

  "Tutorial (207)": {
    description: "",
    directions: "",
    images: [
      "assets/First/Tuts-207-1.jpg",
      "assets/rooms/tutorial-207-2.jpg",
      "assets/rooms/tutorial-207-3.jpg"
    ]
  },

  "Central Atrium": {
    description: "",
    directions: "",
    images: [
      "assets/rooms/central-atrium-first-1.jpg",
      "assets/rooms/central-atrium-first-2.jpg",
      "assets/rooms/central-atrium-first-3.jpg"
    ]
  },

  "Tutorial (223)": {
    description: "",
    directions: "",
    images: [
      "assets/First/Tuts-223-1.jpg",
      "assets/rooms/tutorial-223-2.jpg",
      "assets/rooms/tutorial-223-3.jpg"
    ]
  },

  "Tutorial (224)": {
    description: "",
    directions: "",
    images: [
      "assets/First/Tuts-224-1.jpg",
      "assets/rooms/tutorial-224-2.jpg",
      "assets/rooms/tutorial-224-3.jpg"
    ]
  },

  "Lecture Hall (206)": {
    description: "",
    directions: "",
    images: [
      "assets/First/LH-206-1.jpg",
      "assets/rooms/lecture-hall-206-2.jpg",
      "assets/rooms/lecture-hall-206-3.jpg"
    ]
  },

  "Lecture Hall (225)": {
    description: "",
    directions: "Few steps straight after stairs, on right.",
    images: [
      "assets/First/LH-225-1.jpg",
      "assets/First/LH-C-1.jpg",
      "assets/First/LH-C-2.jpg"
    ]
  },

  "Faculty Cabin Entrance (205)": {
    description: "",
    directions: "",
    images: [
      "assets/First/faculty cabin-205-1.png",
      "assets/rooms/faculty-cabin-entrance-205-2.jpg",
      "assets/rooms/faculty-cabin-entrance-205-3.jpg"
    ]
  },

  "Confidential (203)": {
    description: "",
    directions: "",
    images: [
      "assets/rooms/confidential-203-1.jpg",
      "assets/rooms/confidential-203-2.jpg",
      "assets/rooms/confidential-203-3.jpg"
    ]
  },

  "Examination Cell": {
    description: "",
    directions: "",
    images: [
      "assets/rooms/examination-cell-1.jpg",
      "assets/rooms/examination-cell-2.jpg",
      "assets/rooms/examination-cell-3.jpg"
    ]
  },

  "Office (202)": {
    description: "",
    directions: "",
    images: [
      "assets/rooms/office-202-1.jpg",
      "assets/rooms/office-202-2.jpg",
      "assets/rooms/office-202-3.jpg"
    ]
    
  },
  "LIFT LOBBY (226)": {
    description: "",
    directions: "",
    images: [
      "assets/First/lift f-1.jpg",
      "assets/First/lift f-2.jpg",
      "assets/rooms/computer-centre-131a-3.jpg"
    ]
  },

   "Office all inclusive": {
    
    directions: "Immediate right after stairs.",
    images: [
      "assets/First/oai-1.jpg",
      "assets/First/oai-2.jpg",
      "assets/rooms/cyber-security-3.jpg"
    ]
  },


  // ==========================================
  // SECOND FLOOR
  // ==========================================

  "I.S.B.N. Lab (314)": {
    description: "",
    directions: "",
    images: [
      "assets/second/isbn-lab-314-1.jpg",
      "assets/rooms/isbn-lab-314-2.jpg",
      "assets/rooms/isbn-lab-314-3.jpg"
    ]
  },

  "AICTE IDEA Lab (316)": {
    description: "",
    directions: "",
    images: [
      "assets/second/aicte-316-1.png",
      "assets/second/aicte-316-2.png",
      "assets/second/aicte-316-3.png",
      "assets/second/aicte-316-4.png",
      "assets/second/aicte-316-5.png"
    ]
  },

  "Robotics Lab (317)": {
    description: "",
    directions: "",
    images: [
      "assets/rooms/robotics-317-1.jpg",
      "assets/rooms/robotics-317-2.jpg",
      "assets/rooms/robotics-317-3.jpg"
    ]
  },

  "Boys Common Room (313)": {
    description: "",
    directions: "",
    images: [
      "assets/second/boys c-313-1.jpg",
      "assets/rooms/boys-common-313-2.jpg",
      "assets/rooms/boys-common-313-3.jpg"
    ]
  },

  "Unknown (318)": {
    description: "",
    directions: "",
    images: [
      "assets/rooms/unknown-318-1.jpg",
      "assets/rooms/unknown-318-2.jpg",
      "assets/rooms/unknown-318-3.jpg"
    ]
  },

  "Class Room (308)": {
    description: "",
    directions: "",
    images: [
      "assets/second/classroom-308-1.jpg",
      "assets/rooms/classroom-308-2.jpg",
      "assets/rooms/classroom-308-3.jpg"
    ]
  },

  "Faculty (325)": {
    description: "",
    directions: "",
    images: [
      "assets/second/faculty-325-1.jpg",
      "assets/rooms/faculty-325-2.jpg",
      "assets/rooms/faculty-325-3.jpg"
    ]
  },

  "Class Room (319)": {
    description: "",
    directions: "",
    images: [
      "assets/second/classroom-319-1.png",
      "assets/rooms/classroom-319-2.jpg",
      "assets/rooms/classroom-319-3.jpg"
    ]
  },

  "Class Room (307)": {
    description: "",
    directions: "",
    images: [
      "assets/second/classroom-307-1.jpg",
      "assets/rooms/classroom-307-2.jpg",
      "assets/rooms/classroom-307-3.jpg"
    ]
  },

  "Class Room (320)": {
    description: "",
    directions: "",
    images: [
      "assets/second/classroom-320-1.jpg",
      "assets/rooms/classroom-320-2.jpg",
      "assets/rooms/classroom-320-3.jpg"
    ]
  },

  "Tutorial (306)": {
    description: "",
    directions: "",
    images: [
      "assets/second/Tuts-306-1.jpg",
      "assets/rooms/tutorial-306-2.jpg",
      "assets/rooms/tutorial-306-3.jpg"
    ]
  },

  "Tutorial (305)": {
    description: "",
    directions: "",
    images: [
      "assets/second/Tuts-305-1.jpg",
      "assets/rooms/tutorial-305-2.jpg",
      "assets/rooms/tutorial-305-3.jpg"
    ]
  },

  "R&D Space (321)": {
    description: "",
    directions: "",
    images: [
      "assets/rooms/rd-space-321-1.jpg",
      "assets/rooms/rd-space-321-2.jpg",
      "assets/rooms/rd-space-321-3.jpg"
    ]
  },

  "Unknown (322)": {
    description: "",
    directions: "",
    images: [
      "assets/second/unknown-322-1.jpg",
      "assets/rooms/unknown-322-2.jpg",
      "assets/rooms/unknown-322-3.jpg"
    ]
  },

  "Lecture Hall (304)": {
    description: "",
    directions: "",
    images: [
      "assets/second/LH-304-1.png",
      "assets/rooms/lecture-hall-304-2.jpg",
      "assets/rooms/lecture-hall-304-3.jpg"
    ]
  },

  "Lecture Hall (323)": {
    description: "",
    directions: "",
    images: [
      "assets/second/LH-323-1.jpg",
      "assets/rooms/lecture-hall-323-2.jpg",
      "assets/rooms/lecture-hall-323-3.jpg"
    ]
  },

  "VLSI and Embedded Lab (303)": {
    description: "",
    directions: "",
    images: [
      "assets/second/vlsi-303-1.jpg",
      "assets/rooms/vlsi-303-2.jpg",
      "assets/rooms/vlsi-303-3.jpg"
    ]
  },

  "Electronic Circuit Lab (302)": {
    description: "",
    directions: "",
    images: [
      "assets/second/electronic-circuit-302-1.jpg",
      "assets/rooms/electronic-circuit-302-2.jpg",
      "assets/rooms/electronic-circuit-302-3.jpg"
    ]
  },

  "Computer Programming Lab (301)": {
    description: "",
    directions: "",
    images: [
      "assets/second/computer programming-301-1.jpg",
      "assets/rooms/computer-programming-301-2.jpg",
      "assets/rooms/computer-programming-301-3.jpg"
    ]
  },

  "Meeting Room-1 (204)": {
    description: "",
    directions: "",
    images: [
      "assets/rooms/meeting-room-204-1.jpg",
      "assets/rooms/meeting-room-204-2.jpg",
      "assets/rooms/meeting-room-204-3.jpg"
    ]
  }
};


function startSlideshow(container, images, key) {
  stopSlideshow(key);

  const img = container.querySelector(".slide-image");
  const dots = container.querySelector(".slide-dots");

  if (!img || !dots) return;

  dots.innerHTML = "";

  const usableImages = (images || []).filter(Boolean);

  if (usableImages.length === 0) {
    img.removeAttribute("src");
    img.alt = "Image not available";
    return;
  }

  let index = 0;
  let wheelLocked = false;

  // Display the current photo and update the dots.
  function render() {
    img.onerror = () => {
      img.alt = "Image not found. Check the image path.";
    };

    img.src = usableImages[index];
    img.alt = `Photo ${index + 1} of ${usableImages.length}`;

    [...dots.children].forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }

  // Move forward or backward through the photos.
  function changePhoto(direction) {
    if (usableImages.length <= 1) return;

    index =
      (index + direction + usableImages.length) %
      usableImages.length;

    render();
  }

  // Create clickable photo indicator dots.
  usableImages.forEach((image, i) => {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.setAttribute("aria-label", `Show photo ${i + 1}`);

    dot.addEventListener("click", () => {
      index = i;
      render();
    });

    dots.appendChild(dot);
  });

  // Mouse click: left half = previous, right half = next.
  img.onclick = (event) => {
    const bounds = img.getBoundingClientRect();
    const clickedX = event.clientX - bounds.left;

    changePhoto(clickedX < bounds.width / 2 ? -1 : 1);
  };

  // Touchpad: horizontal two-finger swipe / horizontal scroll.
  const popup = container.closest(".modal-backdrop");

popup?.addEventListener("wheel", (event) => {
    if (usableImages.length <= 1) return;

    // Ignore vertical scrolling.
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

    event.preventDefault();

    if (wheelLocked) return;
    wheelLocked = true;

    // Horizontal scroll to the right = next photo.
    // Horizontal scroll to the left = previous photo.
    changePhoto(event.deltaX > 0 ? 1 : -1);

    setTimeout(() => {
      wheelLocked = false;
    }, 400);
  }, { passive: false });

  render();

  // Automatic slideshow: change every 4.5 seconds.
  if (usableImages.length > 1) {
    timers.set(key, setInterval(() => {
      if (!container.closest(".modal-backdrop.open")) {
        stopSlideshow(key);
        return;
      }

      changePhoto(1);
    }, 4500));
  }
}



document.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
    return;
  }

  // Do not change photos while the user is typing.
  if (
    event.target instanceof HTMLElement &&
    (
      event.target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)
    )
  ) {
    return;
  }

  const roomModal = $("#roomModal");
  const academicModal = $("#academicModal");

  let activeModal = null;

  if (roomModal?.classList.contains("open")) {
    activeModal = roomModal;
  } else if (academicModal?.classList.contains("open")) {
    activeModal = academicModal;
  }

  if (!activeModal) return;

  const direction = event.key === "ArrowRight" ? 1 : -1;
  const image = activeModal.querySelector(".slide-image");

  if (!image) return;

  // Use the existing photo's click handler to navigate.
  const rect = image.getBoundingClientRect();

  image.dispatchEvent(new MouseEvent("click", {
    clientX: direction === 1
      ? rect.left + rect.width * 0.75
      : rect.left + rect.width * 0.25,
    clientY: rect.top + rect.height / 2,
    bubbles: true
  }));

  event.preventDefault();
});


// ACADEMIC BLOCK POPUP
function openAcademic() {
  $("#academicDescription").textContent = academicData.description;
  $("#academicDirections").textContent = academicData.directions;

  openModal("academicModal");

  startSlideshow(
    document.querySelector('[data-slideshow="academic"]'),
    academicData.images,
    "academic"
  );
}

$("#academicPin").addEventListener("click", openAcademic);

// Home button.
$("#backHome").addEventListener("click", () => {
  if (history.length > 1) {
    history.back();
  } else {
    location.href = "index.html";
  }
});

// FLOOR PLAN SWITCHING
function showFloor(floor) {
  const info = floorInfo[floor];

  if (!info) return;
    // Show the note only on first and second floors.
  const planHint = $(".plan-hint");

  if (planHint) {
    planHint.classList.toggle("hidden", floor === "ground");
  }

  $("#floorTitle").textContent = info.title;
  $("#floorSvg").src = info.svg;
  $("#floorSvg").alt = `${info.title} AutoCAD floor plan`;

  const layer = $("#roomHotspots");
  layer.innerHTML = "";

  floorHotspots[floor].forEach(([name, x, y, w, h]) => {
    const button = document.createElement("button");

    button.className = "room-hotspot";
    button.type = "button";
    button.textContent = name;
    button.title = `Open ${name}`;

    button.style.left = x + "%";
    button.style.top = y + "%";
    button.style.width = w + "%";
    button.style.height = h + "%";

    button.setAttribute("aria-label", `Open details for ${name}`);

    button.addEventListener("click", () => {
      openRoom(name, floor);
    });

    layer.appendChild(button);
  });

  if (!$("#floorModal").classList.contains("open")) {
  openModal("floorModal");
}

// Reset zoom whenever a floor is opened.
floorZoom = 1;
applyFloorZoom();

const viewport = $(".floor-map-viewport");

if (viewport) {
  viewport.scrollTo({ left: 0, top: 0 });
}
}


/* ---------- GLOBAL ROOM SEARCH ---------- */

const searchInput = $("#globalRoomSearch");
const searchResults = $("#globalSearchResults");

// Search room names across all three floors.
function searchAllRooms(query) {
  const searchText = query.trim().toLowerCase();

  if (!searchInput || !searchResults) return;

  searchResults.innerHTML = "";

  // Hide results when the search field is empty.
  if (!searchText) {
    searchResults.hidden = true;
    return;
  }

  const matches = [];

  // Check the room names on every floor.
  Object.entries(floorHotspots).forEach(([floor, rooms]) => {
    rooms.forEach(([name]) => {
      if (name.toLowerCase().includes(searchText)) {
        matches.push({ name, floor });
      }
    });
  });

  // Display a message when no rooms match.
  if (matches.length === 0) {
    const message = document.createElement("div");

    message.className = "global-search-empty";
    message.textContent = "No matching rooms found.";

    searchResults.appendChild(message);
    searchResults.hidden = false;
    return;
  }

  // Create one clickable result for every matching room.
  matches.forEach(({ name, floor }) => {
    const resultButton = document.createElement("button");

    resultButton.type = "button";
    resultButton.className = "global-search-result";
    resultButton.setAttribute("role", "option");

    const roomName = document.createElement("span");
    roomName.textContent = name;

    const floorLabel = document.createElement("span");
    floorLabel.className = "search-floor-label";
    floorLabel.textContent = floorInfo[floor].title;

    resultButton.append(roomName, floorLabel);

    // Open the correct floor and then the selected room.
    resultButton.addEventListener("click", () => {
      showFloor(floor);
      openRoom(name, floor);

      // Clear the search field and close the results.
      searchInput.value = "";
      searchResults.innerHTML = "";
      searchResults.hidden = true;
    });

    searchResults.appendChild(resultButton);
  });

  searchResults.hidden = false;
}

// Activate search whenever the user types.
if (searchInput && searchResults) {

  searchInput.addEventListener("input", () => {
    searchAllRooms(searchInput.value);
  });

  // Show results again when the user focuses on the search field.
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim()) {
      searchAllRooms(searchInput.value);
    }
  });

  // Close results when clicking outside the search area.
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".global-room-search")) {
      searchResults.hidden = true;
    }
  });

}


// ---------- FLOOR PLAN ZOOM BUTTONS ----------

$("#zoomIn").addEventListener("click", () => {
  floorZoom = Math.min(
    floorZoom + FLOOR_ZOOM_STEP,
    MAX_FLOOR_ZOOM
  );

  applyFloorZoom();
});

$("#zoomOut").addEventListener("click", () => {
  floorZoom = Math.max(
    floorZoom - FLOOR_ZOOM_STEP,
    MIN_FLOOR_ZOOM
  );

  applyFloorZoom();
});

$("#zoomReset").addEventListener("click", () => {
  floorZoom = 1;
  applyFloorZoom();

  const viewport = $(".floor-map-viewport");

  if (viewport) {
    viewport.scrollTo({ left: 0, top: 0 });
  }
});

// These buttons are in both the building and floor popups.
document.querySelectorAll("[data-floor]").forEach(button => {
  button.addEventListener("click", () => {
    showFloor(button.dataset.floor);
  });
});

// ROOM INFORMATION POPUP
function openRoom(name, floor) {
  const data = roomData[name] || {
    description: "Add this room's description in the roomData object.",
    directions: "Add directions in the roomData object.",
    images: []
  };

  $("#roomTitle").textContent = name;
  $("#roomFloorEyebrow").textContent =
    floorInfo[floor].title.toUpperCase();

  $("#roomDescription").textContent = data.description;
  $("#roomDirections").textContent = data.directions;

  openModal("roomModal");

  startSlideshow(
    document.querySelector('[data-slideshow="room"]'),
    data.images,
    "room"
  );
}
