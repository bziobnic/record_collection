#!/usr/bin/env python
"""
Test runner for the Record Collection API.
This script runs the backend tests for the Record Collection API.
"""

import os
import sys
import unittest

# Add the current directory to the path so we can import the modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


def run_tests():
    """Run the backend tests."""
    print("Running backend tests...")

    # Run the tests using unittest
    test_loader = unittest.TestLoader()
    test_suite = test_loader.discover("api", pattern="tests.py")
    test_runner = unittest.TextTestRunner(verbosity=2)
    result = test_runner.run(test_suite)

    # Return the number of failures and errors
    return len(result.failures) + len(result.errors)


if __name__ == "__main__":
    # Run the tests
    exit_code = run_tests()

    # Exit with the number of failures and errors
    sys.exit(exit_code)
