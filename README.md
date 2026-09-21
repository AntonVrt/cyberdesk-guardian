# FocusGuard

FocusGuard is an AI study-focus assistant built for the Smart Desk project scenario. It recognizes desk objects with a trained Google Teachable Machine image model and sends the prediction and session context to a Gemini Agent. The Agent returns a structured decision that updates the application's score, challenge and feedback.

## Project links

- Live application: https://cyberdesk-guardian.vercel.app/
- GitHub repository: https://github.com/AntonVrt/cyberdesk-guardian
- Published Teachable Machine model: https://teachablemachine.withgoogle.com/models/z42MWkJ86/

## Project idea

Help students organize their study space and develop focused study habits. A phone can prompt a recommendation to put it aside, a document can prompt organization advice, and a water bottle can prompt a hydration reminder. The application displays advice and manages object challenges; it does not verify that a user followed the advice or actually studied.

## Teachable Machine model

Model type: **Image Project**.

| Class | Meaning | Training samples shown in the submitted training screenshot |
| --- | --- | --- |
| PHONE | A phone | 100 |
| DOCUMENT | A paper document | 40 |
| WATER_BOTTLE | A water bottle | 191 |
| NO_OBJECT | None of the target objects | 435 |

Training images were collected using a webcam. The model was trained, exported and connected to the application. The training screenshot shows the classes, sample images, sample counts and the "Model Trained" status.

The new published model is the default. Users can select a different published model through "Connect your Teachable Machine model"; that selection is saved in the browser.

The live camera displays the highest-scoring class and its confidence. A target class must remain stable for about one second with confidence of at least 90% before it can trigger an Agent request. A three-second cooldown limits repeat triggers, but a continuously visible object can still generate repeated requests. NO_OBJECT and low-confidence predictions display a waiting message without calling Gemini.

## AI Agent

### Goal

Help the student build focused, sustainable desk habits and choose the next useful object challenge.

### Input

The Agent receives the detected class and confidence from Teachable Machine, together with the current session state.

### Context and state

The browser tracks and sends:

- Current score and current challenge.
- Number of accepted scans and current streak.
- Counts of accepted PHONE, DOCUMENT and WATER_BOTTLE scans.
- The previous Agent feedback.

Session state and the visible decision log are held in page memory and are not retained after a reload. The saved model URL is retained in local storage.

### Decisions

The server asks Gemini for structured JSON containing:

| Field | Purpose |
| --- | --- |
| accepted | Whether the scan is accepted |
| action | ACCEPT_SCAN or RESCAN |
| scoreDelta | Points to add for an accepted scan |
| nextChallenge | PHONE, DOCUMENT or WATER_BOTTLE |
| feedback | Short feedback for the student |
| tip | Short study-focus advice |

The prompt asks the Agent to reward a scan matching the current challenge more than another valid object. The server validates the response structure before returning it to the application.

### Actions in the application

For an accepted scan, the application adds the returned points, increments accepted-scan counts and the streak, and updates the challenge. For a rescan decision, it resets the streak and displays retry feedback. It displays the returned tip and records the detection and feedback in Agent memory.

Example from the recorded desktop test: a PHONE prediction was followed by an Agent recommendation to place the phone face down out of reach; the application displayed a score of 15 and a WATER_BOTTLE challenge. Scores and wording can vary between Gemini responses.

This uses prediction plus context to produce structured decisions and state changes, rather than only displaying a description of the object.

## Data flow

Camera -> Teachable Machine -> class and confidence -> browser session context -> POST /api/agent -> Gemini -> validated decision -> score, challenge, feedback and decision log.

## Technologies

- HTML, CSS and JavaScript for the responsive interface.
- Google Teachable Machine Image library and TensorFlow.js for browser-based recognition.
- Gemini API, with gemini-3.8-flash configured in the server code.
- Node.js serverless function on Vercel for the Agent request.
- Vercel for HTTPS hosting and server-side environment variables.
- GitHub for source code and development commits.
- AI-assisted coding and debugging during development.

## Running the application

1. Open the live application and wait for the model status to show Connected.
2. Select Enable camera and grant camera access.
3. Hold one of the trained objects steady and wait for the Agent response.
4. Observe the prediction, confidence, score, challenge and Agent memory.
5. Use Reset session to restart the score and challenge. Close the page when finished to stop camera-driven requests.

Run demo detection cycles through PHONE, DOCUMENT, WATER_BOTTLE and NO_OBJECT using simulated predictions. Object demo events still call the server Agent; they do not test the camera model's recognition quality.

## Deployment and API key handling

The repository contains the frontend under dist/ and the server endpoint in api/agent.js. vercel.json configures hosting and routing.

To deploy a copy, import the repository into Vercel, set GEMINI_API_KEY in the server environment for Production, and deploy. A new deployment is needed after changing the environment variable.

The key is read by the server from the environment, not included in browser code. Do not commit a real key or an environment file containing it. Camera frames are processed in the browser; the Agent receives the class, confidence and session context rather than camera images. Avoid showing sensitive documents to the camera.

## Error handling and current availability

The application displays model-loading and camera-permission errors. The server rejects unsupported request methods and invalid detections, handles a missing key and validates the Agent response. A Gemini 503 response is retried once after 800 milliseconds.

When the Agent request fails, the browser uses a local rule-based demo fallback and records the failure in Agent memory. The fallback also updates score and challenge, so changing numbers alone do not prove that Gemini responded. A log entry containing "demo decision used" identifies this fallback.

During submission preparation on September 21, 2026, Gemini requests returned 429 after rate/quota limits were reached. Earlier live tests and the saved desktop screenshot recorded successful Gemini responses. The additional quota-error screenshot shows a Gemini 429 response reported in the application log, and the AI Studio screenshot shows the project rate-limit notice. Together these support that the integration reached the external service and encountered a limit; they do not demonstrate a successful Agent decision in that request.

Live Gemini availability at evaluation time depends on the project's available quota; the fallback is not a substitute for demonstrating a successful AI Agent call.

## Testing and evidence

- JavaScript syntax checks passed during development.
- Mocked API checks covered successful structured responses, invalid input, missing key and upstream failure.
- A mocked retry check covered a temporary 503 followed by a successful response.
- The new Teachable Machine model loaded successfully in the deployed application.
- The desktop camera screenshot shows PHONE at 97% confidence, prior Agent feedback in the log, score 15 and a WATER_BOTTLE challenge.
- The mobile screenshot shows a live camera, DOCUMENT at 98% confidence, score and scan counts in a readable single-column layout.
- A subsequent mobile Agent test reached Gemini's quota limit and used the fallback; successful live Gemini completion on mobile was not established by that test.

Confidence values in individual screenshots are not an overall accuracy measurement.

## Challenges and limitations

- Connecting a browser recognition model to a server-side Agent while keeping the key out of the frontend.
- Diagnosing failed Gemini calls, updating the configured model, and handling temporary overload.
- Managing API limits: repeated camera detections can consume the small free-tier quota quickly.
- Preserving a Teachable Machine training project: the original editor project was unavailable, so the model was retrained and its published URL replaced.
- Unequal training sample counts, lighting and background differences can affect recognition. More balanced examples and systematic testing would improve confidence in model quality.
- Feedback can be replaced by a subsequent camera detection; the decision log preserves previous messages.
- The application does not implement a timed study session, persistent account history, or verification that an object was put away.

## Future improvements

Trigger once per new object or use an explicit scan button, add stronger rate limiting and clearer fallback status, balance training data, and optionally persist session history. These improvements are not claimed as implemented features.
