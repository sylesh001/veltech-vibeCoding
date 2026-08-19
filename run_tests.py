#!/usr/bin/env python
"""
Expense Tracker - Test Runner
==============================
A convenience script to run all backend tests with coverage reporting.

Usage:
    python run_tests.py                  # Run all tests
    python run_tests.py users            # Run tests for a specific app
    python run_tests.py -v               # Run with verbose output
    python run_tests.py --no-cov         # Run without coverage
"""
import os
import sys


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expense_tracker.settings')

    # Separate our custom flags from pytest args
    args = sys.argv[1:]
    no_cov = '--no-cov' in args
    if no_cov:
        args.remove('--no-cov')

    # Build the pytest command
    pytest_args = [
        '--tb=short',
        '--strict-markers',
        '-rN',
    ]

    # Add coverage unless explicitly disabled
    if not no_cov:
        pytest_args.extend([
            '--cov=.',
            '--cov-report=term-missing',
            '--cov-config=.coveragerc',
        ])

    # Add any additional args passed by the user (e.g., app name, -v)
    pytest_args.extend(args)

    try:
        import pytest
    except ImportError:
        print(
            "pytest is not installed. Install test dependencies with:\n"
            "  pip install -r requirements.txt"
        )
        sys.exit(1)

    print("=" * 60)
    print("  Expense Tracker - Running Tests")
    print("=" * 60)
    print(f"  Settings: {os.environ['DJANGO_SETTINGS_MODULE']}")
    print(f"  Coverage: {'enabled' if not no_cov else 'disabled'}")
    print(f"  Args:     {' '.join(pytest_args)}")
    print("=" * 60)
    print()

    exit_code = pytest.main(pytest_args)
    sys.exit(exit_code)


if __name__ == '__main__':
    main()
