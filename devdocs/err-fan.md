betatable@Mac pushscript-v01 % npm run pushscript main

> pushscript@0.1.0 pushscript
> pushscript main

[2025-05-23T13:07:05.574Z] [PushScript-Config] Looking for environment files in these locations (in order of priority):
[2025-05-23T13:07:05.577Z] [PushScript-Config] Loading environment variables from: /Users/betatable/Desktop/beastmode/pushscript-v01/.env.local
PushScript configuration:
- Selected provider: gemini
- API key present: Yes
- Model: gemini-2.0-flash
Staging changes...
Scanning for dependency vulnerabilities...
Generating commit message using gemini/gemini-2.0-flash...
Raw Gemini API response: {
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "docs(devdocs): remove command-line reference from err-fan.md\n"
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP",
      "safetyRatings": [
        {
          "category": "HARM_CATEGORY_HATE_SPEECH",
          "probability": "NEGLIGIBLE"
        },
        {
          "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
          "probability": "NEGLIGIBLE"
        },
        {
          "category": "HARM_CATEGORY_HARASSMENT",
          "probability": "NEGLIGIBLE"
        },
        {
          "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          "probability": "NEGLIGIBLE"
        }
      ],
      "avgLogprobs": -0.04958154874689439
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 897,
    "candidatesTokenCount": 17,
    "totalTokenCount": 914,
    "promptTokensDetails": [
      {
        "modality": "TEXT",
        "tokenCount": 897
      }
    ],
    "candidatesTokensDetails": [
      {
        "modality": "TEXT",
        "tokenCount": 17
      }
    ]
  },
  "modelVersion": "gemini-2.0-flash",
  "responseId": "-nIwaNaKLJaJ1dkPmpP1qQI"
}
AI Generated Commit Message:
docs(devdocs): remove command-line reference from err-fan.md

Creating commit...
Successfully created commit!

Ready to push the following changes:
Commit Message:
docs(devdocs): remove command-line reference from err-fan.md


Files changed:

Target branch: main
Proceed with commit and push? (Y/n): 