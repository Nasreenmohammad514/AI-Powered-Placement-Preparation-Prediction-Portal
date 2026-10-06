/**
 * Fixed Seed Script
 * Run from: placement-portal/database/
 * Command: node seed.js
 */

const mongoose = require('mongoose');

// ── Connect directly (no .env dependency) ─────────────────────────────────
const MONGO_URI = 'mongodb://127.0.0.1:27017/placement_portal';

// ── Define schemas inline (no path dependency) ────────────────────────────
const QuestionSchema = new mongoose.Schema({
  category: String,
  question: String,
  options: [String],
  correct: Number,
  difficulty: String,
  explanation: String
});

const StudentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'student' },
  cgpa: { type: Number, default: 0 },
  branch: String,
  skills: [String],
  internshipCount: { type: Number, default: 0 },
  projectCount: { type: Number, default: 0 },
  certificationCount: { type: Number, default: 0 },
  aptitudeScore: { type: Number, default: 0 },
  placementProbability: { type: Number, default: null },
  resumeScore: { type: Number, default: null },
});

const Question = mongoose.model('Question', QuestionSchema);
const Student  = mongoose.model('Student',  StudentSchema);

// ── Questions data ─────────────────────────────────────────────────────────
const questions = [
  // Aptitude
  { category:'aptitude', difficulty:'easy',
    question:'What is 15% of 200?',
    options:['25','30','35','40'], correct:1,
    explanation:'15/100 × 200 = 30' },

  { category:'aptitude', difficulty:'easy',
    question:'A train travels 60 km in 1 hour. How long to travel 240 km?',
    options:['2 hours','3 hours','4 hours','5 hours'], correct:2,
    explanation:'240 ÷ 60 = 4 hours' },

  { category:'aptitude', difficulty:'medium',
    question:'The ratio of boys to girls in a class is 3:2. If there are 30 boys, how many girls?',
    options:['15','18','20','25'], correct:2,
    explanation:'Girls = (2/3) × 30 = 20' },

  { category:'aptitude', difficulty:'medium',
    question:'Find the next number: 2, 6, 12, 20, 30, ?',
    options:['40','42','44','46'], correct:1,
    explanation:'Differences: 4,6,8,10,12 → 30+12=42' },

  { category:'aptitude', difficulty:'medium',
    question:'A shopkeeper gives 20% discount on ₹500. What is the selling price?',
    options:['₹400','₹380','₹420','₹450'], correct:0,
    explanation:'500 - 20% = 500 - 100 = ₹400' },

  { category:'aptitude', difficulty:'hard',
    question:'Two pipes fill a tank in 10 and 15 hours respectively. Time to fill together?',
    options:['5 hrs','6 hrs','7 hrs','8 hrs'], correct:1,
    explanation:'1/10 + 1/15 = 5/30 = 1/6 → 6 hours' },

  { category:'aptitude', difficulty:'hard',
    question:'A and B can do a job in 12 days. B alone takes 20 days. How long for A alone?',
    options:['25 days','28 days','30 days','32 days'], correct:2,
    explanation:'1/A = 1/12 - 1/20 = 2/60 = 1/30 → 30 days' },

  // Reasoning
  { category:'reasoning', difficulty:'easy',
    question:'Find the odd one out: Apple, Mango, Carrot, Banana',
    options:['Apple','Mango','Carrot','Banana'], correct:2,
    explanation:'Carrot is a vegetable; rest are fruits' },

  { category:'reasoning', difficulty:'medium',
    question:'All dogs are animals. All animals have hearts. Therefore:',
    options:['All dogs have hearts','Some dogs have hearts','Dogs are not animals','Cannot determine'], correct:0,
    explanation:'Transitive: dogs → animals → have hearts' },

  { category:'reasoning', difficulty:'medium',
    question:'If CAT = 3+1+20=24, what does DOG equal?',
    options:['23','24','26','28'], correct:2,
    explanation:'D=4, O=15, G=7 → 4+15+7=26' },

  // Verbal
  { category:'verbal', difficulty:'easy',
    question:'Choose the synonym of BENEVOLENT:',
    options:['Cruel','Kind','Strict','Lazy'], correct:1,
    explanation:'Benevolent means kind/generous' },

  { category:'verbal', difficulty:'easy',
    question:'Choose the antonym of ABUNDANT:',
    options:['Scarce','Plenty','Rich','Full'], correct:0,
    explanation:'Abundant means plentiful; antonym is Scarce' },

  { category:'verbal', difficulty:'medium',
    question:'Fill in: She _____ the book before the movie started.',
    options:['reads','read','has read','reading'], correct:1,
    explanation:'Past tense: "read"' },

  // Coding
  { category:'coding', difficulty:'easy',
    question:'What is the time complexity of Binary Search?',
    options:['O(n)','O(log n)','O(n²)','O(1)'], correct:1,
    explanation:'Binary search halves the array each step → O(log n)' },

  { category:'coding', difficulty:'easy',
    question:'Which data structure uses FIFO?',
    options:['Stack','Queue','Tree','Graph'], correct:1,
    explanation:'Queue = First In First Out' },

  { category:'coding', difficulty:'easy',
    question:'What does print(2**10) output in Python?',
    options:['20','100','1024','512'], correct:2,
    explanation:'2^10 = 1024' },

  { category:'coding', difficulty:'medium',
    question:'Which sorting algorithm has best average-case O(n log n)?',
    options:['Bubble Sort','Insertion Sort','Quick Sort','Selection Sort'], correct:2,
    explanation:'Quick Sort averages O(n log n)' },

  { category:'coding', difficulty:'medium',
    question:'What is the space complexity of Merge Sort?',
    options:['O(1)','O(log n)','O(n)','O(n log n)'], correct:2,
    explanation:'Merge sort needs O(n) auxiliary space' },

  { category:'coding', difficulty:'hard',
    question:'In a linked list, what is the time complexity to access the nth element?',
    options:['O(1)','O(log n)','O(n)','O(n²)'], correct:2,
    explanation:'Linked lists require traversal from head → O(n)' },

  { category:'coding', difficulty:'hard',
    question:'Which data structure is used in BFS traversal of a graph?',
    options:['Stack','Queue','Heap','Array'], correct:1,
    explanation:'BFS uses a Queue to process nodes level by level' },
];

// ── Main seed function ─────────────────────────────────────────────────────
async function seed() {
  console.log('Connecting to MongoDB at', MONGO_URI);

  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,   // fail fast if MongoDB not running
    connectTimeoutMS: 5000,
  });

  console.log('✅ Connected to MongoDB');

  // Clear and re-insert questions
  await Question.deleteMany({});
  await Question.insertMany(questions);
  console.log(`✅ Inserted ${questions.length} questions`);

  // Create admin if not exists
  const adminExists = await Student.findOne({ email: 'admin@portal.com' });
  if (!adminExists) {
    await Student.create({
      name: 'Admin',
      email: 'admin@portal.com',
      password: 'admin123',   // plain text OK for seed (no bcrypt here)
      role: 'admin'
    });
    console.log('✅ Admin created → admin@portal.com / admin123');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  console.log('\n🎉 Seed complete! You can now start the backend.');
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message);
  if (err.message.includes('ECONNREFUSED') || err.message.includes('timed out') || err.message.includes('buffering')) {
    console.error('\n👉 MongoDB is NOT running. Start it first:');
    console.error('   Windows: net start MongoDB');
    console.error('   Or run:  mongod');
    console.error('   Or use MongoDB Atlas (cloud) and update MONGO_URI\n');
  }
  process.exit(1);
});
