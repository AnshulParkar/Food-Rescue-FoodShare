#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Initialize Elastic Beanstalk if not already done
if [ ! -d .elasticbeanstalk ]; then
    echo "Initializing Elastic Beanstalk..."
    eb init food-rescue --platform node.js-18 --region us-east-1
fi

# Create Elastic Beanstalk environment if it doesn't exist
if ! eb status food-rescue-prod; then
    echo "Creating Elastic Beanstalk environment..."
    eb create food-rescue-prod \
        --instance_type t2.micro \
        --vpc.id vpc-xxxxxxxx \
        --vpc.ec2subnets subnet-xxxxxxxx \
        --vpc.elbsubnets subnet-xxxxxxxx \
        --vpc.securitygroups sg-xxxxxxxx \
        --elb-type application \
        --envvars \
            NODE_ENV=production,\
            AWS_REGION=$AWS_REGION,\
            AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID,\
            AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY,\
            AWS_S3_BUCKET=$AWS_S3_BUCKET,\
            MONGODB_URI=$MONGODB_URI,\
            JWT_SECRET=$JWT_SECRET,\
            GOOGLE_API_KEY=$GOOGLE_API_KEY
fi

# Deploy the application
echo "Deploying to Elastic Beanstalk..."
eb deploy food-rescue-prod