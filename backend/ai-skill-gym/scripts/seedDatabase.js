require('dotenv').config();
const mongoose = require('mongoose');
const Level = require('./models/Level');
const Exercise = require('./models/Exercise');

const CURRICULUM = [
  {
    levelNumber: 1,
    title: 'AI Literacy',
    description: 'Understanding the fundamentals of AI and language models',
    topics: ['What is an LLM?', 'Hallucination explained', 'When NOT to trust AI', 'Prompt basics'],
    exercises: [
      {
        topic: 'What is an LLM?',
        title: 'Understanding Language Models',
        description: 'Learn what LLMs are and how they work',
        challenge: 'Write a prompt that asks an AI to explain what a Large Language Model (LLM) is, in a way that a 10-year-old could understand.',
        context: 'You want to understand LLMs but in simple terms',
        expectedOutcomes: ['Clear explanation', 'Age-appropriate language', 'Avoids jargon']
      },
      {
        topic: 'Hallucination explained',
        title: 'Detecting AI Hallucinations',
        description: 'Understand when AI makes up information',
        challenge: 'Write a prompt that asks an AI to explain what "hallucination" means in AI, and then provide an example of when it might happen.',
        context: 'You want to know when AI might give false information',
        expectedOutcomes: ['Clear definition', 'Realistic example', 'Recognizes limitations']
      },
      {
        topic: 'When NOT to trust AI',
        title: 'Critical Thinking with AI',
        description: 'Identify when you should be skeptical of AI outputs',
        challenge: 'Write a prompt that asks an AI to list 5 scenarios where you should NOT trust AI output, and explain why for each.',
        context: 'You want to develop healthy skepticism about AI',
        expectedOutcomes: ['Specific scenarios', 'Clear reasoning', 'Practical advice']
      },
      {
        topic: 'Prompt basics',
        title: 'Your First Prompt',
        description: 'Master the fundamentals of prompt writing',
        challenge: 'Write a clear, specific prompt to ask an AI to help you plan a 7-day trip to Japan, including budget breakdown and must-see locations.',
        context: 'You need help planning a trip',
        expectedOutcomes: ['Specificity', 'Clear structure', 'Actionable results']
      }
    ]
  },
  {
    levelNumber: 2,
    title: 'Structured Prompting',
    description: 'Advanced techniques for precise AI outputs',
    topics: ['Role-based prompts', 'Output formatting', 'Constraint layering', 'Iteration loops'],
    exercises: [
      {
        topic: 'Role-based prompts',
        title: 'Giving AI a Role',
        description: 'Learn to define AI personas for better outputs',
        challenge: 'Write a prompt that assigns an AI the role of a "Senior Marketing Executive with 20 years of experience" and asks for a marketing strategy for a new coffee brand.',
        context: 'You want expert-level strategic thinking',
        expectedOutcomes: ['Clear role definition', 'Expertise reflected', 'Strategic depth']
      },
      {
        topic: 'Output formatting',
        title: 'Structured Outputs',
        description: 'Control exactly how AI formats its response',
        challenge: 'Write a prompt requesting a restaurant review in JSON format with fields: rating, cuisine, price_range, pros, cons, and recommendation.',
        context: 'You need machine-readable output',
        expectedOutcomes: ['Valid JSON', 'All fields populated', 'Proper structure']
      },
      {
        topic: 'Constraint layering',
        title: 'Adding Constraints',
        description: 'Build complex prompts with multiple requirements',
        challenge: 'Write a prompt for a product description that is: under 100 words, includes 3 bullet points of benefits, uses conversational tone, and highlights the eco-friendly aspect.',
        context: 'You need a multi-constraint output',
        expectedOutcomes: ['Word limit respected', 'All constraints met', 'Coherent result']
      },
      {
        topic: 'Iteration loops',
        title: 'Refining Through Iteration',
        description: 'Build better outputs through systematic refinement',
        challenge: 'Write a prompt that asks an AI to write code for a function, then critique its own code, then improve it based on the critique.',
        context: 'You want self-improving AI outputs',
        expectedOutcomes: ['Clear stages', 'Self-critique included', 'Iterative improvement']
      }
    ]
  },
  {
    levelNumber: 3,
    title: 'Applied Tracks',
    description: 'Real-world applications across different domains',
    topics: ['Content creation', 'Business automation', 'Coding', 'Research', 'Personal productivity'],
    exercises: [
      {
        topic: 'Content creation',
        title: 'Writing Better Content Prompts',
        description: 'Master content creation with AI',
        challenge: 'Write a prompt that creates a blog post outline about "Remote Work Best Practices", targeting busy managers, with SEO considerations.',
        context: 'You want SEO-friendly content for a specific audience',
        expectedOutcomes: ['Clear outline', 'Audience focus', 'SEO elements']
      },
      {
        topic: 'Business automation',
        title: 'Automating Business Tasks',
        description: 'Use AI to streamline business processes',
        challenge: 'Write a prompt that generates an email response template for customer support, covering common inquiries about shipping, returns, and refunds.',
        context: 'You need to automate customer support responses',
        expectedOutcomes: ['Professional tone', 'Coverage of topics', 'Reusable template']
      },
      {
        topic: 'Coding',
        title: 'Getting AI to Code Better',
        description: 'Write better prompts for code generation',
        challenge: 'Write a prompt requesting a Python function that validates email addresses, with error handling, type hints, and docstring documentation.',
        context: 'You need production-ready code',
        expectedOutcomes: ['Complete function', 'Error handling', 'Good documentation']
      },
      {
        topic: 'Research',
        title: 'Research with AI',
        description: 'Use AI as a research assistant',
        challenge: 'Write a prompt that asks an AI to research and summarize the history of the Internet, with key milestones, main figures, and current trends.',
        context: 'You need comprehensive research summary',
        expectedOutcomes: ['Historical accuracy', 'Key milestones', 'Balanced perspective']
      },
      {
        topic: 'Personal productivity',
        title: 'Productivity Hack Prompts',
        description: 'Optimize personal workflows with AI',
        challenge: 'Write a prompt that creates a personalized daily routine, considering: wake time (6 AM), work hours (9-5), fitness goal (4x/week), sleep time (11 PM).',
        context: 'You want a personalized schedule',
        expectedOutcomes: ['Realistic schedule', 'All goals included', 'Actionable items']
      }
    ]
  },
  {
    levelNumber: 4,
    title: 'Optimization',
    description: 'Advanced optimization techniques for production use',
    topics: ['Token efficiency', 'Output compression', 'Error reduction', 'Chained prompts', 'Automation logic'],
    exercises: [
      {
        topic: 'Token efficiency',
        title: 'Optimizing for Cost and Speed',
        description: 'Write prompts that minimize tokens while maintaining quality',
        challenge: 'Rewrite a verbose prompt about customer feedback analysis to be as concise as possible while achieving the same results. Show the before/after comparison.',
        context: 'You need to reduce API costs',
        expectedOutcomes: ['Concise writing', 'Maintained quality', 'Clear comparison']
      },
      {
        topic: 'Output compression',
        title: 'Summarization Techniques',
        description: 'Get AI to produce dense, valuable outputs',
        challenge: 'Write a prompt that takes a 10-page research paper and produces a 1-page executive summary with key findings, implications, and recommendations.',
        context: 'You need compressed high-value output',
        expectedOutcomes: ['One page', 'All key points', 'Executive ready']
      },
      {
        topic: 'Error reduction',
        title: 'Building Robust Prompts',
        description: 'Design prompts that are resilient to edge cases',
        challenge: 'Write a prompt for data extraction from messy text that handles: missing fields, formatting variations, and clearly states what to do with ambiguous cases.',
        context: 'You need reliable data extraction',
        expectedOutcomes: ['Handles variations', 'Clear edge cases', 'Reliable output']
      },
      {
        topic: 'Chained prompts',
        title: 'Multi-Step Prompting',
        description: 'Combine multiple prompts for complex tasks',
        challenge: 'Write 3 connected prompts: 1) Generate ideas for a startup, 2) Evaluate top ideas, 3) Create a pitch for the winner.',
        context: 'You need a multi-stage workflow',
        expectedOutcomes: ['Clear stages', 'Proper sequencing', 'Cumulative value']
      },
      {
        topic: 'Automation logic',
        title: 'Prompt Automation Patterns',
        description: 'Design prompts that can be automated at scale',
        challenge: 'Write a prompt template that can process ANY product description and generate: title, tags, category, price_range, and appeal_score automatically.',
        context: 'You need scalable automation',
        expectedOutcomes: ['Template format', 'Variables clear', 'Scalable design']
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-skill-gym');

    // Clear existing data
    await Level.deleteMany({});
    await Exercise.deleteMany({});

    // Seed levels and exercises
    for (const levelData of CURRICULUM) {
      const exercises = levelData.exercises;
      delete levelData.exercises;

      // Create level
      const level = await Level.create({
        ...levelData,
      });

      // Create exercises for this level
      for (const exercise of exercises) {
        await Exercise.create({
          ...exercise,
          levelNumber: levelData.levelNumber,
        });
      }
    }

    // optionally seed an admin/user account if env vars are provided
    if (
      process.env.SEED_ADMIN_USERNAME &&
      process.env.SEED_ADMIN_EMAIL &&
      process.env.SEED_ADMIN_PASSWORD
    ) {
      const User = require('../models/User');
      const existing = await User.findOne({ username: process.env.SEED_ADMIN_USERNAME });
      if (!existing) {
        await User.create({
          username: process.env.SEED_ADMIN_USERNAME,
          email: process.env.SEED_ADMIN_EMAIL,
          password: process.env.SEED_ADMIN_PASSWORD,
        });
        console.log('✓ Admin user seeded');
      }
    }

    console.log('✓ Database seeded successfully');
    console.log(`✓ ${CURRICULUM.length} levels created`);
    console.log(`✓ ${CURRICULUM.reduce((sum, l) => sum + l.exercises.length, 0)} exercises created`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
