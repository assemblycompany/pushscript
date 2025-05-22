betatable@Mac pushscript-v01 % npm i

added 47 packages, and audited 53 packages in 589ms

9 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
betatable@Mac pushscript-v01 % pnpm push

> pushscript@1.0.0 push /Users/betatable/Desktop/beastmode/pushscript-v01
> node pushscript.js

[2025-05-22T17:07:55.876Z] [PushScript-Config] Loading environment variables from: /Users/betatable/Desktop/beastmode/pushscript-v01/.env.local
PushScript configuration:
- Selected provider: gemini
- API key present: Yes
- Model: gemini-2.0-flash
No branch specified, using current branch: main
Staging changes...
Checking for dependency conflicts...
Scanning for dependency vulnerabilities...
Generating commit message using gemini/gemini-2.0-flash...
Raw Gemini API response: {
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "docs(readme): recommend gemini, update provider config instructions\n"
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
      "avgLogprobs": -0.21505462206326997
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 12782,
    "candidatesTokenCount": 13,
    "totalTokenCount": 12795,
    "promptTokensDetails": [
      {
        "modality": "TEXT",
        "tokenCount": 12782
      }
    ],
    "candidatesTokensDetails": [
      {
        "modality": "TEXT",
        "tokenCount": 13
      }
    ]
  },
  "modelVersion": "gemini-2.0-flash"
}
AI Generated Commit Message:
docs(readme): recommend gemini, update provider config instructions

Creating commit...
Successfully created commit!

Ready to push the following changes:
Commit Message:
docs(readme): recommend gemini, update provider config instructions


Files changed:

Target branch: main
Proceed with commit and push? (Y/n): 
Pushing to main...
To https://github.com/caterpillarC15/pushscript.git
   6397c12..178d890  main -> main
Successfully pushed to GitHub!
betatable@Mac pushscript-v01 % 