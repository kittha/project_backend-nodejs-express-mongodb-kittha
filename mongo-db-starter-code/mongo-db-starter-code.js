// Installation
// read readme.txt first
// `npm install mongodb`
// `node mongo-db-starter-code.js`

// Connect to MongoDB (use your connection string)
const { MongoClient } = require('mongodb');
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

async function createMockData() {
    try {
        await client.connect();
        const database = client.db('practice-mongo');

        // Clear existing collections
        await database.collection('questions').deleteMany({});
        await database.collection('answers').deleteMany({});
        await database.collection('question_votes').deleteMany({});
        await database.collection('answer_votes').deleteMany({});

        // Insert sample questions
        const questions = [];
        const categories = ['technology', 'cuisine', 'travelling', 'science', 'literature', 'music', 'sports', 'movies', 'history', 'miscellaneous'];
        for (let i = 1; i <= 100; i++) {
            const category = categories[i % 10];
            questions.push({
                title: `Question Title ${i} about ${category}`,
                description: `This is a detailed description for question ${i}. It covers various aspects of ${category}.`,
                category: category,
                created_at: new Date(),
                updated_at: new Date()
            });
        }
        const questionResult = await database.collection('questions').insertMany(questions);
        
        // Insert sample answers
        const answers = [];
        for (let i = 1; i <= 100; i++) {
            const question_id = questionResult.insertedIds[Math.floor(Math.random() * 100)];
            answers.push({
                question_id: question_id,
                content: `Answer ${i} content goes here. It provides an in-depth explanation about ${categories[i % 10]}.`,
                created_at: new Date(),
                updated_at: new Date()
            });
        }
        const answerResult = await database.collection('answers').insertMany(answers);

        // Insert sample question votes
        const question_votes = [];
        for (let i = 1; i <= 200; i++) {
            const question_id = questionResult.insertedIds[Math.floor(Math.random() * 100)];
            question_votes.push({
                question_id: question_id,
                vote: Math.random() > 0.5 ? 1 : -1,
                created_at: new Date(),
                updated_at: new Date()
            });
        }
        await database.collection('question_votes').insertMany(question_votes);

        // Insert sample answer votes
        const answer_votes = [];
        for (let i = 1; i <= 200; i++) {
            const answer_id = answerResult.insertedIds[Math.floor(Math.random() * 100)];
            answer_votes.push({
                answer_id: answer_id,
                vote: Math.random() > 0.5 ? 1 : -1,
                created_at: new Date(),
                updated_at: new Date()
            });
        }
        await database.collection('answer_votes').insertMany(answer_votes);

        console.log("Sample data inserted successfully");
    } finally {
        await client.close();
    }
}

createMockData().catch(console.dir);
