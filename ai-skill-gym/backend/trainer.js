const axios = require("axios");

async function evaluatePrompt(challenge, userPrompt) {
  const systemPrompt = `
You are an expert AI prompt engineer.

Task:
1. Evaluate the user's prompt.
2. Give score (1-10).
3. Improve it.
4. Explain why improved version is better.

Return ONLY valid JSON in this format:

{
  "score": number,
  "feedback": "string",
  "improved_prompt": "string",
  "explanation": "string"
}
`;

  const fullPrompt = `
Challenge:
${challenge}

User Prompt:
${userPrompt}
`;

  try {
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3",
      prompt: systemPrompt + "\n" + fullPrompt,
      stream: false
    });

    const rawResponse = response.data.response;
    console.log('AI Response:', rawResponse);

    // Try to extract JSON from the response
    let jsonStart = rawResponse.indexOf('{');
    let jsonEnd = rawResponse.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
      throw new Error('No valid JSON found in AI response');
    }

    const jsonString = rawResponse.substring(jsonStart, jsonEnd + 1);
    const result = JSON.parse(jsonString);

    // Validate the result has required fields
    if (typeof result.score !== 'number' || result.score < 1 || result.score > 10) {
      throw new Error('Invalid score in AI response');
    }
    if (!result.feedback || !result.improved_prompt || !result.explanation) {
      throw new Error('Missing required fields in AI response');
    }

    return result;
  } catch (error) {
    console.error('Error evaluating prompt:', error);
    // Return a fallback response
    return {
      score: 5,
      feedback: "The AI evaluation service encountered an error. This might be due to Ollama not running or the model not being available.",
      improved_prompt: userPrompt,
      explanation: "Unable to generate improvement suggestions due to technical issues."
    };
  }
}

module.exports = { evaluatePrompt };
