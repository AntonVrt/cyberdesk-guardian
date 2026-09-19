# FocusGuard

FocusGuard is a mobile-friendly AI study-focus assistant for a study desk. It detects selected desk objects with a Google Teachable Machine Image Model and chooses an action based on the detection and the current session state.

## Project idea

The app helps a student build stronger and more focused habits. For example, a detected phone can start a focus session, while a water bottle can encourage a short healthy break.

## Teachable Machine model

- Model type: Image Project
- Planned classes: PHONE, DOCUMENT, WATER_BOTTLE, NO_OBJECT
- Training data: photos of each class collected in different positions and lighting conditions

After publishing the model in Teachable Machine, paste its model URL into the app and choose Connect.

## AI Agent

### Goal

Help the user keep a focused, sustainable study environment.

### Input

The predicted class and confidence from Teachable Machine.

### Context and state

- Whether a focus session is active
- Number of alerts shown today
- Most recent detection and time

### Decisions and actions

| Detection | Agent decision | Application action |
| --- | --- | --- |
| PHONE | Protect focus | Starts focus mode and displays a phone-away recommendation |
| DOCUMENT | Encourage organization | Displays a reminder to organize study materials |
| WATER_BOTTLE | Suggest a healthy break | Displays a short hydration recommendation |
| NO_OBJECT | Wait for an object | Displays a prompt to show a trained object |

Repeated predictions within a few seconds are ignored so that the Agent does not repeat the same alert.

## Technologies

- HTML, CSS and JavaScript
- Google Teachable Machine Image library
- TensorFlow.js

## Privacy

The model runs in the browser. The app does not send camera frames to a server. Do not show passwords, government IDs, or other sensitive information to the camera.

## Development milestones

1. Initial web app and mobile interface
2. Add Teachable Machine model
3. Connect predictions to Agent decisions
4. Test on mobile and deploy

