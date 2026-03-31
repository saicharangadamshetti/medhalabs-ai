"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTool = exports.geminiTools = exports.openAiTools = exports.checkPropertyAvailability = exports.searchProperties = exports.getUserProfile = void 0;
const database_1 = require("./database");
const getUserProfile = (phoneOrName) => {
    console.log(`[TOOL CALL] getUserProfile - input: ${phoneOrName}`);
    const user = database_1.MockUsers.find(u => u.phone === phoneOrName || u.name.toLowerCase() === phoneOrName.toLowerCase());
    return user || null;
};
exports.getUserProfile = getUserProfile;
const searchProperties = (location, maxBudget, bhk) => {
    console.log(`[TOOL CALL] searchProperties - loc: ${location}, budget: ${maxBudget}, bhk: ${bhk}`);
    let results = database_1.MockProperties;
    if (location) {
        results = results.filter(p => p.location.toLowerCase() === location.toLowerCase());
    }
    if (maxBudget) {
        results = results.filter(p => p.price <= maxBudget);
    }
    if (bhk) {
        results = results.filter(p => p.bhk >= bhk);
    }
    return results;
};
exports.searchProperties = searchProperties;
const checkPropertyAvailability = (propertyIdOrTitle) => {
    console.log(`[TOOL CALL] checkPropertyAvailability - input: ${propertyIdOrTitle}`);
    const property = database_1.MockProperties.find(p => p.id === propertyIdOrTitle || p.title.toLowerCase().includes(propertyIdOrTitle.toLowerCase()));
    return property || null;
};
exports.checkPropertyAvailability = checkPropertyAvailability;
// Tool schemas for Gemini and OpenAI
exports.openAiTools = [
    {
        type: "function",
        name: "getUserProfile",
        description: "Fetch a user's profile and preferences using their mobile phone number or name.",
        parameters: {
            type: "object",
            properties: {
                phoneOrName: { type: "string", description: "The phone number (e.g. +91...) or name of the user." }
            },
            required: ["phoneOrName"]
        }
    },
    {
        type: "function",
        name: "searchProperties",
        description: "Search for available properties based on criteria.",
        parameters: {
            type: "object",
            properties: {
                location: { type: "string", description: "The preferred Indian city/location (e.g., hyderabad, bengaluru, mumbai)." },
                maxBudget: { type: "number", description: "The maximum budget in Indian Rupees (INR)." },
                bhk: { type: "number", description: "The desired number of bedrooms/BHK (e.g., 2, 3, 4)." }
            }
        }
    },
    {
        type: "function",
        name: "checkPropertyAvailability",
        description: "Check the status and details of a specific property in the portfolio.",
        parameters: {
            type: "object",
            properties: {
                propertyIdOrTitle: { type: "string", description: "The ID or title of the property to check." }
            },
            required: ["propertyIdOrTitle"]
        }
    }
];
exports.geminiTools = [
    {
        name: "getUserProfile",
        description: "Fetch a user's profile and preferences using their mobile phone number or name.",
        parameters: {
            type: "OBJECT",
            properties: {
                phoneOrName: { type: "STRING", description: "The phone number (e.g. +91...) or name of the user." }
            },
            required: ["phoneOrName"]
        }
    },
    {
        name: "searchProperties",
        description: "Search for available properties based on criteria.",
        parameters: {
            type: "OBJECT",
            properties: {
                location: { type: "STRING", description: "The preferred Indian city/location (e.g., hyderabad, bengaluru, mumbai)." },
                maxBudget: { type: "NUMBER", description: "The maximum budget in Indian Rupees (INR)." },
                bhk: { type: "NUMBER", description: "The desired number of bedrooms/BHK (e.g., 2, 3, 4)." }
            }
        }
    },
    {
        name: "checkPropertyAvailability",
        description: "Check the status and details of a specific property in the portfolio.",
        parameters: {
            type: "OBJECT",
            properties: {
                propertyIdOrTitle: { type: "STRING", description: "The ID or title of the property to check." }
            },
            required: ["propertyIdOrTitle"]
        }
    }
];
const executeTool = (name, args) => {
    switch (name) {
        case "getUserProfile":
            return (0, exports.getUserProfile)(args.phoneOrName);
        case "searchProperties":
            // Depending on the arg names passed (handling both bedrooms or bhk if standard)
            const bhkValue = args.bhk || args.bedrooms;
            return (0, exports.searchProperties)(args.location, args.maxBudget, bhkValue);
        case "checkPropertyAvailability":
            return (0, exports.checkPropertyAvailability)(args.propertyIdOrTitle);
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
};
exports.executeTool = executeTool;
