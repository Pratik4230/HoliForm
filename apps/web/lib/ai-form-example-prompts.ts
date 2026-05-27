/** Example prompt for the AI form builder (AiXpense user review). */
export const AIXPENSE_REVIEW_EXAMPLE_PROMPT = `Create a user review form for the AiXpense app with these fields:
- Name (required)
- Email (required)
- Date of birth (required)
- Mobile number (required)
- Address (optional)
- Review (required, long text)
- Issues the user faces (required, long text)
- Which features they liked most (required, single choice): 1) Voice Input, 2) Multi Currency support, 3) Bill image Scan, 4) AI Coach
- What feature would the user love to see in AiXpense (required)
- Any other suggestion (optional)

In this entire form, only "address" and "any other suggestion" are optional. All other fields are required.
Use theme minimal-slate and slug aixpense-user-review.`;

export const AI_FORM_EXAMPLE_PROMPTS = [
  {
    label: "AiXpense user review",
    prompt: AIXPENSE_REVIEW_EXAMPLE_PROMPT,
  },
  {
    label: "Holi festival feedback",
    prompt:
      "Holi festival feedback form with name, email, rating, favorite color, and whether they would join again next year.",
  },
  {
    label: "Startup idea validator",
    prompt: "Startup idea validator with founder name, email, one-line pitch, target market, and stage.",
  },
] as const;
