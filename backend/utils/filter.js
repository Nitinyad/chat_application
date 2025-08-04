// const axios = require("axios");
// // const Filter = require("bad-words");

// // import Filter from "bad-words";
// let Filter;

// const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;
// const PERSPECTIVE_URL = "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze";

// const filter = new Filter();

// // Check message using bad-words
// function isProfane(text) {
//     return filter.isProfane(text);
// }

// // Check message using Google Perspective API
// async function isToxic(text) {
//     try {
//         const response = await axios.post(PERSPECTIVE_URL, {
//             comment: { text },
//             languages: ["en"],
//             requestedAttributes: { TOXICITY: {} }
//         }, { params: { key: PERSPECTIVE_API_KEY } });

//         return response.data.attributeScores.TOXICITY.summaryScore.value > 0.7;
//     } catch (error) {
//         console.error("Error analyzing message:", error);
//         return false;
//     }
// }

// module.exports = { isProfane, isToxic };
const axios = require("axios");

const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;
const PERSPECTIVE_URL = "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze";

let filter = null;

async function getFilter() {
    if (!filter) {
        const badWords = await import("bad-words");
        const Filter = badWords.Filter;
        filter = new Filter();
    }
    return filter;
}

async function isProfane(text) {
    const filterInstance = await getFilter();
    return filterInstance.isProfane(text);
}

async function isToxic(text) {
    try {
        const response = await axios.post(PERSPECTIVE_URL, {
            comment: { text },
            languages: ["en"],
            requestedAttributes: { TOXICITY: {} }
        }, {
            params: { key: PERSPECTIVE_API_KEY }
        });

        return response.data.attributeScores.TOXICITY.summaryScore.value > 0.7;
    } catch (error) {
        console.error("Error analyzing message:", error);
        return false;
    }
}

module.exports = { isProfane, isToxic };
