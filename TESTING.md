# Record Collection Testing Guide

This document provides instructions on how to run the tests for the Record Collection application.

## Prerequisites

Before running the tests, make sure you have the following installed:

- Python 3.8 or higher
- Node.js 16 or higher
- npm 8 or higher

## Backend Tests

The backend tests are written using Python's `unittest` framework and `pytest`. They test the API endpoints, database operations, and business logic.

### Installing Dependencies

First, make sure you have the required Python packages installed:

```bash
pip install -r api/requirements.txt
pip install pytest pytest-cov
```

### Running Backend Tests

To run the backend tests, use the following command from the project root:

```bash
python run_tests.py
```

This will run all the tests in the `api/tests.py` file and display the results.

## Frontend Tests

The frontend tests are written using Jest and React Testing Library. They test the React components, API interactions, and user flows.

### Installing Dependencies

First, make sure you have the required npm packages installed:

```bash
cd frontend
npm install
```

### Running Frontend Tests

To run the frontend tests, use the following command from the `frontend` directory:

```bash
npm test
```

This will run all the tests in the `src/tests` directory and display the results.

## Running All Tests

To run both the backend and frontend tests, use the following command from the project root:

```bash
python run_all_tests.py
```

This will run all the tests and display a summary of the results.

## Test Coverage

To generate a test coverage report for the backend, use the following command:

```bash
pytest --cov=api api/tests.py
```

To generate a test coverage report for the frontend, use the following command:

```bash
cd frontend
npm test -- --coverage
```

## Continuous Integration

The tests are automatically run on every push to the repository using GitHub Actions. The workflow is defined in the `.github/workflows/tests.yml` file.

## Adding New Tests

### Backend

To add new backend tests, add them to the `api/tests.py` file. Follow the existing test patterns and use the `unittest` framework.

### Frontend

To add new frontend tests, create a new file in the `frontend/src/tests` directory. Follow the existing test patterns and use Jest and React Testing Library.

## Troubleshooting

If you encounter any issues running the tests, try the following:

1. Make sure all dependencies are installed
2. Make sure the database is properly set up
3. Make sure the API server is not running when running the tests
4. Check the logs for any error messages

If you still have issues, please open an issue on the repository. 