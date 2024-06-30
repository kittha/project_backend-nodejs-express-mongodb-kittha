# Questions and Answers API

This API provides endpoints to manage questions and answers, allowing users to create, retrieve, update, and delete questions, as well as interact with answers by upvoting or downvoting.

## Technologies Used

This backend project is built using Node.js and Express for robust server-side JavaScript development. Here's why these technologies were chosen:

- Node.js: Chosen for its asynchronous and event-driven architecture, ideal for handling multiple concurrent requests efficiently.
- Express: Selected for its minimalistic yet powerful framework that simplifies routing, middleware management, and handling HTTP requests.
- MongoDB: Chosen for its robust non-relational database capabilities, MongoDB stores questions, answers, and user data, ensuring flexibility and scalability to effortlessly manage large datasets.
- Rate Limiting Middleware: Custom rate limiting middleware is implemented to mitigate abuse and ensure fair usage of the API.
- JWT Authorization: Implemented for securing endpoints, ensuring that only authenticated users can access certain routes.
- Swagger: Integrated for API documentation, providing clear and interactive documentation for developers consuming the API.

## Table of content:

- [Endpoints](#item-one)
  - [Get all questions](#item-two)
  - [Create a new question](#item-three)
  - [Create an answer for a question](#item-four)
  - [Upvote a question](#item-five)
  - [Downvote a question](#item-six)
  - [Get a question by ID](#item-seven)
  - [Update a question by ID](#item-eight)
  - [Delete a question by ID](#item-nine)
  - [Upvote an answer](#item-ten)
  - [Downvote an answer](#item-eleven)
  - [Get answer by ID](#item-twelve)
  - [Update answer by ID](#item-thirteen)
  - [Delete answer by ID](#item-fourteen)
- [Schemas](#item-fifteen)
  - [Question Schema](#item-sixteen)
  - [Answer Schema](#item-seventeen)
- [Installation](#item-eighteen)
- [Usage](#item-nineteen)

<a id="item-one"></a>

## Endpoints

<a id="item-two"></a>

### Get All Questions

- **GET** `/questions`

  Retrieve a list of all questions.

  **Parameters:**

  - `title`: (optional) Title to filter questions
  - `category`: (optional) Category to filter questions

  **Responses:**

  - `200 OK`: A list of questions
  - `404 Not Found`: Questions not found
  - `500 Internal Server Error`: Server error

<a id="item-three"></a>

### Create a new question

- **POST** `/questions`

  Create a new question.

  **Request Body:**

```json
{
  "title": "Example Question",
  "description": "This is an example question.",
  "category": "Example Category"
}
```

**Responses:**

- `201 Created`: Question created successfully
- `500 Internal Server Error`: Server error

  <a id="item-four"></a>

### Create an answer for a question

- **POST** `/questions/{id}/answers`

  Create an answer for a specific question identified by ID.

  **Path Parameter:**

  - `id`: ID of the question to which the answer belongs

  **Request Body:**

```json
{
  "content": "This is an example answer."
}
```

**Responses:**

- `201 Created`: Answer created successfully
- `400 Bad Request`: Missing or invalid request data
- `404 Not Found`: Question not found
- `500 Internal Server Error`: Server error

<a id="item-five"></a>

### Upvote a question

- **POST** `/questions/{id}/upvote`

  Upvote a specific question identified by ID.

  **Path Parameter:**

  - `id`: ID of the question to upvote

  **Responses:**

- `200 OK`: Successfully upvoted the question
- `404 Not Found`: Question not found
- `500 Internal Server Error`: Server error

<a id="item-six"></a>

### Downvote a question

- **POST** `/questions/{id}/downvote`

  Downvote a specific question identified by ID.

  **Path Parameter:**

  - `id`: ID of the question to downvote

  **Responses:**

- `200 OK`: Successfully downvoted the question
- `404 Not Found`: Question not found
- `500 Internal Server Error`: Server error

<a id="item-seven"></a>

### Get a question by ID

- **GET** `/questions/{id}`

  Retrieve a question by its ID.

  **Path Parameter:**

  - `id`: ID of the question to retrieve

  **Responses:**

- `200 OK`: A single question
- `404 Not Found`: Question not found
- `500 Internal Server Error`: Server error

<a id="item-eight"></a>

### Update a question by ID

- **PUT** `/questions/{id}`

  Update a question by its ID.

  **Path Parameter:**

  - `id`: ID of the question to update
    **Request Body:**

```json
{
  "title": "Updated Question Title",
  "description": "Updated question description.",
  "category": "Updated Category"
}
```

**Responses:**

- `200 OK`: Question updated successfully
- `404 Not Found`: Question not found
- `500 Internal Server Error`: Server error

<a id="item-nine"></a>

### Delete a question by ID

- **DELETE** `/questions/{id}`

  Delete a question by its ID.

  **Path Parameter:**

  - `id`: ID of the question to delete

  **Responses:**

- `200 OK`: Question deleted successfully
- `404 Not Found`: Question not found
- `500 Internal Server Error`: Server error

<a id="item-ten"></a>

### Upvote an answer

- **POST** `/answers/{id}/upvote`

  Upvote a specific answer identified by ID.

  **Path Parameter:**

  - `id`: ID of the answer to upvote

  **Responses:**

- `200 OK`: Successfully upvoted the answer
- `404 Not Found`: Answer not found
- `500 Internal Server Error`: Server error

<a id="item-eleven"></a>

### Downvote an answer

- **POST** `/answers/{id}/downvote`

  Downvote a specific answer identified by ID.

  **Path Parameter:**

  - `id`: ID of the answer to downvote

  **Responses:**

- `200 OK`: Successfully downvoted the answer
- `404 Not Found`: Answer not found
- `500 Internal Server Error`: Server error

<a id="item-twelve"></a>

### Get answer by ID

- **GET** `/answers/{id}`

  Retrieve an answer by its ID.

  **Path Parameter:**

  - `id`: ID of the answer to retrieve

  **Responses:**

- `200 OK`: Successfully retrieved the answer
- `404 Not Found`: Answer not found
- `500 Internal Server Error`: Server error

<a id="item-thirteen"></a>

### Update answer by ID

- **PUT** `/answers/{id}`

  Update an answer by its ID.

  **Path Parameter:**

  - `id`: ID of the answer to update

  **Request Body:**

```json
{
  "content": "This is an example answer."
}
```

**Responses:**

- `200 OK`: Answer updated successfully
- `404 Not Found`: Answer not found
- `500 Internal Server Error`: Server error

<a id="item-fourteen"></a>

### Delete answer by ID

- **DELETE** `/answers/{id}`

  Delete an answer by its ID.

  **Path Parameter:**

  - `id`: ID of the answer to delete

  **Responses:**

- `200 OK`: Answer deleted successfully
- `404 Not Found`: Answer not found
- `500 Internal Server Error`: Server error

<a id="item-fifteen"></a>

## Schemas

<a id="item-sixteen"></a>

### Question Schema

#### Question

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "created_at": "string (date-time)",
  "updated_at": "string (date-time)"
}
```

#### QuestionCreateUpdate

```json
{
  "title": "string",
  "description": "string",
  "category": "string"
}
```

#### QuestionWithUpvoteDownvote

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "created_at": "string (date-time)",
  "updated_at": "string (date-time)",
  "upvotes": "integer",
  "downvotes": "integer"
}
```

<a id="item-seventeen"></a>

### Answer Schema

#### Answer

```json
{
  "id": "string",
  "question_id": "string",
  "content": "string",
  "created_at": "string (date-time)",
  "updated_at": "string (date-time)"
}
```

#### AnswerCreateUpdate

```json
{
  "content": "string"
}
```

#### AnswerWithUpvoteDownvote

```json
{
  "id": "string",
  "question_id": "string",
  "content": "string",
  "created_at": "string (date-time)",
  "updated_at": "string (date-time)",
  "upvotes": "integer",
  "downvotes": "integer"
}
```

<a id="item-eighteen"></a>

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-directory>
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables as required (database connection, etc.).
4. Start the server:

```bash
npm start
```

<a id="item-nineteen"></a>

## Usage

Ensure the server is running after installation. Use a tool like Postman, Swagger or curl to interact with the API endpoints as documented.
