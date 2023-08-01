# Natours API Documentation

Welcome to the Natours API documentation! This API provides endpoints to interact with the Natours application, which is a platform for booking nature tours and adventures.

## Base URL for Local Development

Before you start using the API, make sure you have the server up and running on your local machine. Use the following base URL for local development:

Base URL: `http://127.0.0.1:3000/`

## Authentication

The Natours API uses token-based authentication. To access most of the endpoints, you will need to include an access token in the headers of your requests. Obtain an access token by registering as a user and then logging in. The access token will be included in the response after successful login.

Include the access token in your requests as follows:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Endpoints

### 1. Users

#### Register a new user

- URL: `/api/v1/users/signup`
- Method: `POST`
- Description: Register a new user with the Natours platform.
- Request Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "your_password",
  "passwordConfirm": "your_password"
}
```

#### Login

- URL: `/api/v1/users/login`
- Method: `POST`
- Description: Log in an existing user and obtain an access token.
- Request Body:

```json
{
  "email": "john@example.com",
  "password": "your_password"
}
```

#### Get Current User

- URL: `/api/v1/users/me`
- Method: `GET`
- Description: Get information about the currently logged-in user.
- Authorization: Required (Include access token in headers)

### 2. Tours

#### Get All Tours

- URL: `/api/v1/tours`
- Method: `GET`
- Description: Get a list of all available tours.

#### Get Single Tour

- URL: `/api/v1/tours/:tourId`
- Method: `GET`
- Description: Get detailed information about a specific tour.

#### Create a Tour

- URL: `/api/v1/tours`
- Method: `POST`
- Description: Create a new tour.
- Authorization: Required (Include access token in headers)
- Request Body:

```json
{
  "name": "Tour Name",
  "duration": 7,
  "maxGroupSize": 12,
  "difficulty": "medium",
  "price": 1499.99,
  "summary": "Tour summary",
  "description": "Tour description",
  "imageCover": "tour-cover.jpg",
  "images": ["image1.jpg", "image2.jpg"],
  "startDates": ["2023-09-01", "2023-10-01"],
  "startLocation": {
    "type": "Point",
    "coordinates": [-74.006, 40.7128],
    "address": "New York City, NY"
  },
  "locations": [
    {
      "type": "Point",
      "coordinates": [-122.4194, 37.7749],
      "address": "San Francisco, CA"
    },
    {
      "type": "Point",
      "coordinates": [-118.2437, 34.0522],
      "address": "Los Angeles, CA"
    }
  ]
}
```

#### Update a Tour

- URL: `/api/v1/tours/:tourId`
- Method: `PATCH`
- Description: Update information for an existing tour.
- Authorization: Required (Include access token in headers)
- Request Body: (Include only the fields you want to update)

```json
{
  "name": "New Tour Name",
  "price": 1699.99,
  "description": "Updated tour description"
}
```

#### Delete a Tour

- URL: `/api/v1/tours/:tourId`
- Method: `DELETE`
- Description: Delete a tour.
- Authorization: Required (Include access token in headers)

### 3. Reviews

#### Get All Reviews for a Tour

- URL: `/api/v1/tours/:tourId/reviews`
- Method: `GET`
- Description: Get all the reviews for a specific tour.

#### Create a Review

- URL: `/api/v1/tours/:tourId/reviews`
- Method: `POST`
- Description: Create a new review for a tour.
- Authorization: Required (Include access token in headers)
- Request Body:

```json
{
  "review": "A fantastic tour! Highly recommended.",
  "rating": 5
}
```

#### Get Single Review

- URL: `/api/v1/reviews/:reviewId`
- Method: `GET`
- Description: Get detailed information about a specific review.

#### Update a Review

- URL: `/api/v1/reviews/:reviewId`
- Method: `PATCH`
- Description: Update information for an existing review.
- Authorization: Required (Include access token in headers)
- Request Body: (Include only the fields you want to update)

```json
{
  "review": "An even better experience than I expected!"
}
```

#### Delete a Review

- URL: `/api/v1/reviews/:reviewId`
- Method: `DELETE`
- Description: Delete a review.
- Authorization: Required (Include access token in headers)

## Error Handling

The API will respond with appropriate error messages and status codes in case of any errors. Refer to the specific endpoint documentation for possible error responses.

## Rate Limiting

The API imposes rate limiting to prevent abuse. Exceeding the rate limit will result in HTTP 429 Too Many Requests responses.

## Conclusion

This concludes the documentation for the Natours API. Please ensure you have obtained an access token through user registration and login before making authenticated requests. If you have any questions or need further assistance, feel free to reach out to the me.

GitHub : [dev-ajithkumar](https://github.com/dev-ajithkumar)

Happy coding! 🚀
