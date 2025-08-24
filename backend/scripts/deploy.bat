@echo off
echo Building the application...
call npm run build

echo Checking for Elastic Beanstalk initialization...
if not exist .elasticbeanstalk (
    echo Initializing Elastic Beanstalk...
    call eb init food-rescue --platform node.js-18 --region us-east-1
)

echo Deploying to Elastic Beanstalk...
call eb deploy food-rescue-prod

if %ERRORLEVEL% NEQ 0 (
    echo Deployment failed. Creating new environment...
    call eb create food-rescue-prod ^
        --instance_type t2.micro ^
        --elb-type application ^
        --envvars NODE_ENV=production,AWS_REGION=%AWS_REGION%,AWS_ACCESS_KEY_ID=%AWS_ACCESS_KEY_ID%,AWS_SECRET_ACCESS_KEY=%AWS_SECRET_ACCESS_KEY%,AWS_S3_BUCKET=%AWS_S3_BUCKET%,MONGODB_URI=%MONGODB_URI%,JWT_SECRET=%JWT_SECRET%,GOOGLE_API_KEY=%GOOGLE_API_KEY%
)

echo Deployment completed!