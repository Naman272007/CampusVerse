
const googleFormLink = document.getElementById("googleFormLink");

const formNote = document.getElementById("formNote");

googleFormLink.addEventListener("click", function(event) {

    const formURL = googleFormLink.href;

    // Check whether the actual Google Form link is added.

    if (formURL.includes("REPLACE_WITH_YOUR_FORM_ID")) {

        event.preventDefault();

        formNote.textContent =
            "Google Form link has not been added yet. Please configure it first.";

        return;
    }

    formNote.textContent =
        "Google Feedback Form opened in a new tab. Thank you for participating!";

});
