betatable@Mac pushscript-v01 % pnpm push

> pushscript@1.0.0 push /Users/betatable/Desktop/beastmode/pushscript-v01
> node wrapper.cjs

Checking PushScript dependencies...
PushScript dependencies already installed.
[2025-05-22T17:12:53.240Z] [PushScript-Config] Loading environment variables from: /Users/betatable/Desktop/beastmode/pushscript-v01/.env.local
PushScript configuration:
- Selected provider: gemini
- API key present: Yes
- Model: gemini-2.0-flash
No branch specified, using current branch: main
Staging changes...
Scanning for dependency vulnerabilities...
Generating commit message using gemini/gemini-2.0-flash...
Raw Gemini API response: {
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "chore: update entrypoint and add monitoring docs\n"
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
      "avgLogprobs": -0.14080079035325485
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 1507,
    "candidatesTokenCount": 11,
    "totalTokenCount": 1518,
    "promptTokensDetails": [
      {
        "modality": "TEXT",
        "tokenCount": 1507
      }
    ],
    "candidatesTokensDetails": [
      {
        "modality": "TEXT",
        "tokenCount": 11
      }
    ]
  },
  "modelVersion": "gemini-2.0-flash"
}
AI Generated Commit Message:
chore: update entrypoint and add monitoring docs

Creating commit...
Successfully created commit!

Ready to push the following changes:
Commit Message:
chore: update entrypoint and add monitoring docs


Files changed:

Target branch: main
Proceed with commit and push? (Y/n): 
Pushing to main...
To https://github.com/caterpillarC15/pushscript.git
   178d890..0cdf350  main -> main
Successfully pushed to GitHub!
betatable@Mac pushscript-v01 % 