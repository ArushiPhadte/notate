console.log("YouTube Notes: Extension loaded!");

// Global variables 
let showAllNotes = false; //state of showing notes 
let allNotes = []; //array to hold the notes 
let currentUrl = window.location.href; 

addPanel();
startWatchingVideo();

// adding the panel for notes
function addPanel() {

    if (document.getElementById("notes-panel")) return;
    
    const panel = document.createElement("div");
    panel.id = "notes-panel";
    
    // panel design
    panel.style.position = "fixed";
    panel.style.top = "20px";
    panel.style.right = "20px";
    panel.style.width = "300px";
    panel.style.height = "400px";
    panel.style.backgroundColor = "white";
    panel.style.border = "2px solid #ffae00e0";
    panel.style.borderRadius = "10px";
    panel.style.padding = "15px";
    panel.style.zIndex = "10000";
    panel.style.boxShadow = "0 5px 15px rgba(7, 9, 31, 0.3)";
    panel.style.fontFamily = "Arial, sans-serif";

    // Add title
    const title = document.createElement("h3");
    title.textContent = "NOTATE";
    title.style.margin = "0 0 20px 0";
    title.style.color = "#ffae00e0";
    panel.appendChild(title);

    // Add current time display
    const timeDisplay = document.createElement("div");
    timeDisplay.id = "current-time";
    timeDisplay.textContent = "Time: 0:00";
    timeDisplay.style.fontSize = "14px";
    timeDisplay.style.color = "#444444ff";
    timeDisplay.style.marginBottom = "10px";
    panel.appendChild(timeDisplay);

    // Add text input for notes
    const noteInput = document.createElement("textarea");
    noteInput.id = "note-text-input";
    noteInput.placeholder = "Write your note here...";
    noteInput.style.width = "100%";
    noteInput.style.height = "60px";
    noteInput.style.border = "1px solid #444444ff";
    noteInput.style.borderRadius = "5px";
    noteInput.style.padding = "8px";
    noteInput.style.fontSize = "14px";
    noteInput.style.resize = "none";
    noteInput.style.boxSizing = "border-box";
    panel.appendChild(noteInput);

    // Add save button
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save Your Note?";
    saveButton.style.backgroundColor = "#ffae00e0";
    saveButton.style.color = "white";
    saveButton.style.border = "none";
    saveButton.style.padding = "8px 15px";
    saveButton.style.borderRadius = "5px";
    saveButton.style.cursor = "pointer";
    saveButton.style.marginTop = "8px";
    saveButton.style.marginRight = "5px";
    panel.appendChild(saveButton);

    // Add toggle button
    const toggleButton = document.createElement("button");
    toggleButton.textContent = "Show All";
    toggleButton.id = "toggle-notes-button";
    toggleButton.style.backgroundColor = "#333";
    toggleButton.style.color = "white";
    toggleButton.style.border = "none";
    toggleButton.style.padding = "8px 15px";
    toggleButton.style.borderRadius = "5px";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.marginTop = "8px";
    panel.appendChild(toggleButton);

    // Add notes display area
    const notesArea = document.createElement("div");
    notesArea.id = "notes-display-area";
    notesArea.style.marginTop = "15px";
    notesArea.style.height = "200px";
    notesArea.style.overflowY = "scroll";
    notesArea.style.border = "1px solid #ddd";
    notesArea.style.borderRadius = "5px";
    notesArea.style.padding = "10px";
    notesArea.style.backgroundColor = "#ffe285ff";
    panel.appendChild(notesArea);

    // Add panel to page
    document.body.appendChild(panel);

    // Set up button clicks
    saveButton.onclick = function() {
        saveCurrentNote();
    };

    toggleButton.onclick = function() {
        toggleNotesView();
    };

    console.log("Note panel created successfully!");
    
    // Load existing notes
    loadNotesFromStorage();
}

// ------------------- SAVE A NOTE -------------------
function saveCurrentNote() {
    const video = document.querySelector("video");
    const noteText = document.getElementById("note-text-input").value.trim();

    // Check if there's a video playing
    if (!video) {
        alert("No video found! You must be on a YouTube video page.");
        return;
    }

    // Check if note text is empty
    if (noteText === "") {
        alert("Please write something before saving!");
        return;
    }

    // Get current video time
    const currentTime = video.currentTime;
    const videoUrl = window.location.href;

    // Create note object
    const newNote = {
        text: noteText,
        timestamp: currentTime,
        url: videoUrl,
        dateCreated: new Date().toISOString()
    };

    console.log("Saving note:", newNote);

    // Add to our notes array
    allNotes.push(newNote);

    // Save to Chrome storage
    chrome.storage.local.set({ youtubeNotes: allNotes }, function() {
        console.log("Note saved to storage!");
        
        // Clear the input
        document.getElementById("note-text-input").value = "";
        
        // Refresh the display
        displayNotes();
    });
}

// ------------------- LOAD NOTES FROM STORAGE -------------------
function loadNotesFromStorage() {
    chrome.storage.local.get(["youtubeNotes"], function(result) {
        if (result.youtubeNotes) {
            allNotes = result.youtubeNotes;
            console.log("Loaded " + allNotes.length + " notes from storage");
        } else {
            allNotes = [];
            console.log("No existing notes found");
        }
        displayNotes();
    });
}

// ------------------- TOGGLE BETWEEN SHOWING ALL NOTES OR CURRENT -------------------
function toggleNotesView() {
    const toggleButton = document.getElementById("toggle-notes-button");
    
    if (showAllNotes == true) {
        // Switch to showing current note only
        showAllNotes = false;
        toggleButton.textContent = "Show All";
    } else {
        // Switch to showing all notes
        showAllNotes = true;
        toggleButton.textContent = "Current Only";
    }
    
    console.log("Toggled view. Show all notes:", showAllNotes);
    displayNotes();
}

// ------------------- DISPLAY NOTES -------------------
function displayNotes() {
    const notesArea = document.getElementById("notes-display-area");
    const currentUrl = window.location.href;
    
    // Filter notes for this video only
    const videoNotes = allNotes.filter(function(note) {
        return note.url === currentUrl;
    });

    // Clear the display area
    notesArea.innerHTML = "";

    //if no notes
    if (videoNotes.length === 0) {
        notesArea.innerHTML = "<div style='text-align: center; color: #999; padding: 20px;'>📝 No notes yet!<br>Create your first note above.</div>";
        return;
    }

    if (showAllNotes == true) {
        // Show all notes for this video
        console.log("Displaying all " + videoNotes.length + " notes");
        
        // Sort notes by timestamp
        videoNotes.sort(function(a, b) {
            return a.timestamp - b.timestamp;
        });

        for (let i = 0; i < videoNotes.length; i++) {
            createNoteElement(videoNotes[i], notesArea);
        }
    } else {
        // Show only the current note (the one that matches current video time)
        const video = document.querySelector("video");
        if (video) {
            const currentTime = video.currentTime;
            const currentNote = findCurrentNote(videoNotes, currentTime);
            
            if (currentNote) {
                console.log("Displaying current note:", currentNote.text);
                createNoteElement(currentNote, notesArea);
            } else {
                notesArea.innerHTML = "<div style='text-align: center; color: #999; padding: 20px;'>⏰ No note for current time</div>";
            }
        }
    }
}

// ------------------- FIND THE RIGHT NOTE FOR CURRENT TIME -------------------
function findCurrentNote(notes, currentTime) {
    let bestNote = null;
    let bestTimeDifference = Infinity;

    // Look through all notes to find the best match
    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const timeDifference = Math.abs(note.timestamp - currentTime);
        
        // We want notes that are at or before the current time, within 30 seconds
        if (note.timestamp <= currentTime && timeDifference <= 30) {
            if (timeDifference < bestTimeDifference) {
                bestNote = note;
                bestTimeDifference = timeDifference;
            }
        }
    }

    return bestNote;
}

// ------------------- CREATE A NOTE ELEMENT -------------------
function createNoteElement(note, container) {
    const noteDiv = document.createElement("div");
    noteDiv.style.marginBottom = "10px";
    noteDiv.style.padding = "10px";
    noteDiv.style.backgroundColor = "white";
    noteDiv.style.border = "1px solid #ddd";
    noteDiv.style.borderRadius = "5px";
    noteDiv.style.borderLeft = "4px solid #ffa600ff";

    // Add timestamp (clickable to jump to that time)
    const timeSpan = document.createElement("div");
    timeSpan.textContent = formatTime(note.timestamp);
    timeSpan.style.fontSize = "12px";
    timeSpan.style.color = "#ffa600ff";
    timeSpan.style.fontWeight = "bold";
    timeSpan.style.cursor = "pointer";
    timeSpan.style.marginBottom = "5px";
    
    // When clicked, jump to that time in video
    timeSpan.onclick = function() {
        const video = document.querySelector("video");
        if (video) {
            video.currentTime = note.timestamp;
            console.log("Jumped to time:", formatTime(note.timestamp));
        }
    };

    // Add note text
    const textDiv = document.createElement("div");
    textDiv.textContent = note.text;
    textDiv.style.fontSize = "14px";
    textDiv.style.lineHeight = "1.4";

    noteDiv.appendChild(timeSpan);
    noteDiv.appendChild(textDiv);
    container.appendChild(noteDiv);
}

// ------------------- WATCH THE VIDEO FOR TIME CHANGES -------------------
function startWatchingVideo() {
    console.log("Starting to watch video for time changes...");
    
    setInterval(function() {
        // Update current time display and check for current notes
        const video = document.querySelector("video");
        const timeDisplay = document.getElementById("current-time");
        
        if (video && timeDisplay) {
            timeDisplay.textContent = "Time: " + formatTime(video.currentTime);
            
            // If we're in "current only" mode, update the display
            if (showAllNotes == false) {
                displayNotes();
            }
        }
        
        // Also check for YouTube navigation
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            setTimeout(function() {
                if (!document.getElementById("notes-panel")) {
                    addPanel();
                    startWatchingVideo();
                }
            }, 2000);
        }
    }, 1000);
}

// ------------------- HELPER FUNCTION TO FORMAT TIME -------------------
function formatTime(seconds) {

    seconds = Math.floor(seconds);

    // Calculate minutes
    let minutes = Math.floor(seconds / 60);

    // Calculate remaining seconds
    let remainingSeconds = seconds % 60;

    // Make seconds always two digits
    if (remainingSeconds < 10) {
        remainingSeconds = "0" + remainingSeconds;
    }

    // Combine minutes and seconds with a colon
    let timeString = minutes + ":" + remainingSeconds;

    return timeString;
}

addPanel()