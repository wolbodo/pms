#!/bin/bash


# Setup environment for docker build.

# Build frontend
cd frontend
npm config set registry https://registry.npmjs.org/
npm install 
npm run build

# Build backend
cd ../backend
cargo clean
cargo update
cargo build --release

cd ..

# Copy relevant info to the build dir to construct the image.
rm -rf build
mkdir build
cp Dockerfile build/
cp -r frontend/dist/ build/frontend/
cp swagger.yaml build/frontend/
cp backend/target/release/backend build/backend
cp backend/run_backend.sh build/
cp -r database build/database
cp -r nginx build/nginx

docker build -t wolbodo/pms build