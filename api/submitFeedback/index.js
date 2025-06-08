const { v4: uuidv4 } = require('uuid'); // Import uuid for unique ID generation

module.exports = async function (context, req) {
    context.log('HTTP triggered feedback function processed a request.');

    const feedbackData = req.body; // Get the JSON data from the request body

    // 1. Basic Input Validation
    if (typeof feedbackData === 'undefined' || typeof feedbackData.isClear !== 'boolean') {
        context.res = {
            status: 400,
            body: { message: "Please provide valid feedback data (e.g., { isClear: true })." }
        };
        return;
    }

    // Prepare entity for Azure Table Storage
    // PartitionKey helps organize data. RowKey must be unique within a PartitionKey.
    // We use a GUID (UUIDv4) to ensure uniqueness for each feedback entry.
    const feedbackEntity = {
        PartitionKey: "Feedback",     // A static partition key for all feedback entries
        RowKey: uuidv4(),             // Unique identifier for each specific feedback entry
        IsClear: feedbackData.isClear,
        Suggestions: feedbackData.suggestions || "", // Store empty string if no suggestions
        Timestamp: new Date().toISOString() // Add a timestamp for when feedback was received
    };

    // Output binding for Azure Table Storage
    // The data assigned to context.bindings.outputTable will be automatically written
    // to the 'ResumeFeedback' table using the connection string defined in MY_STORAGE_CONNECTION_STRING.
    context.bindings.outputTable = feedbackEntity;

    context.res = {
        status: 200,
        body: { message: "Feedback submitted successfully!" }
    };
    context.log('Feedback successfully stored in Table Storage.');
};