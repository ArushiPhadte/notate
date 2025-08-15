console.log("Notate: content script loaded");

// adding the panel for notes
function addPanel() {
    if (document.getElementById("note-panel")) return;

    const panel = document.createElement("div");
    panel.id = "note-panel"; 

    // panel design
    panel.style.position = "fixed";       // ← crucial to make bottom/right work
    panel.style.top = "10px";
    panel.style.right = "10px";
    panel.style.background = "white";
    panel.style.padding = "10px";
    panel.style.border = "1px solid black";
    panel.style.zIndex = "9999";          // ensures it appears on top
    panel.style.width = "200px";       // optional width
    panel.style.height = "100px";      // optional height
    panel.style.overflow = "auto";     // scroll if content grows
    panel.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)"; // subtle shadow for visibility

    // create textarea for note input
    const textarea = document.createElement("textarea");
    textarea.id = "note-input";
    textarea.placeholder = "Take a note...";
    textarea.style.width = "100%";  // fill panel width
    textarea.style.height = "50px"; // reasonable height
    textarea.style.boxSizing = "border-box"; // ensures padding doesn't overflow
    panel.appendChild(textarea);

    // create save button
    const saveBtn = document.createElement("button");
    saveBtn.id = "save-note";
    saveBtn.textContent = "Save Your Note?";
    saveBtn.style.marginTop = "5px";
    panel.appendChild(saveBtn);

    saveBtn.addEventListener("click", () => {
        const noteText = textarea.value;
        console.log("Saved note:", noteText);
        alert("Saved note: " + noteText); // temporary visual feedback
    });

    document.body.appendChild(panel);
    console.log("Added Panel");
}

addPanel();