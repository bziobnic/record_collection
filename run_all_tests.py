#!/usr/bin/env python
"""
Test runner for the Record Collection application.
This script runs both the backend and frontend tests.
"""

import os
import subprocess
import sys


def run_backend_tests():
    """Run the backend tests."""
    print("Running backend tests...")

    # Run the backend tests
    result = subprocess.run(["python", "run_tests.py"], capture_output=True, text=True)

    # Print the output
    print(result.stdout)
    if result.stderr:
        print(result.stderr)

    # Return the exit code
    return result.returncode


def run_frontend_tests():
    """Run the frontend tests."""
    print("Running frontend tests...")

    # Change to the frontend directory
    os.chdir("frontend")

    # Run the frontend tests
    result = subprocess.run(["npm", "test"], capture_output=True, text=True)

    # Print the output
    print(result.stdout)
    if result.stderr:
        print(result.stderr)

    # Change back to the parent directory
    os.chdir("..")

    # Return the exit code
    return result.returncode


def main():
    """Run all tests."""
    # Run the backend tests
    backend_exit_code = run_backend_tests()

    # Run the frontend tests
    frontend_exit_code = run_frontend_tests()

    # Print a summary
    print("\nTest Summary:")
    print(f"Backend tests: {'PASSED' if backend_exit_code == 0 else 'FAILED'}")
    print(f"Frontend tests: {'PASSED' if frontend_exit_code == 0 else 'FAILED'}")

    # Return the combined exit code
    return backend_exit_code + frontend_exit_code


if __name__ == "__main__":
    # Run all tests
    exit_code = main()

    # Exit with the combined exit code
    sys.exit(exit_code)
