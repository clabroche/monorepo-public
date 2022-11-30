#!/bin/bash
cd ..
yarn cap sync
cd android
./gradlew assembleRelease
apksigner sign --ks-pass file:keystorepass --ks ~/keystore.jks  --out  ../dist/ugc-explorer.apk app/build/outputs/apk/release/app-release-unsigned.apk