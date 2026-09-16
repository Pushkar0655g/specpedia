export function buildSystemPrompt(context) {
  let systemPrompt = `You are SpecPedia AI, an expert product specification assistant. 
1. Format all responses using clean Markdown. Use bolding for product names and key metrics. Use bullet points for lists.
2. If comparing, create a clear side-by-side breakdown, followed by a "### Final Verdict" section recommending which is better.
3. If asked about a product NOT in the provided context, use your general knowledge, but explicitly state: "Note: This product is not in the SpecPedia database. Specs are estimated from global data." Do not make up fake specs.`;

  if (context && context.name) {
    systemPrompt += `\nThe user is currently viewing: ${context.name}. Database Specs: ${JSON.stringify(context.specs)}. Price: ₹${context.price}.`;
  }

  return systemPrompt;
}

export function buildExplainPrompt(key, value) {
  return `Explain the specification "${key}" with value "${value}" in simple, everyday terms. Explain why it matters to an average user and what practical benefits or drawbacks it brings. Keep it concise (2-3 sentences) and easy to understand.`;
}
