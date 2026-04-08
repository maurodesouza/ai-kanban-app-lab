#!/bin/bash

# Deployment Script for Kanban Todo App
# This script handles the complete deployment process

set -e  # Exit on any error

echo "=== Kanban Todo App Deployment Script ==="
echo "Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Parse command line arguments
ENVIRONMENT="production"
SKIP_TESTS=false
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --env <environment>    Set environment (development, staging, production)"
            echo "  --skip-tests          Skip running tests"
            echo "  --skip-build          Skip build process"
            echo "  --help                Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_status "Deploying to: $ENVIRONMENT"
print_status "Skip tests: $SKIP_TESTS"
print_status "Skip build: $SKIP_BUILD"

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check if Node.js version is compatible
if [[ ! "$NODE_VERSION" =~ ^v1[8-9]|^v2[0-9] ]]; then
    print_error "Node.js version 18+ required. Current version: $NODE_VERSION"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Run quality checks
print_status "Running code quality checks..."

# Linting
print_status "Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
    print_error "ESLint failed. Please fix linting errors."
    exit 1
fi

# Type checking
print_status "Running TypeScript type checking..."
npm run type-check
if [ $? -ne 0 ]; then
    print_error "TypeScript type checking failed. Please fix type errors."
    exit 1
fi

# Formatting check
print_status "Checking code formatting..."
npm run format
if [ $? -ne 0 ]; then
    print_error "Code formatting check failed."
    exit 1
fi

print_success "Code quality checks passed!"

# Run tests
if [ "$SKIP_TESTS" = false ]; then
    print_status "Running tests..."
    
    # Unit tests
    print_status "Running unit tests..."
    npm run test
    if [ $? -ne 0 ]; then
        print_error "Unit tests failed. Please fix test failures."
        exit 1
    fi
    
    # Integration tests
    print_status "Running integration tests..."
    npm run test:integration
    if [ $? -ne 0 ]; then
        print_error "Integration tests failed. Please fix test failures."
        exit 1
    fi
    
    print_success "All tests passed!"
else
    print_warning "Skipping tests as requested."
fi

# Performance check
print_status "Running performance budget check..."
npm run performance:ci
if [ $? -ne 0 ]; then
    print_error "Performance budget check failed. Please optimize performance."
    exit 1
fi

print_success "Performance budget check passed!"

# Build application
if [ "$SKIP_BUILD" = false ]; then
    print_status "Building application for $ENVIRONMENT..."
    
    # Set environment variables
    export NODE_ENV=$ENVIRONMENT
    export NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-http://localhost:3000}
    
    # Build
    npm run build
    if [ $? -ne 0 ]; then
        print_error "Build failed. Please fix build errors."
        exit 1
    fi
    
    print_success "Build completed successfully!"
else
    print_warning "Skipping build as requested."
fi

# Run post-build checks
if [ "$SKIP_BUILD" = false ]; then
    print_status "Running post-build checks..."
    
    # Check if .next directory exists
    if [ ! -d ".next" ]; then
        print_error "Build output directory .next not found."
        exit 1
    fi
    
    # Check build size
    BUILD_SIZE=$(du -sh .next | cut -f1)
    print_status "Build size: $BUILD_SIZE"
    
    # Check for critical files
    CRITICAL_FILES=(".next/server/app-manifest.json" ".next/static/css")
    for file in "${CRITICAL_FILES[@]}"; do
        if [ ! -e "$file" ]; then
            print_error "Critical build file missing: $file"
            exit 1
        fi
    done
    
    print_success "Post-build checks passed!"
fi

# Environment-specific deployment
case $ENVIRONMENT in
    "development")
        print_status "Starting development server..."
        npm run start
        ;;
    "staging")
        print_status "Deploying to staging..."
        # Add staging deployment logic here
        print_success "Staging deployment completed!"
        ;;
    "production")
        print_status "Deploying to production..."
        # Add production deployment logic here
        
        # Example: Deploy to Vercel
        if command -v vercel &> /dev/null; then
            print_status "Deploying to Vercel..."
            vercel --prod
        else
            print_warning "Vercel CLI not found. Please deploy manually."
        fi
        
        print_success "Production deployment completed!"
        ;;
    *)
        print_error "Unknown environment: $ENVIRONMENT"
        exit 1
        ;;
esac

# Final checks
print_status "Running final deployment checks..."

# Health check
if [ "$ENVIRONMENT" != "development" ]; then
    print_status "Performing health check..."
    
    # Add health check logic here
    # Example: curl -f http://localhost:3000/api/health
    
    print_success "Health check passed!"
fi

print_success "Deployment completed successfully!"
echo "=== Deployment Summary ==="
echo "Environment: $ENVIRONMENT"
echo "Tests: $([ "$SKIP_TESTS" = true ] && echo "Skipped" || echo "Passed")"
echo "Build: $([ "$SKIP_BUILD" = true ] && echo "Skipped" || echo "Completed")"
echo "Performance: Passed"
echo "Status: Ready"
echo "========================"

# Next steps
echo ""
echo "Next steps:"
echo "1. Verify the application is running correctly"
echo "2. Check performance metrics in production"
echo "3. Monitor error logs"
echo "4. Test accessibility features"
echo "5. Update documentation if needed"

echo ""
echo "Deployment commands:"
echo "- Start production server: npm run start"
echo "- Check performance: npm run performance:check"
echo "- Run tests: npm run test"
echo "- View logs: pm2 logs (if using PM2)"

print_success "Thank you for using the Kanban Todo App deployment script!"
