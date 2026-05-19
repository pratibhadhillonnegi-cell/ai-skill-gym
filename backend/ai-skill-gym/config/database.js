const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Harden Mongoose against NoSQL injection and schema leakage
mongoose.set('strictQuery', true);
mongoose.set('strict', true);

// Local file storage paths for Mock Mode
const DATA_DIR = path.join(__dirname, '../data');

// Curriculum and exercises data for auto-seeding in Mock Mode
const CURRICULUM = [
  {
    levelNumber: 1,
    title: 'AI Literacy',
    description: 'Understanding the fundamentals of AI and language models',
    topics: ['What is an LLM?', 'Hallucination explained', 'When NOT to trust AI', 'Prompt basics'],
    exercises: [
      {
        _id: "ex_l1_1",
        topic: 'What is an LLM?',
        title: 'Understanding Language Models',
        description: 'Learn what LLMs are and how they work',
        challenge: 'Write a prompt that asks an AI to explain what a Large Language Model (LLM) is, in a way that a 10-year-old could understand.',
        context: 'You want to understand LLMs but in simple terms',
        expectedOutcomes: ['Clear explanation', 'Age-appropriate language', 'Avoids jargon']
      },
      {
        _id: "ex_l1_2",
        topic: 'Hallucination explained',
        title: 'Detecting AI Hallucinations',
        description: 'Understand when AI makes up information',
        challenge: 'Write a prompt that asks an AI to explain what "hallucination" means in AI, and then provide an example of when it might happen.',
        context: 'You want to know when AI might give false information',
        expectedOutcomes: ['Clear definition', 'Realistic example', 'Recognizes limitations']
      },
      {
        _id: "ex_l1_3",
        topic: 'When NOT to trust AI',
        title: 'Critical Thinking with AI',
        description: 'Identify when you should be skeptical of AI outputs',
        challenge: 'Write a prompt that asks an AI to list 5 scenarios where you should NOT trust AI output, and explain why for each.',
        context: 'You want to develop healthy skepticism about AI',
        expectedOutcomes: ['Specific scenarios', 'Clear reasoning', 'Practical advice']
      },
      {
        _id: "ex_l1_4",
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
        _id: "ex_l2_1",
        topic: 'Role-based prompts',
        title: 'Giving AI a Role',
        description: 'Learn to define AI personas for better outputs',
        challenge: 'Write a prompt that assigns an AI the role of a "Senior Marketing Executive with 20 years of experience" and asks for a marketing strategy for a new coffee brand.',
        context: 'You want expert-level strategic thinking',
        expectedOutcomes: ['Clear role definition', 'Expertise reflected', 'Strategic depth']
      },
      {
        _id: "ex_l2_2",
        topic: 'Output formatting',
        title: 'Structured Outputs',
        description: 'Control exactly how AI formats its response',
        challenge: 'Write a prompt requesting a restaurant review in JSON format with fields: rating, cuisine, price_range, pros, cons, and recommendation.',
        context: 'You need machine-readable output',
        expectedOutcomes: ['Valid JSON', 'All fields populated', 'Proper structure']
      },
      {
        _id: "ex_l2_3",
        topic: 'Constraint layering',
        title: 'Adding Constraints',
        description: 'Build complex prompts with multiple requirements',
        challenge: 'Write a prompt for a product description that is: under 100 words, includes 3 bullet points of benefits, uses conversational tone, and highlights the eco-friendly aspect.',
        context: 'You need a multi-constraint output',
        expectedOutcomes: ['Word limit respected', 'All constraints met', 'Coherent result']
      },
      {
        _id: "ex_l2_4",
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
        _id: "ex_l3_1",
        topic: 'Content creation',
        title: 'Writing Better Content Prompts',
        description: 'Master content creation with AI',
        challenge: 'Write a prompt that creates a blog post outline about "Remote Work Best Practices", targeting busy managers, with SEO considerations.',
        context: 'You want SEO-friendly content for a specific audience',
        expectedOutcomes: ['Clear outline', 'Audience focus', 'SEO elements']
      },
      {
        _id: "ex_l3_2",
        topic: 'Business automation',
        title: 'Automating Business Tasks',
        description: 'Use AI to streamline business processes',
        challenge: 'Write a prompt that generates an email response template for customer support, covering common inquiries about shipping, returns, and refunds.',
        context: 'You need to automate customer support responses',
        expectedOutcomes: ['Professional tone', 'Coverage of topics', 'Reusable template']
      },
      {
        _id: "ex_l3_3",
        topic: 'Coding',
        title: 'Getting AI to Code Better',
        description: 'Write better prompts for code generation',
        challenge: 'Write a prompt requesting a Python function that validates email addresses, with error handling, type hints, and docstring documentation.',
        context: 'You need production-ready code',
        expectedOutcomes: ['Complete function', 'Error handling', 'Good documentation']
      },
      {
        _id: "ex_l3_4",
        topic: 'Research',
        title: 'Research with AI',
        description: 'Use AI as a research assistant',
        challenge: 'Write a prompt that asks an AI to research and summarize the history of the Internet, with key milestones, main figures, and current trends.',
        context: 'You need comprehensive research summary',
        expectedOutcomes: ['Historical accuracy', 'Key milestones', 'Balanced perspective']
      },
      {
        _id: "ex_l3_5",
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
        _id: "ex_l4_1",
        topic: 'Token efficiency',
        title: 'Optimizing for Cost and Speed',
        description: 'Write prompts that minimize tokens while maintaining quality',
        challenge: 'Rewrite a verbose prompt about customer feedback analysis to be as concise as possible while achieving the same results. Show the before/after comparison.',
        context: 'You need to reduce API costs',
        expectedOutcomes: ['Concise writing', 'Maintained quality', 'Clear comparison']
      },
      {
        _id: "ex_l4_2",
        topic: 'Output compression',
        title: 'Summarization Techniques',
        description: 'Get AI to produce dense, valuable outputs',
        challenge: 'Write a prompt that takes a 10-page research paper and produces a 1-page executive summary with key findings, implications, and recommendations.',
        context: 'You need compressed high-value output',
        expectedOutcomes: ['One page', 'All key points', 'Executive ready']
      },
      {
        _id: "ex_l4_3",
        topic: 'Error reduction',
        title: 'Building Robust Prompts',
        description: 'Design prompts that are resilient to edge cases',
        challenge: 'Write a prompt for data extraction from messy text that handles: missing fields, formatting variations, and clearly states what to do with ambiguous cases.',
        context: 'You need reliable data extraction',
        expectedOutcomes: ['Handles variations', 'Clear edge cases', 'Reliable output']
      },
      {
        _id: "ex_l4_4",
        topic: 'Chained prompts',
        title: 'Multi-Step Prompting',
        description: 'Combine multiple prompts for complex tasks',
        challenge: 'Write 3 connected prompts: 1) Generate ideas for a startup, 2) Evaluate top ideas, 3) Create a pitch for the winner.',
        context: 'You need a multi-stage workflow',
        expectedOutcomes: ['Clear stages', 'Proper sequencing', 'Cumulative value']
      },
      {
        _id: "ex_l4_5",
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

function createMockModel(name, schema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const filePath = path.join(DATA_DIR, `${name.toLowerCase()}s.json`);

  // Seed default data if files do not exist
  if (!fs.existsSync(filePath)) {
    if (name === 'Level') {
      const levels = CURRICULUM.map(lvl => ({
        _id: `lvl_${lvl.levelNumber}`,
        levelNumber: lvl.levelNumber,
        title: lvl.title,
        description: lvl.description,
        topics: lvl.topics,
      }));
      fs.writeFileSync(filePath, JSON.stringify(levels, null, 2));
    } else if (name === 'Exercise') {
      const exercises = [];
      CURRICULUM.forEach(lvl => {
        lvl.exercises.forEach(ex => {
          exercises.push({
            ...ex,
            levelNumber: lvl.levelNumber,
          });
        });
      });
      fs.writeFileSync(filePath, JSON.stringify(exercises, null, 2));
    } else {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  }

  function readData() {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      return [];
    }
  }

  function writeData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  class Document {
    constructor(properties = {}) {
      Object.assign(this, properties);
      
      // Copy schema methods to instance
      if (schema && schema.methods) {
        for (const methodName in schema.methods) {
          this[methodName] = schema.methods[methodName].bind(this);
        }
      }
      
      if (!this._id && !this.id) {
        this._id = Math.random().toString(36).substring(2, 9);
      }
    }

    async save() {
      const data = readData();
      const existingIdx = data.findIndex(item => item._id === this._id || item.id === this._id);
      
      const serialized = { ...this };
      // Remove helper methods from being serialized to JSON
      delete serialized.save;
      if (schema && schema.methods) {
        for (const methodName in schema.methods) {
          delete serialized[methodName];
        }
      }
      
      if (existingIdx !== -1) {
        data[existingIdx] = { ...data[existingIdx], ...serialized, updatedAt: new Date().toISOString() };
      } else {
        serialized.createdAt = new Date().toISOString();
        serialized.updatedAt = new Date().toISOString();
        data.push(serialized);
      }
      writeData(data);
      return this;
    }
  }

  // Chain helpers
  function createChain(results) {
    const chain = {
      sort: () => chain,
      limit: () => chain,
      select: () => chain,
      populate: () => chain,
      exec: async () => results,
      then: (resolve) => Promise.resolve(results).then(resolve),
      catch: (reject) => Promise.resolve(results).catch(reject),
    };
    return chain;
  }

  // Model class queries
  Document.find = function(query = {}) {
    const data = readData();
    const filtered = data.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
    return createChain(filtered.map(item => new Document(item)));
  };

  Document.findOne = async function(query = {}) {
    const data = readData();
    const found = data.find(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
    return found ? new Document(found) : null;
  };

  Document.findById = async function(id) {
    const data = readData();
    const found = data.find(item => item._id === id || item.id === id);
    return found ? new Document(found) : null;
  };

  Document.findByIdAndUpdate = async function(id, update, options = {}) {
    const data = readData();
    const idx = data.findIndex(item => item._id === id || item.id === id);
    if (idx === -1) return null;
    
    data[idx] = { ...data[idx], ...update, updatedAt: new Date().toISOString() };
    writeData(data);
    return new Document(data[idx]);
  };

  Document.findByIdAndDelete = async function(id) {
    const data = readData();
    const idx = data.findIndex(item => item._id === id || item.id === id);
    if (idx === -1) return null;
    const deleted = data[idx];
    data.splice(idx, 1);
    writeData(data);
    return new Document(deleted);
  };

  Document.create = async function(doc) {
    const inst = new Document(doc);
    return await inst.save();
  };

  Document.deleteMany = async function(query = {}) {
    writeData([]);
    return { deletedCount: 0 };
  };

  return Document;
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️ No MONGODB_URI provided. Switching server to Local File-System Database Mode.');
    
    // Intercept Mongoose global singleton
    const originalModel = mongoose.model;
    mongoose.model = function(name, schema) {
      return createMockModel(name, schema);
    };

    mongoose.connect = async function() {
      console.log('✓ Mock Mongoose successfully initialized using JSON files in backend/ai-skill-gym/data/');
      return { connection: { db: { admin: () => ({ ping: () => true }) } } };
    };

    await mongoose.connect();
    return;
  }

  try {
    console.log(`⏳ Connecting to MongoDB Atlas`);
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    });
    console.log('✓ MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('✗ MongoDB Atlas connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
