# Supply Chain Optimization

A full-stack demo application for monitoring, predicting, and responding to disruptions in a global supply chain. The project combines a FastAPI backend, a React + TypeScript frontend, real-time weather monitoring, AI-powered rerouting recommendations, and push notifications to help logistics teams understand risk and take action quickly.

This repository simulates a global port network and highlights how weather events, congestion, and carrier instability can propagate across shipping routes.

## Overview

The system models a simplified international supply chain with ports and transit links across Asia, the Middle East, and Europe/North America. It evaluates risk, visualizes the network, and recommends alternate shipping routes when disruptions occur.

The application includes:

- A live risk dashboard
- Network graph visualization for ports & routes
- Simulated disruption triggers
- AI-generated rerouting recommendations using Gemini
- Weather-based risk monitoring
- Firebase push notifications
- Cloud deployment configuration for frontend and backend

## Problem Statement

Supply chains are exposed to multiple operational risks:

- Severe weather at major ports
- Port congestion
- Carrier suspension or service interruptions
- Cascading disruption across downstream routes

This project demonstrates how data, AI reasoning, and operational dashboards can help logistics teams identify disruptions early and reroute shipments with minimal delay.

## Features

### Live Network Monitoring
- Port and route visualization
- Node-based risk scoring
- Route disruption tracking
- Alternate route recommendations

### AI-Powered Decision Support
- Gemini 2.5 Flash integration for rerouting analysis
- Automated recommendations for:
  - Risk assessment
  - Cascading nodes
  - Recommended alternate route
  - Cost/tradeoff analysis
  - 48-hour impact prediction

### Real-Time Data Simulation
- Dynamic congestion score updates
- Carrier reliability updates
- Weather monitoring for key cities
- Auto-detected severe weather events

### Notifications
- Firebase Cloud Messaging integration
- Push alerts for disruption events
- Token registration through backend API

### Deployment Ready
- Firebase Hosting setup for frontend
- Google Cloud Run deployment config for backend
- Docker support for backend containerization

---

## Architecture

This repo is organized into two main parts:

- Frontend: a React/Vite app with the dashboard and landing page
- Backend: a FastAPI service that exposes APIs and manages graph logic

### High-Level Flow

1. The frontend loads the network graph and dashboard
2. The backend monitors weather and simulated feed changes
3. A disruption is triggered via API
4. Risk propagates through the graph
5. Gemini generates AI-based reroute recommendations
6. Dashboard updates with:
   - disrupted edges
   - alternate route
   - risk adjustments
   - notifications

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Google Maps integration
- Firebase
- Tailwind CSS / custom styling
- React Flow / network visualization libraries

### Backend
- Python
- FastAPI
- NetworkX
- Google GenAI SDK
- Firebase Admin SDK
- OpenWeatherMap API
- Pydantic

### Deployment
- Firebase Hosting
- Google Cloud Run
- Docker
- Google Cloud Build

---

## Repository Structure

```text
supply-chain-optimization/
├── backend/
│   ├── .env
│   ├── Dockerfile
│   ├── main.py
│   ├── requirements.txt
│   ├── __pycache__/
│   └── supply-chain-76169-firebase-adminsdk-fbsvc-ae9fde0918.json
├── frontend/
│   ├── .env
│   ├── .gitignore
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── public/
│   └── src/
│       ├── App.tsx
│       ├── DashboardApp.tsx
│       ├── index.css
│       ├── main.tsx
│       ├── types.ts
│       ├── assets/
│       ├── components/
│       ├── hooks/
│       └── lib/
├── .firebaserc
├── .gitignore
├── firebase.json
├── cloudbuild.yaml
└── README.md
